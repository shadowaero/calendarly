import { Router } from 'express';
import db from '../db.js';
import { broadcast } from '../websocket.js';
import { decodeDakexport, convertDakboardBackupToScreens } from '../dakboardImport.js';
import { requireAuth } from '../auth.js';

const router = Router();
// Protect admin mutations (screens/loops/schedules/displays); device pairing stays public.
router.use((req, res, next) => {
  const isAdminPath = ['/screens', '/loops', '/schedules', '/displays'].some(
    (p) => req.path === p || req.path.startsWith(p + '/')
  );
  if (!isAdminPath || req.method === 'GET' || req.path === '/displays/pair/code') return next();
  return requireAuth(req, res, next);
});

// ====================================================
// SCREENS CRUD & TEMPLATES
// ====================================================
// Template preview background overrides stored in settings table
router.get('/screens/template-previews', (req, res) => {
  try {
    const row = db.prepare("SELECT value FROM settings WHERE key = 'template_preview_backgrounds'").get();
    res.json(row && row.value ? JSON.parse(row.value) : {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/screens/template-previews', (req, res) => {
  try {
    const { templateId, photoUrl } = req.body || {};
    if (!templateId) return res.status(400).json({ error: 'templateId is required' });

    let current = {};
    const row = db.prepare("SELECT value FROM settings WHERE key = 'template_preview_backgrounds'").get();
    if (row && row.value) {
      try { current = JSON.parse(row.value); } catch {}
    }

    if (photoUrl) {
      current[templateId] = photoUrl;
    } else {
      delete current[templateId];
    }

    const value = JSON.stringify(current);
    db.prepare(`
      INSERT INTO settings (key, value) VALUES ('template_preview_backgrounds', ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `).run(value);

    broadcast('TEMPLATE_PREVIEWS_UPDATED', current);
    res.json(current);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/screens', (req, res) => {
  try {
    const screens = db.prepare('SELECT * FROM screens ORDER BY id ASC').all();
    const enriched = screens.map((screen) => {
      const blocks = db.prepare('SELECT * FROM screen_blocks WHERE screen_id = ? ORDER BY id ASC').all(screen.id);
      return {
        ...screen,
        blocks: blocks.map(b => ({ ...b, config: b.config ? JSON.parse(b.config) : {} }))
      };
    });
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/screens/:id', (req, res) => {
  try {
    const screen = db.prepare('SELECT * FROM screens WHERE id = ?').get(req.params.id);
    if (!screen) return res.status(404).json({ error: 'Screen not found' });
    const blocks = db.prepare('SELECT * FROM screen_blocks WHERE screen_id = ? ORDER BY id ASC').all(screen.id);
    res.json({
      ...screen,
      blocks: blocks.map(b => ({ ...b, config: b.config ? JSON.parse(b.config) : {} }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/screens', (req, res) => {
  try {
    const { name, description, orientation, resolution, background_type, background_value, custom_css, is_template, template_name, blocks } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Screen name is required' });

    const stmt = db.prepare(`
      INSERT INTO screens (name, description, orientation, resolution, background_type, background_value, custom_css, is_template, template_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      name.trim(),
      description || '',
      orientation || 'landscape',
      resolution || '1080p',
      background_type || 'color',
      background_value || '#090D16',
      custom_css || '',
      is_template ? 1 : 0,
      template_name || null
    );

    const screenId = result.lastInsertRowid;

    if (Array.isArray(blocks) && blocks.length > 0) {
      const blockStmt = db.prepare(`
        INSERT INTO screen_blocks (screen_id, type, pos_x, pos_y, width, height, x_percent, y_percent, w_percent, h_percent, config)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const b of blocks) {
        blockStmt.run(
          screenId,
          b.type || 'calendar_month',
          b.pos_x ?? 0,
          b.pos_y ?? 0,
          b.width ?? 6,
          b.height ?? 6,
          b.x_percent ?? null,
          b.y_percent ?? null,
          b.w_percent ?? null,
          b.h_percent ?? null,
          typeof b.config === 'object' ? JSON.stringify(b.config) : (b.config || '{}')
        );
      }
    }

    const created = db.prepare('SELECT * FROM screens WHERE id = ?').get(screenId);
    const createdBlocks = db.prepare('SELECT * FROM screen_blocks WHERE screen_id = ?').all(screenId);

    broadcast('SCREEN_UPDATED', { screenId });
    res.status(201).json({
      ...created,
      blocks: createdBlocks.map(b => ({ ...b, config: b.config ? JSON.parse(b.config) : {} }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/screens/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, orientation, resolution, background_type, background_value, custom_css, is_template, template_name, blocks } = req.body;

    const existing = db.prepare('SELECT * FROM screens WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Screen not found' });

    db.prepare(`
      UPDATE screens
      SET name = ?, description = ?, orientation = ?, resolution = ?, background_type = ?, background_value = ?, custom_css = ?, is_template = ?, template_name = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name !== undefined ? name.trim() : existing.name,
      description !== undefined ? description : existing.description,
      orientation !== undefined ? orientation : existing.orientation,
      resolution !== undefined ? resolution : existing.resolution,
      background_type !== undefined ? background_type : existing.background_type,
      background_value !== undefined ? background_value : existing.background_value,
      custom_css !== undefined ? custom_css : existing.custom_css,
      is_template !== undefined ? (is_template ? 1 : 0) : existing.is_template,
      template_name !== undefined ? template_name : existing.template_name,
      id
    );

    if (Array.isArray(blocks)) {
      db.prepare('DELETE FROM screen_blocks WHERE screen_id = ?').run(id);
      const blockStmt = db.prepare(`
        INSERT INTO screen_blocks (screen_id, type, pos_x, pos_y, width, height, x_percent, y_percent, w_percent, h_percent, config)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const b of blocks) {
        blockStmt.run(
          id,
          b.type || 'calendar_month',
          b.pos_x ?? 0,
          b.pos_y ?? 0,
          b.width ?? 6,
          b.height ?? 6,
          b.x_percent ?? null,
          b.y_percent ?? null,
          b.w_percent ?? null,
          b.h_percent ?? null,
          typeof b.config === 'object' ? JSON.stringify(b.config) : (b.config || '{}')
        );
      }
    }

    const updated = db.prepare('SELECT * FROM screens WHERE id = ?').get(id);
    const updatedBlocks = db.prepare('SELECT * FROM screen_blocks WHERE screen_id = ?').all(id);

    broadcast('SCREEN_UPDATED', { screenId: Number(id) });
    res.json({
      ...updated,
      blocks: updatedBlocks.map(b => ({ ...b, config: b.config ? JSON.parse(b.config) : {} }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/screens/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM screens WHERE id = ?').run(id);
    broadcast('SCREEN_DELETED', { id: Number(id) });
    res.json({ success: true, id: Number(id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====================================================
// IMPORT DAKBOARD .dakexport
// ====================================================
// Accepts either the raw .dakexport file contents (JSON text) or a
// pre-decoded DAKboard screen object.
router.post('/screens/import', (req, res) => {
  try {
    const { data, name } = req.body;
    if (!data) return res.status(400).json({ error: 'No DAKboard export data provided' });

    const parsed = decodeDakexport(data);
    const convertedScreens = convertDakboardBackupToScreens(parsed);

    if (convertedScreens.length === 0) {
      return res.status(400).json({ error: 'No screens found in this DAKboard export' });
    }

    const createdScreens = [];

    for (let i = 0; i < convertedScreens.length; i++) {
      const converted = convertedScreens[i];

      // For multi-screen imports, append the DAKboard screen name
      if (name && name.trim() && convertedScreens.length === 1) {
        converted.name = name.trim();
      } else if (convertedScreens.length > 1) {
        converted.name = `${converted.name}${i + 1}`;
      }

      const stmt = db.prepare(`
        INSERT INTO screens (name, description, orientation, resolution, background_type, background_value, custom_css, is_template, template_name)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, NULL)
      `);
      const result = stmt.run(
        converted.name,
        converted.description,
        converted.orientation,
        converted.resolution,
        converted.background_type,
        converted.background_value,
        converted.custom_css || ''
      );
      const screenId = result.lastInsertRowid;

      const blockStmt = db.prepare(`
        INSERT INTO screen_blocks (screen_id, type, pos_x, pos_y, width, height, x_percent, y_percent, w_percent, h_percent, config)
        VALUES (?, ?, 0, 0, 6, 6, ?, ?, ?, ?, ?)
      `);
      for (const b of converted.blocks) {
        blockStmt.run(
          screenId,
          b.type,
          b.x_percent ?? null,
          b.y_percent ?? null,
          b.w_percent ?? null,
          b.h_percent ?? null,
          JSON.stringify(b.config || {})
        );
      }

      const created = db.prepare('SELECT * FROM screens WHERE id = ?').get(screenId);
      const createdBlocks = db.prepare('SELECT * FROM screen_blocks WHERE screen_id = ?').all(screenId);
      createdScreens.push({
        ...created,
        blocks: createdBlocks.map(b => ({ ...b, config: b.config ? JSON.parse(b.config) : {} }))
      });
    }

    broadcast('SCREEN_UPDATED', { screenId: createdScreens[0]?.id });
    res.status(201).json(convertedScreens.length === 1 ? createdScreens[0] : { screens: createdScreens, count: createdScreens.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====================================================",
// LOOPS CRUD (Sequential Screen Rotators)
// ====================================================
router.get('/loops', (req, res) => {
  try {
    const loops = db.prepare('SELECT * FROM loops ORDER BY id ASC').all();
    res.json(loops.map(l => ({ ...l, screen_ids: l.screen_ids ? JSON.parse(l.screen_ids) : [] })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/loops', (req, res) => {
  try {
    const { name, interval_seconds, screen_ids, pause_on_touch } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Loop name required' });
    const stmt = db.prepare(`
      INSERT INTO loops (name, interval_seconds, screen_ids, pause_on_touch)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(
      name.trim(),
      interval_seconds || 30,
      JSON.stringify(screen_ids || []),
      pause_on_touch ? 1 : 0
    );
    const created = db.prepare('SELECT * FROM loops WHERE id = ?').get(result.lastInsertRowid);
    broadcast('LOOPS_UPDATED', { id: created.id });
    res.status(201).json({ ...created, screen_ids: JSON.parse(created.screen_ids) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/loops/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, interval_seconds, screen_ids, pause_on_touch } = req.body;
    const existing = db.prepare('SELECT * FROM loops WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Loop not found' });

    db.prepare(`
      UPDATE loops SET name = ?, interval_seconds = ?, screen_ids = ?, pause_on_touch = ? WHERE id = ?
    `).run(
      name !== undefined ? name.trim() : existing.name,
      interval_seconds !== undefined ? interval_seconds : existing.interval_seconds,
      screen_ids !== undefined ? JSON.stringify(screen_ids) : existing.screen_ids,
      pause_on_touch !== undefined ? (pause_on_touch ? 1 : 0) : existing.pause_on_touch,
      id
    );

    const updated = db.prepare('SELECT * FROM loops WHERE id = ?').get(id);
    broadcast('LOOPS_UPDATED', { id: Number(id) });
    res.json({ ...updated, screen_ids: JSON.parse(updated.screen_ids) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/loops/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM loops WHERE id = ?').run(req.params.id);
    broadcast('LOOPS_UPDATED', { deletedId: Number(req.params.id) });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====================================================
// SCHEDULES CRUD (Time-Based Automation)
// ====================================================
router.get('/schedules', (req, res) => {
  try {
    const schedules = db.prepare('SELECT * FROM schedules ORDER BY id ASC').all();
    res.json(schedules.map(s => ({ ...s, rules: s.rules ? JSON.parse(s.rules) : [] })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/schedules', (req, res) => {
  try {
    const { name, rules } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Schedule name required' });
    const stmt = db.prepare('INSERT INTO schedules (name, rules) VALUES (?, ?)');
    const result = stmt.run(name.trim(), JSON.stringify(rules || []));
    const created = db.prepare('SELECT * FROM schedules WHERE id = ?').get(result.lastInsertRowid);
    broadcast('SCHEDULES_UPDATED', { id: created.id });
    res.status(201).json({ ...created, rules: JSON.parse(created.rules) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/schedules/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, rules } = req.body;
    const existing = db.prepare('SELECT * FROM schedules WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Schedule not found' });

    db.prepare('UPDATE schedules SET name = ?, rules = ? WHERE id = ?').run(
      name !== undefined ? name.trim() : existing.name,
      rules !== undefined ? JSON.stringify(rules) : existing.rules,
      id
    );

    const updated = db.prepare('SELECT * FROM schedules WHERE id = ?').get(id);
    broadcast('SCHEDULES_UPDATED', { id: Number(id) });
    res.json({ ...updated, rules: JSON.parse(updated.rules) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/schedules/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM schedules WHERE id = ?').run(req.params.id);
    broadcast('SCHEDULES_UPDATED', { deletedId: Number(req.params.id) });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====================================================
// DISPLAYS CRUD (Physical Hardware Endpoints)
// ====================================================
router.get('/displays', (req, res) => {
  try {
    const displays = db.prepare('SELECT * FROM displays ORDER BY id ASC').all();
    res.json(displays);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/displays/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const display = db.prepare('SELECT * FROM displays WHERE slug = ?').get(slug);
    if (!display) return res.status(404).json({ error: 'Display not found' });

    let target = null;
    if (display.assigned_type === 'screen') {
      const screen = db.prepare('SELECT * FROM screens WHERE id = ?').get(display.assigned_id);
      if (screen) {
        const blocks = db.prepare('SELECT * FROM screen_blocks WHERE screen_id = ?').all(screen.id);
        target = { ...screen, blocks: blocks.map(b => ({ ...b, config: b.config ? JSON.parse(b.config) : {} })) };
      }
    } else if (display.assigned_type === 'loop') {
      const loop = db.prepare('SELECT * FROM loops WHERE id = ?').get(display.assigned_id);
      if (loop) {
        target = { ...loop, screen_ids: loop.screen_ids ? JSON.parse(loop.screen_ids) : [] };
      }
    } else if (display.assigned_type === 'schedule') {
      const schedule = db.prepare('SELECT * FROM schedules WHERE id = ?').get(display.assigned_id);
      if (schedule) {
        target = { ...schedule, rules: schedule.rules ? JSON.parse(schedule.rules) : [] };
      }
    }

    res.json({ display, resolvedTarget: target });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/displays', (req, res) => {
  try {
    const { name, slug, assigned_type, assigned_id, client_mode, notes } = req.body;
    if (!name || !slug) return res.status(400).json({ error: 'Name and slug required' });
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-_]/g, '-');

    const stmt = db.prepare(`
      INSERT INTO displays (name, slug, assigned_type, assigned_id, client_mode, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      name.trim(),
      cleanSlug,
      assigned_type || 'screen',
      assigned_id || null,
      client_mode || 'display',
      notes || ''
    );
    const created = db.prepare('SELECT * FROM displays WHERE id = ?').get(result.lastInsertRowid);
    broadcast('DISPLAYS_UPDATED', { slug: created.slug });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/displays/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, assigned_type, assigned_id, client_mode, notes } = req.body;
    const existing = db.prepare('SELECT * FROM displays WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Display not found' });

    db.prepare(`
      UPDATE displays
      SET name = ?, slug = ?, assigned_type = ?, assigned_id = ?, client_mode = ?, notes = ?
      WHERE id = ?
    `).run(
      name !== undefined ? name.trim() : existing.name,
      slug !== undefined ? slug.toLowerCase().replace(/[^a-z0-9-_]/g, '-') : existing.slug,
      assigned_type !== undefined ? assigned_type : existing.assigned_type,
      assigned_id !== undefined ? assigned_id : existing.assigned_id,
      client_mode !== undefined ? client_mode : existing.client_mode,
      notes !== undefined ? notes : existing.notes,
      id
    );

    const updated = db.prepare('SELECT * FROM displays WHERE id = ?').get(id);
    broadcast('DISPLAYS_UPDATED', { slug: updated.slug });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/displays/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM displays WHERE id = ?').run(req.params.id);
    broadcast('DISPLAYS_UPDATED', { deletedId: Number(req.params.id) });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====================================================
// PAIRING CODE & DEVICE HARDWARE LINKING
// ====================================================

// Device requests / refreshes a 4-digit pairing code
router.post('/displays/pair/code', (req, res) => {
  try {
    const { device_token, touch_capable, screen_res } = req.body;
    if (!device_token) return res.status(400).json({ error: 'device_token required' });

    const existingDisplay = db.prepare('SELECT * FROM displays WHERE device_token = ?').get(device_token);
    if (existingDisplay) {
      return res.json({ paired: true, display: existingDisplay });
    }

    db.prepare("DELETE FROM pairing_codes WHERE datetime(expires_at) < datetime('now')").run();

    let record = db.prepare('SELECT * FROM pairing_codes WHERE device_token = ?').get(device_token);
    if (!record) {
      let code;
      let collision = true;
      while (collision) {
        code = Math.floor(1000 + Math.random() * 9000).toString();
        const check = db.prepare('SELECT id FROM pairing_codes WHERE code = ?').get(code);
        if (!check) collision = false;
      }

      const userAgent = req.headers['user-agent'] || '';
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      db.prepare(`
        INSERT OR REPLACE INTO pairing_codes (code, device_token, touch_capable, screen_res, user_agent, expires_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(code, device_token, touch_capable ? 1 : 0, screen_res || '', userAgent, expiresAt);

      record = db.prepare('SELECT * FROM pairing_codes WHERE device_token = ?').get(device_token);
    }

    res.json({
      paired: false,
      code: record.code,
      expires_at: record.expires_at,
      touch_capable: Boolean(record.touch_capable)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Query info for a 4-digit code
router.get('/displays/pair/lookup/:code', (req, res) => {
  try {
    const { code } = req.params;
    const record = db.prepare(`
      SELECT * FROM pairing_codes 
      WHERE code = ? AND datetime(expires_at) >= datetime('now')
    `).get(code.trim());

    if (!record) {
      return res.status(404).json({ error: 'Invalid or expired 4-digit code' });
    }

    res.json({
      code: record.code,
      device_token: record.device_token,
      touch_capable: Boolean(record.touch_capable),
      screen_res: record.screen_res,
      user_agent: record.user_agent,
      expires_at: record.expires_at
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin claims the 4-digit code
router.post('/displays/pair/claim', (req, res) => {
  try {
    const { code, name, assigned_type, assigned_id, client_mode, notes } = req.body;
    if (!code) return res.status(400).json({ error: 'Code is required' });

    const record = db.prepare(`
      SELECT * FROM pairing_codes 
      WHERE code = ? AND datetime(expires_at) >= datetime('now')
    `).get(code.trim());

    if (!record) {
      return res.status(404).json({ error: 'Invalid or expired 4-digit code' });
    }

    const displayName = (name && name.trim()) ? name.trim() : (record.touch_capable ? 'Touch Command Center' : 'Wall Display');
    const slugBase = displayName.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    let slug = slugBase;
    let counter = 1;
    while (db.prepare('SELECT id FROM displays WHERE slug = ?').get(slug)) {
      slug = `${slugBase}-${counter++}`;
    }

    const detectedMode = client_mode || (record.touch_capable ? 'touch' : 'display');

    const stmt = db.prepare(`
      INSERT INTO displays (name, slug, device_token, assigned_type, assigned_id, client_mode, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      displayName,
      slug,
      record.device_token,
      assigned_type || 'screen',
      assigned_id || 1,
      detectedMode,
      notes || `Paired on ${new Date().toLocaleDateString()}`
    );

    db.prepare('DELETE FROM pairing_codes WHERE code = ?').run(code.trim());

    const created = db.prepare('SELECT * FROM displays WHERE id = ?').get(result.lastInsertRowid);

    broadcast('DISPLAY_PAIRED', {
      device_token: record.device_token,
      display: created
    });
    broadcast('DISPLAYS_UPDATED', { slug: created.slug });

    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Device queries status by token
router.get('/displays/device/:token', (req, res) => {
  try {
    const { token } = req.params;
    const display = db.prepare('SELECT * FROM displays WHERE device_token = ?').get(token);
    if (!display) {
      return res.json({ paired: false });
    }

    let target = null;
    if (display.assigned_type === 'screen') {
      const screen = db.prepare('SELECT * FROM screens WHERE id = ?').get(display.assigned_id);
      if (screen) {
        const blocks = db.prepare('SELECT * FROM screen_blocks WHERE screen_id = ?').all(screen.id);
        target = { ...screen, blocks: blocks.map(b => ({ ...b, config: b.config ? JSON.parse(b.config) : {} })) };
      }
    } else if (display.assigned_type === 'loop') {
      const loop = db.prepare('SELECT * FROM loops WHERE id = ?').get(display.assigned_id);
      if (loop) {
        target = { ...loop, screen_ids: loop.screen_ids ? JSON.parse(loop.screen_ids) : [] };
      }
    }

    res.json({
      paired: true,
      display,
      resolvedTarget: target
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/displays/:id/unpair', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM displays WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Display not found' });

    const oldToken = existing.device_token;
    db.prepare('UPDATE displays SET device_token = NULL WHERE id = ?').run(id);

    if (oldToken) {
      broadcast('DISPLAY_UNPAIRED', { device_token: oldToken });
    }
    broadcast('DISPLAYS_UPDATED', { id: Number(id) });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Push/Sync screen to all displays or a specific display immediately
router.post("/screens/:id/push", (req, res) => {
  try {
    const { id } = req.params;
    const { displayId } = req.body || {};
    broadcast("SCREEN_FORCE_SYNC", { screenId: Number(id), displayId: displayId ? Number(displayId) : null });
    broadcast("SCREEN_UPDATED", { screenId: Number(id) });
    res.json({ success: true, message: "Screen synced to displays successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Push/Reload displays
router.post("/displays/reload", (req, res) => {
  try {
    const { slug, displayId } = req.body || {};
    broadcast("DISPLAY_RELOAD", { slug, displayId: displayId ? Number(displayId) : null });
    res.json({ success: true, message: "Displays refreshed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
