import { Router } from 'express';
import { exportAllData, restoreGroups, writeAutoBackup, listAutoBackups, getAutoBackup, previewBackup } from '../backup.js';
import { refreshAllFeeds } from '../calendar.js';
import { broadcast } from '../websocket.js';
import { requireAuth } from '../auth.js';

const router = Router();
router.use((req, res, next) => {
  if (req.path === '/backup' || req.path.startsWith('/backup/')) return requireAuth(req, res, next);
  return next();
});

// Full backup download
router.get('/backup', (req, res) => {
  try {
    const data = exportAllData();
    const filename = `calendarly-backup-${new Date().toISOString().slice(0, 10)}.json`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(data, null, 2));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Preview a backup's contents (before restoring)
router.post('/backup/preview', (req, res) => {
  try {
    const backup = req.body && (req.body.backup || req.body);
    res.json(previewBackup(backup));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Restore from uploaded backup JSON (full or selective)
router.post('/backup/restore', async (req, res) => {
  try {
    const { backup, scope } = req.body || {};
    const target = backup || req.body;
    if (!target || !target.data) {
      return res.status(400).json({ error: 'Invalid backup file: missing "data"' });
    }
    restoreGroups(target, scope);
    await refreshAllFeeds();
    broadcast('CALENDAR_SYNCED', { restored: true });
    res.json({ success: true, restoredAt: new Date().toISOString(), scope: scope || ['all'] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List automatic backups
router.get('/backup/auto', (req, res) => {
  try {
    res.json(listAutoBackups());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Trigger an automatic backup now
router.post('/backup/auto/now', (req, res) => {
  try {
    const filepath = writeAutoBackup();
    res.json({ success: true, filepath: filepath || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch a specific automatic backup's full contents (for preview/restore)
router.get('/backup/auto/:filename', (req, res) => {
  try {
    const backup = getAutoBackup(req.params.filename);
    if (!backup) return res.status(404).json({ error: 'Auto backup not found' });
    res.json(backup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Restore from a specific automatic backup file (full or selective)
router.post('/backup/auto/:filename/restore', async (req, res) => {
  try {
    const backup = getAutoBackup(req.params.filename);
    if (!backup) return res.status(404).json({ error: 'Auto backup not found' });
    const scope = (req.body && req.body.scope) || ['all'];
    restoreGroups(backup, scope);
    await refreshAllFeeds();
    broadcast('CALENDAR_SYNCED', { restored: true });
    res.json({ success: true, restoredAt: new Date().toISOString(), scope });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

