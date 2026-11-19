#!/usr/bin/env node
// FD wave-weather client patch. Runs INSIDE the family-dashboard container:
//   docker exec family-dashboard node /tmp/fdw-apply-client.cjs
// Patches the minified Vite bundle with the composite 'weather_station' block.
// Idempotent: bails when the case is already injected.
const fs = require('fs');
const path = require('path');
const report = { steps: [], ok: true };
const step = (name, status, extra) => { report.steps.push({ name, status, extra }); console.log('[' + status + '] ' + name + (extra ? ' :: ' + extra : '')); if (status === 'FAIL') report.ok = false; };

// ---------- locate bundle ----------
const dist = process.env.FDW_DIST || '/app/client/dist';
const tmpDir = process.env.FDW_TMP || '/tmp';
const htmlPath = path.join(dist, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');
const htmlOrigStr = html;
const mjs = html.match(/src="(\/assets\/index-[^"?.]+\.js)(\?v=[^"]+)?"/);
if (!mjs) { step('find bundle', 'FAIL', 'no script tag'); console.log('FDW_RESULT ' + JSON.stringify(report)); process.exit(1); }
const jsPath = dist + mjs[1];
let js = fs.readFileSync(jsPath, 'utf8');
step('find bundle', 'OK', mjs[1] + ' (' + js.length + ' bytes)');

if (js.includes('case"weather_station"')) {
  step('inject', 'SKIP', 'already patched');
} else {
  // level-2 backups (orig.* is wave4 hardening's backup; orig2.* is ours)
  const jsBak = path.join(path.dirname(jsPath), 'orig2.' + path.basename(jsPath));
  const htmlBak = path.join(path.dirname(htmlPath), 'orig2.' + path.basename(htmlPath));
  if (!fs.existsSync(jsBak)) { fs.copyFileSync(jsPath, jsBak); step('backup bundle', 'OK', jsBak); }
  if (!fs.existsSync(htmlBak)) { fs.copyFileSync(htmlPath, htmlBak); step('backup html', 'OK', htmlBak); }
  const comp = fs.readFileSync(path.join(tmpDir, 'fdw-ws-component.js'), 'utf8').replace(/\r/g, '').replace(/\s+$/, '');
  const orig = js;
  function one(name, find, repl) {
    const count = js.split(find).length - 1;
    if (count !== 1) { step(name, 'FAIL', 'anchor ' + count + 'x: ' + find.slice(0, 60)); return false; }
    js = js.replace(find, repl);
    step(name, 'OK');
    return true;
  }

  // 1. renderer case (insert before weather_forecast case)
  const caseAnchor = 'case"hourly_weather":return n.jsx("div",{className:`${H} p-2`,style:I,children:n.jsx(vm,{config:_,fontFamilyClass:k})});case"weather_forecast":';
  one('case.injector', caseAnchor,
    'case"hourly_weather":return n.jsx("div",{className:`${H} p-2`,style:I,children:n.jsx(vm,{config:_,fontFamilyClass:k})});' +
    'case"weather_station":return n.jsx("div",{className:H+" p-1",style:I,children:n.jsx(wsWS,{config:_,fontFamilyClass:k})});' +
    'case"weather_forecast":');

  // 2. component function (after renderer default-case closing)
  const tailAnchor = 'children:["Widget: ",P]})}}';
  const tailCount = js.split(tailAnchor).length - 1;
  if (tailCount !== 1) { step('component.inject', 'FAIL', 'tail anchor ' + tailCount + 'x'); }
  else {
    const at = js.indexOf(tailAnchor);
    const after = js.slice(at + tailAnchor.length);
    if (!/^const gr=/.test(after)) step('component.inject', 'WARN', 'unexpected bytes after tail anchor: ' + JSON.stringify(after.slice(0, 20)));
    js = js.replace(tailAnchor, tailAnchor + '\n' + comp + '\n');
    step('component.inject', 'OK', comp.length + ' bytes');
  }

  // 3. admin label map
  one('label.map', 'case"radar_block":return"Weather Radar";',
    'case"radar_block":return"Weather Radar";case"weather_station":return"Weather Station";');

  // 4. admin config form (inserted as a new sibling before the radar conditional)
  const formAnchor = '}),x.type==="radar_block"&&n.jsxs("div",{className:"flex flex-col gap-1.5 border-t border-slate-800 pt-1.5"';
  const formJsx = '}),x.type==="weather_station"&&n.jsxs("div",{className:"flex flex-col gap-1.5 border-t border-slate-800 pt-1.5",children:[' +
    'n.jsx("span",{className:"font-bold text-cyan-400 uppercase text-[8px]",children:"Weather Station Config"}),' +
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
    ']}),' +
    'x.type==="radar_block"&&n.jsxs("div",{className:"flex flex-col gap-1.5 border-t border-slate-800 pt-1.5"';
  one('form.inject', formAnchor, formJsx);

  step('form.vars', 'OK', 'inline (x.config||{}) patterns (no throwaway vars)');

  // 5. cache-bust index.html
  if (html.includes(mjs[1] + '"')) {
    html = html.replace('src="' + mjs[1] + '"', 'src="' + mjs[1] + '?v=ws2"');
    step('index.html', 'OK', '?v=ws2');
  } else { step('index.html', 'SKIP', 'already versioned'); }

  if (!report.ok) { js = orig; step('rollback', 'OK', 'restoring original bundle (anchor failures)'); console.log('FDW_RESULT ' + JSON.stringify(report)); process.exit(1); }

  fs.writeFileSync(jsPath, js);
  fs.writeFileSync(htmlPath, html);
  step('write', 'OK', js.length + ' bytes');

  // 6. parse-only syntax check (SourceTextModule), evaluate nothing
  try {
    const cp = require('child_process');
    const check = cp.execFileSync(process.execPath, ['--experimental-vm-modules', '-e',
      'const vm=require("vm");new vm.SourceTextModule(require("fs").readFileSync(' + JSON.stringify(jsPath) + ',"utf8"));console.log("PARSE_OK")'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    step('parse.check', /PARSE_OK/.test(check) ? 'OK' : 'FAIL', check.trim().slice(-120));
    if (!/PARSE_OK/.test(check)) report.ok = false;
  } catch (e) {
    step('parse.check', 'FAIL', String(e.stderr || e.message).slice(-500));
    // roll back: restore originals
    fs.writeFileSync(jsPath, orig);
    fs.writeFileSync(htmlPath, htmlOrigStr);
    step('rollback', 'OK', 'originals restored after parse failure');
  }
}

console.log('FDW_RESULT ' + JSON.stringify(report));
process.exit(report.ok ? 0 : 1);