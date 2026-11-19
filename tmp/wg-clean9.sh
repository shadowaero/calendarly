#!/bin/bash
echo -n 'wxgui patcher: '; grep -c "jsVer = 'ws6n'" /tmp/fdw-apply-wxgui.cjs
echo -n 'radar patcher: '; grep -c "jsVer = 'ws6n'" /tmp/fdw-apply-radar-widgets.cjs
echo -n 'comp center cfg: '; grep -c 'center: !0' /tmp/wxgui-component.js
echo VERIFYCHAIN_DONE

echo 'cleanup done'
echo '=== FINAL STATE ==='
echo -n 'served html: '; echo bedard13 | sudo -S grep -o 'v=ws6n' /opt/calendarly/client/dist/index.html 2>/dev/null | head -1
echo -n 'pi patchers: '; grep -o "jsVer = 'ws6n'" /tmp/fdw-apply-wxgui.cjs /tmp/fdw-apply-radar-widgets.cjs | tr '\n' ' '; echo ''
echo -n 'pi comp center=:!0 count: '; grep -c 'center: !0' /tmp/wxgui-component.js
echo -n 'lightdm: '; echo bedard13 | sudo -S systemctl is-active lightdm | head -1
echo CLEAN_DONE
