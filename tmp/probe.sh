#!/bin/bash
# probe.sh — clean warm-start POS API probe with timed captures
D=10.42.0.153:5555
CID=sq0idp-QFHVBaVQVe92_dkdvkJu4w
CB=http%3A%2F%2F10.42.0.1%3A5005%2Fapi%2Fpayments%2Fsquare-pos%2Fcallback%3Foid%3Dord_1794682501256_9g1jyv%26tok%3Dpsqmwgrmglklkvv2in7
T=/data/local/tmp
O=/home/flayva/tmp
cd $O || exit 1

fire() {
  # $1 = version, $2 = tender, $3 = tag
  adb -s $D shell am start -n com.squareup/.ui.ApiActivity -a com.squareup.pos.action.CHARGE \
    --ei com.squareup.pos.API_VERSION $1 \
    --el com.squareup.pos.TOTAL_AMOUNT_LONG 109 \
    --es com.squareup.pos.CURRENCY_CODE USD \
    --es com.squareup.pos.CLIENT_ID $CID \
    --es com.squareup.pos.TENDER_TYPES $2 \
    --es com.squareup.pos.WEB_CALLBACK_URI $CB \
    --es com.squareup.pos.CLIENT_TRANSACTION_ID $3 \
    --es com.squareup.pos.NOTE Order116-Flayva \
    --es com.squareup.pos.REQUEST_METADATA '{}' \
    --el com.squareup.pos.AUTO_RETURN_TIMEOUT_MS 20000 >/dev/null 2>&1
}

shot() { adb -s $D shell screencap -p $T/$1.png; adb -s $D pull $T/$1.png $O/$1.png >/dev/null 2>&1; }

echo ===CLEANUP
adb -s $D shell input keyevent 4; adb -s $D shell am force-stop com.squareup
sleep 2
echo ===WARM-START
adb -s $D shell monkey -p com.squareup -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1
sleep 14
shot warm0
echo ===FIRE-V3
adb -s $D logcat -c
fire 3 CARD_PRESENT p1t3
sleep 2;   shot p1a
sleep 1.5; shot p1b
sleep 1.5; shot p1c
sleep 1.5; shot p1d
sleep 1.5; shot p1e
adb -s $D logcat -d > $O/p1full.log 2>/dev/null
adb -s $D shell am force-stop com.squareup
sleep 2
echo ===WARM-AGAIN
adb -s $D shell monkey -p com.squareup -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1
sleep 14
echo ===FIRE-V3-CASH
adb -s $D logcat -c
fire 3 CASH p2t3c
sleep 2;   shot p2a
sleep 1.5; shot p2b
sleep 1.5; shot p2c
sleep 1.5; shot p2d
sleep 1.5; shot p2e
adb -s $D logcat -d > $O/p2full.log 2>/dev/null
adb -s $D shell am force-stop com.squareup
echo ===TOAST-LINES
grep -i toast $O/p1full.log | tail -6
grep -i toast $O/p2full.log | tail -6
echo ===REG-LINES
grep -F Square.Register $O/p1full.log | tail -6
grep -F Square.Register $O/p2full.log | tail -6
echo ===SIZES
ls -la $O/warm0.png $O/p1*.png $O/p2*.png
echo PROBE-DONE
