#!/bin/bash
ls -d /opt/calendarly/server/node_modules/better-sqlite3 2>/dev/null
ls /opt/calendarly/server/data/ | head -5
cd /opt/calendarly/server && sudo node -e "
const D=require('better-sqlite3');
const db=new D('data/calendarly.db',{readonly:true});
const rows=db.prepare(\"SELECT id,type,screen_id,pos_x,pos_y,width,height,x_percent,y_percent,w_percent,h_percent FROM screen_blocks WHERE type LIKE 'ws_%' ORDER BY pos_y\").all();
console.log(JSON.stringify(rows));
"
