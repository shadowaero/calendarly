const fs = require('fs');
const comp = fs.readFileSync('c:/Users/xxtoo/Documents/IDX6011/wave4/fd_weather/wxgui-component.js', 'utf8').replace(/\r\n/g, '\n');
const stub = 'const n={jsx:function(){return null},jsxs:function(){return null}};' +
  'const b={useState:function(){return [null,function(){}]},useEffect:function(){},useRef:function(){return {current:null}}};' +
  'const wm=function(){return null};const WX_SVG={};const wxIco=function(){return null};' +
  'const wxIconKey=function(){return "pc"};const wmoBucket=function(){return "pc"};' +
  'const fOf=function(x){return x};const inHg=function(){return 29.9};' +
  'const fmt12=function(){return ""};const fmtHour=function(){return ""};' +
  'const minsOf=function(){return null};const DIRS=[];\n';
fs.writeFileSync('c:/Users/xxtoo/Documents/IDX6011/tmp/wg-parse-run.mjs', stub + comp + '\nconsole.log("PARSE_OK", typeof wxGUI);\n');
console.log('harness written, comp lines:', comp.split('\n').length);
