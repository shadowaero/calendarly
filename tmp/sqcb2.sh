export XDG_RUNTIME_DIR=/run/user/1000
echo '== probe user journal (generic) =='
journalctl --user --no-pager -n 5 2>&1 | tail -3
echo '== system journal for user unit =='
journalctl _SYSTEMD_USER_UNIT=flayva-thymme.service --no-pager -n 10 2>&1 | tail -8
echo '== log files around app dir =='
ls -la /home/flayva/flayva-thymme/server/*.log /home/flayva/*.log /tmp/flayva*.log 2>/dev/null | head -8
echo '== done =='
