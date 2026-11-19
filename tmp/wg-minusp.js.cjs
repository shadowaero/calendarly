const fs = require('fs');
const vm = require('vm');
const tryParse = (src) => {
  try { new vm.SourceTextModule(src); return true; } catch (e) {
    const m = e.message || '';
    return !(m.indexOf('end of input') >= 0 || m.indexOf('Unterminated') >= 0);
  }
};
let bad = fs.readFileSync('tmp/wgtest/wg-bundle-check.js', 'utf8');
console.log('file: ' + bad.length + 'B, parses: ' + tryParse(bad));
const aCG = bad.indexOf('const WG_CSS');
const bWS = bad.indexOf('function wsWS({ config: c, fontFamilyClass: k }) {');
const comp = bad.slice(aCG, bWS);
const compAlone = 'const n={},b={};\n' + comp + '\n;';
console.log('comp standalone parses: ' + tryParse(compAlone) + ' (' + comp.length + 'B)');
// 1. without comp
const noComp = bad.slice(0, aCG) + bad.slice(bWS);
console.log('minus comp: ' + tryParse(noComp));
// 2. without case
const caseStr = 'case"weather_gui":return n.jsx("div",{className:H,style:I,children:n.jsx(wxGUI,{config:_,fontFamilyClass:k})});';
const noCase = bad.replace(caseStr, '');
console.log('minus case: ' + tryParse(noCase));
// 3. without label
const lblStr = 'case"weather_gui":return"Weather GUI (hero dashboard)";';
const noLbl = bad.replace(lblStr, '');
console.log('minus label: ' + tryParse(noLbl));
// 4. without button
const btnStr = 'n.jsx("button",{type:"button",onClick:()=>o("weather_gui"),className:"px-1.5 py-1 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-800 text-indigo-200 rounded-lg text-[9px] font-bold",children:"+ Weather GUI"}),';
const noBtn = bad.replace(btnStr, '');
console.log('minus button: ' + tryParse(noBtn));
// 5. without form
const aF = bad.indexOf('x.type==="weather_gui"&&n.jsxs');
const rF = bad.indexOf('x.type==="radar_block"&&n.jsxs', aF);
console.log('form region: ' + aF + ' .. ' + rF);
const noForm = aF >= 0 ? bad.slice(0, aF) + bad.slice(rF) : bad;
console.log('minus form: ' + tryParse(noForm));
