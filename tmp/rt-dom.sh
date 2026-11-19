#!/bin/bash
cap() {
  local out=$1 url=$2 dir=$3
  rm -rf "$dir"
  env HOME=/tmp/chromeprof9 /usr/bin/chromium --headless --no-sandbox --disable-gpu --use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --disable-gpu-sandbox --hide-scrollbars --window-size=1920,1080 --virtual-time-budget=60000 --user-data-dir="$dir" --dump-dom "$url" > "$out" 2>/dev/null
  return 0
}
cap /tmp/wg-shots8/rt-dom.html http://127.0.0.1:3000/display/radar-test /tmp/chromeprof9/rtA
cap /tmp/wg-shots8/d17-dom.html http://127.0.0.1:3000/display/17 /tmp/chromeprof9/rtB
chmod 644 /tmp/wg-shots8/rt-dom.html /tmp/wg-shots8/d17-dom.html 2>/dev/null
ls -la /tmp/wg-shots8/rt-dom.html /tmp/wg-shots8/d17-dom.html
for f in rt-dom d17-dom; do
  echo "== $f =="
  echo '--- osm zoom histogram ---'
  grep -oE 'tile.openstreetmap.org/[0-9]+' /tmp/wg-shots8/$f.html | sort | uniq -c | head -6
  echo '--- base tile background sizes ---'
  grep -oE 'background-size: [0-9]+px' /tmp/wg-shots8/$f.html | sort | uniq -c | head -4
  echo '--- scale wrappers ---'
  grep -oE 'transform: scale\([0-9]+\)' /tmp/wg-shots8/$f.html | sort | uniq -c | head -4
  echo '--- rainviewer sample ---'
  grep -oE 'tilecache.rainviewer[^&"]*' /tmp/wg-shots8/$f.html | head -2
done
echo DOM2_DONE