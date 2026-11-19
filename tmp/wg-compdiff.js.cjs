const fs = require('fs');
const s = fs.readFileSync('tmp/wgtest/dist/assets/index-BDiodzvu.js', 'utf8');
const compFile = fs.readFileSync('wave4/fd_weather/wxgui-component.js', 'utf8').replace(/\r/g, '').replace(/\s+$/, '');
const aCG = s.indexOf('const WG_CSS');
const bWS = s.indexOf('\nfunction wsWS');
const region = s.slice(aCG, bWS);
console.log('compFile chars: ' + compFile.length + '   region chars: ' + region.length);
console.log('compFile bytes(utf8): ' + Buffer.byteLength(compFile, 'utf8') + '   region bytes: ' + Buffer.byteLength(region, 'utf8'));
let d = -1;
for (let i = 0; i < Math.min(region.length, compFile.length); i++) { if (region[i] !== compFile[i]) { d = i; break; } }
if (d >= 0) {
  console.log('first char diff at ' + d);
  console.log('region  ctx: ' + JSON.stringify(region.slice(Math.max(0, d - 80), d + 80)));
  console.log('compF   ctx: ' + JSON.stringify(compFile.slice(Math.max(0, d - 80), d + 80)));
} else console.log('common prefix identical');
console.log('region tail: ' + JSON.stringify(region.slice(-40)));
console.log('compF tail : ' + JSON.stringify(compFile.slice(-40)));
