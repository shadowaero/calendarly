#!/bin/bash
echo '== ws6k content markers =='
echo bedard13 | sudo -S node -e '
const fs = require("fs");
const html = fs.readFileSync("/opt/calendarly/client/dist/index.html", "utf8");
const m = html.match(/index-[^"]+\.js\?v=([a-z0-9]+)/);
console.log("served_ver=" + (m ? m[1] : "none"));
const js = fs.readFileSync("/opt/calendarly/client/dist/assets/index-BDiodzvu.js", "utf8");
console.log("updChip_count=" + (js.match(/Weather updated /g) || []).length);
console.log("indoor_count=" + (js.match(/Indoor sensor/g) || []).length);
console.log("chip_style=" + (js.match(/rgba\(9,18,34,\.4\)/g) || []).length);
console.log("chip_pos_rule=" + (js.match(/top: ?'1\.5cqh', right: ?'1\.9cqw'/g) || []).length);
'  2>&1 | grep -v Warning
