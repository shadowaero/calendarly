// rww-zoom-md: zoom the screen-19 radar widgets in to Greater Mount Dora
// (Windy -> 11, RainViewer -> 9; overlay still drawn at RainViewer's z7 cache cap, scaled 4x)
// Prints BEFORE/AFTER and writes the previous configs to /tmp/rww-zoom-undo.sql. Idempotent-ish: re-run safe.
const fs = require('fs');
const db = require('/opt/calendarly/server/node_modules/better-sqlite3')('/opt/calendarly/data/dashboard.sqlite');
const WANT = { radar_windy: 11, radar_rainviewer: 9 };
const undo = ['-- restore pre-zoom configs:'];
const tx = db.transaction(function () {
  for (const row of db.prepare("SELECT id, type, config FROM screen_blocks WHERE type IN ('radar_windy','radar_rainviewer')").all()) {
    let cfg = {};
    try { cfg = JSON.parse(row.config || '{}'); } catch (e) {}
    console.log('BEFORE id=' + row.id + ' ' + row.type + ' config=' + row.config);
    undo.push('UPDATE screen_blocks SET config=' + JSON.stringify(JSON.stringify(cfg)) + " WHERE id=" + row.id + ';');
    if (cfg.zoom !== WANT[row.type]) {
      cfg.zoom = WANT[row.type];
      db.prepare('UPDATE screen_blocks SET config=? WHERE id=?').run(JSON.stringify(cfg), row.id);
      console.log('SET id=' + row.id + ' zoom=' + cfg.zoom);
    } else {
      console.log('KEEP id=' + row.id + ' zoom=' + cfg.zoom + ' (unchanged)');
    }
  }
});
tx();
fs.writeFileSync('/tmp/rww-zoom-undo.sql', undo.join('\n') + '\n');
for (const row of db.prepare("SELECT id, type, config FROM screen_blocks WHERE type IN ('radar_windy','radar_rainviewer')").all()) {
  console.log('AFTER id=' + row.id + ' ' + row.type + ' config=' + row.config);
}
console.log('RWW_ZOOM_DONE');
