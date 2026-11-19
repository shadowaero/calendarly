import db from './db.js';
import crypto from 'crypto';

// Self-managed schema for the Weather Station feature (sensors + barometer history).
db.exec(`
CREATE TABLE IF NOT EXISTS sensor_readings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sensor_id TEXT NOT NULL,
  model TEXT,
  channel TEXT,
  temp_c REAL,
  humidity REAL,
  battery INTEGER,
  rssi REAL,
  ts INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_id_ts ON sensor_readings(sensor_id, ts);
CREATE TABLE IF NOT EXISTS pressure_samples (
  ts INTEGER NOT NULL,
  hpa REAL NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pressure_samples_ts ON pressure_samples(ts);
`);

export function ensureIngestToken() {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'sensor_ingest_token'").get();
  if (row && row.value) return row.value;
  const token = crypto.randomBytes(20).toString('hex');
  db.prepare("INSERT INTO settings (key, value) VALUES ('sensor_ingest_token', ?)").run(token);
  return token;
}

export function checkIngestToken(token) {
  const expected = ensureIngestToken();
  const a = Buffer.from(String(token || ''));
  const b2 = Buffer.from(expected);
  if (a.length !== b2.length) return false;
  return crypto.timingSafeEqual(a, b2);
}

export function recordSensorReading(r) {
  db.prepare(`INSERT INTO sensor_readings (sensor_id, model, channel, temp_c, humidity, battery, rssi, ts)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    String(r.sensor_id),
    r.model ? String(r.model) : null,
    r.channel ? String(r.channel) : null,
    Number(r.tempC),
    r.humidity == null ? null : Number(r.humidity),
    r.battery == null ? 1 : (Number(r.battery) ? 1 : 0),
    r.rssi == null ? null : Number(r.rssi),
    Number(r.ts || Date.now())
  );
}

export function pruneOld() {
  const cut = Date.now() - 7 * 86400e3;
  db.prepare('DELETE FROM sensor_readings WHERE ts < ?').run(cut);
  db.prepare('DELETE FROM pressure_samples WHERE ts < ?').run(cut);
}

export function latestSensors() {
  const ids = db.prepare('SELECT sensor_id, MAX(ts) AS last FROM sensor_readings GROUP BY sensor_id ORDER BY last DESC').all();
  const dayAgo = Date.now() - 86400e3;
  const minmax = db.prepare('SELECT MIN(temp_c) AS mn, MAX(temp_c) AS mx FROM sensor_readings WHERE sensor_id = ? AND ts >= ?');
  const latest = db.prepare('SELECT * FROM sensor_readings WHERE sensor_id = ? ORDER BY ts DESC LIMIT 1');
  return ids.map(r => {
    const s = latest.get(r.sensor_id) || {};
    const mm = minmax.get(r.sensor_id, dayAgo);
    return {
      sensor_id: s.sensor_id,
      model: s.model || null,
      channel: s.channel || null,
      tempC: s.temp_c,
      humidity: s.humidity,
      battery: !!s.battery,
      rssi: s.rssi,
      ageSec: Math.max(0, Math.round((Date.now() - s.ts) / 1000)),
      minC: mm.mn,
      maxC: mm.mx
    };
  });
}

export function recordPressureSample(hpa) {
  db.prepare('INSERT INTO pressure_samples (ts, hpa) VALUES (?, ?)').run(Date.now(), Number(hpa));
}

export function pressureStats() {
  const now = Date.now();
  const cur = db.prepare('SELECT ts, hpa FROM pressure_samples ORDER BY ts DESC LIMIT 1').get();
  if (!cur) return null;
  const past = db.prepare('SELECT ts, hpa FROM pressure_samples WHERE ts <= ? AND ts >= ? ORDER BY ts DESC LIMIT 1')
    .get(now - 3 * 3600e3, now - 4 * 3600e3);
  const mm = db.prepare('SELECT MIN(hpa) AS lo, MAX(hpa) AS hi FROM pressure_samples WHERE ts >= ?').get(now - 24 * 3600e3);
  const d = past ? Math.round((cur.hpa - past.hpa) * 10) / 10 : null;
  return {
    hpa: cur.hpa,
    delta3h: d,
    high24: mm ? mm.hi : null,
    low24: mm ? mm.lo : null,
    trend: d == null ? 'steady' : (d > 0.3 ? 'rising' : d < -0.3 ? 'falling' : 'steady')
  };
}
