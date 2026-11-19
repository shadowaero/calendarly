#!/bin/bash
# rww-shots4: radar-test, REAL-TIME wait (--timeout, no virtual-time budget) so the
# RainViewer animation runs at real pace like the kiosk browser does.
echo bedard13 | sudo -S rm -rf /tmp/rww-shots /tmp/chromeprof
mkdir -p /tmp/rww-shots /tmp/chromeprof
echo bedard13 | sudo -S env HOME=/tmp/chromeprof /usr/bin/chromium --headless --no-sandbox --disable-gpu \
  --use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --disable-gpu-sandbox \
  --hide-scrollbars --window-size=1920,1080 --timeout=45000 \
  --user-data-dir=/tmp/chromeprof/u-radar-test --screenshot=/tmp/rww-shots/radar-test.png \
  "http://127.0.0.1:3000/display/radar-test" >/tmp/rww-shots/radar-test.log 2>&1 || echo "snap FAILED"
grep -icE 'webgl context creation error|crashed' /tmp/rww-shots/radar-test.log || echo 'no webgl errors'
echo bedard13 | sudo -S chown xxtoon:xxtoon /tmp/rww-shots/* 2>/dev/null
ls -la /tmp/rww-shots
echo RWW_SHOTS4_DONE
