import ical from 'node-ical';
import { google } from 'googleapis';
import db from './db.js';
import { getOAuth2Client } from './googleAuth.js';

let cachedEvents = [];
let lastSyncTimestamp = null;

function normalizeIcalEvent(ev, feed) {
  if (ev.type !== 'VEVENT') return null;

  const start = ev.start ? new Date(ev.start).toISOString() : new Date().toISOString();
  let end = ev.end ? new Date(ev.end).toISOString() : start;
  const allDay = ev.datetype === 'date' || (ev.start && !ev.start.getHours && !ev.start.getMinutes);

  return {
    id: `ical_${feed.id}_${ev.uid || Math.random().toString(36).substr(2, 9)}`,
    title: ev.summary || 'Untitled Event',
    description: ev.description || '',
    start_time: start,
    end_time: end,
    all_day: allDay ? 1 : 0,
    color: feed.color || '#3B82F6',
    category: feed.name || 'External Calendar',
    source: feed.feed_type || 'ical',
    feed_id: feed.id
  };
}

export async function fetchGoogleCalendarFeed(feed) {
  try {
    const auth = getOAuth2Client();
    if (!auth) {
      console.warn(`[Google Calendar] OAuth client not configured for feed ${feed.name}`);
      return [];
    }

    const calendar = google.calendar({ version: 'v3', auth });
    const now = new Date();
    const timeMin = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString();
    const timeMax = new Date(now.getFullYear(), now.getMonth() + 6, 1).toISOString();

    const response = await calendar.events.list({
      calendarId: feed.google_calendar_id || 'primary',
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 2500
    });

    const items = response.data.items || [];
    const parsed = items.map(item => {
      const isAllDay = Boolean(item.start?.date);
      const start = item.start?.dateTime || (item.start?.date ? `${item.start.date}T00:00:00.000Z` : new Date().toISOString());
      const end = item.end?.dateTime || (item.end?.date ? `${item.end.date}T23:59:59.000Z` : start);

      return {
        id: `gcal_${feed.id}_${item.id}`,
        title: item.summary || 'Untitled Event',
        description: item.description || '',
        start_time: start,
        end_time: end,
        all_day: isAllDay ? 1 : 0,
        color: feed.color || '#4285F4',
        category: feed.name || 'Google Calendar',
        source: 'google',
        feed_id: feed.id
      };
    });

    db.prepare('UPDATE calendar_feeds SET last_fetched = ? WHERE id = ?').run(
      new Date().toISOString(),
      feed.id
    );

    return parsed;
  } catch (error) {
    console.error(`Error fetching Google feed ${feed.name} (${feed.google_calendar_id}):`, error.message);
    return [];
  }
}

export async function fetchFeed(feed) {
  if (feed.feed_type === 'google') {
    return await fetchGoogleCalendarFeed(feed);
  }

  try {
    if (!feed.url) return [];
    const rawEvents = await ical.async.fromURL(feed.url);
    const parsed = [];
    const now = new Date();
    const pastLimit = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const futureLimit = new Date(now.getFullYear(), now.getMonth() + 6, 1);

    for (const k in rawEvents) {
      if (rawEvents.hasOwnProperty(k)) {
        const ev = rawEvents[k];
        if (ev.type === 'VEVENT') {
          if (ev.rrule) {
            try {
              const dates = ev.rrule.between(pastLimit, futureLimit);
              const duration = ev.end ? (ev.end.getTime() - ev.start.getTime()) : 0;
              for (const d of dates) {
                const recurrenceStart = new Date(d);
                const recurrenceEnd = new Date(d.getTime() + duration);
                parsed.push({
                  id: `ical_${feed.id}_${ev.uid}_${recurrenceStart.toISOString()}`,
                  title: ev.summary || 'Untitled Event',
                  description: ev.description || '',
                  start_time: recurrenceStart.toISOString(),
                  end_time: recurrenceEnd.toISOString(),
                  all_day: (ev.datetype === 'date') ? 1 : 0,
                  color: feed.color || '#3B82F6',
                  category: feed.name,
                  source: 'ical',
                  feed_id: feed.id
                });
              }
              continue;
            } catch (err) {
              // ignore
            }
          }

          const norm = normalizeIcalEvent(ev, feed);
          if (norm) {
            const evDate = new Date(norm.start_time);
            if (evDate >= pastLimit && evDate <= futureLimit) {
              parsed.push(norm);
            }
          }
        }
      }
    }

    db.prepare('UPDATE calendar_feeds SET last_fetched = ? WHERE id = ?').run(
      new Date().toISOString(),
      feed.id
    );

    return parsed;
  } catch (error) {
    console.error(`Error fetching feed ${feed.name} (${feed.url}):`, error.message);
    return [];
  }
}

export async function refreshAllFeeds() {
  const feeds = db.prepare('SELECT * FROM calendar_feeds WHERE enabled = 1').all();
  let allEvents = [];

  for (const feed of feeds) {
    const events = await fetchFeed(feed);
    allEvents = allEvents.concat(events);
  }

  cachedEvents = allEvents;
  lastSyncTimestamp = new Date().toISOString();
  console.log(`[Calendar Service] Cached ${cachedEvents.length} external events at ${lastSyncTimestamp}`);
  return cachedEvents;
}

export function getCachedEvents() {
  return cachedEvents;
}

export function getLastSync() {
  return lastSyncTimestamp;
}
