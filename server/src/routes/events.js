import { Router } from 'express';
import db from '../db.js';
import { getCachedEvents, refreshAllFeeds, getLastSync } from '../calendar.js';
import { broadcast } from '../websocket.js';
import { requireAuth } from '../auth.js';

const router = Router();

export function getWeekNumber(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

// ----------------------------------------------------
// CALENDAR & EVENTS ROUTES
// ----------------------------------------------------

router.get('/events', (req, res) => {
  try {
    const localEvents = db.prepare("SELECT *, 'local' as source FROM events ORDER BY start_time ASC").all();
    const externalEvents = getCachedEvents();
    
    const unified = [...localEvents, ...externalEvents].sort((a, b) => 
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );

    res.json({
      events: unified,
      lastSync: getLastSync()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/events', (req, res) => {
  try {
    const { title, description, start_time, end_time, all_day, color, category } = req.body;
    if (!title || !start_time) {
      return res.status(400).json({ error: 'Title and Start Time are required' });
    }

    const stmt = db.prepare(`
      INSERT INTO events (title, description, start_time, end_time, all_day, color, category)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      title,
      description || '',
      start_time,
      end_time || start_time,
      all_day ? 1 : 0,
      color || '#10B981',
      category || 'Family'
    );

    const createdEvent = db.prepare("SELECT *, 'local' as source FROM events WHERE id = ?").get(result.lastInsertRowid);
    broadcast('EVENT_CREATED', createdEvent);

    res.status(201).json(createdEvent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/events/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM events WHERE id = ?').run(id);
    broadcast('EVENT_DELETED', { id: Number(id) });
    res.json({ success: true, id: Number(id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// FEEDS CRUD (CREATE, READ, UPDATE, DELETE)
// ----------------------------------------------------

router.get('/feeds', (req, res) => {
  try {
    const feeds = db.prepare('SELECT * FROM calendar_feeds ORDER BY id ASC').all();
    res.json(feeds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/feeds', requireAuth, async (req, res) => {
  try {
    const { name, url, color, feed_type, google_calendar_id } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const type = feed_type || 'ical';
    if (type === 'ical' && !url) {
      return res.status(400).json({ error: 'URL is required for iCal feed' });
    }

    const stmt = db.prepare(`
      INSERT INTO calendar_feeds (name, url, color, enabled, feed_type, google_calendar_id)
      VALUES (?, ?, ?, 1, ?, ?)
    `);
    const result = stmt.run(
      name,
      url || null,
      color || '#3B82F6',
      type,
      google_calendar_id || null
    );
    const newFeed = db.prepare('SELECT * FROM calendar_feeds WHERE id = ?').get(result.lastInsertRowid);

    await refreshAllFeeds();
    broadcast('CALENDAR_SYNCED', { feedsUpdated: true });

    res.status(201).json(newFeed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/feeds/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, url, color, enabled, google_calendar_id, feed_type } = req.body;

    const existing = db.prepare('SELECT * FROM calendar_feeds WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Feed not found' });
    }

    db.prepare(`
      UPDATE calendar_feeds
      SET name = ?,
          url = ?,
          color = ?,
          enabled = ?,
          google_calendar_id = ?,
          feed_type = ?
      WHERE id = ?
    `).run(
      name !== undefined ? name : existing.name,
      url !== undefined ? url : existing.url,
      color !== undefined ? color : existing.color,
      enabled !== undefined ? (enabled ? 1 : 0) : existing.enabled,
      google_calendar_id !== undefined ? google_calendar_id : existing.google_calendar_id,
      feed_type !== undefined ? feed_type : existing.feed_type,
      id
    );

    const updated = db.prepare('SELECT * FROM calendar_feeds WHERE id = ?').get(id);

    await refreshAllFeeds();
    broadcast('CALENDAR_SYNCED', { feedsUpdated: true });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/feeds/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM calendar_feeds WHERE id = ?').run(id);
    await refreshAllFeeds();
    broadcast('CALENDAR_SYNCED', { feedsUpdated: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/feeds/refresh', async (req, res) => {
  try {
    const events = await refreshAllFeeds();
    broadcast('CALENDAR_SYNCED', { count: events.length });
    res.json({ success: true, count: events.length, lastSync: getLastSync() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
