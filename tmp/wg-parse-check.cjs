const fs = require('fs');
const base = 'c:/Users/xxtoo/Documents/IDX6011/wave4/fd_weather/';
const comp = fs.readFileSync(base + 'wxgui-component.js', 'utf8').replace(/\r\n/g, '\n');
const rvComp = fs.readFileSync(base + 'rw-rainview-comp.js', 'utf8').replace(/\r\n/g, '\n');
const stub = 'const n={jsx:function(t,p,k){return {t:t,p:p}},jsxs:function(t,p,k){return {t:t,p:p,k:k}}};' +
  'const b={useState:function(){return [new Date(),function(){}]},useEffect:function(){},useRef:function(){return {current:null}}};' +
  'const wm=function(){return null};const WX_SVG={};const wxIco=function(){return null};' +
  'const wxIconKey=function(){return "pc"};const wmoBucket=function(){return "pc"};' +
  'const fOf=function(x){return x};const inHg=function(){return 29.9};' +
  'const fmt12=function(){return "6:00 AM"};const fmtHour=function(){return "6 AM"};' +
  'const minsOf=function(){return 360};const DIRS=["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];\n';
const probe = 'try { const r = wxGUI({config:{zip:"32757",city:"Mount Dora",outdoorChannel:"A",indoorChannel:"B"}}); const s = JSON.stringify(r);' +
  'console.log("RENDER_OK len=" + s.length);' +
  'console.log("chip_in_tree=" + s.includes("Weather updated "));' +
  'console.log("indoor_absent=" + !s.includes("Indoor sensor"));' +
  'console.log("rv_cfg: " + ((s.indexOf(\'"zoom":11\') >= 0 && s.indexOf("28.817422") >= 0 && s.indexOf("-81.620514") >= 0 && s.indexOf("WEATHER RADAR") >= 0 && s.indexOf(\'"ctl":true\') >= 0) ? "OK" : "MISSING"));' +
  'console.log("scene: " + (s.includes("wgXScene") ? "OK" : "MISSING"));' +
  'console.log("scene_kfx: " + ((s.includes("wgXDrift") && s.includes("wgXFall")) ? "OK" : "MISSING"));' +
  'console.log("wgsrc: " + (s.includes("OPEN-METEO") ? "OK" : "MISSING"));' +
  'console.log("oldmap_gone: " + (!(s.includes("magnify") || s.includes("center:!0") || s.includes("center: !0")) ? "OK" : "STILL_PRESENT"));' +
  'const rvc = JSON.stringify(rwRV({config:{lat:28.817422,lon:-81.620514,zoom:10,label:"WEATHER RADAR",ctl:true}}));' +
  'console.log("rv_ctl: " + ((rvc.includes("touchAction\\":\\"none") && rvc.includes("\\u2212") && RVSRC.includes("onTouchStart") && RVSRC.includes("pvMove") && RVSRC.includes("rwRVz:") && RVSRC.includes("rvSet")) ? "OK" : "MISSING"));' +
  'const rvp = JSON.stringify(rwRV({config:{lat:28.8,lon:-81.6,zoom:7,label:"PLAIN"}}));' +
  'console.log("rv_xf: " + ((RVSRC.includes("opacity .48s linear") && RVSRC.indexOf("rvPP") >= 0 && RVSRC.indexOf("rvPL") >= 0 && !RVSRC.includes("setRvFr") && !/[^A-Za-z]rvFr[^A-Za-z]/.test(RVSRC)) ? "OK" : "MISSING"));' +
  'console.log("rv_ov: " + ((RVSRC.indexOf("halfW - cpxO * OV") >= 0 && RVSRC.indexOf("transformOrigin") >= 0 && RVSRC.indexOf("scale(") >= 0) ? "OK" : "MISSING"));' +
  'console.log("rv_bs: " + ((RVSRC.indexOf("const SS = Math.min(2") >= 0 && RVSRC.indexOf("const BZ = rvZoom + SS") >= 0 && RVSRC.indexOf("+ BZ +") >= 0 && RVSRC.indexOf("+ btS +") >= 0) ? "OK" : "MISSING"));' +
  'console.log("rv_ctl_off: " + ((!rvp.includes("touchAction\\":\\"none") && !rvp.includes("\\u2212")) ? "OK" : "LEAKED")); }' +
  'catch(e){ console.log("RENDER_FAIL " + e.constructor.name + ": " + e.message); }\n';
fs.writeFileSync('c:/Users/xxtoo/Documents/IDX6011/tmp/wg-parse-run.mjs', stub + comp + '\n' + rvComp + '\nconst RVSRC = ' + JSON.stringify(rvComp).replace(/\\u2028|\\u2029/g, ' ') + ';\nconsole.log("PARSE_OK", typeof wxGUI, typeof rwRV);\n' + probe);
console.log('harness written, wxgui lines:', comp.split('\n').length, 'rwRV lines:', rvComp.split('\n').length);
// ---- v5: deep-render check — render rwRV with a REAL measured panel (796x462) at zooms 7/9/10
// and assert the rvBS supersampled base + rvXF wrapper math on the actual component output ----
const stub2 = 'var __seed={zoom:7,box:{w:796,h:462}};' +
  'const n={jsx:function(t,p,k){return {t:t,p:p,k:k}},jsxs:function(t,p,k){return {t:t,p:p,k:k}}};' +
  'const b={useState:function(v){ if(v&&typeof v==="object"&&("w" in v)&&("h" in v)){ if(__seed.box)v=__seed.box; } else if(typeof v==="number"){ if(__seed.zoom!=null)v=__seed.zoom; } return [v,function(){}];},useEffect:function(){},useRef:function(){return {current:null}}};' +
  'const wm=function(){return null};const WX_SVG={};const wxIco=function(){return null};' +
  'const wxIconKey=function(){return "pc"};const wmoBucket=function(){return "pc"};' +
  'const fOf=function(x){return x};const inHg=function(){return 29.9};' +
  'const fmt12=function(){return "6:00 AM"};const fmtHour=function(){return "6 AM"};' +
  'const minsOf=function(){return 360};const DIRS=["N","NNE","NE","ENE","E","ESE","SE","SSE","SSW","SW","WSW","W","WNW","NW","NNW"];\n';
const px2 = 'function walk(x, acc){ if(!x||typeof x!=="object")return acc; if(Array.isArray(x)){for(var i=0;i<x.length;i++)walk(x[i],acc);return acc;} var s=(x.p&&x.p.style)||null; if(s){ if(s.backgroundImage)acc.bg.push(String(s.backgroundImage)); if(s.backgroundSize)acc.sz.push(String(s.backgroundSize)); if(s.transform)acc.tr.push(String(s.transform)); } if(x.p&&x.p.children)walk(x.p.children,acc); return acc; }\n' +
  'function runZoom(z){ __seed.zoom = z; var tree=rwRV({config:{lat:28.8,lon:-81.6,zoom:z,label:"BS"}}); var acc={bg:[],sz:[],tr:[]}; walk(tree,acc); __trees[z]=tree; return acc; }\n' +
  'try {\nvar __trees={};\n' +
  ' var a7=runZoom(7); var u9=a7.bg.filter(function(u){return u.indexOf("tile.openstreetmap.org/9/")>=0;});\n' +
  ' console.log("rv_bs_z7: " + ((u9.length>=30 && a7.bg.length===u9.length && a7.sz.length===u9.length && a7.sz.every(function(s){return s==="64px 64px";}) && a7.bg.every(function(u){return u.indexOf("/10/")<0;})) ? "OK" : "MISSING bg="+a7.bg.length+" z9="+u9.length+" sz="+(a7.sz[0]||"none")+" u="+(a7.bg[0]||"none")));\n' +
  ' var a9=runZoom(9); var u10=a9.bg.filter(function(u){return u.indexOf("tile.openstreetmap.org/10/")>=0;});\n' +
  ' console.log("rv_bs_z9: " + ((u10.length>=15 && a9.bg.length===u10.length && a9.sz.every(function(s){return s==="128px 128px";}) && a9.tr.indexOf("scale(4)")>=0) ? "OK" : "MISSING urls="+u10.length+" tr="+a9.tr.join(",")));\n' +
  ' var a10=runZoom(10); var u10b=a10.bg.filter(function(u){return u.indexOf("tile.openstreetmap.org/10/")>=0;});\n' +
  ' console.log("rv_bs_z10: " + ((u10b.length>=10 && a10.bg.length===u10b.length && a10.sz.every(function(s){return s==="256px 256px";}) && a10.tr.indexOf("scale(8)")>=0) ? "OK" : "MISSING urls="+u10b.length+" tr="+a10.tr.join(",")));\n' +
  ' var t10=__trees[10]||null; var s10=t10?JSON.stringify(t10):"";\n' +
  ' console.log("rv_home: " + ((s10.indexOf("rwPulse")>=0 && s10.indexOf("#ff2bd6")>=0 && s10.indexOf("HOME")>=0 && s10.indexOf("398px")>=0 && s10.indexOf("231px")>=0) ? "OK" : "MISSING"));\n' +
  '} catch(e){ console.log("RV_DOM_FAIL " + e.constructor.name + ": " + e.message); }\n';
fs.writeFileSync('c:/Users/xxtoo/Documents/IDX6011/tmp/rv-dom-run.cjs', stub2 + rvComp + '\n' + px2);
