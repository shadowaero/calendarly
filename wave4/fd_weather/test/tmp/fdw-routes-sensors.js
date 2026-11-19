import { Router } from 'express';
import { ensureIngestToken, checkIngestToken, recordSensorReading, latestSensors, pruneOld } from '../sensordb.js';

const router = Router();

// Mutation endpoints stay token-gated (consistent with wave4 hardening policy).
// GETs stay open on the LAN — the public edge (NPM) gates every path behind
// authentik, so exposure is LAN-only, same as the kiosk touch endpoints.
router.post('/sensors/ingest', (req, res) => {
  const b = req.body || {};
  const token = b.token || req.query.token || String(req.headers.authorization || '').replace(/^Bearer /, '');
  if (!checkIngestToken(token)) return res.status(401).json({ error: 'unauthorized' });
  if (!b.sensor_id || !Number.isFinite(Number(b.tempC))) {
    return res.status(400).json({ error: 'sensor_id and tempC are required' });
  }
  try {
    recordSensorReading(b);
    if (Math.random() < 0.02) pruneOld();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/sensors', (req, res) => {
  try {
    res.json({ sensors: latestSensors(), serverTime: Date.now() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lets the feeder (or an operator) validate its token without posting data.
router.get('/sensors/token-check', (req, res) => {
  res.json({ valid: checkIngestToken(req.query.token) });
});

export default router;
