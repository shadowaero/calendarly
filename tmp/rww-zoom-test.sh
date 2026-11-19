#!/bin/bash
# rww-zoom-test: probe RainViewer tile sizes vs zooms
P=$(curl -s 'http://127.0.0.1:3000/api/weather/radar?zip=32757' | grep -o '/v2/radar/[a-f0-9]*' | sed -n '6p')
echo "path=$P"
for SZ in 256 512; do
  for Z in 6 7 8 9 10; do
    CODE=$(curl -s -o /tmp/t.png -w '%{http_code} %{size_download}' "https://tilecache.rainviewer.com$P/${SZ}/${Z}/530/530/6/1_1.png")
    echo "size=$SZ z=$Z -> $CODE"
  done
done
