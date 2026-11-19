#!/bin/bash
sleep 8
curl -s -o /dev/null -w "bundle.HTTP %{http_code} bytes=%{size_download}\n" "http://127.0.0.1:3000/assets/index-BDiodzvu.js?v=ws4"
curl -s -o /dev/null -w "display17.HTTP %{http_code}\n" "http://127.0.0.1:3000/display/17"
systemctl is-active lightdm
pgrep -fc chromium
curl -s http://127.0.0.1:3000/api/weather | head -c 260; echo
echo bedard13 | sudo -S journalctl --since "2 minutes ago" -n 6 --no-pager 2>/dev/null | grep -iE "chromium|lightdm|error" | tail -5
