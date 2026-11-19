import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const dbPath = path.join(DB_DIR, 'dashboard.sqlite');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS calendar_feeds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      url TEXT,
      color TEXT DEFAULT '#3B82F6',
      enabled INTEGER DEFAULT 1,
      last_fetched TEXT,
      feed_type TEXT DEFAULT 'ical',
      google_calendar_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS google_auth (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      client_id TEXT,
      client_secret TEXT,
      tokens TEXT,
      email TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      all_day INTEGER DEFAULT 0,
      color TEXT DEFAULT '#10B981',
      category TEXT DEFAULT 'Family',
      created_by TEXT DEFAULT 'Touchscreen',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      avatar TEXT DEFAULT '👦',
      color TEXT DEFAULT '#8B5CF6',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      points INTEGER NOT NULL DEFAULT 10,
      member_id INTEGER,
      frequency TEXT DEFAULT 'daily',
      icon TEXT DEFAULT '⭐',
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS chore_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chore_id INTEGER NOT NULL,
      member_id INTEGER NOT NULL,
      points_awarded INTEGER NOT NULL,
      completed_at TEXT NOT NULL,
      week_number TEXT NOT NULL,
      FOREIGN KEY (chore_id) REFERENCES chores(id) ON DELETE CASCADE,
      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS rewards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      cost INTEGER NOT NULL,
      icon TEXT DEFAULT '🎁',
      description TEXT,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS redemptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reward_id INTEGER NOT NULL,
      member_id INTEGER NOT NULL,
      cost INTEGER NOT NULL,
      redeemed_at TEXT NOT NULL,
      week_number TEXT NOT NULL,
      status TEXT DEFAULT 'approved',
      FOREIGN KEY (reward_id) REFERENCES rewards(id) ON DELETE CASCADE,
      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS screens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      orientation TEXT DEFAULT 'landscape',
      resolution TEXT DEFAULT '1080p',
      background_type TEXT DEFAULT 'color',
      background_value TEXT DEFAULT '#090D16',
      custom_css TEXT,
      is_template INTEGER DEFAULT 0,
      template_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS screen_blocks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      screen_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      pos_x INTEGER DEFAULT 0,
      pos_y INTEGER DEFAULT 0,
      width INTEGER DEFAULT 6,
      height INTEGER DEFAULT 6,
      x_percent REAL,
      y_percent REAL,
      w_percent REAL,
      h_percent REAL,
      config TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (screen_id) REFERENCES screens(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS loops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      interval_seconds INTEGER DEFAULT 30,
      screen_ids TEXT DEFAULT '[]',
      pause_on_touch INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      rules TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS displays (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      device_token TEXT UNIQUE,
      assigned_type TEXT DEFAULT 'screen',
      assigned_id INTEGER,
      client_mode TEXT DEFAULT 'display',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pairing_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      device_token TEXT NOT NULL UNIQUE,
      touch_capable INTEGER DEFAULT 0,
      screen_res TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL
    );
  `);

  try {
    const tableInfo = db.prepare("PRAGMA table_info(displays)").all();
    const colNames = tableInfo.map(c => c.name);
    if (!colNames.includes('device_token')) {
      db.exec("ALTER TABLE displays ADD COLUMN device_token TEXT");
      db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_displays_device_token ON displays (device_token) WHERE device_token IS NOT NULL");
    }
  } catch (e) {
    console.error('Migration error on displays table:', e);
  }

  // Migrations for existing tables
  try {
    const tableInfo = db.prepare("PRAGMA table_info(screen_blocks)").all();
    const colNames = tableInfo.map(c => c.name);
    const pctCols = [
      ['x_percent', 'REAL'],
      ['y_percent', 'REAL'],
      ['w_percent', 'REAL'],
      ['h_percent', 'REAL']
    ];
    for (const [col, type] of pctCols) {
      if (!colNames.includes(col)) {
        db.exec(`ALTER TABLE screen_blocks ADD COLUMN ${col} ${type}`);
      }
    }
  } catch (e) {
    console.error('Migration error on screen_blocks:', e);
  }

  seedDefaults();
}

function seedDefaults() {
  const memberCount = db.prepare('SELECT COUNT(*) as count FROM members').get().count;
  if (memberCount === 0) {
    const insertMember = db.prepare('INSERT INTO members (name, avatar, color) VALUES (?, ?, ?)');
    insertMember.run('Alex', '👦', '#3B82F6');
    insertMember.run('Emma', '👧', '#EC4899');
    insertMember.run('Liam', '🧒', '#10B981');
  }

  const choreCount = db.prepare('SELECT COUNT(*) as count FROM chores').get().count;
  if (choreCount === 0) {
    const insertChore = db.prepare('INSERT INTO chores (title, description, points, member_id, frequency, icon) VALUES (?, ?, ?, ?, ?, ?)');
    insertChore.run('Make Bed', 'Neatly arrange sheets and pillows', 10, 1, 'daily', '🛏️');
    insertChore.run('Brush Teeth', 'Morning and night (2 mins)', 5, 1, 'daily', '🪥');
    insertChore.run('Feed the Dog', 'Fill bowl with 1 cup kibble', 15, 2, 'daily', '🐕');
    insertChore.run('Clean Bedroom', 'Put away all toys and clothes', 25, 2, 'weekly', '🧹');
    insertChore.run('Empty Dishwasher', 'Unload silverware and clean plates', 20, 3, 'daily', '🍽️');
    insertChore.run('Take Out Trash', 'Take bin to curb', 20, 3, 'weekly', '🗑️');
  }

  const rewardCount = db.prepare('SELECT COUNT(*) as count FROM rewards').get().count;
  if (rewardCount === 0) {
    const insertReward = db.prepare('INSERT INTO rewards (title, cost, icon, description) VALUES (?, ?, ?, ?)');
    insertReward.run('30m Screen Time', 30, '🎮', '30 minutes of tablet or console gaming');
    insertReward.run('Pick Friday Movie', 50, '🍿', 'Choose movie for family movie night');
    insertReward.run('Choose Dinner Menu', 60, '🍕', 'Pick favorite dinner meal for the family');
    insertReward.run('Ice Cream Trip', 80, '🍦', 'Trip to local ice cream parlor');
    insertReward.run('$5 Allowance Bonus', 100, '💵', 'Added directly to weekly allowance');
  }

  const feedCount = db.prepare('SELECT COUNT(*) as count FROM calendar_feeds').get().count;
  if (feedCount === 0) {
    const insertFeed = db.prepare('INSERT INTO calendar_feeds (name, url, color) VALUES (?, ?, ?)');
    insertFeed.run('US Holidays', 'https://calendar.google.com/calendar/ical/en.usa%23holiday%40group.v.calendar.google.com/public/basic.ics', '#EF4444');
  }

  const screenCount = db.prepare('SELECT COUNT(*) as count FROM screens').get().count;
  if (screenCount === 0) {
    const insertScreen = db.prepare(`
      INSERT INTO screens (name, description, orientation, resolution, background_type, background_value, is_template, template_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const s1 = insertScreen.run('Family HQ Split', 'Side-by-side calendar and chores dashboard', 'landscape', '1080p', 'color', '#090D16', 1, 'family_split');
    const s2 = insertScreen.run('Full Month Calendar', 'Full-screen high contrast calendar grid with agenda', 'landscape', '1080p', 'color', '#0A0F1D', 1, 'full_calendar');
    const s3 = insertScreen.run('Chore & Reward Hub', 'Interactive chore checklists and rewards store', 'landscape', '1080p', 'color', '#091316', 1, 'chores_hub');

    const insertBlock = db.prepare(`
      INSERT INTO screen_blocks (screen_id, type, pos_x, pos_y, width, height, config)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertBlock.run(s1.lastInsertRowid, 'calendar_month', 0, 0, 7, 12, JSON.stringify({ showHeader: true }));
    insertBlock.run(s1.lastInsertRowid, 'chores_tracker', 7, 0, 5, 12, JSON.stringify({ showRewards: true }));

    insertBlock.run(s2.lastInsertRowid, 'calendar_month', 0, 0, 12, 12, JSON.stringify({ showHeader: true }));

    insertBlock.run(s3.lastInsertRowid, 'chores_tracker', 0, 0, 12, 12, JSON.stringify({ showRewards: true, showActivity: true }));
  }

  // Seed the DAKboard "Chalkboard" blank template (runs even on existing DBs)
  const chalkExists = db.prepare("SELECT id FROM screens WHERE template_name = 'chalkboard'").get();
  if (!chalkExists) {
    const chalkCss = "@import url('https://fonts.googleapis.com/css?family=Walter+Turncoat&display=swap');\n#screen-root { font-family: 'Walter Turncoat', cursive; }";
    const res = db.prepare(`
      INSERT INTO screens (name, description, orientation, resolution, background_type, background_value, custom_css, is_template, template_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, 'chalkboard')
    `).run(
      'Chalkboard',
      'Green chalkboard style family calendar (DAKboard template)',
      'landscape',
      '1920x1080',
      'color',
      '#2a9313',
      chalkCss
    );
    const cid = res.lastInsertRowid;

    const ib = db.prepare(`
      INSERT INTO screen_blocks (screen_id, type, pos_x, pos_y, width, height, x_percent, y_percent, w_percent, h_percent, config)
      VALUES (?, ?, 0, 0, 6, 6, ?, ?, ?, ?, ?)
    `);
    ib.run(cid, 'text', 31, 1, 67, 15, JSON.stringify({ text: 'SCHOOL / FAMILY CALENDAR' }));
    ib.run(cid, 'text', 49, 1, 32, 9, JSON.stringify({ text: 'FAMILY CALENDAR' }));
    ib.run(cid, 'clock_weather', 2, 0, 25, 13, JSON.stringify({ showSeconds: true, dateFormat: 'MMMM D' }));
    ib.run(cid, 'calendar_month', 29, 7, 71, 83, JSON.stringify({ feeds: [] }));
    ib.run(cid, 'calendar_agenda', 0, 16, 28, 84, JSON.stringify({ feeds: [], limit: 7 }));
    ib.run(cid, 'dailyfacts', 30, 92, 44, 7, JSON.stringify({}));
  }

  const displayCount = db.prepare('SELECT COUNT(*) as count FROM displays').get().count;
  if (displayCount === 0) {
    const insertDisplay = db.prepare(`
      INSERT INTO displays (name, slug, assigned_type, assigned_id, client_mode, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insertDisplay.run('Raspberry Pi 4 Touch (Command Center)', 'pi4-touch', 'screen', 1, 'touch', 'Elo touchscreen wall unit');
    insertDisplay.run('Raspberry Pi 5 Display (Wall Unit)', 'pi5-wall', 'screen', 1, 'display', 'Passive wall display unit');
  }
}

export default db;
