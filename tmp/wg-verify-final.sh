#!/bin/bash
echo '== final serve checks =='
curl -s http://127.0.0.1:3000/ | grep -o 'index-[^"]*js?v=[a-z0-9]*'
curl -s -o /dev/null -w "home.HTTP %{http_code}\n" http://127.0.0.1:3000/
curl -s -o /dev/null -w "bundle-ws6l.HTTP %{http_code}\n" "http://127.0.0.1:3000/assets/index-BDiodzvu.js?v=ws6l"
curl -s -o /dev/null -w "wxgui-preview.HTTP %{http_code}\n" http://127.0.0.1:3000/display/wxgui-preview
echo bedard13 | sudo -S node -e '
const fs = require("fs");
const js = fs.readFileSync("/opt/calendarly/client/dist/assets/index-BDiodzvu.js", "utf8");
console.log("indoor_count=" + (js.match(/Indoor sensor/g) || []).length);
console.log("chip_string_count=" + (js.match(/children: ?.Weather updated /g) || []).length);
console.log("decl_order_ok=" + (js.indexOf("const updChip") < js.indexOf("const heroCard")));
'  2>&1 | grep -v Warning
echo '== cleanup stale root-owned shot dirs =='
echo bedard13 | sudo -S rm -rf /tmp/rww-shots6 /tmp/chromeprof6 && echo 'stale dirs removed'
