// rww-pause.cjs <0|1> — toggle the RainViewer widget's `pause` key (block ids in PAUSE_IDS)
// node /tmp/rww-pause.cjs 1   (pause=1: animation off, shows latest past frame — deterministic)
const fs = require('fs');
const db = require('/opt/calendarly/server/node_modules/better-sqlite3')('/opt/calendarly/data/dashboard.sqlite');
const WANT = Number(process.argv[2]);
if (WANT !== 0 && WANT !== 1) { console.log('usage: node rww-pause.cjs <0|1>'); process.exit(1); }
const undo = [];
const tx = db.transaction(function () {
  for (const row of db.prepare("SELECT id, type, config FROM screen_blocks WHERE type='radar_rainviewer'").all()) {
    let cfg = {};
    try { cfg = JSON.parse(row.config || '{}'); } catch (e) {}
    undo.push('UPDATE screen_blocks SET config=' + JSON.stringify(JSON.stringify(cfg)) + ' WHERE id=' + row.id + ';');
    if (WANT === 1) cfg.pause = 1; else delete cfg.pause;
    db.prepare('UPDATE screen_blocks SET config=? WHERE id=?').run(JSON.stringify(cfg), row.id);
    console.log('id=' + row.id + ' pause=' + WANT + ' config=' + JSON.stringify(cfg));
  }
});
tx();
fs.writeFileSync('/tmp/rww-pause-undo.sql', undo.join('\n') + '\n');
console.log('RWW_PAUSE_DONE');
