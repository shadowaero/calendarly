const fs = require('fs');
const js = fs.readFileSync('tmp/fdlive/dist/assets/index-BDiodzvu.js', 'utf8');
const c = {
  rwWindy: (js.match(/function rwWindy/g) || []).length,
  rwRV: (js.match(/function rwRV/g) || []).length,
  caseW: (js.match(/case"radar_windy":return n\.jsx/g) || []).length,
  caseV: (js.match(/case"radar_rainviewer":return n\.jsx/g) || []).length,
  labelW: (js.match(/"Radar: Windy"/g) || []).length,
  labelV: (js.match(/"Radar: RainViewer"/g) || []).length,
  btnW: (js.match(/children:"\+ Windy"/g) || []).length,
  btnV: (js.match(/children:"\+ RainView"/g) || []).length,
  formW: (js.match(/x\.type==="radar_windy"&&/g) || []).length,
  formV: (js.match(/x\.type==="radar_rainviewer"&&/g) || []).length,
  guiWm: js.slice(js.indexOf('function wxGUI'), js.indexOf('\nfunction wsWS')).includes('n.jsx(wm,{config:{zip:zip'),
};
console.log(JSON.stringify(c));
const h = fs.readFileSync('tmp/fdlive/dist/index.html', 'utf8');
console.log('ver=' + h.match(/v=([a-z0-9]+)/)[1]);
