#!/usr/bin/env node
// FD weather-station regrid v2 — hero-first "Hero Sky + Instrument" preset (?v=ws4)
// Rewrites pos_x/pos_y/width/height (int grid) + x_percent/y_percent/w_percent/h_percent
// for the 9 ws_* blocks on screen 17 of /opt/calendarly/data/dashboard.sqlite.
// Idempotent (safely re-runnable). BEFORE state saved to /tmp/ws-regrid-before.json
// and an undo script written to /tmp/ws-regrid-undo.cjs.
// Run on Pi:  echo <pw> | sudo -S node /tmp/ws-regrid.cjs
// Undo:       echo <pw> | sudo -S node /tmp/ws-regrid-undo.cjs
const DB = '/opt/calendarly/data/dashboard.sqlite';
const D = require('/opt/calendarly/server/node_modules/better-sqlite3');
const db = new D(DB, { timeout: 5000 });
db.pragma('busy_timeout = 5000');
// [pos_x, pos_y, width, height, x_pct, y_pct, w_pct, h_pct]
const preset = {
  ws_current: [6, 1, 2, 5, 50.0, 0.9, 24.6, 33.0],
  ws_alerts: [6, 0, 3, 1, 50.0, 34.5, 24.6, 6.5],
  ws_clock: [6, 8, 2, 2, 50.0, 41.5, 24.6, 12.0],
  ws_outdoor: [6, 3, 2, 2, 50.0, 54.5, 12.1, 13.5],
  ws_indoor: [8, 3, 2, 2, 62.6, 54.5, 12.0, 13.5],
  ws_baro: [6, 6, 2, 2, 50.0, 68.5, 12.1, 14.0],
  ws_wind: [8, 6, 2, 2, 62.6, 68.5, 12.0, 14.0],
  ws_solar: [6, 9, 2, 2, 50.0, 83.5, 12.1, 13.5],
  ws_today: [8, 9, 2, 2, 62.6, 83.5, 12.0, 13.5]
};
const cols = 'id,type,screen_id,pos_x,pos_y,width,height,x_percent,y_percent,w_percent,h_percent';
const fetchAll = () => db.prepare("SELECT " + cols + " FROM screen_blocks WHERE type LIKE 'ws_%' ORDER BY pos_y").all();
const before = fetchAll();
console.log('BEFORE: ' + JSON.stringify(before));
const types = Object.keys(preset);
const missing = types.filter(t => !before.some(r => r.type === t));
if (missing.length) {
  console.log('FAIL_MISSING ' + JSON.stringify(missing));
  process.exit(1);
}
require('fs').writeFileSync('/tmp/ws-regrid-before.json', JSON.stringify(before, null, 1));
require('fs').writeFileSync('/tmp/ws-regrid-undo.cjs', [
  '#!/usr/bin/env node',
  '// Restores the ws_* block layout from /tmp/ws-regrid-before.json',
  'const DB = \'/opt/calendarly/data/dashboard.sqlite\';',
  'const D = require(\'/opt/calendarly/server/node_modules/better-sqlite3\');',
  'const db = new D(DB, { timeout: 5000 }); db.pragma(\'busy_timeout = 5000\');',
  'const rows = JSON.parse(require(\'fs\').readFileSync(\'/tmp/ws-regrid-before.json\', \'utf8\'));',
  'const u = db.prepare("UPDATE screen_blocks SET pos_x=?,pos_y=?,width=?,height=?,x_percent=?,y_percent=?,w_percent=?,h_percent=? WHERE type=?");',
  'rows.forEach(r => u.run(r.pos_x, r.pos_y, r.width, r.height, r.x_percent, r.y_percent, r.w_percent, r.h_percent, r.type));',
  'console.log("UNDO OK: restored", rows.length, "ws_ rows");'
].join('\n') + '\n');
const upd = db.prepare('UPDATE screen_blocks SET pos_x=?,pos_y=?,width=?,height=?,x_percent=?,y_percent=?,w_percent=?,h_percent=? WHERE type=?');
types.forEach(t => {
  const p = preset[t]; upd.run(p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7], t);
});
const after = fetchAll();
console.log('AFTER: ' + JSON.stringify(after));
console.log('REGRID_OK (before saved: /tmp/ws-regrid-before.json, undo: /tmp/ws-regrid-undo.cjs)');
