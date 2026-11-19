#!/bin/bash
# probe8: native CHARGE + WEB_CALLBACK_URI extra = web request via adb shell
cd /home/flayva/tmp
CB='http://10.42.0.1:5005/api/payments/square-pos/callback?oid=p8&tok=p8'
echo "CB: $CB" > probe8.log
adb -s 10.42.0.153:5555 shell "am start -n com.squareup/.ui.ApiActivity -a com.squareup.pos.action.CHARGE --es com.squareup.pos.API_VERSION v2.0 --es com.squareup.pos.CLIENT_ID sq0idp-QFHVBaVQVe92_dkdvkJu4w --ei com.squareup.pos.TOTAL_AMOUNT_LONG 100 --es com.squareup.pos.CURRENCY_CODE USD --es com.squareup.pos.TENDER_TYPES CARD --es com.squareup.pos.CLIENT_TRANSACTION_ID probe8tx --es com.squareup.pos.NOTE Probe8 --es com.squareup.pos.WEB_CALLBACK_URI '$CB' --es com.android.browser.application_id com.android.browser" >> probe8.log 2>&1
sleep 6
adb -s 10.42.0.153:5555 shell screencap -p /sdcard/p8.png >> probe8.log 2>&1
adb -s 10.42.0.153:5555 pull /sdcard/p8.png p8.png >> probe8.log 2>&1
echo DONE >> probe8.log
