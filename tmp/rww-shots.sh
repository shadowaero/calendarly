#!/bin/bash
# rww-shots: headless chromium screenshots of the two preview displays
rm -rf /tmp/rww-shots /tmp/chromeprof
mkdir -p /tmp/rww-shots /tmp/chromeprof
shot() {
  echo bedard13 | sudo -S env HOME=/tmp/chromeprof /usr/bin/chromium --headless --no-sandbox --disable-gpu \
    --hide-scrollbars --window-size=1920,1080 --virtual-time-budget=15000 \
    --user-data-dir=/tmp/chromeprof/u-$1 --screenshot=/tmp/rww-shots/$1.png \
    "http://127.0.0.1:3000/display/$1" >/dev/null 2>&1 || echo "snap $1 FAILED"
}
shot radar-test
shot wxgui-preview
echo bedard13 | sudo -S chown xxtoon:xxtoon /tmp/rww-shots/*.png 2>/dev/null
ls -la /tmp/rww-shots
echo RWW_SHOTS_DONE
