#!/bin/bash
echo '== service discovery =='
systemctl list-units --type=service --all --no-pager 2>/dev/null | grep -iE 'calendar|node' | head -5
ls /etc/systemd/system | grep -iE 'calendar|node|pm2'
echo '== backup route file =='
cp -n /opt/calendarly/server/src/routes/screens.js /opt/calendarly/server/src/routes/screens.js.bak-loopfix
echo '== DB update loop 1 -> [1,18,12] =='
cd /opt/calendarly/server && node -e '
const db=require("better-sqlite3")("/opt/calendarly/data/dashboard.sqlite");
const ids=[1,18,12];
const have=db.prepare("SELECT id FROM screens").all().map(r=>r.id);
const missing=ids.filter(i=>!have.includes(i));
if(missing.length){console.error("REFUSING missing:",missing);process.exit(1);}
db.prepare("UPDATE loops SET screen_ids=? WHERE id=1").run(JSON.stringify(ids));
console.log("loop now:",db.prepare("SELECT screen_ids FROM loops WHERE id=1").get().screen_ids);
'
echo '== patch code (prune-on-read/save) =='
node /tmp/loop-patch.cjs
echo '== curl checks (pre-restart, old GET returns raw ids) =='
curl -s http://127.0.0.1:3000/api/loops
echo
curl -s -o /dev/null -w 'loops_status=%{http_code}\n' http://127.0.0.1:3000/api/loops
echo PHASE1_DONE