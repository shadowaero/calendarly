import { Router } from 'express';
import { haConfig, haConfigured, haStates, haCallService, HA_ALLOWED_SERVICES } from '../hass.js';

const router = Router();

const PICK_DOMAINS = ['climate', 'light', 'switch', 'fan', 'cover', 'humidifier', 'lock', 'sensor', 'binary_sensor', 'media_player', 'weather', 'number', 'input_boolean', 'script'];

// GETs stay open on the LAN (kiosk + editor read freely); the mutation endpoint
// below is whitelisted + entity-checked (same policy stance as routes/sensors.js:
// the public edge is gated by authentik/NPM, so exposure is LAN-only).
router.get('/ha/status', (req, res) => {
  const { baseUrl } = haConfig();
  res.json({ configured: haConfigured(), baseUrl });
});

router.get('/ha/services', (req, res) => {
  res.json(HA_ALLOWED_SERVICES);
});

router.get('/ha/entities', async (req, res) => {
  try {
    const states = await haStates();
    if (!states) return res.json({ configured: false, entities: [] });
    const entities = states
      .filter((s) => PICK_DOMAINS.indexOf(String(s.entity_id).split('.')[0]) >= 0)
      .map((s) => ({
        entity_id: s.entity_id,
        domain: String(s.entity_id).split('.')[0],
        name: (s.attributes && s.attributes.friendly_name) || String(s.entity_id).split('.')[1],
        state: s.state,
        device_class: (s.attributes && s.attributes.device_class) || '',
        unit: (s.attributes && s.attributes.unit_of_measurement) || ''
      }));
    res.json({ configured: true, entities });
  } catch (err) {
    res.status(502).json({ error: err.message, entities: [] });
  }
});

router.get('/ha/states', async (req, res) => {
  try {
    const states = await haStates();
    if (!states) return res.status(503).json({ error: 'ha not configured', states: [] });
    const ids = String(req.query.ids || '').split(',').map((s) => s.trim()).filter(Boolean);
    const out = ids.length
      ? ids.map((id) => states.find((s) => s.entity_id === id) || null).filter(Boolean)
      : states;
    res.json({ states: out, serverTime: Date.now() });
  } catch (err) {
    res.status(502).json({ error: err.message, states: [] });
  }
});

router.post('/ha/services/:domain/:service', async (req, res) => {
  try {
    const result = await haCallService(req.params.domain, req.params.service, req.body || {});
    res.json({ ok: true, states: result });
  } catch (err) {
    res.status(err.status || 502).json({ error: err.message });
  }
});

export default router;