#!/bin/bash
# rww-rv-probe: check RainViewer radar content around Mount Dora + latest frames (z7 overlay tiles)
j=$(curl -s https://api.rainviewer.com/public/weather-maps.json)
host=$(echo "$j" | grep -o '"host":"[^"]*"' | cut -d'"' -f4)
echo "HOST=$host"
echo "$j" | grep -oE '"path":"/v2/radar/[0-9a-f]+"' | cut -d'"' -f4 > /tmp/rww-paths.txt
wc -l < /tmp/rww-paths.txt
tail -5 /tmp/rww-paths.txt
echo '--- tile sizes (z7, 256px, color 6): cols x=33..37 rows y=51..54 (Mount Dora tile = 35/53) ---'
for p in $(tail -3 /tmp/rww-paths.txt); do
  t=$(date -u -d @$(echo "$p" | grep -o '[0-9]*$') +%H:%M 2>/dev/null)
  echo "frame $p (${t}Z):"
  row='';
  for y in 51 52 53 54; do
    line="y=$y:"
    for x in 33 34 35 36 37; do
      b=$(curl -s -o /tmp/rww-t.png -w '%{size_download}' "$host$p/256/7/$x/$y/6/1_1.png")
      line="$line $x:$b"
    done
    echo "$line"
  done
done
echo RWW_PROBE_DONE
