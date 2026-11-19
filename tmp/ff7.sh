#!/bin/bash
set -e
TS=$(date +%Y%m%d-%H%M%S)
CONT=nginx-proxy-manager
C=/data/nginx/proxy_host/46.conf
echo "== ff7: authentik header relay for firefly row 46 ($TS)"
docker exec $CONT cp $C $C.bak-ff7-$TS
cat > /tmp/ff7node.js <<'NODEEOF'
const fs=require('fs');
const C='/data/nginx/proxy_host/46.conf';
const sets=[
 '# --- authentik header relay (ff7) ---',
 'auth_request_set $authentik_username $upstream_http_x_authentik_username;',
 'auth_request_set $authentik_email $upstream_http_x_authentik_email;',
 'auth_request_set $authentik_groups $upstream_http_x_authentik_groups;',
 'auth_request_set $authentik_name $upstream_http_x_authentik_name;',
 'auth_request_set $authentik_uid $upstream_http_x_authentik_uid;',
 'auth_request_set $authentik_jwt $upstream_http_x_authentik_jwt;'].join('\n');
let s=fs.readFileSync(C,'utf8');
if(s.indexOf('$authentik_jwt')!==-1){console.log('CONF already patched');}
else{
 const anchor='auth_request /outpost.goauthentik.io/auth/nginx;';
 if(s.indexOf(anchor)===-1) throw new Error('anchor missing');
 s=s.replace(anchor,anchor+'\n'+sets,1);
 const la='    # Proxy!\n    include conf.d/include/proxy.conf;';
 if(s.indexOf(la)===-1) throw new Error('location anchor missing');
 const hs=[
 '    # authentik header relay (ff7)',
 '    proxy_set_header X-authentik-username $authentik_username;',
 '    proxy_set_header X-authentik-email $authentik_email;',
 '    proxy_set_header X-authentik-groups $authentik_groups;',
 '    proxy_set_header X-authentik-name $authentik_name;',
 '    proxy_set_header X-authentik-uid $authentik_uid;',
 '    proxy_set_header X-authentik-jwt $authentik_jwt;'].join('\n');
 s=s.replace(la,hs+'\n\n'+la,1);
 fs.writeFileSync(C,s);
 console.log('CONF patched');
}
try{
 const db=require('better-sqlite3')('/data/database.sqlite');
 const r=db.prepare('select advanced_config from proxy_host where id=46').get();
 const v=(r&&r.advanced_config)||'';
 if(v.indexOf('$authentik_jwt')===-1){
  db.prepare('update proxy_host set advanced_config=? where id=46').run(v+'\n\n'+sets);
  console.log('DB advanced_config updated (was',v.length,'chars)');}
 else{console.log('DB already ok');}
 db.close();
}catch(e){console.log('DB skip:',e.message);}
NODEEOF
docker cp /tmp/ff7node.js $CONT:/tmp/ff7node.js
docker exec $CONT node /tmp/ff7node.js
docker exec $CONT rm -f /tmp/ff7node.js
rm -f /tmp/ff7node.js
echo ==NGINX-TEST
docker exec $CONT nginx -t 2>&1 | tail -2
docker exec $CONT nginx -s reload
echo ==VERIFY
docker exec $CONT grep -n 'auth_request_set\|X-authentik' $C | head -14