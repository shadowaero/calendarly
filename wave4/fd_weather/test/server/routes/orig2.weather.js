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

export default router;
