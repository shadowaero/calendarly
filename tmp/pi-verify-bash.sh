#!/bin/bash
# headless chromium check of the wxgui radar card at zoom 11 (runs as xxtoon on the Pi)
rm -rf /tmp/wg8
mkdir -p /tmp/wg8
CHROME_ARGS='--headless --no-sandbox --disable-gpu --use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --disable-gpu-sandbox --hide-scrollbars --window-size=1920,1080 --virtual-time-budget=60000'
env HOME=/tmp/wg8 /usr/bin/chromium $CHROME_ARGS --dump-dom 'http://127.0.0.1:3000/display/wxgui-preview?r=7' > /tmp/wg8/dom.html 2>/tmp/wg8/dom.log
echo '--- served version in dom (expect ws6z) ---'
grep -o 'index-[^"?]*\.js?v=[a-z0-9]*' /tmp/wg8/dom.html | head -2
echo '--- OSM base tiles at zoom 11 (bs layer z10-13) ---'
grep -o 'tile.openstreetmap.org/1[0-3]/[0-9]*/[0-9]*' /tmp/wg8/dom.html | head -3
echo -n '--- scale(16) overlay hits at zoom 11 (expect >=1): '
grep -c 'transform: scale(16)' /tmp/wg8/dom.html
echo -n '--- HOME beacon: '
grep -o '>HOME<' /tmp/wg8/dom.html | head -1
echo -n '--- magenta beacon color hits: '
grep -c '#ff2bd6' /tmp/wg8/dom.html
echo -n '--- OPEN-METEO label: '
grep -o 'OPEN-METEO' /tmp/wg8/dom.html | head -1
env HOME=/tmp/wg8 /usr/bin/chromium $CHROME_ARGS --screenshot=/tmp/wg8/wx11.png 'http://127.0.0.1:3000/display/wxgui-preview?r=8' >/tmp/wg8/shot.log 2>&1
ls -la /tmp/wg8/wx11.png
echo BASHVERIFY_DONE