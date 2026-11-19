#!/bin/sh
# rww-wxzoom-verify: confirm ws6i wxgui comp has wm magnify:3 in the served bundle
cd /tmp
curl -s "http://127.0.0.1:3000/assets/index-BDiodzvu.js?v=ws6i" -o /tmp/b6i.js
wc -c /tmp/b6i.js
echo -n 'wm magnify marker : '
grep -o "label:'WEATHER RADAR',fontSize:20,magnify:3" /tmp/b6i.js || echo MISSING
echo -n 'magnify count     : '
grep -c magnify /tmp/b6i.js
echo -n 'served html ver   : '
curl -s http://127.0.0.1:3000/ | grep -o 'v=ws6i' | head -1
rm -f /tmp/b6i.js
