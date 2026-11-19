const db = require('/opt/calendarly/server/node_modules/better-sqlite3')('/opt/calendarly/data/dashboard.sqlite');
const cols = db.prepare('PRAGMA table_info(displays)').all().map(c => c.name + ':' + c.type);
console.log('DISPLAYS_COLS ' + JSON.stringify(cols));
console.log('DISPLAYS ' + JSON.stringify(db.prepare('SELECT * FROM displays ORDER BY id').all(), null, 0));
