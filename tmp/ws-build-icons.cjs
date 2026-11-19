// Builds the WX_SVG literal from Meteocons assets and injects into ws-widgets.js.
// Usage: node tmp/ws-build-icons.cjs   (run from repo root)
const fs = require('fs');
const path = require('path');
const dir = path.join('wave4', 'fd_weather', 'assets', 'icons');
const target = path.join('wave4', 'fd_weather', 'ws-widgets.js');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg')).sort();
const entries = [];
let anim = 0; let total = 0;
for (const f of files) {
  let s = fs.readFileSync(path.join(dir, f), 'utf8');
  if (s.indexOf('<animate') < 0 && s.indexOf('animateTransform') < 0) { console.log('WARN no-animation: ' + f); } else { anim++; }
  s = s.replace(/<\?xml[\s\S]*?\?>/g, '');
  s = s.replace(/<!DOCTYPE[\s\S]*?>/g, '');
  s = s.replace(/<!--[\s\S]*?-->/g, '');
  s = s.replace(/\s+/g, ' ').replace(/> </g, '><').trim();
  s = s.replace('<svg ', '<svg preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;display:block" ');
  if (s.indexOf("'") >= 0) throw new Error('single quote in ' + f);
  const key = f.replace(/\.svg$/, '');
  entries.push("  '" + key + "': '" + s + "'");
  total += s.length;
  console.log('OK ' + key + ' ' + s.length + 'B');
}
const block = 'const WX_SVG = {\n' + entries.join(',\n') + '\n};';
let js = fs.readFileSync(target, 'utf8');
const start = js.indexOf('const WX_SVG = {');
const end = js.indexOf('\n};', start);
if (start < 0 || end < 0) throw new Error('WX_SVG block not found');
js = js.slice(0, start) + block + js.slice(end + 3);
fs.writeFileSync(target, js);
console.log('INJECTED icons=' + files.length + ' animated=' + anim + ' bytes=' + total);
