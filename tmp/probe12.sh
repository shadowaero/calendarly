#!/bin/bash
# probe12: callback via Cloudflare quick tunnel (https, portal-registered)
cd /home/flayva/tmp
CB='https://assumed-king-connectors-exchanges.trycloudflare.com/api/payments/square-pos/callback?oid=p12&tok=p12'
echo "CB: $CB" > probe12.log
adb -s 10.42.0.153:5555 logcat -c >> probe12.log 2>&1
adb -s 10.42.0.153:5555 shell "am start -n com.squareup/.ui.ApiActivity -a com.squareup.pos.action.CHARGE --es com.squareup.pos.API_VERSION v2.0 --es com.squareup.pos.CLIENT_ID sq0idp-QFHVBaVQVe92_dkdvkJu4w --el com.squareup.pos.TOTAL_AMOUNT_LONG 100 --es com.squareup.pos.CURRENCY_CODE USD --esa com.squareup.pos.TENDER_TYPES com.squareup.pos.TENDER_CARD,com.squareup.pos.TENDER_CASH --es com.squareup.pos.CLIENT_TRANSACTION_ID probe12tx --es com.squareup.pos.NOTE Tap-to-Pay-Test --es com.squareup.pos.WEB_CALLBACK_URI '$CB' --es com.android.browser.application_id com.android.browser" >> probe12.log 2>&1
sleep 10
adb -s 10.42.0.153:5555 shell screencap -p /sdcard/p12.png >> probe12.log 2>&1
adb -s 10.42.0.153:5555 pull /sdcard/p12.png p12.png >> probe12.log 2>&1
echo DONE >> probe12.log
