const fs = require('fs');
const vm = require('vm');
const tryParse = (src) => {
  try { new vm.SourceTextModule(src); return true; } catch (e) {
    const m = e.message || '';
    return !(m.indexOf('end of input') >= 0 || m.indexOf('Unterminated') >= 0);
  }
};
let bad = fs.readFileSync('tmp/wgtest/wg-bundle-check.js', 'utf8');
const blank = (chars) => chars.replace(/[^]/g, ' ');
// find injected component region
const aCG = bad.indexOf('const WG_CSS');
const bWS = bad.indexOf('function wsWS({ config: c, fontFamilyClass: k }) {');
console.log('comp region: ' + aCG + ' .. ' + bWS + ' len=' + (bWS - aCG));
const mk = (cut, keep) => bad.slice(0, aCG + cut) + blank(bad.slice(aCG + cut, aCG + keep)) + bad.slice(aCG + keep);
if (tryParse(bad.slice(0, aCG) + blank(bad.slice(aCG, bWS)) + bad.slice(bWS))) {
  console.log('blanking whole comp region parses OK -> problem is inside the component');
  let cut = 0, keep = bWS - aCG;
  while (keep - cut > 120) {
    const mid = Math.floor((cut + keep) / 2);
    const probe = bad.slice(0, aCG + cut) + blank(bad.slice(aCG + cut, aCG + mid)) + bad.slice(aCG + mid);
    if (!tryParse(probe)) keep = mid; else cut = mid;
  }
  console.log('error window inside comp: [' + cut + ', ' + keep + ']');
  console.log(JSON.stringify(bad.slice(aCG + cut, aCG + keep + 60)));
} else {
  console.log('problem NOT inside comp region even when blanked');
}
const trySlice = (s, tag) => { const okP = tryParse(s); console.log(tag + ': ' + (okP ? 'OK' : 'ERR')); return okP; };
