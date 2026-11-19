#!/bin/bash
# rww-shots6: two-pass shot of the Weather GUI screen (?display/wxgui-preview)
# Pass 1 warms /tmp/chromeprof6 HTTP cache (OSM base + RainViewer storm tiles, slow),
# pass 2 captures warm — same technique as rww-shots5.
CHROME_ARGS='--headless --no-sandbox --disable-gpu --use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --disable-gpu-sandbox --hide-scrollbars --window-size=1920,1080 --virtual-time-budget=60000'
rm -rf /tmp/rww-shots7 /tmp/chromeprof7
mkdir -p /tmp/rww-shots7 /tmp/chromeprof7
for i in 1 2; do
  echo bedard13 | sudo -S env HOME=/tmp/chromeprof7 /usr/bin/chromium $CHROME_ARGS \
    --user-data-dir=/tmp/chromeprof7/u-wxgui --screenshot=/tmp/rww-shots7/wxgui-preview-$i.png \
    "http://127.0.0.1:3000/display/wxgui-preview" >/tmp/rww-shots7/wxgui-preview-$i.log 2>&1 || echo "snap $i FAILED"
done
chown xxtoon:xxtoon /tmp/rww-shots7/* 2>/dev/null
ls -la /tmp/rww-shots7
echo RWW_SHOTS7_DONE
