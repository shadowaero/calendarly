const fs = require('fs');
// extract myForm from the patcher file and ws kit form from the widgets patcher
const gui = fs.readFileSync('wave4/fd_weather/fdw-apply-wxgui.cjs', 'utf8');
const ws = fs.readFileSync('wave4/fd_weather/fdw-apply-widgets.cjs', 'utf8');
function extract(src, startMarker, endMarker) {
  const a = src.indexOf(startMarker);
  const b = src.indexOf(endMarker, a);
  return src.slice(a, b + endMarker.length);
}
const mine = extract(gui, "const myForm = 'x.type===\"weather_gui\"", "one('form.inject'");
// slice from 'const myForm' line through 'myForm + radarForm);' line, then pull just the concatenated string
const mineStr = mine.slice(mine.indexOf("='") + 2, mine.indexOf(";\none('form.inject") - 1);
const wsStr = extract(ws, "const myForm = fcond", "one('form.inject'");
const wsStr2 = wsStr.slice(wsStr.indexOf("='") + 2, wsStr.indexOf(";\none('form.inject") - 1);
const strip = (s) => {
  let out = s.replace(/'(?:[^'\\]|\\.)*'/g, "''").replace(/"(?:[^"\\]|\\.)*"/g, '""').replace(/`(?:[^`\\]|\\.)*`/g, '``');
  return out;
};
const bal = (s) => {
  let d = 0, line = 1, hist = [];
  let i = 0;
  const t = strip(s);
  for (const ch of t) {
    if (ch === '\n') line++;
    if ('{(['.includes(ch)) { d++; hist.push(ch + '@L' + line); }
    else if ('})]'.includes(ch)) { d--; hist.pop(); if (d < 0) return { d, line, note: 'negative' }; }
  }
  return { d, line, open: hist.slice(-8) };
};
console.log('strip: mine balanced delta=' + JSON.stringify(bal(mineStr)));
console.log('strip: ws balanced delta=' + JSON.stringify(bal(wsStr2)));
const vm = require('vm');
const pp = (code, tag) => { try { new vm.SourceTextModule(code); console.log(tag + ': OK'); } catch (e) { console.log(tag + ': ' + (e.message || '').split('\n')[0].slice(0, 140)); } };
const mk = (f) => 'const x={config:{}},n={},p=()=>{},h={},L=0,fcond=0;\n[' + f + ' fcond];';
pp('[' + mineStr.replace(/'+$/, '') + ', 0];', 'mine-raw');
pp('[' + wsStr2.replace(/'+$/, '') + ', 0];', 'ws-raw');
