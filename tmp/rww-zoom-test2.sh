#!/bin/bash
# rww-zoom-test2: probe a rain-heavy tile (Orlando) across sizes/zooms
P=$(curl -s 'http://127.0.0.1:3000/api/weather/radar?zip=32757' | grep -o '/v2/radar/[a-f0-9]*' | sed -n '6p')
echo "path=$P"
declare -A TX=( [6]="110/66" [7]="110/66" [8]="221/133" [9]="442/266" [10]="884/532" )
for SZ in 256 512; do
  for Z in 6 7 8 9 10; do
    XY=${TX[$Z]}
    CODE=$(curl -s -o /tmp/t2_${SZ}_${Z}.png -w '%{http_code} %{size_download}' "https://tilecache.rainviewer.com$P/${SZ}/${Z}/${XY}/6/1_1.png")
    echo "size=$SZ z=$Z tile=$XY -> $CODE"
  done
done
echo '--- checksums (placeholder tiles will repeat identical) ---'
md5sum /tmp/t2_*.png | awk '{print $1, $2}' | sed 's#/tmp/##'
