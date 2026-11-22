#!/usr/bin/env node
// wx7av-drygate.cjs — ws7av gates on the patched radar.js (server-only wave: the standby switch —
// the Pi 4 is the ONLY Rainbow caller; the NAS container runs standby: snapshot route 503s
// {fallback:true,why:'standby'}, tile cache misses 503 before the mint gate, disk hits serve free,
// /health carries the flag). Parse gate via node --check on a .mjs copy, then byte-needle gates
// incl. the ordering (route-top gate < ws7au TTL check; tile 503 < mint-gate hook) and every
// ws7au/ws7at prior structure intact. Runs on the repo copy pre-deploy.
const fs = require('fs');
const { spawnSync } = require('child_process');
const js = fs.readFileSync('server/src/routes/radar.js', 'utf8');
let bad = 0;
function want(tag, ok) { console.log((ok ? 'PASS ' : 'FAIL ') + tag); if (!ok) bad++; }
// parse
const chk = 'tmp/wx7av-check.mjs';
fs.writeFileSync(chk, js);
const p = spawnSync('node', ['--check', chk], { encoding: 'utf8' });
want('parse.nodeCheck.exit0', p.status === 0 ? true : String((p.stderr || p.stdout)).slice(-160));
try { fs.unlinkSync(chk); } catch (e) {}
// ws7av needles
want('nav.standbyConst.x1', (js.match(/const STANDBY_FILE = path\.join\(DATA_DIR, 'rainbow-standby'\);/g) || []).length === 1);
want('nav.standbyFn.x1', (js.match(/function rbkStandby\(\) \{ if \(process\.env\.RAINBOW_STANDBY === '1'\) return true; try \{ return fs\.existsSync\(STANDBY_FILE\); \} catch \(e\) \{ return false; \} \}/g) || []).length === 1);
want('nav.snapRouteGateFirst.x1', (js.match(/if \(rbkStandby\(\)\) return res\.status\(503\)\.json\(\{ fallback: true, why: 'standby' \}\); \/\/ ws7av: standby never probes/g) || []).length === 1);
want('nav.tileMissGate.x1', (js.match(/if \(rbkStandby\(\)\) return res\.status\(503\)\.set\('Retry-After', '300'\)\.json\(\{ fallback: true, why: 'standby' \}\);/g) || []).length === 1);
want('nav.healthFlag.x1', (js.match(/standby: rbkStandby\(\) \? 1 : undefined,/g) || []).length === 1);
want('nav.order.tileGateBeforeMint', js.indexOf("if (rbkStandby()) return res.status(503).set('Retry-After', '300')") < js.indexOf('const rbkHold = rbkMintGate('));
want('nav.order.snapGateBeforeTtl', js.indexOf("if (rbkStandby()) return res.status(503).json({ fallback: true, why: 'standby' }); // ws7av") < js.indexOf('if (rbkSnap.v && (now - rbkSnap.t) < SNAP_TTL_MS)'));
want('nav.order.tileGateBeforeUpstream', js.indexOf("if (rbkStandby()) return res.status(503).set('Retry-After', '300')") < js.indexOf("let tries = 0;"));
want('nav.ws7avMarkers.x4', (js.match(/ws7av[:;\),\. ]/g) || []).length >= 4);
// prior structures intact (ws7au + ws7at)
want('prior.mintEvery.x1', (js.match(/const MINT_EVERY_MS = Number\(process\.env\.RAINBOW_MINT_EVERY \|\| 2400000\);/g) || []).length === 1);
want('prior.dayCap.x1', (js.match(/const MINT_DAY_CAP = Number\(process\.env\.RAINBOW_DAY_MINT_CAP \|\| 60\);/g) || []).length === 1);
want('prior.snapTtl.x1', (js.match(/const SNAP_TTL_MS = Number\(process\.env\.RAINBOW_SNAP_TTL \|\| 2400000\);/g) || []).length === 1);
want('prior.mintPath.x1', (js.match(/const MINT_PATH = path\.join\(DATA_DIR, 'rainbow-mint\.json'\);/g) || []).length === 1);
want('prior.gateFn.x1', (js.match(/function rbkMintGate\(layer, snap, off, z, x, y, col, liveRef\) \{/g) || []).length === 1);
want('prior.gateTileHook.x1', (js.match(/const rbkHold = rbkMintGate\(layer, snap, off, z, x, y, col, rbkSnap\.v \|\| nowSnap\);/g) || []).length === 1);
want('prior.holdServe.x1', (js.match(/X-Rbk-Hold/g) || []).length === 1);
want('prior.mintAdvance.x1', (js.match(/if \(off === 0\) \{ const m = rbkMintLedger\(\); m\.t = Date\.now\(\); if \(m\.snap !== snap\) \{ m\.n \+= 1; \} m\.snap = snap; rbkMintSave\(\); \}/g) || []).length === 1);
want('prior.snapRouteTtl.x1', (js.match(/if \(rbkSnap\.v && \(now - rbkSnap\.t\) < SNAP_TTL_MS\) return res\.json\(\{ snapshot: rbkSnap\.v, cached: true \}\); \/\/ ws7au/g) || []).length === 1);
want('prior.healthMint.x1', (js.match(/mint: \{ ago: Math\.max\(0, Date\.now\(\) - mnt\.t\), snap: mnt\.snap, n: mnt\.n, every: MINT_EVERY_MS, ttl: SNAP_TTL_MS \}/g) || []).length === 1);
want('prior.ws7auMarkers.x4', (js.match(/ws7au[:; ]/g) || []).length >= 4);
want('prior.quotaCap.x1', (js.match(/const QUOTA_CAP = Number\(process\.env\.RAINBOW_QUOTA_CAP \|\| 10000\);/g) || []).length === 1);
want('prior.upc.x1', (js.match(/const UPC = Number\(process\.env\.RAINBOW_UPC \|\| 1\);/g) || []).length === 1);
want('prior.brake.x1', (js.match(/const BRAKE = Number\(process\.env\.RAINBOW_BRAKE \|\| 700\);/g) || []).length === 1);
want('prior.bmWindow.x1', (js.match(/const bm = new Date\(d\.getTime\(\) - \(d\.getUTCDate\(\) < 20 \? 21 \* 86400000 : 0\)\);/g) || []).length === 1);
want('prior.leftScaled.x1', (js.match(/left: Math\.round\(QUOTA_CAP - rbkUsage\.total \* UPC\)/g) || []).length === 1);
want('prior.rolloverElse.x1', (js.match(/else \{ rbkUsage = \{ ym: ym, days: \{\}, k1: 0, k2: 0, total: 0 \}; \}/g) || []).length === 1);
want('prior.dayKeyAssign.x1', (js.match(/rbkUsage\.day = day;/g) || []).length === 1);
want('prior.usageAdopt', js.indexOf('if (j.ym === ym) { rbkUsage = { ym: ym, days: j.days || {}, k1: j.k1 || 0, k2: j.k2 || 0, total: j.total || 0 }; }') >= 0);
want('prior.tileCacheServe.x1', (js.match(/snap \+ off < nowSnap \? 'public, max-age=86400, immutable' : 'public, max-age=1800'/g) || []).length === 1);
want('prior.ws7atMarkers.x4', (js.match(/ws7at[:\) ]/g) || []).length >= 4);
want('prior.monthCapGone.x0', (js.match(/MONTH_CAP|RINBOW_MONTH_CAP|9300/g) || []).length === 0);
want('prior.exportTail.x1', (js.match(/export default radarRouter;/g) || []).length === 1);
console.log(bad === 0 ? 'WX7AV_DRYGATE_OK' : 'WX7AV_DRYGATE_FAIL ' + bad);
process.exit(bad === 0 ? 0 : 1);