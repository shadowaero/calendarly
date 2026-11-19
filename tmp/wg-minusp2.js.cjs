const fs = require('fs');
const vm = require('vm');
const tryParse = (src) => {
  try { new vm.SourceTextModule(src); return 'ok'; } catch (e) {
    const m = e.message || '';
    if (m.indexOf('end of input') >= 0 || m.indexOf('Unterminated') >= 0) return 'eof';
    return 'ERR: ' + m.split('\n')[0].slice(0, 100);
  }
};
let bad = fs.readFileSync('tmp/wgtest/wg-bundle-check.js', 'utf8');
console.log('file: parses=' + tryParse(bad));
const aCG = bad.indexOf('const WG_CSS');
const bWS = bad.indexOf('function wsWS({ config: c, fontFamilyClass: k }) {');
const noComp = bad.slice(0, aCG) + bad.slice(bWS);
console.log('minus comp: ' + tryParse(noComp));
const caseStr = 'case"weather_gui":return n.jsx("div",{className:H,style:I,children:n.jsx(wxGUI,{config:_,fontFamilyClass:k})});';
console.log('minus case: ' + tryParse(bad.replace(caseStr, '')));
const lblStr = 'case"weather_gui":return"Weather GUI (hero dashboard)";';
console.log('minus label: ' + tryParse(bad.replace(lblStr, '')));
const btnStr = 'n.jsx("button",{type:"button",onClick:()=>o("weather_gui"),className:"px-1.5 py-1 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-800 text-indigo-200 rounded-lg text-[9px] font-bold",children:"+ Weather GUI"}),';
console.log('minus button: ' + tryParse(bad.replace(btnStr, '')));
const aF = bad.indexOf('x.type==="weather_gui"&&n.jsxs');
const rF = bad.indexOf('x.type==="radar_block"&&n.jsxs', aF);
console.log('form region: ' + aF + '..' + rF + '  len=' + (rF - aF));
console.log('minus form: ' + tryParse(bad.slice(0, aF) + bad.slice(rF)));
// form region alone in a sane wrapper: x.type===X && jsx(...)  is an expression
const form = bad.slice(aF, rF);
console.log('form head 120: ' + JSON.stringify(form.slice(0, 120)));
console.log('form tail 120: ' + JSON.stringify(form.slice(-120)));
