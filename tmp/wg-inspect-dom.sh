#!/bin/bash
echo bedard13 | sudo -S rm -rf /tmp/rww-inspect /tmp/chromeprof8 2>&1 | grep -v Warning
echo bedard13 | sudo -S mkdir -p /tmp/rww-inspect /tmp/chromeprof8 2>&1 | grep -v Warning
echo bedard13 | sudo -S chmod 777 /tmp/rww-inspect /tmp/chromeprof8 2>&1 | grep -v Warning
echo bedard13 | sudo -S bash -c 'env HOME=/tmp/chromeprof8 /usr/bin/chromium --headless --no-sandbox --disable-gpu --use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --disable-gpu-sandbox --hide-scrollbars --window-size=1920,1080 --virtual-time-budget=60000 --dump-dom "http://127.0.0.1:3000/display/wxgui-preview?r='$RANDOM'" >/tmp/rww-inspect/dom.html 2>/tmp/rww-inspect/chrome.log' 2>&1 | grep -v Warning | grep -v Permission || echo "dump FAILED"
echo bedard13 | sudo -S chown xxtoon:xxtoon /tmp/rww-inspect/dom.html 2>/dev/null
echo '--- radar api lat/lon (retry) ---'
curl -s "http://127.0.0.1:3000/api/weather/radar?zip=32757" | head -c 300
echo ''
echo '--- wm mosaic transform (expect translate(...) scale(5) + origin) ---'
grep -o 'style="[^"]*scale(5)[^"]*"' /tmp/rww-inspect/dom.html | head -4
echo '--- wm box size ---'
grep -o 'style="width: [0-9.]*px; height: [0-9.]*px; background[^"]*"' /tmp/rww-inspect/dom.html | head -4
echo '--- served version in dom ---'
grep -o 'index-[^"?]*\.js?v=[a-z0-9]*' /tmp/rww-inspect/dom.html | head -2
ls -la /tmp/rww-inspect
echo INSPECT_DONE

