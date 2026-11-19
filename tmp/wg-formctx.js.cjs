const fs = require('fs');
const orig = fs.readFileSync('tmp/wgtest/dist/assets/orig6.index-BDiodzvu.js', 'utf8');
const radarForm = 'x.type==="radar_block"&&n.jsxs("div",{className:"flex flex-col gap-1.5 border-t border-slate-800 pt-1.5"';
const count = orig.split(radarForm).length - 1;
console.log('anchor count: ' + count);
let a = orig.indexOf(radarForm);
while (a >= 0) {
  console.log('=== context at ' + a + ' ===');
  console.log('BEFORE: ' + JSON.stringify(orig.slice(Math.max(0, a - 420), a)));
  console.log('AFTER : ' + JSON.stringify(orig.slice(a, a + 300)));
  a = orig.indexOf(radarForm, a + 1);
}
// also: does the ws form already exist here?
console.log('ws-form present: ' + (orig.indexOf('Weather Widget Config') >= 0));
