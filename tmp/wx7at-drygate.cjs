#!/usr/bin/env node
// wx7at-drygate.cjs — ws7at gates on the patched radar.js (server-only wave: the usage meter now
// runs in Rainbow's own quota units over their 20th->19th billing window — left = 10,000 -
// attempts*UPC (calibrated 3.354), breaker opens at a 700-unit floor, no calendar-month Dec 1
// zero). Parse gate via node --check on a .mjs copy, then byte-needle gates incl. both prior
// (ws7aj-ws7as) structures intact. Runs on the repo copy pre-deploy.
const fs = require('fs');
const { spawnSync } = require('child_process');
const js = fs.readFileSync('server/src/routes/radar.js', 'utf8');
let bad = 0;
function want(tag, ok) { console.log((ok ? 'PASS ' : 'FAIL ') + tag); if (!ok) bad++; }
// parse
const chk = 'tmp/wx7at-check.mjs';
fs.writeFileSync(chk, js);
const p = spawnSync('node', ['--check', chk], { encoding: 'utf8' });
want('parse.nodeCheck.exit0', p.status === 0 ? true : String((p.stderr || p.stdout)).slice(-160));
try { fs.unlinkSync(chk); } catch (e) {}
// ws7at needles
want('needle.quotaCap.x1', (js.match(/const QUOTA_CAP = Number\(process\.env\.RAINBOW_QUOTA_CAP \|\| 10000\);/g) || []).length === 1);
want('needle.upc.x1', (js.match(/const UPC = Number\(process\.env\.RAINBOW_UPC \|\| 1\);/g) || []).length === 1);
want('needle.brake.x1', (js.match(/const BRAKE = Number\(process\.env\.RAINBOW_BRAKE \|\| 700\);/g) || []).length === 1);
want('needle.bmWindow.x1', (js.match(/const bm = new Date\(d\.getTime\(\) - \(d\.getUTCDate\(\) < 20 \? 21 \* 86400000 : 0\)\);/g) || []).length === 1);
want('needle.ymFromBm.x1', (js.match(/const ym = bm\.getUTCFullYear\(\) \+ '-' \+ String\(bm\.getUTCMonth\(\) \+ 1\)\.padStart\(2, '0'\);/g) || []).length === 1);
want('needle.leftScaled.x1', (js.match(/left: Math\.round\(QUOTA_CAP - rbkUsage\.total \* UPC\)/g) || []).length === 1);
want('needle.brakeFloor.x1', (js.match(/if \(QUOTA_CAP - rbkUsage\.total \* UPC <= BRAKE\) return \{ open: true, why: 'quota-floor' \};/g) || []).length === 1);
want('needle.calendarGone.x1', (js.match(/const ym = d\.getUTCFullYear/g) || []).length === 0);
want('needle.dayFromD.x1', (js.match(/const day = d\.getUTCFullYear\(\) \+ '-' \+ String\(d\.getUTCMonth/g) || []).length === 1);
want('needle.ws7atMarkers.x4', (js.match(/ws7at[:\) ]/g) || []).length >= 4);
// prior structures intact (ws7aj-ws7as)
want('prior.rolloverElse.x1', (js.match(/else \{ rbkUsage = \{ ym: ym, days: \{\}, k1: 0, k2: 0, total: 0 \}; \}/g) || []).length === 1);
want('prior.dayKeyAssign.x1', (js.match(/rbkUsage\.day = day;/g) || []).length === 1);
want('prior.ymAssignStill.x1', (js.match(/rbkUsage\.ym = ym;/g) || []).length === 1);
want('prior.usageAdopt', js.indexOf('if (j.ym === ym) { rbkUsage = { ym: ym, days: j.days || {}, k1: j.k1 || 0, k2: j.k2 || 0, total: j.total || 0 }; }') >= 0);
want('prior.bumpWrite', js.indexOf("fs.writeFileSync(USAGE_PATH + '.tmp', JSON.stringify({ ym: rbkUsage.ym") >= 0);
want('prior.monthCapGone.x0', (js.match(/MONTH_CAP|RINBOW_MONTH_CAP|9300/g) || []).length === 0);
want('prior.exportTail.x1', (js.match(/export default radarRouter;/g) || []).length === 1);
console.log(bad === 0 ? 'WX7AT_DRYGATE_OK' : 'WX7AT_DRYGATE_FAIL ' + bad);
process.exit(bad === 0 ? 0 : 1);