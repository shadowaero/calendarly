const fs = require("fs");
const p = "/opt/calendarly/server/src/routes/screens.js";
let s = fs.readFileSync(p, "utf8");
function rep(oldS, newS, label) {
  const c = s.split(oldS).length - 1;
  if (c !== 1) { console.log("[FAIL] " + label + " occurrences=" + c); process.exitCode = 1; return false; }
  s = s.replace(oldS, newS); console.log("[OK] " + label); return true;
}
const g1 = "const loops = db.prepare('SELECT * FROM loops ORDER BY id ASC').all();";
const gTail = "\n    res.json(loops.map(l => ({ ...l, screen_ids: l.screen_ids ? JSON.parse(l.screen_ids) : [] })));";
const gNew = "\n    const alive = db.prepare('SELECT id FROM screens').all().map(r => r.id);\n    res.json(loops.map(l => ({ ...l, screen_ids: l.screen_ids ? JSON.parse(l.screen_ids).filter(sid => alive.includes(sid)) : [] })));";
rep(g1 + gTail, g1 + gNew, "GET /loops prune-on-read");
const pOld = "      JSON.stringify(screen_ids || []),";
const pNew = "      JSON.stringify((screen_ids || []).filter(sid => { try { return !!db.prepare('SELECT 1 FROM screens WHERE id = ?').get(sid); } catch (e) { return true; } })),";
rep(pOld, pNew, "POST /loops prune");
const uOld = "      screen_ids !== undefined ? JSON.stringify(screen_ids) : existing.screen_ids,";
const uNew = "      screen_ids !== undefined ? JSON.stringify((screen_ids || []).filter(sid => { try { return !!db.prepare('SELECT 1 FROM screens WHERE id = ?').get(sid); } catch (e) { return true; } })) : existing.screen_ids,";
rep(uOld, uNew, "PUT /loops prune");
fs.writeFileSync(p, s);
console.log("PATCH_DONE exit=" + (process.exitCode || 0));