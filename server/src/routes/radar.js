// radar.js — Rainbow Weather (api.rainbow.ai) server-side tile proxy (token ws7aj).
// Injects the subscription key server-side (Rainbow's docs refuse browser keys; the kiosk HTML is
// public), disk-caches response tiles, rotates primary/secondary keys round-robin with per-key
// cooldown, counts upstream calls to data/rainbow-usage.json, and circuit-breaks on quota errors
// (503 {fallback:true}) — the rwRV deck watches /radar/api/health and auto-plays the untouched
// RainViewer path while the breaker is open. Rollback: git revert token ws7aj.
import express from 'express';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.RAINBOW_DATA_DIR || path.join(__dirname, '../../../data');
const KEYS_PATH = process.env.RAINBOW_KEYS || path.join(DATA_DIR, '.rainbow-api-keys');
const TILE_DIR = path.join(DATA_DIR, 'rainbow-tiles');
const USAGE_PATH = path.join(DATA_DIR, 'rainbow-usage.json');
const UPSTREAM_HOST = 'api.rainbow.ai';
const MONTH_CAP = Number(process.env.RAINBOW_MONTH_CAP || 9300); // free tier 10K/mo — brake before it
const COOL_MS = 5 * 60000;   // per-key cooldown after 429/402
const BAD_MS = 60 * 60000;   // per-key cooldown after 401/403 (key invalid)
const FUT_TTL = 2 * 3600000; // future/edge frames: match their CDN max-age=7200
try { fs.mkdirSync(TILE_DIR, { recursive: true }); } catch (e) {}

// keys file: RAINBOW_API_KEY=... / RAINBOW_API_KEY_2=... — re-read on mtime change (live rotation)
let rbkKeys = { list: [], mtime: 0 };
function rbkReadKeys() {
  try {
    const st = fs.statSync(KEYS_PATH);
    if (st.mtimeMs === rbkKeys.mtime && rbkKeys.list.length) return rbkKeys.list;
    const raw = fs.readFileSync(KEYS_PATH, 'utf8');
    const m1 = raw.match(/^\s*RAINBOW_API_KEY\s*=\s*(\S+)\s*$/m);
    const m2 = raw.match(/^\s*RAINBOW_API_KEY_2\s*=\s*(\S+)\s*$/m);
    const list = [];
    if (m1) list.push({ key: m1[1], cool: 0, bad: 0 });
    if (m2) list.push({ key: m2[1], cool: 0, bad: 0 });
    if (list.length) console.log('[radar] keys loaded: ' + list.length + ' (mt ' + st.mtimeMs + ')');
    rbkKeys = { list: list, mtime: st.mtimeMs };
  } catch (e) {
    if (rbkKeys.list.length) { console.log('[radar] keys file unreadable: ' + e.message); rbkKeys = { list: [], mtime: 0 }; }
  }
  return rbkKeys.list;
}
// usage counter: { ym, days: { d: n }, k1, k2, total } — upstream calls only
let rbkUsage = { ym: '', k1: 0, k2: 0, total: 0 };
function rbkUsageNow() {
  const d = new Date(Date.now() - 0);
  const ym = d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = ym + '-' + String(d.getUTCDate()).padStart(2, '0');
  try {
    if (fs.existsSync(USAGE_PATH)) {
      const j = JSON.parse(fs.readFileSync(USAGE_PATH, 'utf8'));
      if (j.ym === ym) { rbkUsage = { ym: ym, days: j.days || {}, k1: j.k1 || 0, k2: j.k2 || 0, total: j.total || 0 }; }
      else { rbkUsage = { ym: ym, days: {}, k1: 0, k2: 0, total: 0 }; } // ws7as: the meter zeroes at the year-month rollover (Nov's carry no longer leaks into Dec)
    }
  } catch (e) {}
  rbkUsage.day = day; // ws7as: real per-day histogram key (rbkBump reads rbkUsage.day — was the undefined-key bug)
  rbkUsage.ym = ym;
  const today = (rbkUsage.days && rbkUsage.days[day]) || 0;
  return { ym: ym, day: day, today: today, k1: rbkUsage.k1, k2: rbkUsage.k2, total: rbkUsage.total, left: MONTH_CAP - rbkUsage.total };
}
function rbkBump(idx) {
  rbkUsageNow();
  rbkUsage.total += 1;
  rbkUsage.days = rbkUsage.days || {};
  rbkUsage.days[rbkUsage.day] = (rbkUsage.days[rbkUsage.day] || 0) + 1;
  if (idx === 0) rbkUsage.k1 += 1; else rbkUsage.k2 += 1;
  try { fs.writeFileSync(USAGE_PATH + '.tmp', JSON.stringify({ ym: rbkUsage.ym, days: rbkUsage.days, k1: rbkUsage.k1, k2: rbkUsage.k2, total: rbkUsage.total })); fs.renameSync(USAGE_PATH + '.tmp', USAGE_PATH); } catch (e) {}
}
let rbkRR = 0; // round-robin cursor for even key spread
function rbkBreaker() {
  rbkReadKeys();
  rbkUsageNow();
  if (rbkUsage.total >= MONTH_CAP) return { open: true, why: 'month-cap' };
  return { open: false };
}
// per-IP rate limit: 240 tile GETs per min per IP (prefetch bursts ~ 8 tiles x 10 frames)
const rbkIPs = new Map();
function rbkLimit(ip) {
  const now = Date.now();
  const arr = (rbkIPs.get(ip) || []).filter(function (t) { return now - t < 60000; });
  if (arr.length >= 240) { rbkIPs.set(ip, arr); return false; }
  arr.push(now); rbkIPs.set(ip, arr);
  if (rbkIPs.size > 4000) for (const k of rbkIPs.keys()) { const a = rbkIPs.get(k) || []; if (a.every(function (t) { return now - t >= 60000; })) rbkIPs.delete(k); if (rbkIPs.size <= 3000) break; }
  return true;
}
function rbkGet(path_, key, cb) {
  const opt = { host: UPSTREAM_HOST, path: path_, method: 'GET', headers: { 'Ocp-Apim-Subscription-Key': key }, timeout: 20000 };
  const req = https.request(opt, function (res) {
    const chunks = [];
    res.on('data', function (c) { chunks.push(c); });
    res.on('end', function () { cb(res.statusCode, res.headers['content-type'] || '', Buffer.concat(chunks)); });
  });
  req.on('timeout', function () { req.destroy(new Error('timeout')); });
  req.on('error', function () { cb(0, '', Buffer.alloc(0)); });
  req.end();
}
const radarRouter = express.Router();
// disk hygiene: drop tiles older than 7 days (bounded growth), at most once an hour
let rbkSwept = 0;
function rbkSweep() {
  const t = Date.now(); if (t - rbkSwept < 3600000) return; rbkSwept = t;
  try { for (const f of fs.readdirSync(TILE_DIR)) { const p = path.join(TILE_DIR, f); if (t - fs.statSync(p).mtimeMs > 7 * 86400000) { try { fs.unlinkSync(p); } catch (e) {} } } } catch (e) {}
}
radarRouter.get('/health', function (req, res) {
  const b = rbkBreaker();
  rbkSweep();
  res.set('Cache-Control', 'no-store');
  res.json({ rbk: !b.open && rbkKeys.list.length > 0, keys: rbkKeys.list.length, why: b.open ? b.why : 'ok', usage: rbkUsageNow() });
});
function rbkTile(req, res, layer, offNum) {
  const ip = String(req.ip || 'x').replace(/[^A-Za-z0-9:.]/g, '').slice(0, 40);
  if (!rbkLimit(ip)) return res.status(429).set('Retry-After', '30').json({ fallback: true, why: 'rate' });
  const snap = Number(req.params.snap);
  const off = offNum != null ? offNum : 0;
  const z = Number(req.params.z), x = Number(req.params.x), y = Number(req.params.y);
  const col = Math.min(9, Math.max(0, (req.query.color === undefined || !Number.isFinite(Number(req.query.color))) ? 8 : Math.round(Number(req.query.color))));
  const ok = function (v) { return Number.isInteger(v); };
  if (!ok(snap) || !/^\d{10}$/.test(String(req.params.snap)) || snap % 600 !== 0) return res.status(400).json({ fallback: true, why: 'bad-snap' });
  if (!ok(off) || off % 600 !== 0 || off < 0 || off > (layer === 'radars' ? 0 : 14400)) return res.status(400).json({ fallback: true, why: 'bad-off' });
  if (!ok(z) || !(z >= 1 && z <= (layer === 'radars' ? 7 : 10)) || !ok(x) || !ok(y) || !(x >= 0 && y >= 0 && x < Math.pow(2, z) && y < Math.pow(2, z))) return res.status(400).json({ fallback: true, why: 'bad-geo' });
  const br = rbkBreaker();
  if (br.open || !rbkKeys.list.length) return res.status(503).set('Retry-After', '300').json({ fallback: true, why: br.open ? br.why : 'no-keys' });
  const file = path.join(TILE_DIR, layer + '_' + snap + '_' + off + '_' + z + '_' + x + '_' + y + '_' + col + '.png');
  const nowSnap = Math.floor(Date.now() / 600000) * 600;
  const fut = (snap === nowSnap && off > 0) || snap > nowSnap;
  if (fs.existsSync(file) && (!fut || (Date.now() - fs.statSync(file).mtimeMs) < FUT_TTL)) {
    res.set('Cache-Control', snap + off < nowSnap ? 'public, max-age=86400, immutable' : 'public, max-age=1800');
    res.set('Content-Type', 'image/png');
    return res.sendFile(file);
  }
  const up = layer === 'radars'
    ? ('/tiles/v1/' + layer + '/' + snap + '/' + z + '/' + x + '/' + y + '?color=' + col)
    : ('/tiles/v1/' + layer + '/' + snap + '/' + off + '/' + z + '/' + x + '/' + y + '?color=' + col);
  const ks = rbkKeys.list;
  let tries = 0;
  const attempt = function (idx) {
    tries++;
    const kk = ks[idx];
    if (!kk || kk.cool > Date.now() || kk.bad > Date.now()) {
      const nxt = 1 - idx;
      if (tries <= ks.length && ks[nxt] && !(ks[nxt].cool > Date.now() || ks[nxt].bad > Date.now())) return attempt(nxt);
      return res.status(503).json({ fallback: true, why: 'key-cooldown' });
    }
    rbkBump(idx);
    rbkGet(up, kk.key, function (st, ct, buf) {
      if (st === 200 && buf.length > 4) {
        const tmp = file + '.w' + idx;
        try { fs.writeFileSync(tmp, buf); fs.renameSync(tmp, file); } catch (e) {}
        res.set('Cache-Control', (snap + off < nowSnap) ? 'public, max-age=86400, immutable' : 'public, max-age=600');
        res.set('Content-Type', 'image/png');
        return res.end(buf);
      }
      if (st === 401 || st === 403) { kk.bad = Date.now() + BAD_MS; console.log('[radar] HTTP ' + st + ' ' + up + ' -> k' + (idx ? 2 : 1) + ' cool 60m'); }
      else if (st === 429 || st === 402) { kk.cool = Date.now() + COOL_MS; console.log('[radar] HTTP ' + st + ' ' + up + ' -> k' + (idx ? 2 : 1) + ' cool 5m'); }
      else console.log('[radar] HTTP ' + st + ' ' + up + ' (' + buf.length + 'B)');
      const nxt = 1 - idx;
      if (tries <= ks.length && ks[nxt] && !(ks[nxt].cool > Date.now() || ks[nxt].bad > Date.now())) return attempt(nxt);
      return res.status(503).json({ fallback: true, why: 'upstream-' + st });
    });
  };
  attempt(rbkRR % ks.length); rbkRR += 1;
}
// snapshot edge: their snapshot id is NOT wall-clock (the published edge lags real time), so the
// router serves it: 1 upstream call only on a 2-min cache miss; last-good survives outages.
let rbkSnap = { v: null, t: 0 };
function rbkSnapshotRoute(req, res) {
  const now = Date.now();
  if (rbkSnap.v && (now - rbkSnap.t) < 120000) return res.json({ snapshot: rbkSnap.v, cached: true });
  const br = rbkBreaker();
  if (br.open || !rbkKeys.list.length) { if (rbkSnap.v) return res.json({ snapshot: rbkSnap.v, cached: true, stale: true }); return res.status(503).json({ fallback: true, why: br.open ? br.why : 'no-keys' }); }
  const ks = rbkKeys.list;
  const attempt = function (idx) {
    const kk = ks[idx];
    if (!kk || kk.cool > Date.now() || kk.bad > Date.now()) {
      const nxt = 1 - idx;
      if (tries2 <= ks.length + 1 && ks[nxt] && !(ks[nxt].cool > Date.now() || ks[nxt].bad > Date.now())) { tries2 += 1; return attempt(nxt); }
      if (rbkSnap.v) return res.json({ snapshot: rbkSnap.v, cached: true, stale: true });
      return res.status(503).json({ fallback: true, why: 'key-cooldown' });
    }
    rbkBump(idx);
    rbkGet('/tiles/v1/snapshot?layer=precip-global', kk.key, function (st2, ct2, buf) {
      if (st2 === 200) {
        let j = null;
        try { j = JSON.parse(buf.toString('utf8')); } catch (e) {}
        if (j && j.snapshot) { rbkSnap.v = j.snapshot; rbkSnap.t = Date.now(); return res.json({ snapshot: rbkSnap.v, cached: false }); }
      }
      if (st2 === 401 || st2 === 403) kk.bad = Date.now() + BAD_MS;
      else if (st2 === 429 || st2 === 402) kk.cool = Date.now() + COOL_MS;
      console.log('[radar] snapshot HTTP ' + st2 + ' (' + buf.length + 'B)');
      const nxt = 1 - idx;
      if (ks[nxt] && !(ks[nxt].cool > Date.now() || ks[nxt].bad > Date.now())) return attempt(nxt);
      if (rbkSnap.v) return res.json({ snapshot: rbkSnap.v, cached: true, stale: true });
      return res.status(503).json({ fallback: true, why: 'upstream-' + st2 });
    });
  };
  let tries2 = 1;
  attempt(0);
}
radarRouter.get('/snapshot', rbkSnapshotRoute);
radarRouter.get('/tiles/v1/precip-global/:snap/:off/:z/:x/:y', function (req, res) { rbkTile(req, res, 'precip-global', Number(req.params.off)); });
radarRouter.get('/tiles/v1/radars/:snap/:z/:x/:y', function (req, res) { rbkTile(req, res, 'radars', 0); });
export default radarRouter;
