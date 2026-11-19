echo '== replay verified callback =='
curl -s --max-time 25 'http://localhost:5005/api/payments/square-pos/callback?com.squareup.pos.CLIENT_TRANSACTION_ID=e2230b2f-0ec1-4fb4-8f7f-97a13c2dbc76&com.squareup.pos.SERVER_TRANSACTION_ID=YqlcUfPAicxKfOmds4SERFPi2mOZY' | head -c 300
echo
echo '== order status =='
curl -s http://localhost:5005/api/orders/ord_1794762183487_m1qjrl/payment-status
echo
echo '== logs =='
journalctl _SYSTEMD_USER_UNIT=flayva-thymme.service --no-pager -n 120 2>/dev/null | grep -E 'pos-callback|pos-manual' | tail -4
sleep 2
echo '== tablet foreground =='
adb -s 10.42.0.153:5555 shell dumpsys window 2>/dev/null | grep mCurrentFocus
echo '== done =='
