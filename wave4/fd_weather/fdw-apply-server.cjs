#!/usr/bin/env node
// FD wave-weather server patch. Runs INSIDE the family-dashboard container:
//   docker exec -w /app/server family-dashboard node /tmp/fdw-apply-server.cjs
// Idempotent: every anchor skips if its replacement is already present.
const fs = require('fs');
const path = require('path');

const SRC = process.env.FDW_SRC || '/app/server/src';
const tmpf = (f) => path.join(process.env.FDW_TMP || '/tmp', f);
const report = { steps: [], ok: true };
const step = (name, status, extra) => { report.steps.push({ name, status, extra }); console.log('[' + status + '] ' + name + (extra ? ' :: ' + extra : '')); if (status === 'FAIL') { report.ok = false; report.failCount = (report.failCount || 0) + 1; } };

function backup(file) {
  const bak = path.join(path.dirname(file), 'orig2.' + path.basename(file));
  if (!fs.existsSync(bak)) { fs.copyFileSync(file, bak); step('backup ' + path.basename(bak), 'OK'); }
  return fs.readFileSync(file, 'utf8');
}

function applyAnchor(text, name, marker, find, replace) {
  if (text.includes(marker)) { step(name, 'SKIP', 'already patched'); return text; }
  const count = text.split(find).length - 1;
  if (count !== 1) { step(name, 'FAIL', 'anchor ' + count + 'x: ' + JSON.stringify(String(find).slice(0, 70))); return text; }
  step(name, 'OK');
  return text.replace(find, replace);
}

// ---------- 1. new files (from pack) ----------
try {
  fs.copyFileSync(tmpf('fdw-sensordb.js'), path.join(SRC, 'sensordb.js'));
  fs.copyFileSync(tmpf('fdw-routes-sensors.js'), path.join(SRC, 'routes', 'sensors.js'));
  step('copy sensordb.js + routes/sensors.js', 'OK');
} catch (e) { step('copy new files', 'FAIL', e.message); }

// ---------- 2. index.js ----------
try {
  let t = backup(path.join(SRC, 'index.js'));
  t = applyAnchor(t, 'index.import', "import sensorsRouter from './routes/sensors.js';",
    "import weatherRouter from './routes/weather.js';",
    "import weatherRouter from './routes/weather.js';\nimport sensorsRouter from './routes/sensors.js';");
  t = applyAnchor(t, 'index.mount', "app.use('/api', sensorsRouter);",
    "app.use('/api', weatherRouter);",
    "app.use('/api', weatherRouter);\napp.use('/api', sensorsRouter);");
  const before = report.failCount || 0;
  if ((report.failCount || 0) === before) { fs.writeFileSync(path.join(SRC, 'index.js'), t); step('index.write', 'OK'); }
  else step('index.write', 'SKIP', 'FAIL earlier, original kept');
} catch (e) { step('index.js patch', 'FAIL', e.message); }

// ---------- 3. weather.js helper ----------
try {
  let t = backup(path.join(SRC, 'weather.js'));
  t = applyAnchor(t, 'wx.import', "import { recordPressureSample, pressureStats } from './sensordb.js';",
    'let cache = { key: null, data: null, fetchedAt: 0 };',
    "import { recordPressureSample, pressureStats } from './sensordb.js';\nlet cache = { key: null, data: null, fetchedAt: 0 };");
  t = applyAnchor(t, 'wx.current_params', 'wind_direction_10m,wind_gusts_10m,apparent_temperature,is_day',
    '&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature',
    '&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,apparent_temperature,is_day,cloud_cover,pressure_msl,surface_pressure,uv_index,shortwave_radiation');
  t = applyAnchor(t, 'wx.daily_params', ',sunrise,sunset,uv_index_max',
    '&daily=weather_code,temperature_2m_max,temperature_2m_min',
    '&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max');
  t = applyAnchor(t, 'wx.current_map', 'code: current.weather_code,',
    [
      '      humidity: current.relative_humidity_2m ?? null,',
      '      wind: current.wind_speed_10m ?? null,',
      '      condition: wmoToCondition(current.weather_code)',
      '    },'
    ].join('\n'),
    [
      '      humidity: current.relative_humidity_2m ?? null,',
      '      wind: current.wind_speed_10m ?? null,',
      '      code: current.weather_code,',
      '      is_day: current.is_day,',
      '      cloud_cover: current.cloud_cover ?? null,',
      '      wind_dir: current.wind_direction_10m ?? null,',
      '      wind_gusts: current.wind_gusts_10m ?? null,',
      '      pressure_msl: current.pressure_msl ?? null,',
      '      surface_pressure: current.surface_pressure ?? null,',
      '      uv_index: current.uv_index ?? null,',
      '      shortwave_radiation: current.shortwave_radiation ?? null,',
      '      condition: wmoToCondition(current.weather_code)',
      '    },'
    ].join('\n'));
  t = applyAnchor(t, 'wx.daily_map', 'uvMax: raw.daily.uv_index_max ? raw.daily.uv_index_max[i] : null,',
    '      min: Math.round(raw.daily.temperature_2m_min[i]),',
    [
      '      min: Math.round(raw.daily.temperature_2m_min[i]),',
      '      sunrise: raw.daily.sunrise ? raw.daily.sunrise[i] : null,',
      '      sunset: raw.daily.sunset ? raw.daily.sunset[i] : null,',
      '      uvMax: raw.daily.uv_index_max ? raw.daily.uv_index_max[i] : null,'
    ].join('\n'));
  t = applyAnchor(t, 'wx.pressure_hook', 'recordPressureSample(Math.round(current.pressure_msl',
    '  cache = { key, data, fetchedAt: now };',
    [
      '  try {',
      '    if (Number.isFinite(current.pressure_msl)) recordPressureSample(Math.round(current.pressure_msl * 10) / 10);',
      '    const pstats = pressureStats();',
      '    if (pstats) data.pressure = pstats;',
      "  } catch (e) { console.error('[weather] pressure stats failed:', e.message); }",
      '',
      '  cache = { key, data, fetchedAt: now };'
    ].join('\n'));
  const before = report.failCount || 0;
  if ((report.failCount || 0) === before) { fs.writeFileSync(path.join(SRC, 'weather.js'), t); step('wx.write', 'OK'); }
  else step('wx.write', 'SKIP', 'FAIL earlier, original kept');
} catch (e) { step('weather.js patch', 'FAIL', e.message); }

// ---------- 4. routes/weather.js ----------
try {
  let t = backup(path.join(SRC, 'routes', 'weather.js'));
  t = applyAnchor(t, 'alerts_route', "router.get('/weather/alerts'",
    'export default router;',
    [
      '// Active National Weather Service alerts (cached 10 min per lat/lon).',
      'let alertCache = { key: null, data: null, at: 0 };',
      "router.get('/weather/alerts', async (req, res) => {",
      '  try {',
      "    const zip = req.query.zip || req.query.location || '';",
      '    let lat = Number(req.query.lat), lon = Number(req.query.lon);',
      '    if ((!Number.isFinite(lat) || !Number.isFinite(lon)) && zip) {',
      '      const geo = await geocodeLocation(zip);',
      '      if (geo) { lat = geo.lat; lon = geo.lon; }',
      '    }',
      '    if (!Number.isFinite(lat) || !Number.isFinite(lon)) { lat = 28.80249; lon = -81.64452; }',
      "    const key = lat.toFixed(3) + ',' + lon.toFixed(3);",
      '    const now = Date.now();',
      '    if (alertCache.data && alertCache.key === key && now - alertCache.at < 600000) return res.json(alertCache.data);',
      "    const r = await fetch('https://api.weather.gov/alerts/active?status=actual&point=' + lat + ',' + lon,",
      "      { headers: { 'User-Agent': 'family-dashboard-kiosk', Accept: 'application/geo+json' } });",
      "    if (!r.ok) throw new Error('alerts http ' + r.status);",
      '    const j = await r.json();',
      '    const alerts = (j.features || []).slice(0, 5).map(f => ({',
      "      event: f.properties.event, headline: f.properties.headline || '',",
      "      severity: f.properties.severity || '', effective: f.properties.effective,",
      "      ends: f.properties.ends || f.properties.expires || ''",
      '    }));',
      '    const data = { alerts };',
      '    alertCache = { key, data, at: now };',
      '    res.json(data);',
      '  } catch (err) { res.status(500).json({ error: err.message }); }',
      '});',
      '',
      'export default router;'
    ].join('\n'));
  const before = report.failCount || 0;
  if ((report.failCount || 0) === before) { fs.writeFileSync(path.join(SRC, 'routes', 'weather.js'), t); step('alerts.write', 'OK'); }
  else step('alerts.write', 'SKIP', 'FAIL earlier, original kept');
} catch (e) { step('routes/weather.js patch', 'FAIL', e.message); }

// ---------- 5. database: token + screen-17 seed (skipped in FDW_TEST mode) ----------
if (!process.env.FDW_TEST) {
try {
  const { createRequire } = require('module');
  const rr = createRequire(path.join(SRC, 'db.js'));
  const Database = rr('better-sqlite3');
  const DATA_DIR = process.env.DATA_DIR || '/app/server/data';
  const dbPath = path.join(DATA_DIR, 'dashboard.sqlite');
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(r => r.name);
  step('db tables', 'OK', tables.join(','));

  // ingest token
  let token = null;
  try {
    const tname = ['settings', 'app_settings', 'app_settings_kv'].find(nm => tables.includes(nm));
    let cols = tname ? db.prepare('PRAGMA table_info(' + tname + ')').all().map(c => c.name) : [];
    if (tname && cols.includes('key') && cols.includes('value')) {
      const row = db.prepare('SELECT value FROM ' + tname + " WHERE key = 'sensor_ingest_token'").get();
      if (row && row.value) { token = row.value; }
      else {
        token = require('crypto').randomBytes(20).toString('hex');
        db.prepare('INSERT INTO ' + tname + " (key, value) VALUES ('sensor_ingest_token', ?)").run(token);
      }
    } else {
      step('token table', 'WARN', 'no settings key/value table found: ' + tables.join(','));
    }
  } catch (e) { step('token', 'FAIL', e.message); }

  // screen 17 composite block
  try {
    const sbCols = db.prepare("PRAGMA table_info(screen_blocks)").all().map(c => c.name);
    const has = db.prepare("SELECT id FROM screen_blocks WHERE screen_id = 17 AND type = 'weather_station'").get();
    if (has) { step('s17 seed', 'SKIP', 'weather_station block exists (id ' + has.id + ')'); }
    else {
      const cfg = JSON.stringify({ zip: '32757', outdoorChannel: 'A', indoorChannel: 'B' });
      if (sbCols.includes('x_percent')) {
        db.prepare("INSERT INTO screen_blocks (screen_id, type, x_percent, y_percent, w_percent, h_percent, config, created_at) VALUES (17, 'weather_station', 0.5, 0.5, 58.2, 98.6, ?, 'now')").run(cfg);
      } else {
        db.prepare("INSERT INTO screen_blocks (screen_id, type, pos_x, pos_y, width, height, config, created_at) VALUES (17, 'weather_station', 0, 0, 58, 98, ?, 'now')").run(cfg);
      }
      step('s17 seed', 'OK');
    }
  } catch (e) { step('s17 seed', 'FAIL', e.message); }

  report.token = token;
  report.dbPath = dbPath;
} catch (e) { step('db seed', 'FAIL', e.message); }
}

console.log('FDW_RESULT ' + JSON.stringify(report));
if (!report.ok) process.exit(1);
