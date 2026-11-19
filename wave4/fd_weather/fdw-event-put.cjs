#!/usr/bin/env node
// fdw-event-put.cjs — adds router.put('/events/:id', ...) to a deployed events.js.
// Kit: calendar event-edit wave (ws6zt token, 2026-11-19). Server piece only —
// the cache-bust token (?v=ws6zt) is bumped by fdw-apply-eventedit.cjs in index.html.
// usage: node fdw-event-put.cjs <path-to-events.js> <open|gate>
//   open : Pi deployment (its events POST/DELETE are ungated — touch-parity)
//   gate : NAS deployment (requireAuth, parity with hardened POST/DELETE)
// Idempotent (skips if PUT already present), writes <file>.bak-eventput first.
const fs = require('fs');
const p = process.argv[2];
const mode = process.argv[3] || 'gate';
if (!p || fs.existsSync(p) === false) { console.log('FAIL usage: node fdw-event-put.cjs <events.js> <open|gate>'); process.exit(1); }
let js = fs.readFileSync(p, 'utf8');
const EOL = js.includes('\r\n') ? '\r\n' : '\n';
if (js.includes("router.put('/events/:id'")) { console.log('SKIP already present'); process.exit(0); }
const anchor = "router.delete('/events/:id',";
const n = js.split(anchor).length - 1;
if (n !== 1) { console.log('FAIL anchor DELETE count=' + n); process.exit(1); }
const gate = mode === 'gate' ? 'requireAuth, ' : '';
const put = [
  "router.put('/events/:id', " + gate + "(req, res) => {",
  '  try {',
  '    const { id } = req.params;',
  '    const { title, description, start_time, end_time, all_day, color, category } = req.body;',
  '    const existing = db.prepare("SELECT *, \'local\' as source FROM events WHERE id = ?").get(id);',
  '    if (!existing) {',
  "      return res.status(404).json({ error: 'Event not found' });",
  '    }',
  '    db.prepare(`',
  '      UPDATE events',
  '      SET title = ?, description = ?, start_time = ?, end_time = ?, all_day = ?, color = ?, category = ?',
  '      WHERE id = ?',
  '    `).run(',
  '      title !== undefined ? title : existing.title,',
  '      description !== undefined ? description : existing.description,',
  '      start_time !== undefined ? start_time : existing.start_time,',
  '      end_time !== undefined ? end_time : existing.end_time,',
  '      all_day !== undefined ? (all_day ? 1 : 0) : existing.all_day,',
  '      color !== undefined ? color : existing.color,',
  '      category !== undefined ? category : existing.category,',
  '      id',
  '    );',
  '    const updated = db.prepare("SELECT *, \'local\' as source FROM events WHERE id = ?").get(id);',
  "    broadcast('EVENT_UPDATED', updated);",
  '    res.json(updated);',
  '  } catch (err) {',
  '    res.status(500).json({ error: err.message });',
  '  }',
  '});',
  ''
].join(EOL);
fs.copyFileSync(p, p + '.bak-eventput');
js = js.replace(anchor, put + anchor);
fs.writeFileSync(p, js);
console.log('OK event-put ' + mode + ' inserted before DELETE; backup ' + p + '.bak-eventput');