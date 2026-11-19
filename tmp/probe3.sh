#!/bin/bash
# probe3.sh — test API versions 8-11 with warm-start pattern
D=10.42.0.153:5555
CID=sq0idp-QFHVBaVQVe92_dkdvkJu4w
CB=http%3A%2F%2F10.42.0.1%3A5005%2Fapi%2Fpayments%2Fsquare-pos%2Fcallback%3Foid%3Dord_1794682501256_9g1jyv%26tok%3Dpsqmwgrmglklkvv2in7
T=/data/local/tmp
O=/home/flayva/tmp
cd $O || exit 1

fire() {
  # $1 = version, $2 = tag
  adb -s $D shell am start -n com.squareup/.ui.ApiActivity -a com.squareup.pos.action.CHARGE \
    --ei com.squareup.posAPI_VERSION_PLACEHOLDER 0 >/dev/null 2>&1
}

fire2() {
  adb -s $D shell am start -n com.squareup/.ui.ApiActivity -a com.squareup.pos.action.CHARGE \
    --ei com.squareup.pos.API_VERSION $1 \
    --el com.squareup.pos.TOTAL_AMOUNT_LONG 109 \
    --es com.squareup.pos.CURRENCY_CODE USD \
    --es com.squareup.pos.CLIENT_ID $CID \
    --es com.squareup.pos.TENDER_TYPES CARD_PRESENT \
    --es com.squareup.pos.WEB_CALLBACK_URI $CB \
    --es com.squareup.pos.CLIENT_TRANSACTION_ID $2 \
    --es com.squareup.pos.NOTE Order116-Flayva \
    --es com.squareup.pos.REQUEST_METADATA '{}' \
    --el com.squareup.pos.AUTO_RETURN_TIMEOUT_MS 20000 >/dev/null 2>&1
}

shot() { adb -s $D shell screencap -p $T/$1.png; adb -s $D pull $T/$1.png $O/$1.png >/dev/null 2>&1; }

for V in 8 9 10 11; do
  echo ===CYCLE-V$V
  adb -s $D shell input keyevent 4
  adb -s $D shell am force-stop com.squareup
  sleep 2
  adb -s $D shell monkey -p com.squareup -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1
  sleep 14
  adb -s $D logcat -c
  fire2 $V r$V
  sleep 2;   shot r${V}a
  sleep 2;   shot r${V}b
  sleep 2;   shot r${V}c
  sleep 2;   shot r${V}d
  adb -s $D logcat -d > $O/r${V}.log 2>/dev/null
  grep -F Square.Register $O/r${V}.log | tail -4
done
echo ===SIZES
ls -la $O/r8*.png $O/r9*.png $O/r10*.png $O/r11*.png 2>/dev/null
echo PROBE3-DONE
