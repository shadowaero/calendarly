const fs = require('fs');
const vm = require('vm');
const tryParse = (src, tag) => {
  try { new vm.SourceTextModule(src); return 'ok'; } catch (e) {
    const m = e.message || '';
    if (m.indexOf('end of input') >= 0 || m.indexOf('Unterminated') >= 0) return 'eof';
    if (process.env.VERBOSE === '1') console.log(tag + ' ' + m.slice(0, 140));
    return 'err';
  }
};
const orig = fs.readFileSync('tmp/wgtest/dist/assets/orig6.index-BDiodzvu.js', 'utf8');
console.log('original parses: ' + tryParse(orig, 'orig'));
const bad = fs.readFileSync('tmp/wgtest/wg-bundle-check.js', 'utf8');
console.log('patched parses: ' + tryParse(bad, 'bad'));
let lo = 0, hi = bad.length;
while (lo < hi) {
  const mid = Math.floor((lo + hi) / 2);
  if (tryParse(bad.slice(0, mid), '') !== 'err') lo = mid + 1; else hi = mid;
}
console.log('first real syntax error char (1-based): ' + lo);
console.log('--- context ---');
console.log(JSON.stringify(bad.slice(Math.max(0, lo - 300), lo + 40)));
