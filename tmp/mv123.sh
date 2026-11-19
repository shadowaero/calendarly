echo '== manual-verify order 123 =='
curl -s -X POST http://localhost:5005/api/payments/square-pos/manual-verify -H 'Content-Type: application/json' -d '{"orderId":"ord_1794762183487_m1qjrl","via":"square-payments-api y2TKculjC9nmjrXsUjhJ1zLVfjKZY"}'
echo
echo '== status =='
curl -s http://localhost:5005/api/orders/ord_1794762183487_m1qjrl/payment-status
echo
echo '== adb state =='
adb devices 2>/dev/null | tail -3
adb -s 10.42.0.153:5555 shell dumpsys window 2>/dev/null | grep mCurrentFocus
echo '== done =='
