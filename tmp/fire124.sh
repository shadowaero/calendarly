echo '== restore kiosk =='
adb -s 10.42.0.153:5555 shell monkey -p de.ozerov.fully -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1 && echo kiosk-restored
python3 /home/flayva/tmp/live_order.py | tail -1
sleep 4
adb -s 10.42.0.153:5555 shell input tap 960 375
sleep 1.5
adb -s 10.42.0.153:5555 shell input tap 960 722
sleep 1
adb -s 10.42.0.153:5555 shell screencap -p /sdcard/now7.png && adb -s 10.42.0.153:5555 pull /sdcard/now7.png /home/flayva/tmp/now7.png >/dev/null && echo TAPNOW-UP
echo '== done =='
