const fs = require('fs');
const db = require('/opt/calendarly/server/node_modules/better-sqlite3')('/opt/calendarly/data/dashboard.sqlite');
const undo = [];
let scr = db.prepare("SELECT * FROM screens WHERE name='Radar Widgets' LIMIT 1").get();
if (!scr) {
  const info = db.prepare("INSERT INTO screens (name,description,orientation,resolution,background_type,background_value,custom_css,is_template,created_at,updated_at) VALUES ('Radar Widgets','Side-by-side radar widgets: Windy embed + RainViewer','landscape','1080p','color','#090D16','',0,datetime('now'),datetime('now'))").run();
  scr = db.prepare('SELECT * FROM screens WHERE id=?').get(info.lastInsertRowid);
  undo.push('DELETE FROM screens WHERE id=' + scr.id + ';');
  console.log('SCREEN created id=' + scr.id + ' name=Radar Widgets');
} else { console.log('SCREEN existing id=' + scr.id + ' name=' + scr.name); }
const blocks = [
  { type: 'radar_windy', x: 0.5, y: 0.5, w: 49.5, h: 99, cfg: { lat: '28.800', lon: '-81.644', zoom: '11', overlay: 'radar' } },
  { type: 'radar_rainviewer', x: 50, y: 0.5, w: 49.5, h: 99, cfg: { lat: '28.800', lon: '-81.644', zoom: 7, color: 6, label: 'RainViewer Radar' } }
];
for (const b of blocks) {
  const exists = db.prepare('SELECT id FROM screen_blocks WHERE screen_id=? AND type=?').get(scr.id, b.type);
  if (exists) { db.prepare('UPDATE screen_blocks SET x_percent=?,y_percent=?,w_percent=?,h_percent=?,pos_x=0,pos_y=0,width=0,height=0,config=? WHERE id=?').run(b.x, b.y, b.w, b.h, JSON.stringify(b.cfg), exists.id); console.log('BLOCK updated id=' + exists.id); continue; }
  const bi = db.prepare("INSERT INTO screen_blocks (screen_id,type,pos_x,pos_y,width,height,config,created_at,x_percent,y_percent,w_percent,h_percent) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)").run(
    scr.id, b.type, 0, 0, 0, 0, JSON.stringify(b.cfg), new Date().toISOString().slice(0, 19).replace('T', ' '), b.x, b.y, b.w, b.h);
  undo.push('DELETE FROM screen_blocks WHERE id=' + bi.lastInsertRowid + ';');
  console.log('BLOCK created id=' + bi.lastInsertRowid + ' type=' + b.type);
}
let di = db.prepare("SELECT id FROM displays WHERE slug='radar-test'").get();
if (!di) {
  const info2 = db.prepare("INSERT INTO displays (name,slug,assigned_type,assigned_id,client_mode,notes,created_at) VALUES ('Radar Widgets Preview','radar-test','screen',?,?,'preview display (not the kiosk)',datetime('now'))").run(scr.id, 'display');
  undo.push('DELETE FROM displays WHERE id=' + info2.lastInsertRowid + ';');
  console.log('DISPLAY created id=' + info2.lastInsertRowid + ' slug=radar-test -> screen ' + scr.id);
} else console.log('DISPLAY existing id=' + di.id);
fs.writeFileSync('/tmp/rww-undo.sql', undo.join('\n') + '\n');
console.log('UNDO saved -> /tmp/rww-undo.sql');
