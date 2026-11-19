#!/bin/bash
# probe14: callback exact (no query) + v2.0 tender values CARD,CASH
cd /home/flayva/tmp
CB='https://assumed-king-connectors-exchanges.trycloudflare.com/api/payments/square-pos/callback'
echo "CB: $CB" > probe14.log
adb -s 10.42.0.153:5555 logcat -c >> probe14.log 2>&1
adb -s 10.42.0.153:5555 shell "am start -n com.squareup/.ui.ApiActivity -a com.squareup.pos.action.CHARGE --es com.squareup.pos.API_VERSION v2.0 --es com.squareup.pos.CLIENT_ID sq0idp-QFHVBaVQVe92_dkdvkJu4w --el com.squareup.pos.TOTAL_AMOUNT_LONG 100 --es com.squareup.pos.CURRENCY_CODE USD --esa com.squareup.pos.TENDER_TYPES CARD,CASH --es com.squareup.pos.CLIENT_TRANSACTION_ID probe14tx --es com.squareup.pos.NOTE Tap-to-Pay-Test --es com.squareup.pos.WEB_CALLBACK_URI '$CB' --es com.android.browser.application_id com.android.browser" >> probe14.log 2>&1
sleep 12
adb -s 10.42.0.153:5555 shell screencap -p /sdcard/p14.png >> probe14.log 2>&1
adb -s 10.42.0.153:5555 pull /sdcard/p14.png p14.png >> probe14.log 2>&1
echo DONE >> probe14.log
