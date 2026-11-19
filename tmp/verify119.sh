echo '== manual-verify #119 =='
curl -s -X POST http://localhost:5005/api/payments/square-pos/manual-verify -H 'Content-Type: application/json' -d '{"orderId":"ord_1794693307139_wnrqy5","via":"register-tender-reconcile"}'
echo
echo '== payment status #119 =='
curl -s http://localhost:5005/api/orders/ord_1794693307139_wnrqy5/payment-status
echo
echo '== relevant log lines =='
journalctl _SYSTEMD_USER_UNIT=flayva-thymme.service --no-pager -n 400 2>/dev/null | grep -E 'pos-manual|pos-callback|SQCB' | tail -8
echo '== done =='
