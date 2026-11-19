const D = require('better-sqlite3');
const db = new D('/app/data/dashboard.sqlite', { readonly: true });
const out = {};
out.screen17 = db.prepare('SELECT * FROM screens WHERE id = 17').get();
out.blocks = db.prepare('SELECT * FROM screen_blocks WHERE screen_id = 17 ORDER BY id').all();
console.log(JSON.stringify(out, null, 1));
