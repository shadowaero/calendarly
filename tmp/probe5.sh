#!/bin/bash
# probe5.sh — API_VERSION as major.minor strings 1.1..1.8
D=10.42.0.153:5555
CID=sq0idp-QFHVBaVQVe92_dkdvkJu4w
CB=http%3A%2F%2F10.42.0.1%3A5005%2Fapi%2Fpayments%2Fsquare-pos%2Fcallback%3Foid%3Dord_1794682501256_9g1jyv%26tok%3Dpsqmwgrmglklkvv2in7
T=/data/local/tmp
O=/home/flayva/tmp
cd $O || exit 1
shot() { adb -s $D shell screencap -p $T/$1.png; adb -s $D pull $T/$1.png $O/$1.png >/dev/null 2>&1; }
for VS in 1.1 1.2 1.4 1.5 1.6 1.7 1.8; do
  TAG=$(echo $VS | tr -d .)
  echo ===V$VS
  adb -s $D shell am force-stop com.squareup
  sleep 2
  adb -s $D shell monkey -p com.squareup -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1
  sleep 14
  adb -s $D logcat -c
  adb -s $D shell am start -n com.squareup/.ui.ApiActivity -a com.squareup.pos.action.CHARGE \
    --es com.squareup.pos.API_VERSION $VS \
    --el com.squareup.pos.TOTAL_AMOUNT_LONG 109 \
    --es com.squareup.pos.CURRENCY_CODE USD \
    --es com.squareup.pos.CLIENT_ID $CID \
    --es com.squareup.pos.TENDER_TYPES CARD_PRESENT \
    --es com.squareup.pos.WEB_CALLBACK_URI $CB \
    --es com.squareup.pos.CLIENT_TRANSACTION_ID m$TAG \
    --es com.squareup.pos.NOTE Order116-Flayva >/dev/null 2>&1
  sleep 5
  shot m$TAG
  adb -s $D logcat -d > $O/m$TAG.log 2>/dev/null
  grep -F Square.Register $O/m$TAG.log | tail -3
done
echo ===SIZES
ls -la $O/m1*.png
echo PROBE5-DONE
