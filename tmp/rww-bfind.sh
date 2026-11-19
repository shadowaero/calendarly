#!/bin/sh
# rww-bfind: locate the deployed dist bundle path + check wm call site
grep -n 'readFileSync\|dist/\|assets' /tmp/verify-wxgui6.sh | grep -v curl | head -8
echo '--- wm call sites in served bundle ---'
curl -s "http://127.0.0.1:3000/assets/index-BDiodzvu.js?v=ws6i" -o /tmp/b6i.js
grep -o 'WEATHER RADAR.\{0,140\}' /tmp/b6i.js
echo '--- magnify contexts ---'
grep -o '.\{60\}magnify.\{0,60\}' /tmp/b6i.js
rm -f /tmp/b6i.js
