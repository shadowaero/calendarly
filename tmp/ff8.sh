#!/bin/bash
set -e
TS=$(date +%Y%m%d-%H%M%S)
CONT=nginx-proxy-manager
echo "== ff8: DB advanced_config relay update for row 46 ($TS)"
docker exec $CONT sh -c 'ls -d /app /app/src/backend 2>/dev/null; find /app -maxdepth 3 -name better-sqlite3 -type d 2>/dev/null | head -2' || true
cat > /tmp/ff8node.js <<'NODEEOF'
const db=require('better-sqlite3')('/data/database.sqlite');
const sets=[
 '# --- authentik header relay (ff7/ff8) ---',
 'auth_request_set $authentik_username $upstream_http_x_authentik_username;',
 'auth_request_set $authentik_email $upstream_http_x_authentik_email;',
 'auth_request_set $authentik_groups $upstream_http_x_authentik_groups;',
 'auth_request_set $authentik_name $upstream_http_x_authentik_name;',
 'auth_request_set $authentik_uid $upstream_http_x_authentik_uid;',
 'auth_request_set $authentik_jwt $upstream_http_x_authentik_jwt;'].join('\n');
const r=db.prepare('select advanced_config from proxy_host where id=46').get();
const v=(r&&r.advanced_config)||'';
if(v.indexOf('$authentik_jwt')===-1){
 db.prepare('update proxy_host set advanced_config=? where id=46').run(v+'\n\n'+sets);
 console.log('DB advanced_config updated (was',v.length,'chars)');}
else{console.log('DB already ok');}
const r2=db.prepare('select length(advanced_config) as n from proxy_host where id=46').get();
console.log('advanced_config now',r2.n,'chars');
db.close();
NODEEOF
W=$(docker exec $CONT sh -c 'find /app -maxdepth 3 -path "*/node_modules" -type d 2>/dev/null' | head -1)
echo "modules=$W"
docker cp /tmp/ff8node.js $CONT:/app/ff8node.cjs
docker exec $CONT node /app/ff8node.cjs
docker exec $CONT rm -f /app/ff8node.cjs
rm -f /tmp/ff8node.js