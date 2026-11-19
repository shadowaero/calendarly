const fs = require('fs');
const db = require('/opt/calendarly/server/node_modules/better-sqlite3')('/opt/calendarly/data/dashboard.sqlite');
const undo = [];
const existing = db.prepare("SELECT * FROM displays WHERE slug='wxgui-preview' LIMIT 1").get();
if (existing) { console.log('DISPLAY existing id=' + existing.id + ' slug=' + existing.slug + ' -> ' + existing.assigned_type + ' ' + existing.assigned_id); process.exit(0); }
const scr = db.prepare("SELECT * FROM screens WHERE name='Weather GUI' LIMIT 1").get();
if (!scr) { console.error('SCREEN Weather GUI not found'); process.exit(1); }
const di = db.prepare("INSERT INTO displays (name,slug,assigned_type,assigned_id,client_mode,notes,created_at) VALUES ('Weather GUI Preview','wxgui-preview','screen',?,?,'preview display (not the kiosk)',datetime('now'))").run(scr.id, 'display');
undo.push('DELETE FROM displays WHERE id=' + di.lastInsertRowid + ';');
console.log('DISPLAY created id=' + di.lastInsertRowid + ' slug=wxgui-preview -> screen ' + scr.id);
fs.writeFileSync('/tmp/wg-display-undo.sql', undo.join('\n') + '\n');
