#!/bin/bash
echo bedard13 | sudo -S node --experimental-vm-modules -e '
const vm = require("vm");
const fs = require("fs");
const js = fs.readFileSync("/opt/calendarly/client/dist/assets/index-BDiodzvu.js", "utf8");
new vm.SourceTextModule(js);
console.log("FULL_BUNDLE_PARSE_OK bytes=" + js.length);
const html = fs.readFileSync("/opt/calendarly/client/dist/index.html", "utf8");
const m = html.match(/src="(\/assets\/index-[^"?]+\.js)(\?v=[^"]+)?"/);
console.log("HTML_MARKER " + (m ? m[0] : "MISSING"));
console.log("has WX_SVG: " + js.includes("const WX_SVG"));
console.log("has thunderstorms-night svg: " + js.includes("thunderstorms-night"));
console.log("has wsCss keys: " + js.includes("@keyframes wsDrift"));
console.log("case count ws_: " + (js.match(/case"ws_/g) || []).length);
console.log("wsTile count: " + (js.match(/function wsTile/g) || []).length);
' 2>&1
curl -s -o /dev/null -w "home.HTTP %{http_code}\n" http://127.0.0.1:3000/
curl -s "http://127.0.0.1:3000/api/sensors" | head -c 300; echo
curl -s "http://127.0.0.1:3000/display/17" -o /dev/null -w "display17.HTTP %{http_code}\n"
