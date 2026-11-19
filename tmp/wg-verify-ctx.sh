#!/bin/bash
echo '== occurrence contexts =='
echo bedard13 | sudo -S node -e '
const fs = require("fs");
const js = fs.readFileSync("/opt/calendarly/client/dist/assets/index-BDiodzvu.js", "utf8");
const needle = "Weather updated ";
let i = -1, n = 0;
while ((i = js.indexOf(needle, i + 1)) >= 0) {
  n++;
  console.log("#" + n + " @" + i + ": ..." + js.slice(Math.max(0, i - 110), i + 90).replace(/\n/g, " ").replace(/\r/g, " ") + "...");
}
console.log("total=" + n);
console.log("updChip_total=" + (js.match(/updChip/g) || []).length);
'  2>&1 | grep -v Warning
