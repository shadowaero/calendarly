const fs = require('fs');
const s = fs.readFileSync('/opt/calendarly/client/dist/assets/index-BDiodzvu.js', 'utf8');
const i = s.indexOf('case"radar_block"');
const j = s.lastIndexOf('function wm(', i);
console.log('=== wm() slice ===');
console.log(s.slice(j, j + 9500));
