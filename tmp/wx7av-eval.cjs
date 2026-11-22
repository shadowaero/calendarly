#!/usr/bin/env node
// wx7av-eval.cjs — executes the PATCHED radar.js's REAL rbkStandby + rbkMintGate + ledger
// functions in a vm sandbox (in-memory fs + faked UTC clock), proving the ws7av standby switch:
//  (1) flag truth-table: default off; the DATA_DIR marker file turns it on; RAINBOW_STANDBY=1
//      forces it on at boot; a non-'1' env value is ignored,
//  (2) LAYERING: the mint gate itself is standby-blind (a cold-start gate call still returns
//      null with the marker present) — the ROUTE's 503-before-gate is the enforcement point,
//  (3) ws7au regression: the full mint-throttle suite re-runs unchanged (the Pi path is
//      byte-identical behavior while the flag is off),
//  (4) THE 30-DAY ROLL SIM re-runs (total still 7,560 / max 252/day — brake unreachable).
const fs = require('fs');
const vm = require('vm');
const pathMod = require('path');
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
const code = 'var rbkMint = null;\n' + sliceFn('rbkMintLedger') + '\n' + sliceFn('rbkMintSave') + '\n' + sliceFn('rbkMintGate') + '\n' + sliceFn('rbkStandby') +
  '\nthis.__api = { gate: rbkMintGate, ledger: rbkMintLedger, save: rbkMintSave, reset: function () { rbkMint = null; }, standby: rbkStandby };';
const MINT_EVERY_MS = 2400000, MINT_DAY_CAP = 60, SNAP_TTL_MS = 2400000;
let NOW = 0;
function shimDate() {
  function D(ms) { this._d = new Date(ms === undefined ? NOW : ms); }
  D.now = function () { return NOW; };
  for (const m of ['getUTCFullYear', 'getUTCMonth', 'getUTCDate', 'getTime']) D.prototype[m] = function () { return this._d[m](); };
  return D;
}
const TILE_DIR = '/data/rainbow-tiles', MINT_PATH = '/data/rainbow-mint.json', STANDBY_PATH = '/data/rainbow-standby';
function makeEnv(filesMap, envObj) {
  const pending = new Map();
  const fsStub = {
    existsSync: function (p) { return filesMap.has(String(p)) || pending.has(String(p)); },
    readFileSync: function (p) {
      if (pending.has(String(p))) return pending.get(String(p));
      if (filesMap.has(String(p))) return filesMap.get(String(p));
      throw new Error('ENOENT: ' + p);
    },
    writeFileSync: function (p, txt) { pending.set(String(p), txt); },
    renameSync: function (a, b) {
      const t = pending.has(String(a)) ? pending.get(String(a)) : (filesMap.has(String(a)) ? filesMap.get(String(a)) : undefined);
      pending.delete(String(a)); filesMap.set(String(b), t);
    },
  };
  const ctx = {
    fs: fsStub, path: pathMod, Date: shimDate(),
    process: { env: envObj || {} },
    TILE_DIR: TILE_DIR, MINT_PATH: MINT_PATH, STANDBY_FILE: STANDBY_PATH,
    MINT_EVERY_MS: MINT_EVERY_MS, MINT_DAY_CAP: MINT_DAY_CAP, SNAP_TTL_MS: SNAP_TTL_MS,
    console: { log: function () {} },
  };
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  return {
    api: ctx.__api, files: filesMap,
    mintSim: function (layer, snap, off, z, x, y, c) {
      const m = ctx.__api.ledger();
      m.t = NOW; if (m.snap !== snap) m.n += 1;
      m.snap = snap; ctx.__api.save();
      filesMap.set(pathMod.join(TILE_DIR, layer + '_' + snap + '_' + off + '_' + z + '_' + x + '_' + y + '_' + c + '.png'), 1);
    },
  };
}
let bad = 0, npass = 0;
function want(tag, ok) { console.log((ok ? 'PASS ' : 'FAIL ') + tag); if (ok) npass++; else bad++; }
const LAYER = 'precip-global', col = 8;
const holdPath = function (ls, z, x, y) { return pathMod.join(TILE_DIR, LAYER + '_' + ls + '_0_' + z + '_' + x + '_' + y + '_' + col + '.png'); };
// == (1) the flag truth table ==
const e0 = makeEnv(new Map(), {});
want('flag.offByDefault', e0.api.standby() === false);
const eM = makeEnv(new Map([[STANDBY_PATH, 1]]), {});
want('flag.markerFile', eM.api.standby() === true);
const eE = makeEnv(new Map(), { RAINBOW_STANDBY: '1' });
want('flag.envForce', eE.api.standby() === true);
const eZ = makeEnv(new Map(), { RAINBOW_STANDBY: '0' });
want('flag.envZeroIgnored', eZ.api.standby() === false);
// == (2) layering: the gate is standby-blind; the ROUTE 503s before it (static order shown in the drygate) ==
const routeSnap = src.indexOf("if (rbkStandby()) return res.status(503).json({ fallback: true, why: 'standby' }); // ws7av: standby never probes");
const routeTtl = src.indexOf('if (rbkSnap.v && (now - rbkSnap.t) < SNAP_TTL_MS)');
const tileGate = src.indexOf("if (rbkStandby()) return res.status(503).set('Retry-After', '300')");
const gateHook = src.indexOf('const rbkHold = rbkMintGate(');
want('layering.snapRouteThenTtl', routeSnap > -1 && routeSnap < routeTtl);
want('layering.tileGateThenMint', tileGate > -1 && tileGate < gateHook);
const S0 = Date.parse('2026-12-20T00:06:00Z'); NOW = S0;
want('layering.gateUnawareOfStandby', eM.api.gate(LAYER, Math.floor(NOW / 600000) * 600, 0, 7, 17, 26, col, Math.floor(NOW / 600000) * 600) === null);
// == (3) ws7au regression: the mint suite re-runs with the flag OFF (the Pi path is unchanged) ==
const BASE = S0; NOW = BASE;
const S = Math.floor(NOW / 600000) * 600;
const e1 = makeEnv(new Map(), {});
want('cold.firstMint', e1.api.gate(LAYER, S, 0, 7, 17, 26, col, S) === null);
e1.mintSim(LAYER, S, 0, 7, 17, 26, col);
want('family.siblingMints', e1.api.gate(LAYER, S, 0, 7, 18, 26, col, S) === null);
want('family.nCountedOnce', e1.api.ledger().n === 1);
e1.mintSim(LAYER, S, 0, 7, 18, 26, col);
NOW += 1000;
want('cadence.withinHold', e1.api.gate(LAYER, S + 600, 0, 7, 17, 26, col, S + 600) === holdPath(S, 7, 17, 26));
want('future.holds', e1.api.gate(LAYER, S, 600, 7, 17, 26, col, S + 600) === holdPath(S, 7, 17, 26));
want('future.fcstHolds', e1.api.gate(LAYER, S, 7200, 7, 17, 26, col, S + 600) === holdPath(S, 7, 17, 26));
NOW += 2500000;
want('stale.holdsBeyondCadence', e1.api.gate(LAYER, S - 3600, 0, 7, 17, 26, col, S + 600) === holdPath(S, 7, 17, 26));
const beforeN = e1.api.ledger().n;
const S2 = S + 600;
want('cadence.expiryMints', NOW - e1.api.ledger().t >= MINT_EVERY_MS && e1.api.gate(LAYER, S2, 0, 7, 17, 26, col, S2) === null);
want('cadence.claimAdvanced', e1.api.ledger().n === beforeN + 1 && e1.api.ledger().snap === S2);
e1.mintSim(LAYER, S2, 0, 7, 17, 26, col);
NOW += 60000;
e1.api.ledger().n = MINT_DAY_CAP; e1.api.save();
want('dayCap.holds', typeof e1.api.gate(LAYER, S2 + 600, 0, 7, 17, 26, col, S2 + 600) === 'string' && e1.api.ledger().n === MINT_DAY_CAP);
NOW = BASE + 86400000 + 300000;
const S4 = Math.floor(NOW / 600000) * 600;
want('dayRoll.resetsAndMints', e1.api.gate(LAYER, S4, 0, 7, 17, 26, col, S4) === null && e1.api.ledger().n === 1 && e1.api.ledger().day === '2026-12-21');
e1.mintSim(LAYER, S4, 0, 7, 17, 26, col);
e1.api.ledger().t = NOW - MINT_EVERY_MS - 1; // in-memory only, not saved
want('slotNeg1.holdsAtExpiry', e1.api.gate(LAYER, S4 - 600, 0, 7, 17, 26, col, S4) === holdPath(S4, 7, 17, 26));
const e2 = makeEnv(e1.files, {});
e2.api.reset();
want('persist.roundTrip', e2.api.ledger().snap === S4 && e2.api.ledger().n === 1 && e2.api.ledger().t === NOW);
want('zoom.firstMint', e2.api.gate(LAYER, S4, 0, 9, 68, 104, col, S4) === null);
e2.mintSim(LAYER, S4, 0, 9, 68, 104, col);
want('zoom.thenHolds', e2.api.gate(LAYER, S4, 0, 9, 68, 104, col, S4) === holdPath(S4, 9, 68, 104));
// == (4) THE 30-DAY ROLL SIM (unchanged from ws7au — the Pi stays primary) ==
const Z6 = [[7, 17, 26], [7, 18, 26], [7, 18, 27], [7, 17, 27], [7, 16, 26], [7, 17, 25]];
const sim = { day: [], total: 0, holds: 0 };
(function rollSim() {
  const sf = new Map();
  const env = makeEnv(sf, {});
  let rbkSnapV = 0, snapCheckT = 0;
  const DAY0 = Date.parse('2026-12-20T00:00:00Z');
  for (let d = 0; d < 30; d++) {
    let dayT = 0;
    for (let r = 0; r < 144; r++) {
      NOW = DAY0 + d * 86400000 + r * 600000 + 20000;
      const Sn = Math.floor(NOW / 600000) * 600;
      for (const pollAt of [NOW, NOW + 300000]) { // the deck polls the snapshot every 5 min
        if (pollAt - snapCheckT >= SNAP_TTL_MS) { snapCheckT = pollAt; rbkSnapV = Sn; dayT++; } // route re-check: <= 1 per TTL
      }
      const Sd = rbkSnapV;
      const fams = [];
      for (let k = 0; k < 7; k++) fams.push([Sd - k * 600, 0]);
      for (const o of [600, 1200, 1800, 2400, 3000, 3600]) fams.push([Sd, o]);
      fams.push([Sd, 7200]);
      for (const fm of fams) for (const g of Z6) { // the client fetches oldest -> newest, then the tail
        const p = pathMod.join(TILE_DIR, LAYER + '_' + fm[0] + '_' + fm[1] + '_' + g[0] + '_' + g[1] + '_' + g[2] + '_' + col + '.png');
        if (sf.has(p)) continue; // disk-cache hit (free)
        const hb = env.api.gate(LAYER, fm[0], fm[1], g[0], g[1], g[2], col, rbkSnapV);
        if (hb) { sim.holds++; continue; } // hold (free)
        dayT++;                             // upstream mint
        env.api.ledger().t = NOW; if (env.api.ledger().snap !== fm[0]) env.api.ledger().n += 1;
        env.api.ledger().snap = fm[0]; env.api.save();
        sf.set(p, 1);
      }
    }
    sim.day.push(dayT); sim.total += dayT;
  }
})();
let mx = 0; for (const c of sim.day) mx = Math.max(mx, c);
want('sim.windowTotal', sim.total <= 7800 && sim.total < 9000, sim.total);
want('sim.dailyCap', mx <= 300, mx);
want('sim.brakeUnreachable', sim.total < 9200, sim.total);
want('sim.holdsServe', sim.holds > 150000, sim.holds);
console.log(bad === 0 ? 'WX7AV_EVAL_OK ' + npass + '/' + (npass + bad) + ' (sim total=' + sim.total + ' maxDay=' + mx + ' holds=' + sim.holds + ')' : 'WX7AV_EVAL_FAIL ' + bad);
process.exit(bad === 0 ? 0 : 1);