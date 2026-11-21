#!/usr/bin/env node
// wx7as-drygate.cjs — ws7as gates on the patched radar.js (server-only wave: the usage meter
// zeroes at the year-month rollover + the per-day histogram gets a real date key). Parse gate via
// node --check on a .mjs copy (module-parse == calendarly's runtime target), then byte-needle
// gates incl. both prior structures being intact. Runs on the repo copy pre-deploy.
const fs = require('fs');
const { spawnSync } = require('child_process');
const js = fs.readFileSync('server/src/routes/radar.js', 'utf8');
let bad = 0;
function want(tag, ok) { console.log((ok ? 'PASS ' : 'FAIL ') + tag); if (!ok) bad++; }
// parse
const chk = 'tmp/wx7as-check.mjs';
fs.writeFileSync(chk, js);
const p = spawnSync('node', ['--check', chk], { encoding: 'utf8' });
want('parse.nodeCheck.exit0', p.status === 0 ? true : String((p.stderr || p.stdout)).slice(-160));
try { fs.unlinkSync(chk); } catch (e) {}
// ws7as needles
want('needle.rolloverElse.x1', (js.match(/else \{ rbkUsage = \{ ym: ym, days: \{\}, k1: 0, k2: 0, total: 0 \}; \}/g) || []).length === 1);
want('needle.dayKeyAssign.x1', (js.match(/rbkUsage\.day = day;/g) || []).length === 1);
want('needle.ws7asMarkers.x2', (js.match(/\/\/ ws7as:/g) || []).length === 2);
want('needle.ymAssignStill.x1', (js.match(/rbkUsage\.ym = ym;/g) || []).length === 1);
// prior structures intact
want('prior.monthCap', js.indexOf('const MONTH_CAP = Number(process.env.RAINBOW_MONTH_CAP || 9300);') >= 0);
want('prior.usageAdopt', js.indexOf('if (j.ym === ym) { rbkUsage = { ym: ym, days: j.days || {}, k1: j.k1 || 0, k2: j.k2 || 0, total: j.total || 0 }; }') >= 0);
want('prior.bumpWrite', js.indexOf("fs.writeFileSync(USAGE_PATH + '.tmp', JSON.stringify({ ym: rbkUsage.ym") >= 0);
want('prior.breaker', js.indexOf("if (rbkUsage.total >= MONTH_CAP) return { open: true, why: 'month-cap' };") >= 0);
want('prior.exportTail.x1', (js.match(/export default radarRouter;/g) || []).length === 1);
console.log(bad === 0 ? 'WX7AS_DRYGATE_OK' : 'WX7AS_DRYGATE_FAIL ' + bad);
process.exit(bad === 0 ? 0 : 1);