import { Router } from 'express';
import { getWeather, geocodeLocation } from '../weather.js';

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

    const mapsRes = await fetch('https://api.rainviewer.com/public/weather-maps.json');
    if (!mapsRes.ok) throw new Error('Radar service error: ' + mapsRes.status);
    const maps = await mapsRes.json();
    const host = maps.host || 'https://tilecache.rainviewer.com';
    const frames = [...(maps.radar?.past || []), ...(maps.radar?.nowcast || [])];

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
    const r = await fetch('https://api.weather.gov/alerts/active?status=actual&point=' + lat + ',' + lon,
      { headers: { 'User-Agent': 'family-dashboard-kiosk', Accept: 'application/geo+json' } });
    if (!r.ok) throw new Error('alerts http ' + r.status);
    const j = await r.json();
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
