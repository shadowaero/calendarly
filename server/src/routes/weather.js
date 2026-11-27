import { Router } from 'express';
import { getWeather, geocodeLocation, fetchJSONRetry } from '../weather.js';

const router = Router();

router.get('/weather/geocode', async (req, res) => {
  try {
    const q = req.query.q || req.query.zip || '';
    const result = await geocodeLocation(q);
    if (!result) return res.status(404).json({ error: 'Location not found' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/weather', async (req, res) => {
  try {
    let lat = Number(req.query.lat);
    let lon = Number(req.query.lon);
    const zip = req.query.zip || req.query.location;
    const days = Number(req.query.days) || 4;
    const units = req.query.units === 'celsius' ? 'celsius' : 'fahrenheit';

    if ((!Number.isFinite(lat) || !Number.isFinite(lon)) && zip) {
      const geo = await geocodeLocation(zip);
      if (geo) {
        lat = geo.lat;
        lon = geo.lon;
      }
    }

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      lat = 40.7128; // default NYC
      lon = -74.0060;
    }

    const data = await getWeather(lat, lon, units, days);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Weather radar metadata (RainViewer tiles). Returns host + frame list + resolved lat/lon.
let radarCache = { data: null, at: 0 }; // ws7bf: last good frames for stale-while-error
router.get('/weather/radar', async (req, res) => {
  try {
    let lat = Number(req.query.lat);
    let lon = Number(req.query.lon);
    const zip = req.query.zip || req.query.location || '32757';

    if ((!Number.isFinite(lat) || !Number.isFinite(lon)) && zip) {
      const geo = await geocodeLocation(zip);
      if (geo) { lat = geo.lat; lon = geo.lon; }
    }
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) { lat = 28.80249; lon = -81.64452; } // 32757 fallback

    let maps;
    try {
      // ws7bf: 8s timeout + retry; stale-while-error keeps the radar alive through blips.
      maps = await fetchJSONRetry('https://api.rainviewer.com/public/weather-maps.json', 8000);
    } catch (e) {
      if (radarCache.at) return res.json({ ...radarCache.data, stale: true });
      throw e;
    }
    const host = maps.host || 'https://tilecache.rainviewer.com';
    const frames = [...(maps.radar?.past || []), ...(maps.radar?.nowcast || [])];

    radarCache = { data: { host, frames, lat, lon }, at: Date.now() };
    res.json({ host, frames, lat, lon });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Active National Weather Service alerts (cached 10 min per lat/lon).
let alertCache = { key: null, data: null, at: 0 };
router.get('/weather/alerts', async (req, res) => {
  try {
    const zip = req.query.zip || req.query.location || '';
    let lat = Number(req.query.lat), lon = Number(req.query.lon);
    if ((!Number.isFinite(lat) || !Number.isFinite(lon)) && zip) {
      const geo = await geocodeLocation(zip);
      if (geo) { lat = geo.lat; lon = geo.lon; }
    }
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) { lat = 28.80249; lon = -81.64452; }
    const key = lat.toFixed(3) + ',' + lon.toFixed(3);
    const now = Date.now();
    if (alertCache.data && alertCache.key === key && now - alertCache.at < 600000) return res.json(alertCache.data);
    let j;
    try {
      // ws7bf: 8s timeout + retry; stale-while-error beats a 500 on the wall tile.
      j = await fetchJSONRetry('https://api.weather.gov/alerts/active?status=actual&point=' + lat + ',' + lon, 8000,
        { headers: { 'User-Agent': 'family-dashboard-kiosk', Accept: 'application/geo+json' } });
    } catch (e) {
      if (alertCache.data && alertCache.key === key) return res.json({ ...alertCache.data, stale: true });
      throw e;
    }
    const alerts = (j.features || []).slice(0, 5).map(f => ({
      event: f.properties.event, headline: f.properties.headline || '',
      severity: f.properties.severity || '', effective: f.properties.effective,
      ends: f.properties.ends || f.properties.expires || ''
    }));
    const data = { alerts };
    alertCache = { key, data, at: now };
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
