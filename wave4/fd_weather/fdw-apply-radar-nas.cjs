#!/usr/bin/env node
// FD radar-widgets patcher NAS variant rbT30/ws7ar (?v=ws7ar). Runs inside the family-dashboard container:
//   docker exec family-dashboard node /tmp/fdw-apply-radar-nas.cjs
// Same injections as fdw-apply-radar-widgets.cjs but WITHOUT the wxGUI-marker dependency (the NAS
// bundle has no wxgui/ws kit): the two radar comps inject right before \nfunction wsWS behind the
// '// rwRadarNAS' marker, and the wxGUI/wsTile guard items become a single marker guard.
// Backups: orig7.* (bundle + index.html, taken before any change). Rollback: cp orig7.<name> <name>.
const fs = require('fs');
const path = require('path');
const jsVer = 'ws7ar';
const report = { steps: [], ok: true };
const step = (name, status, extra) => { report.steps.push({ name, status, extra }); console.log('[' + status + '] ' + name + (extra ? ' :: ' + extra : '')); if (status === 'FAIL') report.ok = false; };
const dist = process.env.FDW_DIST || '/app/client/dist';
const tmpDir = process.env.FDW_TMP || '/tmp';
const htmlPath = path.join(dist, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');
const htmlOrigStr = html;
const mjs = html.match(/src="(\/assets\/index-[^"?]+\.js)(\?v=([^"]+))?"/);
if (!mjs) { step('find bundle', 'FAIL', 'no script tag'); console.log('FDW_RESULT ' + JSON.stringify(report)); process.exit(1); }
const jsPath = dist + mjs[1];
const ver = mjs[3] || '';
let js = fs.readFileSync(jsPath, 'utf8');
step('find bundle', 'OK', mjs[1] + ' (' + js.length + ' bytes, v=' + (ver || 'none') + ')');
const orig = js;
const jsBak = path.join(path.dirname(jsPath), 'orig7.' + path.basename(jsPath));
const htmlBak = path.join(path.dirname(htmlPath), 'orig7.' + path.basename(htmlPath));
if (!fs.existsSync(jsBak)) { fs.copyFileSync(jsPath, jsBak); step('backup bundle', 'OK', jsBak); }
if (!fs.existsSync(htmlBak)) { fs.copyFileSync(htmlPath, htmlBak); step('backup html', 'OK', htmlBak); }
function one(name, already, find, repl) {
  if (js.indexOf(already) >= 0) { step(name, 'SKIP', 'already present'); return true; }
  const count = js.split(find).length - 1;
  if (count !== 1) { step(name, 'FAIL', 'anchor ' + count + 'x: ' + find.slice(0, 80)); return false; }
  js = js.replace(find, repl);
  step(name, 'OK');
  return true;
}
// ---- components (read from FDW_TMP so they can be updated without editing the patcher) ----
const c1Path = path.join(tmpDir, 'rw-windy-comp.js');
const c2Path = path.join(tmpDir, 'rw-rainview-comp.js');
if (!fs.existsSync(c1Path) || !fs.existsSync(c2Path)) { step('comp.read', 'FAIL', 'missing rw-*-comp.js in ' + tmpDir); console.log('FDW_RESULT ' + JSON.stringify(report)); process.exit(1); }
const compBlockClean = (fs.readFileSync(c1Path, 'utf8') + '\n' + fs.readFileSync(c2Path, 'utf8')).replace(/\r/g, '').replace(/\s+$/, '') + '\n';
// ---- inject comps right before function wsWS (NAS has no // wxGUI marker) ----
const atWS = js.indexOf('\nfunction wsWS');
if (atWS < 0) { step('anchor.wsWS', 'FAIL', 'function wsWS missing'); console.log('FDW_RESULT ' + JSON.stringify(report)); process.exit(1); }
const NASMARK = '// rwRadarNAS';
const atMk = js.indexOf(NASMARK);
const newBlock = NASMARK + '\n' + compBlockClean;
const cur = atMk >= 0 ? js.slice(atMk, atWS) : '';
if (cur.replace(/\r/g, '').trimEnd() === newBlock.trimEnd()) step('comp.inject', 'SKIP', 'identical comps present');
else { js = js.slice(0, atMk >= 0 ? atMk : atWS) + newBlock + js.slice(atWS); step('comp.inject', 'OK', atMk >= 0 ? 'comps upgraded behind marker' : compBlockClean.length + ' bytes before function wsWS'); }
// ---- switch cases (before the existing radar_block case) ----
const caseAnchor = 'case"radar_block":return n.jsx("div",{className:`${H} p-1`,style:I,children:n.jsx(wm,{config:_,fontFamilyClass:k})});';
const caseAdd = 'case"radar_windy":return n.jsx("div",{className:`${H} p-0.5`,style:I,children:n.jsx(rwWindy,{config:_,fontFamilyClass:k})});' +
  'case"radar_rainviewer":return n.jsx("div",{className:`${H}`,style:I,children:n.jsx(rwRV,{config:_,fontFamilyClass:k})});' +
  caseAnchor;
one('case.inject', 'case"radar_windy":return n.jsx', caseAnchor, caseAdd);
// ---- admin label + add buttons ---- (legacy-fresh path only: SKIPs once any radar_rainviewer label exists)
one('label.inject', 'case"radar_rainviewer":return',
  'case"radar_block":return"Weather Radar";',
  'case"radar_block":return"Weather Radar";case"radar_rainviewer":return"Radar: RainViewer";case"radar_windy":return"Radar: Windy";');
const radarBtn = 'n.jsx("button",{type:"button",onClick:()=>o("radar_block"),className:"px-1.5 py-1 bg-sky-950/80 hover:bg-sky-900 border border-sky-800 text-sky-200 rounded-lg text-[9px] font-bold",children:"+ Radar"}),';
const btnAdd = radarBtn +
  'n.jsx("button",{type:"button",onClick:()=>o("radar_windy"),className:"px-1.5 py-1 bg-amber-950/80 hover:bg-amber-900 border border-amber-800 text-amber-200 rounded-lg text-[9px] font-bold",children:"+ Windy"}),' +
  'n.jsx("button",{type:"button",onClick:()=>o("radar_rainviewer"),className:"px-1.5 py-1 bg-blue-950/80 hover:bg-blue-900 border border-blue-800 text-blue-200 rounded-lg text-[9px] font-bold",children:"+ RainView"}),';
one('button.inject', 'children:"+ Windy"', radarBtn, btnAdd);
// ---- config forms (self-closed: injected before the radar_block form conditional) ----
const windyForm = 'x.type==="radar_windy"&&n.jsxs("div",{className:"flex flex-col gap-1.5 border-t border-slate-800 pt-1.5",children:[' +
  'n.jsx("span",{className:"font-bold text-amber-400 uppercase text-[8px]",children:"Windy Radar Config"}),' +
  'n.jsxs("div",{className:"grid grid-cols-2 gap-1",children:[' +
  'n.jsxs("div",{children:[n.jsx("label",{className:"text-[7.5px] text-slate-400 block mb-0.5",children:"Latitude"}),n.jsx("input",{type:"text",placeholder:"28.800",value:(x.config||{}).lat||"",onChange:L=>p(h,{lat:L.target.value}),className:"w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"})]}),' +
  'n.jsxs("div",{children:[n.jsx("label",{className:"text-[7.5px] text-slate-400 block mb-0.5",children:"Longitude"}),n.jsx("input",{type:"text",placeholder:"-81.644",value:(x.config||{}).lon||"",onChange:L=>p(h,{lon:L.target.value}),className:"w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"})]})' +
  ']}),' +
  'n.jsx("input",{type:"text",placeholder:"Zoom (3-17, e.g. 11)",value:(x.config||{}).zoom||"",onChange:L=>p(h,{zoom:L.target.value}),className:"w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"}),' +
  'n.jsx("select",{value:(x.config||{}).overlay||"radar",onChange:L=>p(h,{overlay:L.target.value}),className:"w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1",children:[' +
  'n.jsx("option",{value:"radar",children:"Overlay: Radar"}),n.jsx("option",{value:"satellite",children:"Overlay: Satellite"}),n.jsx("option",{value:"temperature",children:"Overlay: Temperature"}),n.jsx("option",{value:"wind",children:"Overlay: Wind"}),n.jsx("option",{value:"pressure",children:"Overlay: Pressure"}),n.jsx("option",{value:"clouds",children:"Overlay: Clouds"})' +
  ']})' +
  ']}),';
const rvForm = 'x.type==="radar_rainviewer"&&n.jsxs("div",{className:"flex flex-col gap-1.5 border-t border-slate-800 pt-1.5",children:[' +
  'n.jsx("span",{className:"font-bold text-sky-400 uppercase text-[8px]",children:"RainViewer Radar Config"}),' +
  'n.jsxs("div",{className:"grid grid-cols-2 gap-1",children:[' +
  'n.jsxs("div",{children:[n.jsx("label",{className:"text-[7.5px] text-slate-400 block mb-0.5",children:"Latitude"}),n.jsx("input",{type:"text",placeholder:"28.800",value:(x.config||{}).lat||"",onChange:L=>p(h,{lat:L.target.value}),className:"w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"})]}),' +
  'n.jsxs("div",{children:[n.jsx("label",{className:"text-[7.5px] text-slate-400 block mb-0.5",children:"Longitude"}),n.jsx("input",{type:"text",placeholder:"-81.644",value:(x.config||{}).lon||"",onChange:L=>p(h,{lon:L.target.value}),className:"w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"})]})' +
  ']}),' +
  'n.jsxs("div",{className:"grid grid-cols-2 gap-1",children:[' +
  'n.jsxs("div",{children:[n.jsx("label",{className:"text-[7.5px] text-slate-400 block mb-0.5",children:"Zoom (3-13, default 7)"}),n.jsx("input",{type:"text",placeholder:"7",value:(x.config||{}).zoom||"",onChange:L=>p(h,{zoom:L.target.value}),className:"w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"})]}),' +
  'n.jsxs("div",{children:[n.jsx("label",{className:"text-[7.5px] text-slate-400 block mb-0.5",children:"Palette"}),n.jsx("select",{value:(x.config||{}).color??6,onChange:L=>p(h,{color:Number(L.target.value)}),className:"w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1",children:[n.jsx("option",{value:6,children:"Dark Sky"}),n.jsx("option",{value:8,children:"Dark Sky Alt"}),n.jsx("option",{value:4,children:"Rainbow"}),n.jsx("option",{value:2,children:"Universal Blue"}),n.jsx("option",{value:0,children:"Classic"}),n.jsx("option",{value:3,children:"Titan"})]})]})' +
  ']}),' +
  'n.jsx("input",{type:"text",placeholder:"Label (optional)",value:(x.config||{}).label||"",onChange:L=>p(h,{label:L.target.value}),className:"w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"})' +
  ']}),';
one('form.inject', 'x.type==="radar_windy"&&',
  'x.type==="radar_block"&&n.jsxs("div",{className:"flex flex-col gap-1.5 border-t border-slate-800 pt-1.5"',
  windyForm + rvForm + 'x.type==="radar_block"&&n.jsxs("div",{className:"flex flex-col gap-1.5 border-t border-slate-800 pt-1.5"');
// upgrade pass for previously-deployed bundles: the deployed form block came from an earlier
// wave, so replace its piece-parts (title, palette selector, admin label) in place;
// reruns SKIP on the new markers. Fresh bundles get the old form injected then upgraded.
one('rainbow.formTitle', 'children:"Rainbow Radar Config"', 'children:"RainViewer Radar Config"', 'children:"Rainbow Radar Config"');
one('rainbow.palette', 'rainbowP:1', '(x.config||{}).color??6,onChange:L=>p(h,{color:Number(L.target.value)})', '(x.config||{}).color??8,onChange:L=>p(h,{color:Number(L.target.value),rainbowP:1})');
one('rainbow.opts', 'value:4,children:"Nexrad"', 'children:[n.jsx("option",{value:6,children:"Dark Sky"}),n.jsx("option",{value:8,children:"Dark Sky Alt"}),n.jsx("option",{value:4,children:"Rainbow"}),n.jsx("option",{value:2,children:"Universal Blue"}),n.jsx("option",{value:0,children:"Classic"}),n.jsx("option",{value:3,children:"Titan"})]', 'children:[n.jsx("option",{value:8,children:"Universal Blue"}),n.jsx("option",{value:4,children:"Nexrad"}),n.jsx("option",{value:5,children:"Rainviewer"}),n.jsx("option",{value:0,children:"Semi-Classic"}),n.jsx("option",{value:1,children:"Original"}),n.jsx("option",{value:2,children:"Rainbow SELEX"}),n.jsx("option",{value:3,children:"Titan"}),n.jsx("option",{value:6,children:"Palette 6"}),n.jsx("option",{value:7,children:"Palette 7"}),n.jsx("option",{value:9,children:"Palette 9"})]');
one('rainbow.label', 'return"Radar: Rainbow"', 'case"radar_rainviewer":return"Radar: RainViewer"', 'case"radar_rainviewer":return"Radar: Rainbow"');
// Zoom-ceiling pass: same 3-branch label bump as the Pi patcher (fresh or bare 3-12
// variant; both collapse to `Zoom (3-13, default 7)`; reruns SKIP on either 3-13 marker).
if (js.indexOf('Zoom (3-13') >= 0) step('zoom.label', 'SKIP', 'already 3-13');
else if (js.split('children:"Zoom (3-12, default 7)"').length === 2) { js = js.replace('children:"Zoom (3-12, default 7)"', 'children:"Zoom (3-13, default 7)"'); step('zoom.label', 'OK', 'fresh 3-12 -> 3-13'); }
else if (js.split('children:"Zoom (3-12)"').length === 2) { js = js.replace('children:"Zoom (3-12)"', 'children:"Zoom (3-13, default 7)"'); step('zoom.label', 'OK', 'bare 3-12 -> 3-13, default 7'); }
else { step('zoom.label', 'FAIL', 'no known zoom label variant (want Zoom (3-12...))'); }
// ---- cache bust + guards + parse + write ----
const vi = html.indexOf(mjs[1] + '?v=');
if (vi >= 0) { if (ver !== jsVer) html = html.replace(mjs[1] + '?v=' + ver, mjs[1] + '?v=' + jsVer); step('cache.bust', 'OK', '?v=' + (ver || 'none') + ' -> ?v=' + jsVer); }
else { html = html.replace(mjs[1] + '"', mjs[1] + '?v=' + jsVer + '"'); step('cache.bust', 'OK', '?v=' + jsVer + ' appended'); }
if (html.indexOf(mjs[1] + '?v=' + jsVer) < 0) step('cache.bust', 'FAIL', 'marker missing after bust');
const gm = (js.match(/\/\/ rwRadarNAS/g) || []).length;
const gw = (js.match(/function rwWindy/g) || []).length;
const gv = (js.match(/function rwRV/g) || []).length;
const gcw = (js.match(/case"radar_windy":return n\.jsx/g) || []).length;
const gcv = (js.match(/case"radar_rainviewer":return n\.jsx/g) || []).length;
const glw = (js.match(/case"radar_rainviewer":return"Radar: (Rainbow|RainViewer)"/g) || []).length;
const gbw = (js.match(/children:"\+ Windy"/g) || []).length;
const gbv = (js.match(/children:"\+ RainView"/g) || []).length;
const gfw = (js.match(/x\.type==="radar_windy"&&/g) || []).length;
const gfv = (js.match(/x\.type==="radar_rainviewer"&&/g) || []).length;
if (gm !== 1 || gw !== 1 || gv !== 1 || gcw !== 1 || gcv !== 1 || glw !== 1 || gbw !== 1 || gbv !== 1 || gfw !== 1 || gfv !== 1) {
  step('guards', 'FAIL', 'marker=' + gm + ' rwWindy=' + gw + ' rwRV=' + gv + ' caseW=' + gcw + ' caseV=' + gcv + ' label=' + glw + ' btnW=' + gbw + ' btnV=' + gbv + ' formW=' + gfw + ' formV=' + gfv + ' (all must be 1)');
  fs.writeFileSync(jsPath, orig); fs.writeFileSync(htmlPath, htmlOrigStr);
  step('rollback', 'OK', 'originals restored (guard failures)');
  console.log('FDW_RESULT ' + JSON.stringify(report)); process.exit(1);
}
step('guards', 'OK', 'rwRadarNAS/rwWindy/rwRV/caseW/caseV/label/btnW/btnV/formW/formV all 1x');
if (!report.ok) {
  fs.writeFileSync(jsPath, orig); fs.writeFileSync(htmlPath, htmlOrigStr);
  step('rollback', 'OK', 'originals restored (anchor failures)');
  console.log('FDW_RESULT ' + JSON.stringify(report)); process.exit(1);
}
const tmpCheck = path.join(tmpDir, 'rww-nas-bundle-check.js');
fs.writeFileSync(tmpCheck, js);
try {
  const cp = require('child_process');
  const chk = cp.execFileSync(process.execPath, ['--experimental-vm-modules', '-e',
    'const vm=require("vm");new vm.SourceTextModule(require("fs").readFileSync(' + JSON.stringify(tmpCheck) + ',"utf8"));console.log("PARSE_OK")'],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  step('parse.check', /PARSE_OK/.test(chk) ? 'OK' : 'FAIL', chk.trim().slice(-120));
  if (!/PARSE_OK/.test(chk)) {
    fs.writeFileSync(jsPath, orig); fs.writeFileSync(htmlPath, htmlOrigStr);
    step('rollback', 'OK', 'originals restored after parse failure');
  }
} catch (e) {
  step('parse.check', 'FAIL', String(e.stderr || e.message).slice(-600));
  fs.writeFileSync(jsPath, orig); fs.writeFileSync(htmlPath, htmlOrigStr);
  step('rollback', 'OK', 'originals restored after parse failure');
}
if (!report.ok) { console.log('FDW_RESULT ' + JSON.stringify(report)); process.exit(1); }
fs.writeFileSync(jsPath, js);
fs.writeFileSync(htmlPath, html);
step('write', 'OK', js.length + ' bytes');
console.log('FDW_RESULT ' + JSON.stringify(report));
process.exit(0);