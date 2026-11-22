// radar.js — Rainbow Weather (api.rainbow.ai) server-side tile proxy (token ws7aj; ws7at quota space; ws7au mint throttle).
// Injects the subscription key server-side (Rainbow's docs refuse browser keys; the kiosk HTML is
// public), disk-caches response tiles, rotates primary/secondary keys round-robin with per-key
// cooldown, counts upstream attempts to data/rainbow-usage.json (ws7at: usage.left is scaled into
// Rainbow's own quota units over the 20th->19th billing window — see the consts below), and
// circuit-breaks on quota errors (503 {fallback:true}) — the rwRV deck watches /radar/api/health
// and auto-plays the untouched RainViewer path while the breaker is open. Rollback: git revert.
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
// ws7at: Rainbow's free tier = 10,000 calls per billing window (the 20th -> the 19th UTC; their
// dashboard 2026-11-21: "8,307 used · 1,693 left of 10,000 · resets on December 20, 2026").
// VERIFIED 1:1 live reconciliation: their raw ledger (8,715 requests) == our lifetime attempt
// meter (8,619, within ~1% — skew: NAS's ~5 attempts + probe calls + a few minutes' clock skew),
// so left = QUOTA_CAP - attempts * UPC with UPC = 1 — "On Free, each call counts as 1" (their
// pricing page; paid tiers bill Tiles=2 -> set RAINBOW_UPC=2 then). The client ladder thresholds
// (7800/7000) read the same usage.left and keep their original ws7ar economics (fresh 10,000 ->
// tier 2; brake at 700). "Plan state (internal)" is NOT customer-callable (12 probed paths 404;
// no RateLimit/quota headers on 200s) — the attempt meter IS the truth. Recalibrate UPC only if
// their billing semantics change (set RAINBOW_UPC=2 on a paid plan).
const QUOTA_CAP = Number(process.env.RAINBOW_QUOTA_CAP || 10000);
const UPC = Number(process.env.RAINBOW_UPC || 1);       // Rainbow billed units per upstream attempt (Free = 1)
const BRAKE = Number(process.env.RAINBOW_BRAKE || 700); // breaker opens while left <= BRAKE (drift margin before their hard pause)
const COOL_MS = 5 * 60000;   // per-key cooldown after 429/402
const BAD_MS = 60 * 60000;   // per-key cooldown after 401/403 (key invalid)
const FUT_TTL = 2 * 3600000; // future/edge frames: match their CDN max-age=7200
// ws7au: free-tier sustainment — Rainbow bills 1:1 for tile fetches AND the snapshot probe (their
// ledger == our attempt meter within ~1%), and the ws7at window burned out in ~36 h at the
// mint-on-demand rate (~42 calls per 10-min publish roll — each new publish's (snap, off) family
// is fresh: 7 frames x 6 tiles). Now the proxy MINTS at most one edge frame family per
// RAINBOW_MINT_EVERY (default 40 min) and every other cache miss — future offsets, stale past
// slots, within-cadence edges — HOLDS to the last minted edge tile (same z/x/y: the deck's
// viewport is fixed, so the file exists). Steady burn at the 40-min cadence: ~36 edge families/day
// (=216 tiles) + ~36 snapshot re-polls (the snapshot id feeds the deck's stamps, so it re-polls at
// the mint cadence too) ~= 252 calls/day ~ 7,560 per 30-day window, comfortably under the brake
// floor (left 700 == total 9,300) — the newest radar runs ~40-90 min old and the HUD stamps trail
// wall clock by up to ~50 min; that is the price of a full month on Rainbow without paying (the
// ws7at option text undercounted the billed snapshot probes). The 503 RainViewer breaker stays the
// backstop. Set RAINBOW_MINT_EVERY=0 to restore mint-on-demand (parity probing).
const MINT_EVERY_MS = Number(process.env.RAINBOW_MINT_EVERY || 2400000);
const MINT_DAY_CAP = Number(process.env.RAINBOW_DAY_MINT_CAP || 60); // max edge families/day (cadence binds first)
const SNAP_TTL_MS = Number(process.env.RAINBOW_SNAP_TTL || 2400000); // snapshot probe re-poll: ~1 per mint cycle (billed 1:1 too)
const MINT_PATH = path.join(DATA_DIR, 'rainbow-mint.json');          // { t, snap, day, n }
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
  // ws7at: key the meter to Rainbow's BILLING window (the 20th -> the 19th UTC), not the calendar
  // month — a calendar Dec 1 zero would fake a fresh 10K while their real quota carries to Dec 20.
  const bm = new Date(d.getTime() - (d.getUTCDate() < 20 ? 21 * 86400000 : 0));
  const ym = bm.getUTCFullYear() + '-' + String(bm.getUTCMonth() + 1).padStart(2, '0');
  const day = d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0');
  try {
    if (fs.existsSync(USAGE_PATH)) {
      const j = JSON.parse(fs.readFileSync(USAGE_PATH, 'utf8'));
      if (j.ym === ym) { rbkUsage = { ym: ym, days: j.days || {}, k1: j.k1 || 0, k2: j.k2 || 0, total: j.total || 0 }; }
      else { rbkUsage = { ym: ym, days: {}, k1: 0, k2: 0, total: 0 }; } // ws7as/ws7at: the meter zeroes at the billing-window rollover (a stale carry no longer leaks across windows)
    }
  } catch (e) {}
  rbkUsage.day = day; // ws7as: real per-day histogram key (rbkBump reads rbkUsage.day — was the undefined-key bug)
  rbkUsage.ym = ym;
  const today = (rbkUsage.days && rbkUsage.days[day]) || 0;
  return { ym: ym, day: day, today: today, k1: rbkUsage.k1, k2: rbkUsage.k2, total: rbkUsage.total, left: Math.round(QUOTA_CAP - rbkUsage.total * UPC) };
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
  if (QUOTA_CAP - rbkUsage.total * UPC <= BRAKE) return { open: true, why: 'quota-floor' };
  return { open: false };
}
// ws7au: persisted mint ledger + per-request mint gate. Only the LIVE edge family (off === 0,
// |snap - liveRef| <= 60 where liveRef is the newest known publish id and the client builds its
// slots from it, so the live slot's distance is 0) may mint, at most one family per MINT_EVERY_MS
// and MINT_DAY_CAP per UTC day; every other cache miss HOLDS to the last minted edge tile.
// Returns the hold file path, or null to mint (cold start / viewport changes pass through the
// early null-return — bounded, since each mint refreshes the ledger and subsequent misses find
// their hold file).
let rbkMint = null;
function rbkMintLedger() {
  if (rbkMint) return rbkMint;
  let fresh = true;
  try { const j = JSON.parse(fs.readFileSync(MINT_PATH, 'utf8')); if (j && typeof j.t === 'number') { rbkMint = j; fresh = false; } } catch (e) {}
  if (!rbkMint) rbkMint = { t: 0, snap: 0, day: '', n: 0 };
  if (fresh) rbkMintSave(); // ws7au: seed the ledger file on first boot (restart continuity + observability while braked)
  return rbkMint;
}
function rbkMintSave() { try { fs.writeFileSync(MINT_PATH + '.tmp', JSON.stringify(rbkMintLedger())); fs.renameSync(MINT_PATH + '.tmp', MINT_PATH); } catch (e) {} }
function rbkMintGate(layer, snap, off, z, x, y, col, liveRef) {
  const m = rbkMintLedger();
  const d = new Date();
  const mday = d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0'); // ws7au: named mday — rbkUsageNow owns the `const day` shape the ws7at gate pins
  if (m.day !== mday) { m.day = mday; m.n = 0; rbkMintSave(); }
  const holdFile = m.snap ? path.join(TILE_DIR, layer + '_' + m.snap + '_0_' + z + '_' + x + '_' + y + '_' + col + '.png') : '';
  if (!holdFile || !fs.existsSync(holdFile)) return null; // nothing to hold -> complete/mint
  if (off > 0) return holdFile;                        // future nowcasts always hold
  if (Math.abs(snap - liveRef) > 60) return holdFile; // stale past slots always hold — liveRef is the newest known publish id and the client builds its slots FROM it, so the live slot's distance is 0 (±60 s slack; NOT wall clock, which would misread a 40-min-stale snapshot feed as ~3000s stale)
  if (m.n >= MINT_DAY_CAP) return holdFile;            // runaway guard (cadence binds first)
  if (Date.now() - m.t < MINT_EVERY_MS) return holdFile; // the 30-min cadence
  m.t = Date.now(); m.n += 1; m.snap = snap; rbkMintSave(); // claim the cycle optimistically (dedupes concurrent fires)
  return null; // mint the live edge
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
  const mnt = rbkMintLedger();
  res.set('Cache-Control', 'no-store');
  res.json({ rbk: !b.open && rbkKeys.list.length > 0, keys: rbkKeys.list.length, why: b.open ? b.why : 'ok', usage: rbkUsageNow(), mint: { ago: Math.max(0, Date.now() - mnt.t), snap: mnt.snap, n: mnt.n, every: MINT_EVERY_MS, ttl: SNAP_TTL_MS } });
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
  // ws7au: mint throttle — a cache miss holds to the last minted edge tile unless the gate mints
  const rbkHold = rbkMintGate(layer, snap, off, z, x, y, col, rbkSnap.v || nowSnap);
  if (rbkHold) {
    res.set('Cache-Control', 'public, max-age=1800');
    res.set('Content-Type', 'image/png');
    res.set('X-Rbk-Hold', '1');
    return res.sendFile(rbkHold);
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
        if (off === 0) { const m = rbkMintLedger(); m.t = Date.now(); if (m.snap !== snap) { m.n += 1; } m.snap = snap; rbkMintSave(); } // ws7au: only true edge-family mints advance the ledger (n counts families)
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
  if (rbkSnap.v && (now - rbkSnap.t) < SNAP_TTL_MS) return res.json({ snapshot: rbkSnap.v, cached: true }); // ws7au: the snapshot probe bills 1:1 too — re-polls at the mint cadence (~36/day)
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
