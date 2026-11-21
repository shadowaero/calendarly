#!/usr/bin/env node
// wx7at-eval.cjs — executes the PATCHED radar.js's REAL rbkUsageNow + rbkBump (and rbkBreaker)
// in a vm sandbox (faked UTC clock + stubbed fs) proving the ws7at quota space:
// (1) clean start reports left=10000 (Rainbow units) keyed to the billing window,
// (2) the live-file adoption yields left = round(10000 - attempts*3.354) — today's calibration
//     (2,476 attempts -> 1,696 vs Rainbow's own 1,693),
// (3) NO zero at the calendar Dec 1 (the meter keys the 20th window — a carried process stays),
// (4) the billing rollover at Dec 20 00:00 UTC zeroes it (in-process AND crash-across-boundary),
// (5) bump math: attempts integer, left scaled, per-day histogram real dates,
// (6) the breaker opens at the 700-unit floor (left <= 700 -> open 'quota-floor'; above -> closed).
const fs = require('fs');
const vm = require('vm');
const src = fs.readFileSync('server/src/routes/radar.js', 'utf8');
function sliceFn(name) {
  const at = src.indexOf('function ' + name + '(');
  if (at < 0) throw new Error('fn missing: ' + name);
  let depth = 0, end = -1;
  for (let i = src.indexOf('{', at); i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
  }
  return src.slice(at, end);
}
const code = sliceFn('rbkUsageNow') + '\n' + sliceFn('rbkBump') + '\n' + sliceFn('rbkBreaker');
const UPC = 1, QUOTA_CAP = 10000, BRAKE = 700;
const expLeft = function (attempts) { return Math.round(QUOTA_CAP - attempts * UPC); };
let NOW = 0;
function shimDate() {
  function D(ms) { this._d = new Date(ms === undefined ? NOW : ms); }
  D.now = function () { return NOW; };
  for (const m of ['getUTCFullYear', 'getUTCMonth', 'getUTCDate', 'getTime']) D.prototype[m] = function () { return this._d[m](); };
  return D;
}
function makeCtx(memJson, withBreaker) {
  let store = memJson;      // the persisted rainbow-usage.json bytes (null = no file)
  let tmpStore = null;
  const fsStub = {
    existsSync: function (p) { return String(p).indexOf('rainbow-usage.json') >= 0 && store !== null; },
    readFileSync: function (p) { if (store === null) throw new Error('ENOENT'); return store; },
    writeFileSync: function (p, txt) { if (String(p).indexOf('.tmp') >= 0) tmpStore = txt; },
    renameSync: function () { store = tmpStore; tmpStore = null; },
  };
  const ctx = {
    fs: fsStub, USAGE_PATH: '/data/rainbow-usage.json',
    QUOTA_CAP: QUOTA_CAP, UPC: UPC, BRAKE: BRAKE, console: { log: function () {} }, Date: shimDate(),
  };
  if (withBreaker) { ctx.rbkKeys = { list: [{}, {}], mtime: 1 }; ctx.rbkReadKeys = function () { return ctx.rbkKeys.list; }; }
  vm.createContext(ctx);
  vm.runInContext((withBreaker ? '' : "var rbkUsage = { ym: '', k1: 0, k2: 0, total: 0 };\n") + code, ctx);
  return {
    now: function () { return ctx.rbkUsageNow(); },
    bump: function (i) { ctx.rbkBump(i); },
    breaker: function () { return ctx.rbkBreaker(); },
    state: function () { const u = ctx.rbkUsage; return { ym: u.ym, day: u.day, total: u.total, k1: u.k1, k2: u.k2 }; },
    peekFile: function () { return JSON.parse(store); },
  };
}
let bad = 0, npass = 0;
function want(tag, ok) { console.log((ok ? 'PASS ' : 'FAIL ') + tag); if (ok) npass++; else bad++; }
// (1) clean start: fresh window left=10000, bm key = current month when day >= 20
const c1 = makeCtx(null); NOW = Date.parse('2026-11-20T12:00:00Z');
const w1 = c1.now();
want('clean.start left=10000 ym=2026-11 day=today', w1.total === 0 && w1.left === 10000 && w1.ym === '2026-11' && w1.day === '2026-11-20');
c1.bump(0);
const f1 = c1.peekFile();
want('clean.bump dateKey + integer total', f1.total === 1 && f1.days['2026-11-20'] === 1 && !('undefined' in f1.days) && f1.ym === '2026-11');
// (2) live-today adoption (truth 1:1): 8,619 lifetime attempts -> left 1,381 (their pool is nearly empty)
const c2 = makeCtx(JSON.stringify({ ym: '2026-11', days: { '2026-11-21': 6145, 'undefined': 2474 }, k1: 4502, k2: 4117, total: 8619 }));
NOW = Date.parse('2026-11-21T19:55:00Z');
const w2 = c2.now();
want('adopt.live1to1 left=1381', w2.total === 8619 && w2.left === 1381 && w2.ym === '2026-11' && w2.today === 6145);
c2.bump(0);
want('adopt.bump continues + left drops', c2.state().total === 8620 && c2.now().left === expLeft(8620));
// (3) THE ws7at point: calendar Dec 1 must NOT zero a carried process (their window runs to the 20th)
NOW = Date.parse('2026-12-01T00:05:00Z');
const w3 = c2.now();
want('dec1.noZero ym=2026-11 left=expLeft(8620)', w3.total === 8620 && w3.ym === '2026-11' && w3.left === expLeft(8620));
// (4a) in-process rollover AT the billing boundary
NOW = Date.parse('2026-12-20T00:01:00Z');
const w4 = c2.now();
want('rollover.dec20Zero total=0 left=10000', w4.total === 0 && w4.left === 10000 && w4.ym === '2026-12');
c2.bump(1);
const f4 = c2.peekFile();
want('rollover.freshDecemberBillingFile', f4.ym === '2026-12' && f4.total === 1 && f4.days['2026-12-20'] === 1);
// (4b) crash across the boundary
const c3 = makeCtx(JSON.stringify({ ym: '2026-11', days: {}, k1: 610, k2: 590, total: 1234 }));
NOW = Date.parse('2026-12-21T08:00:00Z');
const w5 = c3.now();
want('crash.zeroBeforeAnyBump', w5.total === 0 && w5.left === 10000 && w5.ym === '2026-12');
// (5) window-key edges (pure date function)
const extra = function (iso) { const c = makeCtx(null); NOW = Date.parse(iso); return c.now().ym; };
want('window.nov19->2026-10', extra('2026-11-19T23:00:00Z') === '2026-10');
want('window.nov20->2026-11', extra('2026-11-20T00:00:00Z') === '2026-11');
want('window.dec19->2026-11', extra('2026-12-19T23:58:00Z') === '2026-11');
want('window.dec20->2026-12', extra('2026-12-20T00:00:00Z') === '2026-12');
want('window.jan1->prev-month', extra('2027-01-01T12:00:00Z') === '2026-12');
want('window.jan20->2027-01', extra('2027-01-20T12:00:00Z') === '2027-01');
// (6) breaker: left <= 700 -> open 'quota-floor'; 1,000 left -> closed
const c6 = makeCtx(JSON.stringify({ ym: '2026-11', days: {}, k1: 0, k2: 0, total: 9304 }), true);
NOW = Date.parse('2026-11-21T20:00:00Z');
const bOpen = c6.breaker();
want('breaker.openAtFloor left=696', bOpen.open === true && bOpen.why === 'quota-floor' && c6.now().left === Math.round(10000 - 9304 * UPC));
const c6b = makeCtx(JSON.stringify({ ym: '2026-11', days: {}, k1: 0, k2: 0, total: 9000 }), true);
const bClosed = c6b.breaker();
want('breaker.closedRicher', bClosed.open === false && c6b.now().left === Math.round(10000 - 9000 * UPC));
// (7) fresh-window breaker: total 0 -> left 10000 -> closed (Dec 20 recovery)
const c7 = makeCtx(JSON.stringify({ ym: '2026-12', days: {}, k1: 0, k2: 0, total: 0 }), true);
NOW = Date.parse('2026-12-20T01:00:00Z');
want('breaker.freshWindowClosed', c7.breaker().open === false && c7.now().left === 10000);
console.log(bad === 0 ? 'WX7AT_EVAL_OK ' + npass + '/' + (npass + bad) : 'WX7AT_EVAL_FAIL ' + bad);
process.exit(bad === 0 ? 0 : 1);