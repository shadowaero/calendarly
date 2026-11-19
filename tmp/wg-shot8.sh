#!/bin/bash
sudo rm -rf /tmp/wg-shots8 /tmp/chromeprof9
sudo mkdir -p /tmp/wg-shots8 /tmp/chromeprof9
sudo chmod 777 /tmp/wg-shots8 /tmp/chromeprof9
CHROME_ARGS='--headless --no-sandbox --disable-gpu --use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --disable-gpu-sandbox --hide-scrollbars --window-size=1920,1080 --virtual-time-budget=60000'
R1=$RANDOM; R2=$RANDOM
sudo bash -c "env HOME=/tmp/chromeprof9 /usr/bin/chromium $CHROME_ARGS --user-data-dir=/tmp/chromeprof9/u1 --screenshot=/tmp/wg-shots8/wxgui-1.png 'http://127.0.0.1:3000/display/wxgui-preview?r=$R1' >/tmp/wg-shots8/1.log 2>&1"
sudo bash -c "env HOME=/tmp/chromeprof9 /usr/bin/chromium $CHROME_ARGS --user-data-dir=/tmp/chromeprof9/u1 --screenshot=/tmp/wg-shots8/wxgui-2.png 'http://127.0.0.1:3000/display/wxgui-preview?r=$R2' >/tmp/wg-shots8/2.log 2>&1"
sudo chown xxtoon:xxtoon /tmp/wg-shots8/* 2>/dev/null
ls -la /tmp/wg-shots8
R3=$RANDOM
sudo bash -c 'env HOME=/tmp/chromeprof9 /usr/bin/chromium --headless --no-sandbox --disable-gpu --use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --disable-gpu-sandbox --hide-scrollbars --window-size=1920,1080 --virtual-time-budget=60000 --dump-dom "http://127.0.0.1:3000/display/wxgui-preview?r='$R3'" >/tmp/wg-shots8/dom.html 2>/tmp/wg-shots8/dom.log'
sudo chmod 644 /tmp/wg-shots8/dom.html 2>/dev/null
echo '--- served version in dom (expect ws6z) ---'
grep -o 'index-[^"?]*\.js?v=[a-z0-9]*' /tmp/wg-shots8/dom.html | head -2
echo '--- HOME beacon at center (expect rwPulse + magenta #ff2bd6 + centered wrapper + HOME chip) ---'
grep -o 'left: 50%; top: 50%[^"]*' /tmp/wg-shots8/dom.html | head -2
grep -o '@keyframes rwPulse{[^}]*}' /tmp/wg-shots8/dom.html | head -2
grep -c '#ff2bd6' /tmp/wg-shots8/dom.html
grep -o '>HOME<' /tmp/wg-shots8/dom.html | head -2
echo '--- weather source label next to sun arc ---'
grep -o 'OPEN-METEO' /tmp/wg-shots8/dom.html | head -2
echo '--- OSM base tiles at zoom 11 (bs layer z10-13) ---'
grep -o 'tile.openstreetmap.org/1[0-3]/[0-9]*/[0-9]*' /tmp/wg-shots8/dom.html | head -3
echo '--- rainviewer radar tile urls ---'
grep -o 'tilecache.rainviewer[^"]*' /tmp/wg-shots8/dom.html | head -2
echo '--- rvXF overlay wrapper in rendered dom (expect >=1 scale(16) hits at zoom 11) ---'
grep -c 'transform: scale(16)' /tmp/wg-shots8/dom.html
grep -o 'transform-origin: [^;"]*' /tmp/wg-shots8/dom.html | sort | uniq -c
echo '--- animated scene node animation styles (normalized: name last) ---'
grep -o 'animation:[^;"]*' /tmp/wg-shots8/dom.html | grep wgX | head -6
grep -o 'wgX[A-Za-z]*' /tmp/wg-shots8/dom.html | sort | uniq -c
echo SHOT8_DONE
