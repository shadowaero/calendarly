adb -s 10.42.0.153:5555 shell monkey -p de.ozerov.fully -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1 && echo kiosk-front
python3 /home/flayva/tmp/live_order.py | tail -1
sleep 4
adb -s 10.42.0.153:5555 shell input tap 960 375
sleep 1.5
adb -s 10.42.0.153:5555 shell input tap 960 722
sleep 1
echo TAPNOW-UP-TAP-THE-CARD
