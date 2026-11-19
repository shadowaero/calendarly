#!/bin/bash
TS=$(date -u +%Y%m%d-%H%M%S)
NPM=$(docker ps --format '{{.Names}} {{.Image}}' | awk 'tolower($0) ~ /jc21\/nginx/ {print $1; exit}')
echo NPM=$NPM TS=$TS
[ -z "$NPM" ] && { echo NO-NPM-CONTAINER; exit 1; }
cat > /tmp/blk-firefly.txt <<'BLK'
# --- authentik forward-auth (firefly-iii) ---
location /outpost.goauthentik.io {
    proxy_pass http://192.168.76.188:8090/outpost.goauthentik.io;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Original-URL $scheme://$http_host$request_uri;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    add_header X-authentik-username "";
    add_header X-authentik-groups "";
    add_header X-authentik-email "";
    add_header X-authentik-name "";
    add_header X-authentik-uid "";
    add_header X-authentik-jwt "";
}

auth_request /outpost.goauthentik.io/auth/nginx;
error_page 401 =302 https://firefly.examininglife.com/outpost.goauthentik.io/start?rd=$request_uri;
BLK
python3 - <<'PYEOF'
import re
src='/volume1/docker/nginx/data/nginx/proxy_host/46.conf'
s=open(src).read()
s2=re.sub(r'set \$server\s+"192\.168\.76\.\d+"', 'set $server         "192.168.76.188"', s, count=1)
blk=open('/tmp/blk-firefly.txt').read()
if 'outpost.goauthentik.io' in s:
    print('conf already gated; only server retarget:', s!=s2)
    open('/tmp/46.conf.new','w').write(s2)
else:
    s2=s2.replace('  location / {', blk+'\n  location / {', 1)
    open('/tmp/46.conf.new','w').write(s2)
    print('rendered /tmp/46.conf.new')
PYEOF
echo ==BACKUPS
docker exec $NPM sh -c "cp -a /data/nginx/proxy_host/46.conf /data/nginx/proxy_host/46.conf.bak-fireflyfwd-$TS && cp -a /data/database.sqlite /data/database.sqlite.bak-fireflyfwd-$TS && echo backups-ok-$TS"
echo ==SQL
docker cp /tmp/blk-firefly.txt $NPM:/tmp/blk-firefly.txt
docker exec $NPM node -e '
let B; try{B=require("/app/node_modules/better-sqlite3")}catch(e){B=require("better-sqlite3")}
const fs=require("fs");
const block=fs.readFileSync("/tmp/blk-firefly.txt","utf8");
const db=B("/data/database.sqlite");
const r=db.prepare("UPDATE proxy_host SET forward_host=?, advanced_config=? WHERE id=46 AND is_deleted=0").run("192.168.76.188", block);
console.log("rows:", r.changes);
const row=db.prepare("SELECT id,domain_names,forward_host,forward_port,enabled,is_deleted,length(advanced_config) ac FROM proxy_host WHERE id=46").get();
console.log(JSON.stringify(row));
'
echo ==CONF-SWAP
O=$(docker exec $NPM sh -c "stat -c '%u:%g' /data/nginx/proxy_host/46.conf")
echo owner=$O
docker cp /tmp/46.conf.new $NPM:/data/nginx/proxy_host/46.conf
docker exec $NPM sh -c "chown $O /data/nginx/proxy_host/46.conf; chmod 644 /data/nginx/proxy_host/46.conf; grep -n 'outpost.goauthentik.io\|set \$server' /data/nginx/proxy_host/46.conf | head -8"
echo ==NGINX-T
docker exec $NPM nginx -t 2>&1
echo ==RELOAD
docker exec $NPM nginx -s reload && echo reload-ok
echo ==DONE-$TS