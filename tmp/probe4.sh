#!/bin/bash
# probe4.sh — web-format request variants via ApiActivity
D=10.42.0.153:5555
CID=sq0idp-QFHVBaVQVe92_dkdvkJu4w
CBURL=http://10.42.0.1:5005/api/payments/square-pos/callback?oid=ord_1794682501256_9g1jyv&tok=psqmwgrmglklkvv2in7
# NOTE: & inside a single-quoted assignment below, so define CB properly:
CB=http%3A%2F%2F10.42.0.1%3A5005%2Fapi%2Fpayments%2Fsquare-pos%2Fcallback%3Foid%3Dord_1794682501256_9g1jyv%26tok%3Dpsqmwgrmglklkvv2in7
T=/data/local/tmp
O=/home/flayva/tmp
cd $O || exit 1

shot() { adb -s $D shell screencap -p $T/$1.png; adb -s $D pull $T/$1.png $O/$1.png >/dev/null 2>&1; }

warmup() {
  adb -s $D shell input keyevent 4
  adb -s $D shell am force-stop com.squareup
  sleep 2
  adb -s $D shell monkey -p com.squareup -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1
  sleep 14
}

# w1: API_VERSION as STRING 1.3 + modern keys
warmup
adb -s $D logcat -c
adb -s $D shell am start -n com.squareup/.ui.ApiActivity -a com.squareup.pos.action.CHARGE \
  --es com.squareup.pos.API_VERSION 1.3 \
  --el com.squareup.pos.TOTAL_AMOUNT_LONG 109 \
  --es com.squareup.pos.CURRENCY_CODE USD \
  --es com.squareup.pos.CLIENT_ID $CID \
  --es com.squareup.pos.TENDER_TYPES CARD_PRESENT \
  --es com.squareup.pos.WEB_CALLBACK_URI $CB \
  --es com.squareup.pos.CLIENT_TRANSACTION_ID w1 \
  --es com.squareup.pos.NOTE Order116-Flayva >/dev/null 2>&1
sleep 2;   shot w1a
sleep 1.5; shot w1b
sleep 1.5; shot w1c
sleep 1.5; shot w1d
adb -s $D logcat -d > $O/w1.log 2>/dev/null

# w2: raw legacy web JSON in data extra
warmup
adb -s $D logcat -c
DATAJSON='{"amount_money":{"amount":109,"currency_code":"USD"},"callback_url":"http://10.42.0.1:5005/api/payments/square-pos/callback?oid=ord_1794682501256_9g1jyv&tok=psqmwgrmglklkvv2in7","version":"1.3","client_id":"sq0idp-QFHVBaVQVe92_dkdvkJu4w"}'
adb -s $D shell am start -n com.squareup/.ui.ApiActivity -a com.squareup.pos.action.CHARGE \
  --es data "$DATAJSON" >/dev/null 2>&1
sleep 2;   shot w2a
sleep 1.5; shot w2b
sleep 1.5; shot w2c
sleep 1.5; shot w2d
adb -s $D logcat -d > $O/w2.log 2>/dev/null

# w3: data extra + API_VERSION string
warmup
adb -s $D logcat -c
adb -s $D shell am start -n com.squareup/.ui.ApiActivity -a com.squareup.pos.action.CHARGE \
  --es com.squareup.pos.API_VERSION 1.3 \
  --es data "$DATAJSON" >/dev/null 2>&1
sleep 2;   shot w3a
sleep 1.5; shot w3b
sleep 1.5; shot w3c
sleep 1.5; shot w3d
adb -s $D logcat -d > $O/w3.log 2>/dev/null

adb -s $D shell am force-stop com.squareup
echo ===SIZES
ls -la $O/w1*.png $O/w2*.png $O/w3*.png
echo ===W1-REG
grep -F Square.Register $O/w1.log | tail -4
echo ===W2-REG
grep -F Square.Register $O/w2.log | tail -4
echo ===W3-REG
grep -F Square.Register $O/w3.log | tail -4
echo PROBE4-DONE
