const db = require('/opt/calendarly/server/node_modules/better-sqlite3')('/opt/calendarly/data/dashboard.sqlite');
console.log('SCREENS_COLS ' + JSON.stringify(db.prepare('PRAGMA table_info(screens)').all().map(c => c.name + ':' + c.type)));
console.log('SCR17 ' + JSON.stringify(db.prepare('SELECT * FROM screens WHERE id=17').all()));
const wsb = db.prepare("SELECT type,pos_x,pos_y,width,height,x_percent,y_percent,w_percent,h_percent,substr(config,1,120) cfg FROM screen_blocks WHERE screen_id=17 ORDER BY id LIMIT 4").all();
console.log('SCR17_BLOCKS ' + JSON.stringify(wsb, null, 0));
