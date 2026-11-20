// wx7ar-drygate.cjs — local dry-run gate for the ws7ar quota-ladder patch. Reads the DRY dist copy
// and asserts: whole-bundle parse (vm.SourceTextModule), token ws7ar-only in dry html, ladder
// needles live IN the rbk region (between 'function rwRV' and '// wxGUI'), the tier-0 tail intact,
// the wx region untouched, and the fresh comps' byte growth. Run: node tmp/future/wx7ar-drygate.cjs
const fs = require('fs');
const vm = require('vm');
const D = 'c:/Users/xxtoo/Documents/IDX6011/tmp/future/wx7ar-dry/';
const T = 'c:/Users/xxtoo/Documents/IDX6011/tmp/future/wx7ar-drytmp/';
const js = fs.readFileSync(D + 'assets/index-BDiodzvu.js', 'utf8');
const html = fs.readFileSync(D + 'index.html', 'utf8');
const comp = fs.readFileSync(T + 'rw-rainview-comp.js', 'utf8');
const results = [];
const want = function (name, got, exp) { results.push([name, got, exp]); };
const cnt = function (s, n) { return s.split(n).length - 1; };
try { new vm.SourceTextModule(js); } catch (e) { results.push(['bundle.parse', String(e).slice(0, 120), 'OK']); }
want('bundle.parseOk', true, true);
want('bundle.bytes', js.length > 579500, true);
want('html.token', /v=ws7ar/.test(html) && !/v=ws7aq/.test(html), true);
const R = js.slice(js.indexOf('function rwRV'), js.indexOf('// wxGUI'));
want('rbk.snapshotSrc', cnT(R, '/radar/api/snapshot'), 1);
want('rbk.healthSrc', R.indexOf('/radar/api/health') >= 0, true);
want('rbk.ladderTh', R.indexOf('(l >= 7800') >= 0 && R.indexOf('(l >= 7000') >= 0, true);
want('rbk.ladderT2', cnT(R, 'F3 <= 3600'), 1);
want('rbk.ladderT1', cnT(R, 'F4 <= 3600'), 1);
want('rbk.memo', cnT(R, 'old.tier === t3'), 1);
want('rbk.tierField', cnT(R, 'tier: tier'), 1);
want('rbk.tier0Tail', cnT(R, 's + 7200, s: s, o: 7200, rbk: 1'), 1);
want('rbk.o1800Gone', cnT(R, 'o: 1800'), 0);
want('rbk.F2Gone', cnT(R, 'F2 <= 6'), 0);
want('rbk.leftRead', cnT(R, 'j3.usage.left'), 2);
want('rbk.leftRefDecl', cnT(R, 'const rbkLeft = b.useRef'), 1);
want('wx.wxGUIfn', cnt(js, 'function wxGUI'), 1);
want('wx.WG_CSS', cnt(js, 'const WG_CSS'), 1);
want('wx.WX_SVG', cnt(js, 'const WX_SVG'), 1);
want('wx.animGate', js.indexOf('wgXBob') >= 0 && js.indexOf('wgIcoBob') >= 0, true);
want('comp.bytes', comp.length > 25000, true);
want('comp.tierLadder', cnT(comp, 'rbkTier'), 3);
want('comp.sweepLoop', cnT(comp, 'F3 <= 3600') + cnT(comp, 'F4 <= 3600'), 2);
want('comp.trimGone', cnT(comp, 'F2 <= 6') + cnT(comp, 'o: 1800'), 0);
function cnT(s, n) { return s.split(n).length - 1; }
let fail = 0;
for (const r of results) { const ok = r[1] === r[2]; if (!ok) fail++; console.log((ok ? 'OK  ' : 'FAIL') + ' ' + r[0] + ' = ' + String(r[1]) + (ok ? '' : ' (want ' + String(r[2]) + ')')); }
console.log('WX7AR-DRYGATE pass=' + (results.length - fail) + ' fail=' + fail);
process.exit(fail ? 1 : 0);
