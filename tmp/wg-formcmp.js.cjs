const fs = require('fs');
const vm = require('vm');
const tryParse = (src, tag) => {
  try { new vm.SourceTextModule(src); return 'ok'; } catch (e) {
    const m = e.message || '';
    if (m.indexOf('end of input') >= 0 || m.indexOf('Unterminated') >= 0) return 'eof';
    console.log('[F2] ' + m.split('\n')[0].slice(0, 120));
    return 'ERR';
  }
};
const orig = fs.readFileSync('tmp/wgtest/dist/assets/orig6.index-BDiodzvu.js', 'utf8');
const comp = fs.readFileSync('tmp/wgtest/wxgui-component.js', 'utf8').replace(/\r/g, '').replace(/\s+$/, '');
// --- base: orig + comp + case + label + button ---
let js = orig;
const atWSh = js.indexOf('function wsWS({ config: c, fontFamilyClass: k }) {');
js = js.slice(0, atWSh) + comp + '\n' + js.slice(atWSh);
const wsCase = 'case"weather_station":return n.jsx("div",{className:H+" p-1",style:I,children:n.jsx(wsWS,{config:_,fontFamilyClass:k})});';
js = js.replace(wsCase, 'case"weather_gui":return n.jsx("div",{className:H,style:I,children:n.jsx(wxGUI,{config:_,fontFamilyClass:k})});' + wsCase);
js = js.replace('case"radar_block":return"Weather Radar";', 'case"weather_gui":return"Weather GUI (hero dashboard)";case"radar_block":return"Weather Radar";');
js = js.replace('n.jsx("button",{type:"button",onClick:()=>o("radar_block")',
  'n.jsx("button",{type:"button",onClick:()=>o("weather_gui"),className:"px-1.5 py-1 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-800 text-indigo-200 rounded-lg text-[9px] font-bold",children:"+ Weather GUI"}),' +
  'n.jsx("button",{type:"button",onClick:()=>o("radar_block")');
const radarForm = 'x.type==="radar_block"&&n.jsxs("div",{className:"flex flex-col gap-1.5 border-t border-slate-800 pt-1.5"';
// --- their form, verbatim from fdw-apply-widgets.cjs ---
const fcond = '["ws_current","ws_baro","ws_wind","ws_solar","ws_outdoor","ws_indoor","ws_today","ws_clock","ws_alerts"].indexOf(x.type)>=0&&';
const theirs = fcond + 'n.jsxs("div",{className:"flex flex-col gap-1.5 border-t border-slate-800 pt-1.5",children:[' +
  'n.jsx("span",{className:"font-bold text-cyan-400 uppercase text-[8px]",children:"Weather Widget Config"}),' +
  'n.jsxs("div",{className:"grid grid-cols-2 gap-1",children:[' +
  'n.jsxs("div",{children:[' +
  'n.jsx("label",{className:"text-[7.5px] text-slate-400 block mb-0.5",children:"Zip / City"}),' +
  'n.jsx("input",{type:"text",placeholder:"32757",value:(x.config||{}).zip||"",onChange:L=>p(h,{zip:L.target.value}),className:"w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"})' +
  ']}),' +
  'n.jsxs("div",{children:[' +
  'n.jsx("label",{className:"text-[7.5px] text-slate-400 block mb-0.5",children:"Indoor channel"}),' +
  'n.jsx("input",{type:"text",placeholder:"B",value:(x.config||{}).indoorChannel||"",onChange:L=>p(h,{indoorChannel:L.target.value}),className:"w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"})' +
  ']}),' +
  'n.jsxs("div",{children:[' +
  'n.jsx("label",{className:"text-[7.5px] text-slate-400 block mb-0.5",children:"Outdoor channel"}),' +
  'n.jsx("input",{type:"text",placeholder:"A",value:(x.config||{}).outdoorChannel||"",onChange:L=>p(h,{outdoorChannel:L.target.value}),className:"w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"})' +
  ']})' +
  ']}),';
const F2 = js.replace(radarForm, theirs + radarForm);
console.log('F2 (their form) parses: ' + tryParse(F2, 'F2'));
// --- my form but with 3 fields (drop indoor) ---
const mineTail = 'x.type==="weather_gui"&&n.jsxs("div",{className:"flex flex-col gap-1.5 border-t border-slate-800 pt-1.5",children:[' +
  'n.jsx("span",{className:"font-bold text-indigo-300 uppercase text-[8px]",children:"Weather GUI Config"}),' +
  'n.jsxs("div",{className:"grid grid-cols-2 gap-1",children:[' +
  'n.jsxs("div",{children:[n.jsx("label",{className:"text-[7.5px] text-slate-400 block mb-0.5",children:"City label"}),' +
  'n.jsx("input",{type:"text",placeholder:"MOUNT DORA",value:(x.config||{}).city||"",onChange:L=>p(h,{city:L.target.value}),className:"w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"})]}),' +
  'n.jsxs("div",{children:[n.jsx("label",{className:"text-[7.5px] text-slate-400 block mb-0.5",children:"Zip / Location"}),' +
  'n.jsx("input",{type:"text",placeholder:"32757",value:(x.config||{}).zip||"",onChange:L=>p(h,{zip:L.target.value}),className:"w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"})]}),' +
  'n.jsxs("div",{children:[n.jsx("label",{className:"text-[7.5px] text-slate-400 block mb-0.5",children:"Outdoor channel"}),' +
  'n.jsx("input",{type:"text",placeholder:"A",value:(x.config||{}).outdoorChannel||"",onChange:L=>p(h,{outdoorChannel:L.target.value}),className:"w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"})]})' +
  ']}),';
const F3 = js.replace(radarForm, mineTail + radarForm);
console.log('F3 (my form, 3 fields, ws-style tail) parses: ' + tryParse(F3, 'F3'));
