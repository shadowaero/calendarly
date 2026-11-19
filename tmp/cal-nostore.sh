#!/bin/bash
# fdw cache-hardening for NPM proxy host 104 (calendar.examininglife.com -> Pi 192.168.76.36:3000)
# Root cause of "Widget: weather_gui" placeholder on the public URL:
#   assets.conf proxy_cache (any 30m, ignore Cache-Control/Set-Cookie) + Cloudflare
#   cached authentik 302s under /assets/index-*.js URLs; browsers also held the
#   same-URL NAS-era bundle (?v=ws6z). Fix: dedicated ^~ /assets/ location (beats the
#   regex, disables proxy_cache/expires), no-store on location /, no-store on the
#   authentik outpost relay; then bump Pi index.html ?v=ws6z -> ws6zp so poisoned
#   edge entries are orphaned.
set -euo pipefail
CONF=/data/nginx/proxy_host/104.conf
BAK=$CONF.bak-nostore-$(date +%Y%m%d)
cp -p "$CONF" "$BAK"

# (1) inside location /: hide upstream Cache-Control, emit no-store
awk '
/^  location \/ \{/ {
  print
  print "  # fdw-cache: nothing from this host may be cached by browsers or CDN (poisoned-302 fix)"
  print "  proxy_hide_header Cache-Control;"
  print "  add_header Cache-Control \"no-store\" always;"
  next
}
{ print }
' "$CONF" > "$CONF.tmp"
mv "$CONF.tmp" "$CONF"

# (2) dedicated ^~ /assets/ location (^~ short-circuits regex match -> assets.conf never applies)
sed -i 's|^  location / {|  # fdw-cache: assets bypass NPM public-cache + CDN cache entirely\n  location ^~ /assets/ {\n    add_header Strict-Transport-Security $hsts_header always;\n    proxy_hide_header Cache-Control;\n    add_header Cache-Control "no-store" always;\n    include conf.d/include/proxy.conf;\n  }\n\n  location / {|' "$CONF"

# (3) no-store on the authentik outpost relay (covers anonymous 302 start-redirects)
sed -i '/outpost.goauthentik.io;/a\    add_header Cache-Control "no-store" always;' "$CONF"

if ! nginx -t 2>/tmp/nostore-t.log; then
  echo "NGINX_TEST_FAIL"
  cat /tmp/nostore-t.log
  cp -p "$BAK" "$CONF"
  echo "RESTORED backup"
  exit 1
fi
nginx -s reload
echo "PATCH_OK backup=$BAK"
echo "--- patched markers ---"
grep -n 'no-store\|^  location \^~ /assets/' "$CONF"
