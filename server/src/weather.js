// Weather via Open-Meteo (free, no API key, worldwide).
// Provides current conditions, hourly forecast, and a 4-day forecast.

let cache = { key: null, data: null, fetchedAt: 0 };

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
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=1&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = await res.json();
  const loc = json.results && json.results[0];
  if (!loc) return null;
  return {
    name: loc.name,
    admin1: loc.admin1 || loc.country || '',
    lat: loc.latitude,
    lon: loc.longitude
  };
}

export async function getWeather(lat, lon, units = 'fahrenheit', days = 4) {
  const forecastDays = Math.min(Math.max(Number(days) || 4, 1), 14);
  const key = `${lat},${lon},${units},${forecastDays}`;
  const now = Date.now();
  if (cache.data && cache.key === key && (now - cache.fetchedAt) < 15 * 60 * 1000) {
    return cache.data;
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature` +
    `&hourly=temperature_2m,weather_code,precipitation_probability` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
    `&temperature_unit=${units}&wind_speed_unit=mph&timezone=auto&forecast_days=${forecastDays}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather service error: ' + res.status);
  const raw = await res.json();

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
      code: raw.daily.weather_code[i],
      condition: wmoToCondition(raw.daily.weather_code[i])
    }))
  };

  cache = { key, data, fetchedAt: now };
  return data;
}
