#!/bin/bash
sudo rm -rf /tmp/chromeprof9/u4
sudo bash -c 'env HOME=/tmp/chromeprof9 /usr/bin/chromium --headless --no-sandbox --disable-gpu --use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --disable-gpu-sandbox --hide-scrollbars --window-size=1920,1080 --virtual-time-budget=60000 --user-data-dir=/tmp/chromeprof9/u4 --screenshot=/tmp/wg-shots8/manual.png "http://127.0.0.1:3000/display/wxgui-preview" 2>&1 | tail -6'
sudo chmod 644 /tmp/wg-shots8/manual.png 2>/dev/null
ls -la /tmp/wg-shots8/manual.png
echo MANUAL_DONE
