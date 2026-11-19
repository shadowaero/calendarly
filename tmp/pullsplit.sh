#!/bin/bash
# pullsplit.sh — pull ALL com.squareup APKs (base + splits) from the kiosk tablet and extract dex for grep
D=10.42.0.153:5555
cd /home/flayva/tmp || exit 1
mkdir -p apks dex2
adb -s "$D" shell pm path com.squareup | tr -d '\r' | sed 's/package://' | while read -r p; do
  n=$(basename "$p")
  if [ -s "apks/$n" ]; then echo "have $n"; else adb -s "$D" pull "$p" "apks/$n" >/dev/null 2>&1 && echo "pulled $n"; fi
done
cd dex2
for a in ../apks/*.apk; do unzip -o -q "$a" '*.dex' -d . 2>/dev/null; done
echo "dex count: $(ls *.dex 2>/dev/null | wc -l)"
echo PULLSPLIT-DONE
