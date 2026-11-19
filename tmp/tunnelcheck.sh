echo '== cloudflared processes =='
pgrep -af cloudflared || echo 'NOT RUNNING'
echo '== cloudflared services (system + user) =='
systemctl list-units --all 2>/dev/null | grep -iE 'cloudflar|tunnel' | head -5
systemctl --user list-units --all 2>/dev/null | grep -iE 'cloudflar|tunnel' | head -5
echo '== cloudflared config dir =='
ls -la /home/flayva/.cloudflared/ 2>/dev/null | head -8
ls -la /etc/cloudflared/ 2>/dev/null | head -8
echo '== server redirect/callback url config =='
grep -n 'trycloudflare' /home/flayva/flayva-thymme/server/index.js | head -6
grep -rn 'trycloudflare\|redirectUri\|redirect_uri\|callbackBase\|publicBase' /home/flayva/flayva-thymme/data/ 2>/dev/null | head -8
grep -n 'redirect' /home/flayva/flayva-thymme/server/index.js | head -12
echo '== done =='
