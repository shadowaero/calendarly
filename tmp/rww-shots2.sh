#!/bin/bash
# rww-shots2: longer virtual time + stderr net log
rm -rf /tmp/rww-shots /tmp/chromeprof
mkdir -p /tmp/rww-shots /tmp/chromeprof
shot() {
  echo bedard13 | sudo -S env HOME=/tmp/chromeprof /usr/bin/chromium --headless --no-sandbox --disable-gpu \
    --hide-scrollbars --window-size=1920,1080 --virtual-time-budget=30000 \
    --user-data-dir=/tmp/chromeprof/u-$1 --screenshot=/tmp/rww-shots/$1.png \
    --enable-logging=stderr --v=0 \
    "http://127.0.0.1:3000/display/$1" >/tmp/rww-shots/$1.log 2>&1 || echo "snap $1 FAILED"
  grep -iE 'net::|ERR_|CONSOLE' /tmp/rww-shots/$1.log | head -8 || echo "no net errors in $1.log"
}
shot radar-test
shot wxgui-preview
echo bedard13 | sudo -S chown xxtoon:xxtoon /tmp/rww-shots/*.png 2>/dev/null
ls -la /tmp/rww-shots
echo RWW_SHOTS2_DONE
