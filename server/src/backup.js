import db from './db.js';
import fs from 'fs';
import path from 'path';

// All persistent tables (excludes the transient `pairing_codes`).
// Order matters: parents before children for restore inserts.
const TABLES = [
  'members',
  'calendar_feeds',
  'google_auth',
  'events',
  'screens',
  'screen_blocks',
  'loops',
  'schedules',
  'displays',
  'chores',
  'chore_logs',
  'rewards',
  'redemptions'
];

export function exportAllData() {
  const data = {};
  for (const table of TABLES) {
    data[table] = db.prepare(`SELECT * FROM ${table}`).all();
  }
  return {
    app: 'calendarly',
    version: 1,
    exported_at: new Date().toISOString(),
    data
  };
}

// Logical restore groups (for selective restore).
// Each group lists the tables it covers, in parent→child dependency order.
export const GROUPS = {
  screens: ['screens', 'screen_blocks'],
  displays: ['displays'],
  loops: ['loops'],
  schedules: ['schedules'],
  calendar: ['calendar_feeds', 'google_auth'],
  events: ['events'],
  family: ['members', 'chores', 'chore_logs', 'rewards', 'redemptions']
};

export function restoreAllData(backup) {
  return restoreGroups(backup, ['all']);
}

export function restoreGroups(backup, groups) {
  const data = backup && backup.data;
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid backup file: missing "data" object');
  }

  const scope = Array.isArray(groups) && groups.length ? groups : ['all'];

  // Resolve requested groups → ordered table list (parents before children)
  let tables;
  if (scope.includes('all')) {
    tables = [...TABLES];
  } else {
    const collected = new Set();
    for (const g of scope) {
      if (GROUPS[g]) GROUPS[g].forEach(t => collected.add(t));
    }
    tables = [...collected];
  }
  // Keep TABLES' parent→child ordering
  const ordered = TABLES.filter(t => tables.includes(t));
  if (ordered.length === 0) throw new Error('No valid restore groups selected');

  const deleteOrder = [...ordered].reverse(); // children first

  db.pragma('foreign_keys = OFF');
  try {
    const tx = db.transaction(() => {
      for (const table of deleteOrder) {
        if (Object.prototype.hasOwnProperty.call(data, table)) {
          db.prepare(`DELETE FROM ${table}`).run();
        }
      }
      for (const table of ordered) {
        const rows = data[table];
        if (!Array.isArray(rows) || rows.length === 0) continue;
        const cols = Object.keys(rows[0]);
        const placeholders = cols.map(() => '?').join(', ');
        const stmt = db.prepare(`INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`);
        for (const row of rows) {
          stmt.run(...cols.map(c => row[c]));
        }
      }
    });
    tx();
  } finally {
    db.pragma('foreign_keys = ON');
  }
}

export function previewBackup(backup) {
  const data = (backup && backup.data) || {};
  const names = (table, key = 'name') => (Array.isArray(data[table]) ? data[table].map(r => r[key]).filter(Boolean) : []);
  return {
    app: backup.app || null,
    version: backup.version || null,
    exported_at: backup.exported_at || null,
    counts: Object.fromEntries(Object.keys(data).map(t => [t, (data[t] || []).length])),
    summary: {
      screens: names('screens'),
      calendar_feeds: names('calendar_feeds'),
      members: names('members'),
      displays: names('displays'),
      loops: names('loops'),
      schedules: names('schedules'),
      chores: names('chores', 'title'),
      rewards: names('rewards', 'title')
    }
  };
}

const BACKUP_DIR = path.join(process.env.DATA_DIR || path.join(process.cwd(), 'data'), 'backups');

export function writeAutoBackup() {
  try {
    if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const payload = exportAllData();
    const filename = `backup-${new Date().toISOString().slice(0, 10)}.json`;
    const filepath = path.join(BACKUP_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(payload, null, 2));

    // Keep only the most recent 7 auto-backups
    const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.json')).sort();
    while (files.length > 7) {
      fs.unlinkSync(path.join(BACKUP_DIR, files.shift()));
    }
    return filepath;
  } catch (e) {
    console.error('[Backup] auto backup failed:', e.message);
    return null;
  }
}

export function listAutoBackups() {
  try {
    if (!fs.existsSync(BACKUP_DIR)) return [];
    return fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith('.json'))
      .sort()
      .map(f => {
        const st = fs.statSync(path.join(BACKUP_DIR, f));
        return { filename: f, size: st.size, modified: st.mtime.toISOString() };
      });
  } catch (e) {
    return [];
  }
}

export function getAutoBackup(filename) {
  const safe = path.basename(filename);
  const filepath = path.join(BACKUP_DIR, safe);
  if (!fs.existsSync(filepath)) return null;
  return JSON.parse(fs.readFileSync(filepath, 'utf8'));
}
