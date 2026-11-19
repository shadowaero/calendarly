#!/bin/bash
# probe10: correct extra types (--esa tenders, --el amount)
cd /home/flayva/tmp
CB='http://10.42.0.1:5005/api/payments/square-pos/callback'
echo "CB: $CB" > probe10.log
adb -s 10.42.0.153:5555 logcat -c >> probe10.log 2>&1
adb -s 10.42.0.153:5555 shell "am start -n com.squareup/.ui.ApiActivity -a com.squareup.pos.action.CHARGE --es com.squareup.pos.API_VERSION v2.0 --es com.squareup.pos.CLIENT_ID sq0idp-QFHVBaVQVe92_dkdvkJu4w --el com.squareup.pos.TOTAL_AMOUNT_LONG 100 --es com.squareup.pos.CURRENCY_CODE USD --esa com.squareup.pos.TENDER_TYPES CARD --es com.squareup.pos.CLIENT_TRANSACTION_ID probe10tx --es com.squareup.pos.NOTE Probe10 --es com.squareup.pos.WEB_CALLBACK_URI '$CB' --es com.android.browser.application_id com.android.browser" >> probe10.log 2>&1
sleep 6
adb -s 10.42.0.153:5555 shell screencap -p /sdcard/p10.png >> probe10.log 2>&1
adb -s 10.42.0.153:5555 pull /sdcard/p10.png p10.png >> probe10.log 2>&1
echo DONE >> probe10.log
