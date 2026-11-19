#!/bin/bash
# rww-shots5: two-pass shot — pass 1 warms the profile's HTTP cache, pass 2 captures warm.
# Both passes share /tmp/chromeprof so tiles fetched (slowly) in pass 1 paint instantly in pass 2.
CHROME_ARGS='--headless --no-sandbox --disable-gpu --use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --disable-gpu-sandbox --hide-scrollbars --window-size=1920,1080 --virtual-time-budget=60000'
echo bedard13 | sudo -S rm -rf /tmp/rww-shots /tmp/chromeprof
mkdir -p /tmp/rww-shots /tmp/chromeprof
for i in 1 2; do
  echo bedard13 | sudo -S env HOME=/tmp/chromeprof /usr/bin/chromium $CHROME_ARGS \
    --user-data-dir=/tmp/chromeprof/u-radar-test --screenshot=/tmp/rww-shots/radar-test-$i.png \
    "http://127.0.0.1:3000/display/radar-test" >/tmp/rww-shots/radar-test-$i.log 2>&1 || echo "snap $i FAILED"
done
echo bedard13 | sudo -S chown xxtoon:xxtoon /tmp/rww-shots/* 2>/dev/null
ls -la /tmp/rww-shots
echo RWW_SHOTS5_DONE
