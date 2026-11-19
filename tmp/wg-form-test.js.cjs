const fs = require('fs');
const vm = require('vm');
const p = (code, tag) => {
  try { new vm.SourceTextModule(code); console.log(tag + ': OK'); } catch (e) { console.log(tag + ': ' + (e.message || '').split('\n')[0].slice(0, 120)); }
};
// my myForm exactly as in fdw-apply-wxgui.cjs
const mine = 'x.type==="weather_gui"&&n.jsxs("div",{className:"flex flex-col gap-1.5 border-t border-slate-800 pt-1.5",children:[' +
  'n.jsx("span",{className:"font-bold text-indigo-300 uppercase text-[8px]",children:"Weather GUI Config"}),' +
  'n.jsxs("div",{className:"grid grid-cols-2 gap-1",children:[' +
  'n.jsxs("div",{children:[n.jsx("label",{className:"text-[7.5px] text-slate-400 block mb-0.5",children:"City label"}),' +
  'n.jsx("input",{type:"text",placeholder:"MOUNT DORA",value:(x.config||{}).city||"",onChange:L=>p(h,{city:L.target.value}),className:"w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"})]}),' +
  'n.jsxs("div",{children:[n.jsx("label",{className:"text-[7.5px] text-slate-400 block mb-0.5",children:"Zip / Location"}),' +
  'n.jsx("input",{type:"text",placeholder:"32757",value:(x.config||{}).zip||"",onChange:L=>p(h,{zip:L.target.value}),className:"w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"})]}),' +
  'n.jsxs("div",{children:[n.jsx("label",{className:"text-[7.5px] text-slate-400 block mb-0.5",children:"Outdoor channel"}),' +
  'n.jsx("input",{type:"text",placeholder:"A",value:(x.config||{}).outdoorChannel||"",onChange:L=>p(h,{outdoorChannel:L.target.value}),className:"w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"})]}),' +
  'n.jsxs("div",{children:[n.jsx("label",{className:"text-[7.5px] text-slate-400 block mb-0.5",children:"Indoor channel"}),' +
  'n.jsx("input",{type:"text",placeholder:"B",value:(x.config||{}).indoorChannel||"",onChange:L=>p(h,{indoorChannel:L.target.value}),className:"w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"})]})' +
  ']}),';
const wrap = (f) => { const pre = 'const x={config:{}},n={jsx:()=>{},jsxs:()=>{}},p=()=>{},h={},L=0;['; return pre + f + ',0];r();'; };
p(wrap(mine), 'mine-in-array');
// ws kit myForm exactly as in fdw-apply-widgets.cjs lines 143-159
const ws = '[\"ws_current\"].indexOf(x.type)>=0&&' +
  'n.jsxs("div",{className:"flex flex-col gap-1.5 border-t border-slate-800 pt-1.5",children:[' +
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
p(wrap(ws), 'ws-kit-in-array');
// bracket balance summary
const bal = (s) => {
  let d = 0;
  for (const ch of s) { if ('{(['.includes(ch)) d++; else if ('})]'.includes(ch)) d--; }
  return d;
};
console.log('bracket balance count (incl strings, approx): mine=' + bal(mine) + ' ws=' + bal(ws));
