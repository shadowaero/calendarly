const D = require('better-sqlite3');
const db = new D('/app/data/dashboard.sqlite', { readonly: true });
const out = {};
out.schema = db.prepare("SELECT name, sql FROM sqlite_master WHERE type='table' AND name IN ('screens','screen_blocks','displays','loops','schedules','settings')").all();
out.screens = db.prepare('SELECT * FROM screens ORDER BY id').all();
out.blocks = db.prepare('SELECT * FROM screen_blocks ORDER BY screen_id, id').all();
out.displays = db.prepare('SELECT * FROM displays ORDER BY id').all();
out.loops = db.prepare('SELECT * FROM loops ORDER BY id').all();
out.schedules = db.prepare('SELECT * FROM schedules ORDER BY id').all();
out.sWeather = {};
for (const k of ['weather_location', 'weather_units', 'forecast_days', 'template_preview_backgrounds']) {
  const r = db.prepare('SELECT value FROM settings WHERE key = ?').get(k);
  if (r) out.sWeather[k] = r.value;
}
console.log(JSON.stringify(out));

