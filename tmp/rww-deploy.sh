#!/bin/bash
# rww-deploy: strips CRs, applies radar-widget patcher then wxgui patcher, creates screen+display, checks
echo '== CR strip =='
for f in wxgui-component.js rw-windy-comp.js rw-rainview-comp.js fdw-apply-radar-widgets.cjs fdw-apply-wxgui.cjs rww-run.cjs; do
  [ -f /tmp/$f ] && sed -i 's/\r$//' /tmp/$f && echo "stripped $f"
done
echo '== radar widgets patcher =='
echo bedard13 | sudo -S node /tmp/fdw-apply-radar-widgets.cjs || { echo PATCH_RADAR_FAILED; exit 1; }
echo '== wxgui patcher =='
echo bedard13 | sudo -S node /tmp/fdw-apply-wxgui.cjs || { echo PATCH_WXGUI_FAILED; exit 1; }
echo '== db screen/display =='
echo bedard13 | sudo -S node /tmp/rww-run.cjs || { echo DB_FAILED; exit 1; }
echo '== checks =='
systemctl is-active lightdm || true
curl -s -o /dev/null -w 'home %{http_code}\n' http://127.0.0.1:3000/
curl -s -o /dev/null -w 'radar-test %{http_code}\n' 'http://127.0.0.1:3000/display/radar-test'
curl -s -o /dev/null -w 'wxgui-preview %{http_code}\n' 'http://127.0.0.1:3000/display/wxgui-preview'
grep -o 'index-[^"]*js?v=[a-z0-9]*' /opt/calendarly/client/dist/index.html
echo RWW_DEPLOY_DONE
