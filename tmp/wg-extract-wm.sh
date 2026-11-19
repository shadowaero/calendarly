#!/bin/bash
echo bedard13 | sudo -S node -e '
const fs = require("fs");
const js = fs.readFileSync("/opt/calendarly/client/dist/assets/index-BDiodzvu.js", "utf8");
const hits = [];
for (const pat of ["function wm(", "const wm", "var wm", "wm=({config", "wxguiZoom"]) {
  let i = js.indexOf(pat);
  while (i >= 0) { hits.push(pat + " @" + i); i = js.indexOf(pat, i + 1); }
}
console.log("HITS: " + hits.join(" | "));
const s = hits.find(h => h.startsWith("function wm("));
if (s) {
  const i = Number(s.split(" @")[1]);
  fs.writeFileSync("/tmp/wm-src.txt", js.slice(i, i + 14000));
  console.log("WROTE /tmp/wm-src.txt from " + i);
} else { console.log("NO function wm( — need other anchor"); }
'  2>&1 | grep -v Warning
echo '--- wm source ---'
head -c 14000 /tmp/wm-src.txt 2>/dev/null
