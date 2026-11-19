const s = require('fs').readFileSync('tmp/wgtest/wg-bundle-check.js', 'utf8');
const a = s.indexOf('const WG_CSS');
const b = s.indexOf('function wsWS({ config: c, fontFamilyClass: k }) {');
console.log('WG_CSS at ' + a + '  wsWS head at ' + b);
console.log('=== seam before wsWS (last 300 of comp region) ===');
console.log(JSON.stringify(s.slice(b - 300, b + 80)));
console.log('=== comp first 200 ===');
console.log(JSON.stringify(s.slice(a, a + 200)));
const comp = s.slice(a, b);
let depth = 0, line = 1, minErr = null;
for (let i = 0; i < comp.length; i++) {
  const ch = comp[i];
  if (ch === '\n') line++;
  if (ch === '{' || ch === '(' || ch === '[') depth++;
  if (ch === '}' || ch === ')' || ch === ']') depth--;
  if (depth < 0 && !minErr) minErr = { line, i, around: comp.slice(Math.max(0, i - 120), i + 40) };
}
console.log('brace depth at comp end: ' + depth + (minErr ? '  NEGATIVE at line ' + minErr.line + ' around: ' + JSON.stringify(minErr.around) : ''));
