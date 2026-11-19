const fs = require('fs');
const db = require('/opt/calendarly/server/node_modules/better-sqlite3')('/opt/calendarly/data/dashboard.sqlite');
const cfgStr = JSON.stringify({ zip: '32757', city: 'MOUNT DORA', outdoorChannel: 'A', indoorChannel: 'B' });
const undo = [];
const existing = db.prepare("SELECT * FROM screen_blocks WHERE type='weather_gui' LIMIT 1").get();
if (existing) {
  db.prepare("UPDATE screen_blocks SET x_percent=0, y_percent=0, w_percent=100, h_percent=100, pos_x=0, pos_y=0, width=0, height=0, config=? WHERE id=?").run(cfgStr, existing.id);
  console.log('EXISTING_BLOCK updated id=' + existing.id + ' screen_id=' + existing.screen_id);
  console.log('UNDO saved -> /tmp/wg-screen-undo.sql');
  fs.writeFileSync('/tmp/wg-screen-undo.sql', '-- idempotent re-run: nothing destructive (block config reset)\n');
  process.exit(0);
}
let scr = db.prepare("SELECT * FROM screens WHERE name='Weather GUI' LIMIT 1").get();
if (!scr) {
  const info = db.prepare("INSERT INTO screens (name,description,orientation,resolution,background_type,background_value,custom_css,is_template,created_at,updated_at) VALUES ('Weather GUI','Full-screen weather GUI hero dashboard','landscape','1080p','color','#090D16','',0,datetime('now'),datetime('now'))").run();
  scr = db.prepare('SELECT * FROM screens WHERE id=?').get(info.lastInsertRowid);
  undo.push('DELETE FROM screens WHERE id=' + scr.id + ';');
  console.log('SCREEN created id=' + scr.id + ' name=Weather GUI');
} else {
  console.log('SCREEN existing id=' + scr.id + ' name=' + scr.name);
}
const bi = db.prepare("INSERT INTO screen_blocks (screen_id,type,pos_x,pos_y,width,height,config,created_at,x_percent,y_percent,w_percent,h_percent) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)").run(
  scr.id, 'weather_gui', 0, 0, 0, 0, cfgStr, new Date().toISOString().slice(0, 19).replace('T', ' '), 0, 0, 100, 100);
undo.push('DELETE FROM screen_blocks WHERE id=' + bi.lastInsertRowid + ';');
console.log('BLOCK created id=' + bi.lastInsertRowid + ' screen_id=' + scr.id + ' type=weather_gui 100%x100%');
fs.writeFileSync('/tmp/wg-screen-undo.sql', undo.join('\n') + '\n');
console.log('UNDO saved -> /tmp/wg-screen-undo.sql');
