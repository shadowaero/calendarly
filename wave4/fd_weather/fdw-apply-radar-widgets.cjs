#!/usr/bin/env node
// FD radar-widgets patcher rvT30 (?v=ws7ae). Runs on the Pi: sudo node /tmp/fdw-apply-radar-widgets.cjs
// Adds two resizable radar block types for screens studio: "radar_windy" (Windy iframe embed)
// and "radar_rainviewer" (RainViewer public API over dark OSM base). Injects components right
// BEFORE the `// wxGUI` marker (so the wxgui patcher's upgrade slice never deletes them), plus
// switch case / admin label / add-button / config-form entries.
// Backups: orig7.* (bundle + index.html, taken before any change).
// Rollback: cp orig7.<name> <name> + restart lightdm.
const fs = require('fs');
const path = require('path');
const jsVer = 'ws7ae';
const report = { steps: [], ok: true };
const step = (name, status, extra) => { report.steps.push({ name, status, extra }); console.log('[' + status + '] ' + name + (extra ? ' :: ' + extra : '')); if (status === 'FAIL') report.ok = false; };
const dist = process.env.FDW_DIST || '/opt/calendarly/client/dist';
const tmpDir = process.env.FDW_TMP || '/tmp';
const htmlPath = path.join(dist, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');
const htmlOrigStr = html;
const mjs = html.match(/src="(\/assets\/index-[^"]+\.(?:js))(\?v=([^"]+))?"/);
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
// ---- components (read from /tmp so they can be updated without editing the patcher) ----
const c1Path = path.join(tmpDir, 'rw-windy-comp.js');
const c2Path = path.join(tmpDir, 'rw-rainview-comp.js');
if (!fs.existsSync(c1Path) || !fs.existsSync(c2Path)) { step('comp.read', 'FAIL', 'scp both rw-*-comp.js to ' + tmpDir); console.log('FDW_RESULT ' + JSON.stringify(report)); process.exit(1); }
const compBlock = fs.readFileSync(c1Path, 'utf8') + '\n' + fs.readFileSync(c2Path, 'utf8');
const compBlockClean = compBlock.replace(/\r/g, '').replace(/\s+$/, '') + '\n';
const atMarker = js.indexOf('// wxGUI');
const atWS = js.indexOf('\nfunction wsWS');
if (atMarker < 0 || atWS < 0 || atMarker > atWS) { step('marker.wxGUI', 'FAIL', 'deploy the wxgui kit first (marker // wxGUI missing)'); console.log('FDW_RESULT ' + JSON.stringify(report)); process.exit(1); }
if (js.indexOf('function rwWindy') >= 0 && js.indexOf('function rwRV') >= 0) {
  const atRw = js.indexOf('// rwWindy');
  if (atRw >= 0 && atRw < atMarker) {
    const cur = js.slice(atRw, atMarker).replace(/\r/g, '').trimEnd();
    const fresh = compBlockClean.trimEnd();
    if (cur === fresh) step('comp.inject', 'SKIP', 'comps identical, no change');
    else { js = js.slice(0, atRw) + fresh + '\n' + js.slice(atMarker); step('comp.inject', 'OK', 'comps upgraded: old ' + cur.length + 'B -> new ' + compBlockClean.length + 'B'); }
  } else { js = js.slice(0, atMarker) + compBlockClean + js.slice(atMarker); step('comp.inject', 'OK', 'comps re-injected (region anchor missing)'); }
}
else { js = js.slice(0, atMarker) + compBlockClean + js.slice(atMarker); step('comp.inject', 'OK', compBlockClean.length + ' bytes before // wxGUI marker'); }
// ---- switch cases (before the existing radar_block case) ----
const caseAnchor = 'case"radar_block":return n.jsx("div",{className:`${H} p-1`,style:I,children:n.jsx(wm,{config:_,fontFamilyClass:k})});';
const caseAdd = 'case"radar_windy":return n.jsx("div",{className:`${H} p-0.5`,style:I,children:n.jsx(rwWindy,{config:_,fontFamilyClass:k})});' +
  'case"radar_rainviewer":return n.jsx("div",{className:`${H}`,style:I,children:n.jsx(rwRV,{config:_,fontFamilyClass:k})});' +
  caseAnchor;
one('case.inject', 'case"radar_windy":return n.jsx', caseAnchor, caseAdd);
// ---- admin label + add buttons ----
one('label.inject', 'case"radar_rainviewer":return"Radar: RainViewer"',
  'case"radar_block":return"Weather Radar";',
  'case"radar_block":return"Weather Radar";case"radar_rainviewer":return"Radar: RainViewer";case"radar_windy":return"Radar: Windy";');
const radarBtn = 'n.jsx("button",{type:"button",onClick:()=>o("radar_block"),className:"px-1.5 py-1 bg-sky-950/80 hover:bg-sky-900 border border-sky-800 text-sky-200 rounded-lg text-[9px] font-bold",children:"+ Radar"}),';
const btnAdd = radarBtn +
  'n.jsx("button",{type:"button",onClick:()=>o("radar_windy"),className:"px-1.5 py-1 bg-amber-950/80 hover:bg-amber-900 border border-amber-800 text-amber-200 rounded-lg text-[9px] font-bold",children:"+ Windy"}),' +
  'n.jsx("button",{type:"button",onClick:()=>o("radar_rainviewer"),className:"px-1.5 py-1 bg-blue-950/80 hover:bg-blue-900 border border-blue-800 text-blue-200 rounded-lg text-[9px] font-bold",children:"+ RainView"}),';
one('button.inject', 'children:"+ Windy"', radarBtn, btnAdd);
// ---- config forms (self-closed: injected before the radar_block form conditional; each form
// closes its own brackets fully and ends with a trailing comma) ----
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
  'n.jsxs("div",{children:[n.jsx("label",{className:"text-[7.5px] text-slate-400 block mb-0.5",children:"Zoom (3-11, default 7)"}),n.jsx("input",{type:"text",placeholder:"7",value:(x.config||{}).zoom||"",onChange:L=>p(h,{zoom:L.target.value}),className:"w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"})]}),' +
  'n.jsxs("div",{children:[n.jsx("label",{className:"text-[7.5px] text-slate-400 block mb-0.5",children:"Palette"}),n.jsx("select",{value:(x.config||{}).color??6,onChange:L=>p(h,{color:Number(L.target.value)}),className:"w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1",children:[n.jsx("option",{value:6,children:"Dark Sky"}),n.jsx("option",{value:8,children:"Dark Sky Alt"}),n.jsx("option",{value:4,children:"Rainbow"}),n.jsx("option",{value:2,children:"Universal Blue"}),n.jsx("option",{value:0,children:"Classic"}),n.jsx("option",{value:3,children:"Titan"})]})]})' +
  ']}),' +
  'n.jsx("input",{type:"text",placeholder:"Label (optional)",value:(x.config||{}).label||"",onChange:L=>p(h,{label:L.target.value}),className:"w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"})' +
  ']}),';
one('form.inject', 'x.type==="radar_windy"&&',
  'x.type==="radar_block"&&n.jsxs("div",{className:"flex flex-col gap-1.5 border-t border-slate-800 pt-1.5"',
  windyForm + rvForm + 'x.type==="radar_block"&&n.jsxs("div",{className:"flex flex-col gap-1.5 border-t border-slate-800 pt-1.5"');
// ---- cache bust + guards + parse + write ----
const vi = html.indexOf(mjs[1] + '?v=');
if (vi >= 0) { if (ver !== jsVer) html = html.replace(mjs[1] + '?v=' + ver, mjs[1] + '?v=' + jsVer); step('cache.bust', 'OK', '?v=' + (ver || 'none') + ' -> ?v=' + jsVer); }
else { html = html.replace(mjs[1] + '"', mjs[1] + '?v=' + jsVer + '"'); step('cache.bust', 'OK', '?v=' + jsVer + ' appended'); }
if (html.indexOf(mjs[1] + '?v=' + jsVer) < 0) step('cache.bust', 'FAIL', 'marker missing after bust');
const gw = (js.match(/function rwWindy/g) || []).length;
const gv = (js.match(/function rwRV/g) || []).length;
const gcw = (js.match(/case"radar_windy":return n\.jsx/g) || []).length;
const gcv = (js.match(/case"radar_rainviewer":return n\.jsx/g) || []).length;
const glw = (js.match(/case"radar_rainviewer":return"Radar: RainViewer"/g) || []).length;
const gbw = (js.match(/children:"\+ Windy"/g) || []).length;
const gbv = (js.match(/children:"\+ RainView"/g) || []).length;
const gfw = (js.match(/x\.type==="radar_windy"&&/g) || []).length;
const gfv = (js.match(/x\.type==="radar_rainviewer"&&/g) || []).length;
const gWX = (js.match(/function wxGUI/g) || []).length;
const gWS = (js.match(/function wsTile/g) || []).length;
if (gw !== 1 || gv !== 1 || gcw !== 1 || gcv !== 1 || glw !== 1 || gbw !== 1 || gbv !== 1 || gfw !== 1 || gfv !== 1 || gWX !== 1 || gWS !== 1) {
  step('guards', 'FAIL', 'rwWindy=' + gw + ' rwRV=' + gv + ' caseW=' + gcw + ' caseV=' + gcv + ' label=' + glw + ' btnW=' + gbw + ' btnV=' + gbv + ' formW=' + gfw + ' formV=' + gfv + ' (all must be 1) wxGUI=' + gWX + ' wsTile=' + gWS);
  fs.writeFileSync(jsPath, orig); fs.writeFileSync(htmlPath, htmlOrigStr);
  step('rollback', 'OK', 'originals restored (guard failures)');
  console.log('FDW_RESULT ' + JSON.stringify(report)); process.exit(1);
}
step('guards', 'OK', 'rwWindy/rwRV/caseW/caseV/label/btnW/btnV/formW/formV all 1x; wxGUI + wsTile intact');
if (!report.ok) {
  fs.writeFileSync(jsPath, orig); fs.writeFileSync(htmlPath, htmlOrigStr);
  step('rollback', 'OK', 'originals restored (anchor failures)');
  console.log('FDW_RESULT ' + JSON.stringify(report)); process.exit(1);
}
const tmpCheck = path.join(tmpDir, 'rww-bundle-check.js');
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
