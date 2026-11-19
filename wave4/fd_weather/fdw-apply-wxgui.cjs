#!/usr/bin/env node
// FD wave-weatherGUI patcher v1 (?v=ws6). Runs on the Pi: sudo node /tmp/fdw-apply-wxgui.cjs
// Adds the full-screen "weather_gui" block type + wxGUI component (needs ws kit present: WX_SVG, wxIconKey, wxIco, fmt helpers).
//   fresh    : no weather_gui anchor -> inject comp + case + label + button + form, bust ?v=ws6
//   upgrade  : wxGUI present -> replace component region (between const WG_CSS and \nfunction wsWS) only
// Backups: orig6.* (bundle + index.html taken BEFORE any change; extends orig3/orig4/orig5 chain).
// Rollback recipe: cp orig5.<name> <name>  (restores the ws5 weather-station build) then restart lightdm.
const fs = require('fs');
const path = require('path');
const jsVer = 'ws6z';
const report = { steps: [], ok: true };
const step = (name, status, extra) => { report.steps.push({ name, status, extra }); console.log('[' + status + '] ' + name + (extra ? ' :: ' + extra : '')); if (status === 'FAIL') report.ok = false; };
const dist = process.env.FDW_DIST || '/opt/calendarly/client/dist';
const tmpDir = process.env.FDW_TMP || '/tmp';
const htmlPath = path.join(dist, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');
const htmlOrigStr = html;
const mjs = html.match(/src="(\/assets\/index-[^"?]+\.(?:js))(\?v=([^"]+))?"/);
if (!mjs) { step('find bundle', 'FAIL', 'no script tag'); console.log('FDW_RESULT ' + JSON.stringify(report)); process.exit(1); }
const jsPath = dist + mjs[1];
const ver = mjs[3] || '';
let js = fs.readFileSync(jsPath, 'utf8');
step('find bundle', 'OK', mjs[1] + ' (' + js.length + ' bytes, v=' + (ver || 'none') + ')');
const compPath = path.join(tmpDir, 'wxgui-component.js');
if (!fs.existsSync(compPath)) { step('comp.read', 'FAIL', compPath + ' missing (scp wxgui-component.js to /tmp)'); console.log('FDW_RESULT ' + JSON.stringify(report)); process.exit(1); }
const comp = fs.readFileSync(compPath, 'utf8').replace(/\r/g, '').replace(/\s+$/, '');
const orig = js;
const atWS = js.indexOf('\nfunction wsWS');
const atWSh = js.indexOf('function wsWS({ config: c, fontFamilyClass: k }) {');
if (atWS < 0 || atWSh < 0) { step('anchor.wsWS', 'FAIL', 'function wsWS anchors missing (ws kit not deployed?)'); console.log('FDW_RESULT ' + JSON.stringify(report)); process.exit(1); }
const atCG = js.indexOf('const WG_CSS');
const upgradeMode = atCG >= 0 && js.indexOf('function wxGUI') >= 0 && atCG < atWS;
const jsBak = path.join(path.dirname(jsPath), 'orig6.' + path.basename(jsPath));
const htmlBak = path.join(path.dirname(htmlPath), 'orig6.' + path.basename(htmlPath));
if (!fs.existsSync(jsBak)) { fs.copyFileSync(jsPath, jsBak); step('backup bundle', 'OK', jsBak); }
if (!fs.existsSync(htmlBak)) { fs.copyFileSync(htmlPath, htmlBak); step('backup html', 'OK', htmlBak); }
function one(name, already, find, repl) {
  if (js.indexOf(already) >= 0) { step(name, 'SKIP', 'already present'); return true; }
  const count = js.split(find).length - 1;
  if (count !== 1) { step(name, 'FAIL', 'anchor ' + count + 'x: ' + find.slice(0, 70)); return false; }
  js = js.replace(find, repl);
  step(name, 'OK');
  return true;
}
if (upgradeMode) {
  step('mode', 'OK', 'upgrade (wxGUI region found)');
  const atCM = js.lastIndexOf('// wxGUI', atWS);
  const startIdx = (atCM >= 0 && atCM < atCG) ? atCM : atCG;
  const current = js.slice(startIdx, atWS).replace(/\r/g, '');
  if (current === comp) step('component.upgrade', 'SKIP', 'identical build already present');
  else { js = js.slice(0, startIdx) + comp + js.slice(atWS); step('component.upgrade', 'OK', 'old ' + current.length + 'B -> new ' + comp.length + 'B'); }
} else {
  step('mode', 'OK', 'fresh install');
  js = js.slice(0, atWSh) + comp + '\n' + js.slice(atWSh);
  step('component.inject', 'OK', comp.length + ' bytes before wsWS');
}
one('wm.zcap', 'M=Math.min(Math.max(Number(a.magnify)||2,1),6),v=Number.isFinite', 'M=Math.min(Math.max(Number(a.magnify)||2,1),3),v=Number.isFinite',
  'M=Math.min(Math.max(Number(a.magnify)||2,1),6),v=Number.isFinite');
one('wm.center', 'transform:(a.center?',
  'style:{transform:`scale(${M})`,transformOrigin:`${Q}% ${Z}%`}',
  'style:{transform:(a.center?`translate(${50-Q}%, ${50-Z}%) `:"")+`scale(${M})`,transformOrigin:`${Q}% ${Z}%`}');
one('wm.centerPin', 'left:(a.center?50:Q',
  'style:{left:`${Q}%`,top:`${Z}%`,transform:"translate(-50%, -100%)"',
  'style:{left:(a.center?50:Q)+"%",top:(a.center?50:Z)+"%",transform:"translate(-50%, -100%)"');
one('case.inject', 'case"weather_gui":return n.jsx', 'case"weather_station":return n.jsx("div",{className:H+" p-1",style:I,children:n.jsx(wsWS,{config:_,fontFamilyClass:k})});',
  'case"weather_gui":return n.jsx("div",{className:H,style:I,children:n.jsx(wxGUI,{config:_,fontFamilyClass:k})});' +
  'case"weather_station":return n.jsx("div",{className:H+" p-1",style:I,children:n.jsx(wsWS,{config:_,fontFamilyClass:k})});');
one('label.map', 'Weather GUI (hero dashboard)', 'case"radar_block":return"Weather Radar";',
  'case"weather_gui":return"Weather GUI (hero dashboard)";case"radar_block":return"Weather Radar";');
one('button.inject', 'children:"+ Weather GUI"', 'n.jsx("button",{type:"button",onClick:()=>o("radar_block")',
  'n.jsx("button",{type:"button",onClick:()=>o("weather_gui"),className:"px-1.5 py-1 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-800 text-indigo-200 rounded-lg text-[9px] font-bold",children:"+ Weather GUI"}),' +
  'n.jsx("button",{type:"button",onClick:()=>o("radar_block")');
const radarForm = 'x.type==="radar_block"&&n.jsxs("div",{className:"flex flex-col gap-1.5 border-t border-slate-800 pt-1.5"';
const myForm = 'x.type==="weather_gui"&&n.jsxs("div",{className:"flex flex-col gap-1.5 border-t border-slate-800 pt-1.5",children:[' +
  'n.jsx("span",{className:"font-bold text-indigo-300 uppercase text-[8px]",children:"Weather GUI Config"}),' +
  'n.jsxs("div",{className:"grid grid-cols-2 gap-1",children:[' +
  'n.jsxs("div",{children:[n.jsx("label",{className:"text-[7.5px] text-slate-400 block mb-0.5",children:"City label"}),' +
  'n.jsx("input",{type:"text",placeholder:"MOUNT DORA",value:(x.config||{}).city||"",onChange:L=>p(h,{city:L.target.value}),className:"w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"})]}),' +
  'n.jsxs("div",{children:[n.jsx("label",{className:"text-[7.5px] text-slate-400 block mb-0.5",children:"Zip / Location"}),' +
  'n.jsx("input",{type:"text",placeholder:"32757",value:(x.config||{}).zip||"",onChange:L=>p(h,{zip:L.target.value}),className:"w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"})]}),' +
  'n.jsxs("div",{children:[n.jsx("label",{className:"text-[7.5px] text-slate-400 block mb-0.5",children:"Outdoor channel"}),' +
  'n.jsx("input",{type:"text",placeholder:"A",value:(x.config||{}).outdoorChannel||"",onChange:L=>p(h,{outdoorChannel:L.target.value}),className:"w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"})]}),' +
  'n.jsxs("div",{children:[n.jsx("label",{className:"text-[7.5px] text-slate-400 block mb-0.5",children:"Indoor channel"}),' +
  'n.jsx("input",{type:"text",placeholder:"B",value:(x.config||{}).indoorChannel||"",onChange:L=>p(h,{indoorChannel:L.target.value}),className:"w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"})' +
  ']})' +
  ']}),' +
  ']}),';
one('form.inject', 'x.type==="weather_gui"', radarForm, myForm + radarForm);
const vi = html.indexOf(mjs[1] + '?v=');
if (vi >= 0) { if (ver !== jsVer) html = html.replace(mjs[1] + '?v=' + ver, mjs[1] + '?v=' + jsVer); step('cache.bust', 'OK', '?v=' + (ver || 'none') + ' -> ?v=' + jsVer); }
else { html = html.replace(mjs[1] + '"', mjs[1] + '?v=' + jsVer + '"'); step('cache.bust', 'OK', '?v=' + jsVer + ' appended'); }
if (html.indexOf(mjs[1] + '?v=' + jsVer) < 0) step('cache.bust', 'FAIL', 'marker missing after bust');
const gw = (js.match(/function wxGUI/g) || []).length;
const gc = (js.match(/case"weather_gui":return n\.jsx/g) || []).length;
const gl = (js.match(/Weather GUI \(hero dashboard\)/g) || []).length;
const gm = (js.match(/const WG_CSS/g) || []).length;
const gxs = (js.match(/const WX_SVG/g) || []).length;
const gz = (js.match(/transform:\(a\.center\?/g) || []).length;
const gzp = (js.match(/left:\(a\.center\?50:Q/g) || []).length;
const grv = (js.match(/function rwRV/g) || []).length;
const atWXA = js.indexOf('function wxGUI');
const atWSA = js.indexOf('\nfunction wsWS');
const wxSlice = (atWXA >= 0 && atWSA > atWXA) ? js.slice(atWXA, atWSA) : '';
const grw = (wxSlice.includes('n.jsx(rwRV') && wxSlice.includes('lat: 28.817422') && wxSlice.includes('lon: -81.620514') && wxSlice.includes('zoom: 11') && wxSlice.includes("ctl: !0") && wxSlice.includes('wgXScene')) ? 1 : 0;
if (gw !== 1 || gc !== 1 || gl !== 1 || gm !== 1 || gxs !== 1 || gz !== 1 || gzp !== 1 || grv !== 1 || grw !== 1) {
  step('guards', 'FAIL', 'wxGUI=' + gw + ' case_gui=' + gc + ' label=' + gl + ' WG_CSS=' + gm + ' WX_SVG=' + gxs + ' wm.center=' + gz + ' wm.centerPin=' + gzp + ' rwRV=' + grv + ' wxRadarSwap=' + grw + ' (must all be 1)');
  fs.writeFileSync(jsPath, orig); fs.writeFileSync(htmlPath, htmlOrigStr);
  step('rollback', 'OK', 'originals restored (guard failures)');
  console.log('FDW_RESULT ' + JSON.stringify(report)); process.exit(1);
}
step('guards', 'OK', 'wxGUI/case/label/WG_CSS/WX_SVG/wm.center/wm.centerPin/rwRV/wxRadarSwap all 1x');
if (!report.ok) {
  fs.writeFileSync(jsPath, orig); fs.writeFileSync(htmlPath, htmlOrigStr);
  step('rollback', 'OK', 'originals restored (anchor failures)');
  console.log('FDW_RESULT ' + JSON.stringify(report)); process.exit(1);
}
const tmpCheck = path.join(tmpDir, 'wg-bundle-check.js');
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
