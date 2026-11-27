// Weather via Open-Meteo (free, no API key, worldwide).
// Provides current conditions, hourly forecast, and a 4-day forecast.
// ws7bf hardening (wave4/fd_weather/DEPLOY-NOTES.md): every upstream fetch gets a
// 10 s timeout + one retry, geocoding is cached 24 h (was: fetched on EVERY
// /api/weather request), and the forecast cache is multi-key with stale-while-error —
// on upstream failure the last good snapshot is served with `stale: true` so a wall
// display never shows an empty forecast card because of a transient outage.

import { recordPressureSample, pressureStats } from './sensordb.js';

// Upstream fetch with timeout + single retry: a wedged socket/DNS stall can never
// hang /api/weather for minutes again (it used to hang until the process restarted).
async function fetchJSONUpstream(url, timeoutMs = 10000, opts = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, ...opts });
    if (!res.ok) throw new Error('Weather service error: ' + res.status);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchJSONRetry(url, timeoutMs = 10000, opts = {}) {
  try {
    return await fetchJSONUpstream(url, timeoutMs, opts);
  } catch (e) {
    await new Promise((r) => setTimeout(r, 1200));
    return fetchJSONUpstream(url, timeoutMs, opts);
  }
}

const MIN15 = 15 * 60 * 1000;
const HOUR24 = 24 * 60 * 60 * 1000;
const geocodeCache = new Map(); // ws7bf: lowercased query -> { geo, at }
const cacheMap = new Map();     // ws7bf: `${lat},${lon},${units},${days}` -> { data, fetchedAt }
                                // (was one global slot the days=1/2/4 callers thrashed)

const WMO_CODES = {
  0: { label: 'Clear sky', icon: '☀️' },
  1: { label: 'Mainly clear', icon: '🌤️' },
  2: { label: 'Partly cloudy', icon: '⛅' },
  3: { label: 'Overcast', icon: '☁️' },
  45: { label: 'Fog', icon: '🌫️' },
  48: { label: 'Rime fog', icon: '🌫️' },
  51: { label: 'Light drizzle', icon: '🌦️' },
  53: { label: 'Drizzle', icon: '🌦️' },
  55: { label: 'Heavy drizzle', icon: '🌧️' },
  61: { label: 'Light rain', icon: '🌧️' },
  63: { label: 'Rain', icon: '🌧️' },
  65: { label: 'Heavy rain', icon: '🌧️' },
  71: { label: 'Light snow', icon: '🌨️' },
  73: { label: 'Snow', icon: '🌨️' },
  75: { label: 'Heavy snow', icon: '❄️' },
  80: { label: 'Rain showers', icon: '🌦️' },
  81: { label: 'Rain showers', icon: '🌧️' },
  82: { label: 'Violent showers', icon: '⛈️' },
  85: { label: 'Snow showers', icon: '🌨️' },
  86: { label: 'Snow showers', icon: '❄️' },
  95: { label: 'Thunderstorm', icon: '⛈️' },
  96: { label: 'Thunderstorm', icon: '⛈️' },
  99: { label: 'Thunderstorm', icon: '⛈️' }
};

export function wmoToCondition(code) {
  return WMO_CODES[code] || { label: 'Unknown', icon: '🌡️' };
}

export async function geocodeLocation(query) {
  if (!query || !query.trim()) return null;
  const k = query.trim().toLowerCase();
  const hit = geocodeCache.get(k);
  if (hit && Date.now() - hit.at < HOUR24) return hit.geo;
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=1&language=en&format=json`;
  try {
    const json = await fetchJSONRetry(url);
    const loc = json.results && json.results[0];
    if (!loc) return null;
    const geo = {
      name: loc.name,
      admin1: loc.admin1 || loc.country || '',
      lat: loc.latitude,
      lon: loc.longitude
    };
    geocodeCache.set(k, { geo, at: Date.now() });
    return geo;
  } catch (e) {
    // ws7bf: on upstream failure serve the expired cached geo (a zip's coordinates
    // never change) instead of falling through to the NYC default — wrong-city
    // weather on the wall is worse than slightly stale resolution.
    if (hit) return hit.geo;
    throw e;
  }
}

export async function getWeather(lat, lon, units = 'fahrenheit', days = 4) {
  const forecastDays = Math.min(Math.max(Number(days) || 4, 1), 14);
  const key = `${lat},${lon},${units},${forecastDays}`;
  const now = Date.now();
  const hit = cacheMap.get(key); // ws7bf: cache PER key — the days=1/2/4
  if (hit && (now - hit.fetchedAt) < MIN15) { // widget callers no longer thrash
    return hit.data;
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,apparent_temperature,is_day,cloud_cover,pressure_msl,surface_pressure,uv_index,shortwave_radiation` +
    `&hourly=temperature_2m,weather_code,precipitation_probability` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max` +
    `&temperature_unit=${units}&wind_speed_unit=mph&timezone=auto&forecast_days=${forecastDays}`;

  let raw;
  try {
    raw = await fetchJSONRetry(url);
  } catch (e) {
    // ws7bf stale-while-error: an hour-old forecast beats a blank card on the wall.
    if (hit) return { ...hit.data, stale: true, staleForSec: Math.round((Date.now() - hit.fetchedAt) / 1000) };
    throw e;
  }

  const current = raw.current || {};
  const offsetSec = raw.utc_offset_seconds || 0;
  const nowEpoch = Date.now();
  // Convert a location-local "YYYY-MM-DDTHH:mm" string to a UTC epoch (ms).
  const epochOf = (t) => Date.parse(`${t}:00Z`) - offsetSec * 1000;

  // Build the full hourly list, then trim it to start one hour before the
  // current hour so widgets can show a useful "past hour + next N hours" window.
  const hourlyTimes = raw.hourly?.time || [];
  const hourlyAll = hourlyTimes.map((t, i) => ({
    time: t,
    epoch: epochOf(t),
    temp: Math.round(raw.hourly.temperature_2m[i]),
    code: raw.hourly.weather_code[i],
    condition: wmoToCondition(raw.hourly.weather_code[i]),
    precip: raw.hourly.precipitation_probability ? raw.hourly.precipitation_probability[i] : null
  }));

  let curIdx = hourlyAll.findIndex((h) => nowEpoch >= h.epoch && nowEpoch < h.epoch + 3600 * 1000);
  if (curIdx === -1) curIdx = hourlyAll.findIndex((h) => h.epoch >= nowEpoch);
  if (curIdx === -1) curIdx = hourlyAll.length - 1;
  const curEpoch = hourlyAll[curIdx] ? hourlyAll[curIdx].epoch : null;
  const startIdx = Math.max(0, curIdx - 1);

  const data = {
    units: units === 'celsius' ? 'C' : 'F',
    timezone: raw.timezone || 'auto',
    current: {
      temp: Math.round(current.temperature_2m),
      apparent: Math.round(current.apparent_temperature ?? current.temperature_2m),
      humidity: current.relative_humidity_2m ?? null,
      wind: current.wind_speed_10m ?? null,
      code: current.weather_code,
      is_day: current.is_day,
      cloud_cover: current.cloud_cover ?? null,
      wind_dir: current.wind_direction_10m ?? null,
      wind_gusts: current.wind_gusts_10m ?? null,
      pressure_msl: current.pressure_msl ?? null,
      surface_pressure: current.surface_pressure ?? null,
      uv_index: current.uv_index ?? null,
      shortwave_radiation: current.shortwave_radiation ?? null,
      condition: wmoToCondition(current.weather_code)
    },
    hourly: hourlyAll.slice(startIdx, startIdx + 24).map((h) => ({
      time: h.time,
      temp: h.temp,
      code: h.code,
      condition: h.condition,
      precip: h.precip,
      current: h.epoch === curEpoch
    })),
    daily: (raw.daily?.time || []).map((t, i) => ({
      date: t,
      max: Math.round(raw.daily.temperature_2m_max[i]),
      min: Math.round(raw.daily.temperature_2m_min[i]),
      sunrise: raw.daily.sunrise ? raw.daily.sunrise[i] : null,
      sunset: raw.daily.sunset ? raw.daily.sunset[i] : null,
      uvMax: raw.daily.uv_index_max ? raw.daily.uv_index_max[i] : null,
      code: raw.daily.weather_code[i],
      condition: wmoToCondition(raw.daily.weather_code[i])
    }))
  };

  try {
    if (Number.isFinite(current.pressure_msl)) recordPressureSample(Math.round(current.pressure_msl * 10) / 10);
    const pstats = pressureStats();
    if (pstats) data.pressure = pstats;
  } catch (e) { console.error('[weather] pressure stats failed:', e.message); }

  cacheMap.set(key, { data, fetchedAt: Date.now() });
  return data;
}
