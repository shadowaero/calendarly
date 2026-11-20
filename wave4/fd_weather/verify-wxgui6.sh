#!/bin/bash
echo '== bundle parse + markers =='
node --experimental-vm-modules -e '
const vm = require("vm");
const fs = require("fs");
const html = fs.readFileSync("/opt/calendarly/client/dist/index.html", "utf8");
const m = html.match(/src="(\/assets\/index-[^"?]+\.js)(\?v=([^"]+))?"/);
if (!m) { console.log("HTML_MARKER MISSING"); process.exit(1); }
console.log("HTML_MARKER " + m[0]);
const js = fs.readFileSync("/opt/calendarly/client/dist" + m[1], "utf8");
new vm.SourceTextModule(js);
console.log("FULL_BUNDLE_PARSE_OK bytes=" + js.length);
console.log("wxGUI: " + (js.match(/function wxGUI/g) || []).length);
console.log("caseGui: " + (js.match(/case"weather_gui":return n\.jsx/g) || []).length);
console.log("label: " + (js.match(/Weather GUI \(hero dashboard\)/g) || []).length);
console.log("WG_CSS: " + (js.match(/const WG_CSS/g) || []).length);
console.log("WX_SVG: " + (js.match(/const WX_SVG/g) || []).length);
console.log("button: " + (js.match(/\+ Weather GUI/g) || []).length);
console.log("form: " + (js.match(/Weather GUI Config/g) || []).length);
console.log("rwWindy: " + (js.match(/function rwWindy/g) || []).length);
console.log("rwRV: " + (js.match(/function rwRV/g) || []).length);
console.log("caseWindy: " + (js.match(/case"radar_windy":return n\.jsx/g) || []).length);
console.log("caseRain: " + (js.match(/case"radar_rainviewer":return n\.jsx/g) || []).length);
console.log("btnWindy: " + (js.match(/\+ Windy/g) || []).length);
console.log("btnRain: " + (js.match(/\+ RainView/g) || []).length);
console.log("formWindy: " + (js.match(/Windy Radar Config/g) || []).length);
console.log("formRain: " + (js.match(/Rainbow Radar Config/g) || []).length);
console.log("rwCtl: " + (function(){var R=js.slice(js.indexOf("function rwRV"), js.indexOf("// wxGUI")); return (R.includes("pvStart") && R.includes("pvMove") && R.includes("const rvSet") && (R.match(/rwRVz:/g)||[]).length >= 2 && R.includes("touchAction") && R.includes("onTouchStart")) ? 1 : 0;})());
console.log("rwInWxCard: " + (function(){var S=js.slice(js.indexOf("function wxGUI"), js.indexOf("function wsWS({")); return S.includes("n.jsx(rwRV") && S.includes("zoom: 11") && S.includes("lat: 28.817422") && S.includes("lon: -81.620514") && S.includes("ctl: !0") && S.includes("wgXScene");})());
console.log("wxSrc: " + (function(){var S=js.slice(js.indexOf("function wxGUI"), js.indexOf("function wsWS({")); return S.includes("OPEN-METEO");})());
console.log("omSm: " + (function(){var S=js.slice(js.indexOf("function wxGUI"), js.indexOf("function wsWS({")); return (S.includes(".49cqw") && S.includes("OPEN-METEO")) ? 1 : 0;})());
console.log("omHalf: " + (function(){var S=js.slice(js.indexOf("function wxGUI"), js.indexOf("function wsWS({")); return S.includes(".075cqh") ? 1 : 0;})());
console.log("wxAnim: " + (function(){var S=js.slice(js.indexOf("function wxGUI"), js.indexOf("function wsWS({")); return (S.includes("wgXBob") && S.includes("wgXBreath") && S.includes("wgIcoBob") && js.includes("@keyframes wgXBob") && js.includes("@keyframes wgIcoBob")) ? 1 : 0;})());
console.log("n12Gone: " + (function(){var S=js.slice(js.indexOf("function wxGUI"), js.indexOf("function wsWS({")); return !S.includes("NEXT 12H") ? 1 : 0;})());
console.log("fx5: " + (function(){var S=js.slice(js.indexOf("function wxGUI"), js.indexOf("function wsWS({")); return (S.includes("5-DAY FORECAST") && S.includes("&days=6") && !S.includes("&days=2") && S.includes("TODAY")) ? 1 : 0;})());
console.log("rwXF: " + (function(){var R=js.slice(js.indexOf("function rwRV"), js.indexOf("// wxGUI")); return (R.includes("opacity 1.24s linear") && R.includes("rvPP") && R.includes("rvPL") && R.includes("620") && R.includes("rvHold") && R.includes("rvBeat") && R.includes("rvPrev") && !R.includes("setRvFr") && !R.match(/[^A-Za-z]rvFr[^A-Za-z]/) && !R.includes("(x + 1) % rvFrames.length")) ? 1 : 0;})());
console.log("rwTm: " + (function(){var R=js.slice(js.indexOf("function rwRV"), js.indexOf("// wxGUI")); return (R.indexOf(".slice(-7).concat(rvNC)") >= 0 && R.indexOf(".length, 7);") >= 0 && R.indexOf(".slice(-9).concat") < 0 && R.indexOf(".slice(-6).concat") < 0 && R.indexOf("slice(rvNC.length") < 0 && R.indexOf("rvNC.length ? 10 : 13") < 0) ? 1 : 0;})());
console.log("rwMI: " + (function(){var R=js.slice(js.indexOf("function rwRV"), js.indexOf("// wxGUI")); return (R.indexOf("rvBeat.current === 1") >= 0 && R.indexOf("620000") >= 0 && R.indexOf("rvPrev.current = rvN.current") >= 0 && R.indexOf("rvStT ||") >= 0 && R.indexOf(".62s linear") < 0) ? 1 : 0;})());
console.log("rbkDeck: " + (function(){var R=js.slice(js.indexOf("function rwRV"), js.indexOf("// wxGUI")); return (R.indexOf("/radar/api/snapshot") >= 0 && R.indexOf("/radar/api/health") >= 0 && R.indexOf("frUrl") >= 0 && R.indexOf("RV2RBK") >= 0 && R.indexOf("o: 7200") >= 0) ? 1 : 0;})());
console.log("rbkFcst: " + (function(){var R=js.slice(js.indexOf("function rwRV"), js.indexOf("// wxGUI")); return (R.indexOf("s + 7200, s: s, o: 7200, rbk: 1") >= 0 && R.indexOf("o: 1800") < 0 && R.indexOf("F2 <= 6") < 0) ? 1 : 0;})());
console.log("rbkNoUpstream: " + (function(){var R=js.slice(js.indexOf("function rwRV"), js.indexOf("// wxGUI")); return (R.indexOf("api.rainbow.ai") < 0 && R.indexOf("?color=") >= 0 && R.indexOf("rainbowP") >= 0) ? 1 : 0;})());
console.log("rwOv: " + (function(){var R=js.slice(js.indexOf("function rwRV"), js.indexOf("// wxGUI")); return (R.indexOf("halfW - cpxO * OV") >= 0 && R.indexOf("transformOrigin") >= 0 && R.indexOf("scale(") >= 0) ? 1 : 0;})());
console.log("rwOz: " + (function(){var R=js.slice(js.indexOf("function rwRV"), js.indexOf("// wxGUI")); return (R.indexOf("const OZ = Math.min(rvZoom, rvRBK ? 10 : 7)") >= 0 && R.indexOf(", 3), 13)") >= 0 && R.indexOf("lz >= 3 && lz <= 13") >= 0 && R.indexOf("Number(a.zoom)) || 7, 3), 13)") >= 0) ? 1 : 0;})());
console.log("rwBs: " + (function(){var R=js.slice(js.indexOf("function rwRV"), js.indexOf("// wxGUI")); return (R.indexOf("const SS = Math.min(2") >= 0 && R.indexOf("const BZ = rvZoom + SS") >= 0 && R.indexOf("+ BZ +") >= 0 && R.indexOf("+ btS +") >= 0) ? 1 : 0;})());
console.log("rwHome: " + (function(){var R=js.slice(js.indexOf("function rwRV"), js.indexOf("// wxGUI")); return (R.indexOf("@keyframes rwPulse") >= 0 && R.indexOf("#ff2bd6") >= 0 && R.indexOf("radial-gradient") >= 0 && R.indexOf("HOME") >= 0 && R.indexOf("left: halfW") >= 0 && R.indexOf("#ef4444") < 0) ? 1 : 0;})());
console.log("wmInWxCardOld: " + (function(){var S=js.slice(js.indexOf("function wxGUI"), js.indexOf("function wsWS({")); return S.includes("n.jsx(wm");})());
console.log("wgXSceneCount: " + (js.match(/wgXScene/g) || []).length);
console.log("centerCfgGone: " + ((js.match(/center: !0/g) || []).length === 0));
console.log("wsCases: " + (js.match(/case"ws_/g) || []).length);
console.log("wsTile: " + (js.match(/function wsTile/g) || []).length);
console.log("hurricane: " + js.includes("hurricane"));
' 2>&1
echo '== http =='
curl -s -o /dev/null -w "home.HTTP %{http_code}\n" http://127.0.0.1:3000/
V=$(grep -o 'index-[A-Za-z0-9_-]*\.js?v=[a-z0-9]*' /opt/calendarly/client/dist/index.html | sed 's/.*?v=//')
N=$(grep -o 'assets/index-[A-Za-z0-9_-]*\.js' /opt/calendarly/client/dist/index.html | head -1)
curl -s -o /dev/null -w "bundle-$V.HTTP %{http_code}\n" "http://127.0.0.1:3000/$N?v=$V"
curl -s -o /dev/null -w "display17.HTTP %{http_code}\n" http://127.0.0.1:3000/display/17
curl -s -o /dev/null -w "wxgui-preview.HTTP %{http_code}\n" http://127.0.0.1:3000/display/wxgui-preview
curl -s -o /dev/null -w "radar-test.HTTP %{http_code}\n" http://127.0.0.1:3000/display/radar-test
curl -s -o /dev/null -w "radar-api.HTTP %{http_code}\n" "http://127.0.0.1:3000/api/weather/radar?zip=32757"
echo '== lightdm (kiosk) =='
systemctl is-active lightdm

