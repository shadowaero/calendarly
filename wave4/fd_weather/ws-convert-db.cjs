// Converts screen 17: replaces the single weather_station block with 9 ws_* widgets.
// Percent fields are the render truth (Xt(): percent wins over pos/12*100 fallback).
// Idempotent: skips if ws_* blocks already exist on screen 17.
const D = require('/opt/calendarly/server/node_modules/better-sqlite3');
const db = new D('/opt/calendarly/data/dashboard.sqlite');
const CFG = JSON.stringify({ zip: '32757', outdoorChannel: 'A', indoorChannel: 'B' });
const cnt = db.prepare("SELECT COUNT(*) c FROM screen_blocks WHERE screen_id=17 AND type LIKE 'ws_%'").get().c;
const blockRows = () => db.prepare("SELECT id,type,pos_x,pos_y,width,height,x_percent,y_percent,w_percent,h_percent FROM screen_blocks WHERE screen_id=17 ORDER BY pos_y,pos_x").all();
console.log('BEFORE:', JSON.stringify(blockRows()));
if (cnt > 0) { console.log('SKIP: ws_* blocks already present (' + cnt + ')'); process.exit(0); }
const wsRow = db.prepare("SELECT id,x_percent,y_percent,w_percent,h_percent,config FROM screen_blocks WHERE screen_id=17 AND type='weather_station'").get();
if (!wsRow) { console.log('FAIL: no weather_station block on screen 17'); process.exit(1); }
const saved = { weather_station: wsRow }; // record for undo reference
const upd = db.prepare("UPDATE screen_blocks SET type=?, pos_x=?, pos_y=?, width=?, height=?, x_percent=?, y_percent=?, w_percent=?, h_percent=?, config=? WHERE id=?");
const ins = db.prepare("INSERT INTO screen_blocks (screen_id,type,pos_x,pos_y,width,height,config,x_percent,y_percent,w_percent,h_percent) VALUES (?,?,?,?,?,?,?,?,?,?,?)");
// [type, px, py, pw, ph, xp, yp, wp, hp]
const tiles = [
  ['ws_alerts', 6, 0, 3, 1, 50.0, 0.9, 24.6, 8.6],
  ['ws_current', 6, 1, 2, 2, 50.0, 10.0, 12.1, 17.8],
  ['ws_baro', 8, 1, 2, 2, 62.6, 10.0, 12.0, 17.8],
  ['ws_wind', 6, 3, 2, 2, 50.0, 28.3, 12.1, 17.8],
  ['ws_solar', 8, 3, 2, 2, 62.6, 28.3, 12.0, 17.8],
  ['ws_outdoor', 6, 6, 2, 2, 50.0, 46.6, 12.1, 17.8],
  ['ws_indoor', 8, 6, 2, 2, 62.6, 46.6, 12.0, 17.8],
  ['ws_clock', 6, 8, 2, 4, 50.0, 64.9, 12.1, 34.5],
  ['ws_today', 8, 8, 2, 4, 62.6, 64.9, 12.0, 34.5]
];
// convert the existing composite block (id 273) -> the first widget keeps its config
upd.run('ws_current', tiles[1][1], tiles[1][2], tiles[1][3], tiles[1][4], tiles[1][5], tiles[1][6], tiles[1][7], tiles[1][8], CFG, wsRow.id);
for (let i = 0; i < tiles.length; i++) {
  if (i === 1) continue; // 273 already became ws_current
  const t = tiles[i];
  ins.run(17, t[0], t[1], t[2], t[3], t[4], CFG, t[5], t[6], t[7], t[8]);
}
// narrow the calendar and slide radar+hourly right so the widget column has clean space
db.prepare("UPDATE screen_blocks SET w_percent=49.3 WHERE id=270").run();
db.prepare("UPDATE screen_blocks SET x_percent=75.05, w_percent=24.6 WHERE id=271").run();
db.prepare("UPDATE screen_blocks SET x_percent=75.0, w_percent=24.5 WHERE id=272").run();
console.log('SAVED_FOR_UNDO:', JSON.stringify(saved));
console.log('AFTER:', JSON.stringify(blockRows()));
console.log('CONVERT_OK');
