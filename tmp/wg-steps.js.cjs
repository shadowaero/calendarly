const fs = require('fs');
const vm = require('vm');
const tryParse = (src, tag) => {
  try { new vm.SourceTextModule(src); return 'ok'; } catch (e) {
    const m = e.message || '';
    if (m.indexOf('end of input') >= 0 || m.indexOf('Unterminated') >= 0) return 'eof';
    console.log('   [' + tag + '] ' + m.split('\n')[0].slice(0, 160));
    return 'ERR';
  }
};
const orig = fs.readFileSync('tmp/wgtest/dist/assets/orig6.index-BDiodzvu.js', 'utf8');
console.log('A orig: ' + tryParse(orig, 'A'));
const comp = fs.readFileSync('tmp/wgtest/wxgui-component.js', 'utf8').replace(/\r/g, '').replace(/\s+$/, '');
console.log('0 comp standalone: ' + tryParse('const n={},b={};\n' + comp + '\n;', '0'));
const atWS = orig.indexOf('\nfunction wsWS');
const atWSh = orig.indexOf('function wsWS({ config: c, fontFamilyClass: k }) {');
let js = orig.slice(0, atWSh) + comp + '\n' + orig.slice(atWSh);
console.log('B +component: ' + tryParse(js, 'B'));
js = 'case"weather_gui":return n.jsx("div",{className:H,style:I,children:n.jsx(wxGUI,{config:_,fontFamilyClass:k})});' + js; // no-op wrong; do real case inject
js = orig.slice(0, atWSh) + comp + '\n' + orig.slice(atWSh);
const wsCase = 'case"weather_station":return n.jsx("div",{className:H+" p-1",style:I,children:n.jsx(wsWS,{config:_,fontFamilyClass:k})});';
js = js.replace(wsCase, 'case"weather_gui":return n.jsx("div",{className:H,style:I,children:n.jsx(wxGUI,{config:_,fontFamilyClass:k})});' + wsCase);
console.log('C +case: ' + tryParse(js, 'C'));
js = js.replace('case"radar_block":return"Weather Radar";', 'case"weather_gui":return"Weather GUI (hero dashboard)";case"radar_block":return"Weather Radar";');
console.log('D +label: ' + tryParse(js, 'D'));
js = js.replace('n.jsx("button",{type:"button",onClick:()=>o("radar_block")',
  'n.jsx("button",{type:"button",onClick:()=>o("weather_gui"),className:"px-1.5 py-1 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-800 text-indigo-200 rounded-lg text-[9px] font-bold",children:"+ Weather GUI"}),' +
  'n.jsx("button",{type:"button",onClick:()=>o("radar_block")');
console.log('E +button: ' + tryParse(js, 'E'));
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
  'n.jsx("input",{type:"text",placeholder:"B",value:(x.config||{}).indoorChannel||"",onChange:L=>p(h,{indoorChannel:L.target.value}),className:"w-full bg-slate-900 border border-slate-700 rounded text-[8px] text-white p-1"})]})' +
  ']}),';
js = js.replace(radarForm, myForm + radarForm);
console.log('F +form (full): ' + tryParse(js, 'F'));
console.log('matches deployed size: ' + js.length + ' (deployed check file: ' + fs.statSync('tmp/wgtest/wg-bundle-check.js').size + ')');
