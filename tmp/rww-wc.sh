#!/bin/sh
# rww-wc: byte size of deployed bundle + html stamp
wc -c /opt/calendarly/client/dist/assets/index-BDiodzvu.js /opt/calendarly/client/dist/index.html
md5sum /opt/calendarly/client/dist/assets/index-BDiodzvu.js
curl -s "http://127.0.0.1:3000/assets/index-BDiodzvu.js" -o /tmp/bx.js
md5sum /tmp/bx.js; wc -c /tmp/bx.js; rm -f /tmp/bx.js
