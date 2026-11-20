// wx7ar-eval.cjs — execute the comp's ACTUAL ladder code (extracted from the edited source):
// rbkTier + rbkBuild run for a spread of usage.left values; assert deck shape per tier.
const fs = require('fs');
const s = fs.readFileSync('c:/Users/xxtoo/Documents/IDX6011/wave4/fd_weather/rw-rainview-comp.js', 'utf8');
const a = s.indexOf('const rbkTier = function');
const b = s.indexOf('const tk = function');
if (a < 0 || b < 0 || a > b) { console.log('EXTRACT_FAIL'); process.exit(1); }
const code = s.slice(a, b);
const ctx = { OUT: null };
const fn = new Function('ctx', code.replace(/^const rbkTier = function/, 'ctx.OUT = {}; ctx.OUT.tierFn = function') + '; ctx.OUT.buildFn = rbkBuild; return ctx;');
fn(ctx);
const snap = Math.floor(Date.now() / 1000 / 600) * 600;
let fail = 0;
function want(name, got, exp) { const ok = JSON.stringify(got) === JSON.stringify(exp); if (!ok) fail++; console.log((ok ? 'OK  ' : 'FAIL') + ' ' + name + ' = ' + String(got) + (ok ? '' : ' (want ' + String(exp) + ')')); }
const cases = [[9300, 13], [8000, 13], [7799, 10], [7100, 10], [6999, 8], [100, 8], [null, 8]];
for (const [l, len] of cases) {
  const t = ctx.OUT.tierFn(l);
  const d = ctx.OUT.buildFn(snap, t);
  const tail = d.f.slice(7).map(function (f) { return f.o; });
  want('left=' + l + ' tier', t, l == null ? 0 : (l >= 7800 ? 2 : (l >= 7000 ? 1 : 0)));
  want('left=' + l + ' len', d.f.length, len);
  if (t === 2) want('left=' + l + ' tail', tail.join(','), '600,1200,1800,2400,3000,3600');
  if (t === 1) want('left=' + l + ' tail', tail.join(','), '1200,2400,3600');
  if (t === 0) want('left=' + l + ' tail', tail.join(','), '7200');
  want('left=' + l + ' tierField', d.tier, t);
}
console.log('WX7AR-EVAL pass=' + (fail === 0 ? 'ALL' : 'FAILURES=' + fail));
process.exit(fail ? 1 : 0);
