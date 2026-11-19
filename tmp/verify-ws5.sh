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
console.log("hurricane icon in map: " + js.includes("hurricane"));
console.log("icon-only hero: " + (js.includes("min(64cqw,58cqh)") ? "yes" : "NO"));
console.log("strip removed: " + (!js.includes("NEXT 6 HOURS") ? "yes" : "STILL PRESENT"));
console.log("chips removed: " + (!js.includes("Live \u00B7 local weather") ? "yes" : "STILL PRESENT"));
console.log("tropical override: " + (js.includes(">=39?") || js.includes("Number(cur.wind)>=39") || /Number\(cur\.wind\)\s*>=\s*39/.test(js) ? "yes" : "NO"));
console.log("case count ws_: " + (js.match(/case\"ws_/g) || []).length);
console.log("wsTile count: " + (js.match(/function wsTile/g) || []).length);
' 2>&1 | grep -v Warning
curl -s -o /dev/null -w "home.HTTP %{http_code}\n" http://127.0.0.1:3000/
curl -s -o /dev/null -w "bundle5.HTTP %{http_code}\n" "http://127.0.0.1:3000/assets/index-BDiodzvu.js?v=ws5"
curl -s "http://127.0.0.1:3000/display/17" -o /dev/null -w "display17.HTTP %{http_code}\n"
echo bedard13 | sudo -S systemctl restart lightdm && sleep 10 && systemctl is-active lightdm
