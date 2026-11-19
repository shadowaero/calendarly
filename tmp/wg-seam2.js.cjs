const fs = require('fs');
const s = fs.readFileSync('tmp/wgtest/dist/assets/index-BDiodzvu.js', 'utf8');
const aCG = s.indexOf('const WG_CSS');
const bWS = s.indexOf('\nfunction wsWS');
console.log('WG_CSS at ' + aCG + ', \\nfunction wsWS at ' + bWS + ', region=' + (bWS - aCG));
console.log('count function wxGUI: ' + (s.match(/function wxGUI/g) || []).length);
console.log('=== last 340 chars before \\nfunction wsWS ===');
console.log(JSON.stringify(s.slice(bWS - 340, bWS + 30)));
// what's right after the head anchor?
const h = s.indexOf('function wsWS({ config: c, fontFamilyClass: k }) {');
console.log('head anchor at ' + h + ' (gap from atWS: ' + (h - bWS) + ')');
