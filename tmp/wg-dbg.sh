#!/bin/bash
sudo rm -rf /tmp/chromeprof9/u2
sudo bash -c 'env HOME=/tmp/chromeprof9 /usr/bin/chromium --headless --no-sandbox --disable-gpu --use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --enable-logging=stderr --v=0 --user-data-dir=/tmp/chromeprof9/u2 --virtual-time-budget=20000 --dump-dom "http://127.0.0.1:3000/display/wxgui-preview" >/dev/null 2>/tmp/wg-dbg.log'
sudo chmod 644 /tmp/wg-dbg.log
grep -iE 'console|error|failed' /tmp/wg-dbg.log | head -12
echo DBG_DONE
