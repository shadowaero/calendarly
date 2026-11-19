#!/bin/bash
# probe11: after callback registered on Flayvathymme-menu-app (Ju4w)
# docs-correct tender values + per-probe callback with oid/tok
cd /home/flayva/tmp
CB='http://10.42.0.1:5005/api/payments/square-pos/callback?oid=p11&tok=p11'
echo "CB: $CB" > probe11.log
adb -s 10.42.0.153:5555 logcat -c >> probe11.log 2>&1
adb -s 10.42.0.153:5555 shell "am start -n com.squareup/.ui.ApiActivity -a com.squareup.pos.action.CHARGE --es com.squareup.pos.API_VERSION v2.0 --es com.squareup.pos.CLIENT_ID sq0idp-QFHVBaVQVe92_dkdvkJu4w --el com.squareup.pos.TOTAL_AMOUNT_LONG 100 --es com.squareup.pos.CURRENCY_CODE USD --esa com.squareup.pos.TENDER_TYPES com.squareup.pos.TENDER_CARD,com.squareup.pos.TENDER_CASH --es com.squareup.pos.CLIENT_TRANSACTION_ID probe11tx --es com.squareup.pos.NOTE Tap-to-Pay-Test --es com.squareup.pos.WEB_CALLBACK_URI '$CB' --es com.android.browser.application_id com.android.browser" >> probe11.log 2>&1
sleep 8
adb -s 10.42.0.153:5555 shell screencap -p /sdcard/p11.png >> probe11.log 2>&1
adb -s 10.42.0.153:5555 pull /sdcard/p11.png p11.png >> probe11.log 2>&1
echo DONE >> probe11.log
