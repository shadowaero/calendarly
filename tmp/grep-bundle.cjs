const s = require('fs').readFileSync('c:/Users/xxtoo/Documents/IDX6011/tmp/pi-bundle.js', 'utf8');
console.log('bytes', s.length);
const keys = ['background_type', 'chalkboard', '"pattern"', 'pattern:', 'background_value'];
for (const k of keys) {
  let i = 0, c = 0; const ctxs = [];
  while ((i = s.indexOf(k, i)) >= 0 && c < 6) { ctxs.push('   #' + (c + 1) + '  ' + s.slice(Math.max(0, i - 90), i + 110).replace(/\n/g, ' ')); i += k.length; c++; }
  console.log('== ' + k + ' hits~' + c);
  ctxs.forEach(x => console.log(x));
}