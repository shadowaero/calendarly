echo '== callback handler body =='
sed -n '2480,2565p' /home/flayva/flayva-thymme/server/index.js
echo '== journal around 12:04:53 =='
journalctl _SYSTEMD_USER_UNIT=flayva-thymme.service --no-pager --since '2026-11-15 12:04:40' --until '2026-11-15 12:05:30' 2>/dev/null | tail -30
echo '== done =='
