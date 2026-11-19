const db = require('/opt/calendarly/server/node_modules/better-sqlite3')('/opt/calendarly/data/dashboard.sqlite');
const cols = (t) => db.prepare(`PRAGMA table_info(${t})`).all().map((c) => c.name);
console.log('SCREENS ' + JSON.stringify(db.prepare('SELECT id,name FROM screens ORDER BY id').all()));
console.log('BLOCKTYPES ' + JSON.stringify(db.prepare('SELECT type, COUNT(*) n FROM screen_blocks GROUP BY type').all().map(r => r.type + 'x' + r.n)));
const bs = db.prepare('SELECT * FROM screen_blocks LIMIT 1').all();
console.log('BLOCKCOLS ' + JSON.stringify(Object.keys(bs[0] || {})));
try {
  const st = db.prepare('SELECT key,value FROM settings').all().filter((s) => /rot|kiosk|disp|weather/i.test(s.key));
  console.log('SETTINGS ' + JSON.stringify(st));
} catch (e) { console.log('SETTINGS none: ' + e.message); }
