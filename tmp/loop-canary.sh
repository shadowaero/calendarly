#!/bin/bash
# Loop-change canary: proves editor-shaped loop mutations actually apply to the kiosk.
# Login -> POST+DELETE throwaway loop -> PUT loop 1 (reversed + 5s + dead id) -> screenshots -> REVERT.
set -u
BASE=http://127.0.0.1:3000
echo '== login (default admin creds; aborts if password was changed) =='
code=$(curl -s -m 8 -o /tmp/fd-login.json -w '%{http_code}' -c /tmp/fd.cookie -H 'Content-Type: application/json' -X POST -d '{"username":"admin","password":"admin"}' $BASE/api/auth/login)
echo login_http=$code
cat /tmp/fd-login.json; echo
if [ "$code" != "200" ]; then echo ABORT_NO_AUTH; exit 2; fi
echo '== baseline loops =='
curl -s -m 8 $BASE/api/loops; echo
node /tmp/ws-listen.cjs > /tmp/ws-events.log 2>&1 &
WSPID=$!
sleep 1
echo '== POST canary loop (create path; dead id 999 proves validation) =='
curl -s -m 8 -b /tmp/fd.cookie -H 'Content-Type: application/json' -X POST -d '{"name":"ZZZ canary loop","interval_seconds":10,"screen_ids":[12,999],"pause_on_touch":1}' $BASE/api/loops; echo
sleep 1
CID=$(curl -s -m 8 $BASE/api/loops | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{try{const l=JSON.parse(d).find(x=>x.name==="ZZZ canary loop");console.log(l?l.id:"NONE")}catch(e){console.log("ERR")}})')
echo created_id=$CID
echo '== DELETE canary loop =='
if [ "$CID" != "NONE" ]; then
  curl -s -m 8 -o /tmp/fd-del.json -w delete_http=%{http_code} -b /tmp/fd.cookie -X DELETE $BASE/api/loops/$CID; echo
  [ -f /tmp/fd-del.json ] && cat /tmp/fd-del.json; echo
fi
sleep 1
echo '== PUT loop 1 (editor-shaped payload: reversed order + interval 5 + dead id 999) =='
curl -s -m 8 -b /tmp/fd.cookie -H 'Content-Type: application/json' -X PUT -d '{"id":1,"name":"Pi4 Kiosk Calendar","interval_seconds":5,"screen_ids":[18,12,1,999],"pause_on_touch":1}' $BASE/api/loops/1; echo
echo '== GET loops after PUT (expect [18,12,1], interval 5, 999 dropped) =='
curl -s -m 8 $BASE/api/loops; echo
echo '== live kiosk screenshots (labwc/grim), shots at ~3/8/13/18s =='
export XDG_RUNTIME_DIR=/run/user/1000
export WAYLAND_DISPLAY=wayland-0
sleep 3; grim /tmp/lc-3.png && echo shot_3s
sleep 5; grim /tmp/lc-8.png && echo shot_8s
sleep 5; grim /tmp/lc-13.png && echo shot_13s
sleep 5; grim /tmp/lc-18.png && echo shot_18s
echo '== REVERT loop 1 to canonical [1,18,12] interval 30 =='
curl -s -m 8 -b /tmp/fd.cookie -H 'Content-Type: application/json' -X PUT -d '{"id":1,"name":"Pi4 Kiosk Calendar","interval_seconds":30,"screen_ids":[1,18,12],"pause_on_touch":1}' $BASE/api/loops/1; echo
sleep 1
echo '== GET loops after revert (must be [1,18,12] interval 30) =='
curl -s -m 8 $BASE/api/loops; echo
kill $WSPID 2>/dev/null
echo '== websocket events captured during mutations =='
cat /tmp/ws-events.log
rm -f /tmp/fd.cookie /tmp/fd-login.json /tmp/fd-del.json
echo CANARY_DONE