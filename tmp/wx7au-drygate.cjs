#!/usr/bin/env node
// wx7au-drygate.cjs — ws7au gates on the patched radar.js (server-only wave: the mint throttle —
// one edge-family mint per RAINBOW_MINT_EVERY (40 min), holds to the last minted edge tile for
// every other miss, snapshot probe re-poll tied to the same cadence, mint ledger persisted at
// data/rainbow-mint.json). Parse gate via node --check on a .mjs copy, then byte-needle gates incl.
// both prior (ws7aj-ws7at) structures intact. Runs on the repo copy pre-deploy.
const fs = require('fs');
const { spawnSync } = require('child_process');
const js = fs.readFileSync('server/src/routes/radar.js', 'utf8');
let bad = 0;
function want(tag, ok) { console.log((ok ? 'PASS ' : 'FAIL ') + tag); if (!ok) bad++; }
// parse
const chk = 'tmp/wx7au-check.mjs';
fs.writeFileSync(chk, js);
const p = spawnSync('node', ['--check', chk], { encoding: 'utf8' });
want('parse.nodeCheck.exit0', p.status === 0 ? true : String((p.stderr || p.stdout)).slice(-160));
try { fs.unlinkSync(chk); } catch (e) {}
// ws7au needles
want('needle.mintEvery.x1', (js.match(/const MINT_EVERY_MS = Number\(process\.env\.RAINBOW_MINT_EVERY \|\| 2400000\);/g) || []).length === 1);
want('needle.dayCap.x1', (js.match(/const MINT_DAY_CAP = Number\(process\.env\.RAINBOW_DAY_MINT_CAP \|\| 60\);/g) || []).length === 1);
want('needle.snapTtl.x1', (js.match(/const SNAP_TTL_MS = Number\(process\.env\.RAINBOW_SNAP_TTL \|\| 2400000\);/g) || []).length === 1);
want('needle.mintPath.x1', (js.match(/const MINT_PATH = path\.join\(DATA_DIR, 'rainbow-mint\.json'\);/g) || []).length === 1);
want('needle.ledger.x2', (js.match(/function rbkMintLedger\(\) \{/g) || []).length === 1 && (js.match(/function rbkMintSave\(\) \{/g) || []).length === 1);
want('needle.gateFn.x1', (js.match(/function rbkMintGate\(layer, snap, off, z, x, y, col, liveRef\) \{/g) || []).length === 1);
want('needle.gateHoldFuture.x1', (js.match(/if \(off > 0\) return holdFile;/g) || []).length === 1);
want('needle.gateLiveRef.x1', (js.match(/if \(Math\.abs\(snap - liveRef\) > 60\) return holdFile;/g) || []).length === 1);
want('needle.gateCadence.x1', (js.match(/if \(Date\.now\(\) - m\.t < MINT_EVERY_MS\) return holdFile;/g) || []).length === 1);
want('needle.gateDayCap.x1', (js.match(/if \(m\.n >= MINT_DAY_CAP\) return holdFile;/g) || []).length === 1);
want('needle.gateTileHook.x1', (js.match(/const rbkHold = rbkMintGate\(layer, snap, off, z, x, y, col, rbkSnap\.v \|\| nowSnap\);/g) || []).length === 1);
want('needle.holdServe.x3', (js.match(/X-Rbk-Hold/g) || []).length === 1 && (js.match(/public, max-age=1800/g) || []).length >= 2);
want('needle.mintAdvance.x1', (js.match(/if \(off === 0\) \{ const m = rbkMintLedger\(\); m\.t = Date\.now\(\); if \(m\.snap !== snap\) \{ m\.n \+= 1; \} m\.snap = snap; rbkMintSave\(\); \}/g) || []).length === 1);
want('needle.snapRouteTtl.x1', (js.match(/if \(rbkSnap\.v && \(now - rbkSnap\.t\) < SNAP_TTL_MS\) return res\.json\(\{ snapshot: rbkSnap\.v, cached: true \}\); \/\/ ws7au/g) || []).length === 1);
want('needle.healthMint.x1', (js.match(/mint: \{ ago: Math\.max\(0, Date\.now\(\) - mnt\.t\), snap: mnt\.snap, n: mnt\.n, every: MINT_EVERY_MS, ttl: SNAP_TTL_MS \}/g) || []).length === 1);
want('needle.ws7auMarkers.x4', (js.match(/ws7au[:; ]/g) || []).length >= 4);
// prior structures intact (ws7aj-ws7at)
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
console.log(bad === 0 ? 'WX7AU_DRYGATE_OK' : 'WX7AU_DRYGATE_FAIL ' + bad);
process.exit(bad === 0 ? 0 : 1);