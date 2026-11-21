#!/usr/bin/env node
// wx7as-eval.cjs — executes the PATCHED radar.js's REAL rbkUsageNow + rbkBump in a vm sandbox
// (faked UTC clock + stubbed fs) proving: (1) clean start, (2) mid-month adoption continuity,
// (3) the Nov->Dec rollover ZEROES the meter even on a process that carried (the ws7as fix),
// (4) a stale November file re-zeroes a fresh process (crash across the boundary), (5) same-ym
// files adopt with no unwanted reset, (6) the per-day histogram keys real dates from bump 1.
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
const code = sliceFn('rbkUsageNow') + '\n' + sliceFn('rbkBump');
let NOW = 0;
function shimDate() {
  function D(ms) { this._d = new Date(ms === undefined ? NOW : ms); }
  D.now = function () { return NOW; };
  for (const m of ['getUTCFullYear', 'getUTCMonth', 'getUTCDate']) D.prototype[m] = function () { return this._d[m](); };
  return D;
}
function makeCtx(memJson) {
  let store = memJson;      // the persisted rainbow-usage.json bytes (null = no file)
  let tmpStore = null;
  const fsStub = {
    existsSync: function (p) { return String(p).indexOf('rainbow-usage.json') >= 0 && store !== null; },
    readFileSync: function (p) { if (store === null) throw new Error('ENOENT'); return store; },
    writeFileSync: function (p, txt) { if (String(p).indexOf('.tmp') >= 0) tmpStore = txt; },
    renameSync: function () { store = tmpStore; tmpStore = null; },
  };
  const ctx = { fs: fsStub, USAGE_PATH: '/data/rainbow-usage.json', MONTH_CAP: 9300, console: { log: function () {} }, Date: shimDate() };
  vm.createContext(ctx);
  vm.runInContext("var rbkUsage = { ym: '', k1: 0, k2: 0, total: 0 };\n" + code, ctx);
  return {
    now: function () { return ctx.rbkUsageNow(); },
    bump: function (i) { ctx.rbkBump(i); },
    state: function () { const u = ctx.rbkUsage; return { ym: u.ym, day: u.day, total: u.total, k1: u.k1, k2: u.k2 }; },
    peekFile: function () { return JSON.parse(store); },
  };
}
let bad = 0, npass = 0;
function want(tag, ok) { console.log((ok ? 'PASS ' : 'FAIL ') + tag); if (ok) npass++; else bad++; }
// (1) clean start + real day key from bump 1
const c1 = makeCtx(null); NOW = Date.parse('2026-11-20T12:00:00Z');
const w1 = c1.now();
want('clean.start left=9300 ym=2026-11 day=today', w1.total === 0 && w1.left === 9300 && w1.ym === '2026-11' && w1.day === '2026-11-20');
c1.bump(0);
const f1 = c1.peekFile();
want('clean.bump dateKey + no undefined', f1.total === 1 && f1.days['2026-11-20'] === 1 && !('undefined' in f1.days) && f1.ym === '2026-11');
c1.bump(1);
const f1b = c1.peekFile();
want('clean.bump.k2 sameDayKey', f1b.k2 === 1 && f1b.days['2026-11-20'] === 2);
// (2) mid-month adopt continuity (the live Nov 20 situation)
const c2 = makeCtx(JSON.stringify({ ym: '2026-11', days: { 'undefined': 1121 }, k1: 596, k2: 561, total: 1157 }));
NOW = Date.parse('2026-11-25T10:00:00Z');
const w2 = c2.now();
want('adopt.midMonth', w2.total === 1157 && w2.left === 8143 && w2.today === 0);
c2.bump(0);
const f2 = c2.peekFile();
want('adopt.continuity + realDateKey alongside legacy', f2.total === 1158 && f2.days['2026-11-25'] === 1 && f2.days['undefined'] === 1121);
// (3) THE rollover: same context (an in-memory carry) crosses Nov 30 -> Dec 1
NOW = Date.parse('2026-12-01T00:05:00Z');
const w3 = c2.now();
want('rollover.carryKilled total=0 left=9300', w3.total === 0 && w3.left === 9300 && w3.ym === '2026-12');
c2.bump(0);
const f3 = c2.peekFile();
want('rollover.freshDecemberFile', f3.ym === '2026-12' && f3.total === 1 && f3.days['2026-12-01'] === 1 && !('undefined' in f3.days));
// (4) crash across the boundary: fresh process + stale November file
const c3 = makeCtx(JSON.stringify({ ym: '2026-11', days: {}, k1: 610, k2: 590, total: 1234 }));
NOW = Date.parse('2026-12-03T08:00:00Z');
const w4 = c3.now();
want('crash.zeroBeforeAnyBump', w4.total === 0 && w4.left === 9300 && w4.ym === '2026-12');
c3.bump(0);
const f4 = c3.peekFile();
want('crash.freshDecemberFile', f4.ym === '2026-12' && f4.total === 1 && f4.days['2026-12-03'] === 1);
// (5) same-ym adopt: no unwanted reset
const c4 = makeCtx(JSON.stringify({ ym: '2026-12', days: { '2026-12-02': 40 }, k1: 20, k2: 20, total: 40 }));
NOW = Date.parse('2026-12-02T22:00:00Z');
const w5 = c4.now();
want('sameMonth.adopt', w5.total === 40 && w5.left === 9260 && w5.today === 40);
c4.bump(1);
want('sameMonth.bumpContinues', c4.peekFile().total === 41);
console.log(bad === 0 ? 'WX7AS_EVAL_OK ' + npass + '/' + (npass + bad) : 'WX7AS_EVAL_FAIL ' + bad);
process.exit(bad === 0 ? 0 : 1);