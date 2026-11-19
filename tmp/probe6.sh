#!/bin/bash
# probe6b: WEB-format data extra via device-side single quoting
cd /home/flayva/tmp
J='{"amount_money":{"amount":"100","currency_code":"USD"},"callback_url":"http://10.42.0.1:5005/api/payments/square-pos/callback?oid=tok=1","version":"v1.3","client_id":"sq0idp-QFHVBaVQVe92_dkdvkJu4w","state":"p01","note":"ProbeWeb"}'
echo "JSON: $J" > probe6.log
adb -s 10.42.0.153:5555 shell "am start -n com.squareup/.ui.ApiActivity --es data '$J'" >> probe6.log 2>&1
sleep 5
adb -s 10.42.0.153:5555 shell screencap -p /sdcard/web3.png >> probe6.log 2>&1
adb -s 10.42.0.153:5555 pull /sdcard/web3.png web3.png >> probe6.log 2>&1
echo DONE >> probe6.log
