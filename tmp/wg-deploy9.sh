#!/bin/bash
sudo sed -i 's/\r$//' /tmp/fdw-apply-wxgui.cjs /tmp/fdw-apply-radar-widgets.cjs /tmp/wxgui-component.js
echo '--- radar widgets patcher (comps SKIP expected, cache.bust -> ws6o) ---'
sudo node /tmp/fdw-apply-radar-widgets.cjs
echo '--- wxgui patcher (component.upgrade OK, cache.bust -> ws6o) ---'
sudo node /tmp/fdw-apply-wxgui.cjs
echo '--- served html version marker (expect 1) ---'
sudo grep -c 'v=ws6o' /opt/calendarly/client/dist/index.html
echo '--- bundle greps (expect comp_rw=2 latlon=1 zoom10=1 scene=1 magnify=0 centerCfg=0) ---'
sudo bash -c 'B=$(ls /opt/calendarly/client/dist/assets/index-*.js | head -1); echo -n "comp_rw="; grep -o "n.jsx(rwRV" $B | wc -l; echo -n "latlon="; grep -o "lat: 28.80249" $B | wc -l; echo -n "zoom10="; grep -o "zoom: 10" $B | wc -l; echo -n "scene="; grep -o "wgXScene" $B | wc -l; echo -n "magnify="; grep -o "magnify: 5" $B | wc -l; echo -n "centerCfg="; grep -o "center: !0" $B | wc -l; echo -n "weather_radar_lbl="; grep -o "WEATHER RADAR" $B | wc -l; echo -n "indoor_sensor="; grep -o "Indoor sensor" $B | wc -l'
