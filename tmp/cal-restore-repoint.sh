#!/bin/bash
# restore pristine post-repoint baseline for host 104 (before re-applying cache fix)
set -euo pipefail
CONF=/data/nginx/proxy_host/104.conf
cp -p $CONF.bak-cal-pi-20261119 $CONF
sed -i 's@set $server[ ]*"192.168.76.188";@set $server         "192.168.76.36";@' $CONF
sed -i 's@set $port[ ]*3080;@set $port           3000;@' $CONF
echo '--- routing vars (expect 36/3000) ---'
sed -n '12,16p' $CONF
echo '--- fdw markers (expect 0) ---'
grep -c fdw-cache $CONF || echo 0
echo '--- 192.168 refs (outpost must survive) ---'
grep -n '192.168' $CONF
