#!/usr/bin/env node
// FD wave-weather WIDGET-SPLIT client patch. Runs on the Pi (server runs natively):
//   sudo node /tmp/fdw-apply-widgets.cjs
// Splits the composite 'weather_station' into 9 individual ws_* widget block types.
// Idempotent: bails when already injected.
const fs = require('fs');
const path = require('path');
const report = { steps: [], ok: true };
const step = (name, status, extra) => { report.steps.push({ name, status, extra }); console.log('[' + status + '] ' + name + (extra ? ' :: ' + extra : '')); if (status === 'FAIL') report.ok = false; };

const dist = process.env.FDW_DIST || '/opt/calendarly/client/dist';
const tmpDir = process.env.FDW_TMP || '/tmp';
const htmlPath = path.join(dist, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');
const htmlOrigStr = html;
const mjs = html.match(/src="(\/assets\/index-[^"?]+\.(?:js))(\?v=[^"]+)?"/);
if (!mjs) { step('find bundle', 'FAIL', 'no script tag'); console.log('FDW_RESULT ' + JSON.stringify(report)); process.exit(1); }
const jsPath = dist + mjs[1];
let js = fs.readFileSync(jsPath, 'utf8');
step('find bundle', 'OK', mjs[1] + ' (' + js.length + ' bytes)');

if (js.includes('case"ws_current":')) { step('inject', 'SKIP', 'already patched'); }
else {
  const jsBak = path.join(path.dirname(jsPath), 'orig3.' + path.basename(jsPath));
  const htmlBak = path.join(path.dirname(htmlPath), 'orig3.' + path.basename(htmlPath));
  if (!fs.existsSync(jsBak)) { fs.copyFileSync(jsPath, jsBak); step('backup bundle', 'OK', jsBak); }
  if (!fs.existsSync(htmlBak)) { fs.copyFileSync(htmlPath, htmlBak); step('backup html', 'OK', htmlBak); }
  const comp = fs.readFileSync(path.join(tmpDir, 'ws-widgets.js'), 'utf8').replace(/\r/g, '').replace(/\s+$/, '');
  const orig = js;
  function one(name, find, repl) {
    const count = js.split(find).length - 1;
    if (count !== 1) { step(name, 'FAIL', 'anchor ' + count + 'x: ' + find.slice(0, 70)); return false; }
    js = js.replace(find, repl);
    step(name, 'OK');
    return true;
  }

  // 1. renderer cases for the 9 widget types (tight p-0.5 wrapper)
  const wsCase = 'case"weather_station":return n.jsx("div",{className:H+" p-1",style:I,children:n.jsx(wsWS,{config:_,fontFamilyClass:k})});';
  const K = ['current', 'baro', 'wind', 'solar', 'outdoor', 'indoor', 'today', 'clock', 'alerts'];
  let widgetCases = '';
  K.forEach(k => { widgetCases += 'case"ws_' + k + '":return n.jsx("div",{className:H+" p-0.5",style:I,children:n.jsx(wsTile,{config:_,kind:"' + k + '",fontFamilyClass:k})});'; });
  one('case.inject', wsCase, widgetCases + wsCase);

  // 2. component function: inject wsTile just before wsWS definition
  const headAnchor = 'function wsWS({ config: c, fontFamilyClass: k }) {';
  const at = js.indexOf(headAnchor);
  if (at < 0) { step('component.inject', 'FAIL', 'wsWS head anchor missing'); }
  else {
    js = js.slice(0, at) + comp + '\n' + js.slice(at);
    step('component.inject', 'OK', comp.length + ' bytes');
  }

  // 3. label map
  one('label.map', 'case"weather_station":return"Weather Station";',
    'case"weather_station":return"Weather Station";' +
    'case"ws_current":return"Weather: Current";' +
    'case"ws_baro":return"Weather: Barometer";' +
    'case"ws_wind":return"Weather: Wind";' +
    'case"ws_solar":return"Weather: Solar & UV";' +
    'case"ws_outdoor":return"Weather: Outdoor Sensor";' +
    'case"ws_indoor":return"Weather: Indoor Sensor";' +
    'case"ws_today":return"Weather: Today";' +
    'case"ws_clock":return"Weather: Clock";' +
    'case"ws_alerts":return"Weather: Alerts";');

  // 4. add-menu buttons (before the + Date button)
  const BTN = [['ws_current', '+ Current'], ['ws_baro', '+ Baro'], ['ws_wind', '+ Wind'], ['ws_solar', '+ Solar'], ['ws_outdoor', '+ Outdoor'], ['ws_indoor', '+ Indoor'], ['ws_today', '+ Today'], ['ws_clock', '+ Clock'], ['ws_alerts', '+ Alerts']];
  let btns = '';
  BTN.forEach(bt => {
    btns += 'n.jsx("button",{type:"button",onClick:()=>o("' + bt[0] + '"),className:"px-1.5 py-1 bg-sky-950/80 hover:bg-sky-900 border border-sky-800 text-sky-200 rounded-lg text-[9px] font-bold",children:"' + bt[1] + '"}),';
  });
  one('button.inject', 'n.jsx("button",{type:"button",onClick:()=>o("date_block")', btns + 'n.jsx("button",{type:"button",onClick:()=>o("date_block")');

  // 5. admin config form (shared across all ws_* types)
  const radarForm = 'x.type==="radar_block"&&n.jsxs("div",{className:"flex flex-col gap-1.5 border-t border-slate-800 pt-1.5"';
  const cond = '["ws_current","ws_baro","ws_wind","ws_solar","ws_outdoor","ws_indoor","ws_today","ws_clock","ws_alerts"].indexOf(x.type)>=0&&';
  const myForm = cond + 'n.jsxs("div",{className:"flex flex-col gap-1.5 border-t border-slate-800 pt-1.5",children:[' +
    'n.jsx("span",{className:"font-bold text-cyan-400 uppercase text-[8px]",children:"Weather Widget Config"}),' +
    'n.jsxs("div",{className:"grid grid-cols-2 gap-1",children:[' +
    'n.jsxs("div",{children:[' +
    'n.jsx("label",{className:"text-[7.5px] text-slate-400 block mb-0.5",children:"Zip / City"}),' +
    'n.jsx("input",{type:"text",placeholder:"32757",value:(x.config||{}).zip||"",onChange:L=>p(h,{zip:L.target.value}),className:"w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"})' +
    ']}),' +
    'n.jsxs("div",{children:[' +
    'n.jsx("label",{className:"text-[7.5px] text-slate-400 block mb-0.5",children:"Indoor channel"}),' +
    'n.jsx("input",{type:"text",placeholder:"B",value:(x.config||{}).indoorChannel||"",onChange:L=>p(h,{indoorChannel:L.target.value}),className:"w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"})' +
    ']})' +
    ']}),' +
    'n.jsxs("div",{children:[' +
    'n.jsx("label",{className:"text-[7.5px] text-slate-400 block mb-0.5",children:"Outdoor channel"}),' +
    'n.jsx("input",{type:"text",placeholder:"A",value:(x.config||{}).outdoorChannel||"",onChange:L=>p(h,{outdoorChannel:L.target.value}),className:"w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"})' +
    ']})' +
    ']}),';
  one('form.inject', radarForm, myForm + radarForm);

  // 6. cache-bust index.html : ?v=ws2 -> ?v=ws3
  if (html.indexOf(mjs[1] + '?v=ws3') >= 0) { step('index.html', 'SKIP', 'already ws3'); }
  else if (html.indexOf(mjs[1] + '?v=ws2') >= 0) { html = html.replace(mjs[1] + '?v=ws2', mjs[1] + '?v=ws3'); step('index.html', 'OK', '?v=ws3'); }
  else { step('index.html', 'FAIL', 'no ws2 version marker'); }

  if (!report.ok) {
    fs.writeFileSync(jsPath, orig);
    fs.writeFileSync(htmlPath, htmlOrigStr);
    step('rollback', 'OK', 'originals restored (anchor failures)');
    console.log('FDW_RESULT ' + JSON.stringify(report));
    process.exit(1);
  }

  fs.writeFileSync(jsPath, js);
  fs.writeFileSync(htmlPath, html);
  step('write', 'OK', js.length + ' bytes');

  try {
    const cp = require('child_process');
    const check = cp.execFileSync(process.execPath, ['--experimental-vm-modules', '-e',
      'const vm=require("vm");new vm.SourceTextModule(require("fs").readFileSync(' + JSON.stringify(jsPath) + ',"utf8"));console.log("PARSE_OK")'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    step('parse.check', /PARSE_OK/.test(check) ? 'OK' : 'FAIL', check.trim().slice(-120));
    if (!/PARSE_OK/.test(check)) report.ok = false;
  } catch (e) {
    step('parse.check', 'FAIL', String(e.stderr || e.message).slice(-500));
    fs.writeFileSync(jsPath, orig);
    fs.writeFileSync(htmlPath, htmlOrigStr);
    step('rollback', 'OK', 'originals restored after parse failure');
  }
}
console.log('FDW_RESULT ' + JSON.stringify(report));
process.exit(report.ok ? 0 : 1);
