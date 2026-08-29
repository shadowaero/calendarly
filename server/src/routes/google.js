import { Router } from 'express';
import { google } from 'googleapis';
import db from '../db.js';
import { refreshAllFeeds } from '../calendar.js';
import { broadcast } from '../websocket.js';
import { 
  getOAuth2Client, 
  saveGoogleCredentials, 
  saveGoogleTokens, 
  getGoogleStatus, 
  disconnectGoogle 
} from '../googleAuth.js';

const router = Router();

router.get('/google/status', (req, res) => {
  try {
    const status = getGoogleStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/google/config', (req, res) => {
  try {
    const { clientId, clientSecret } = req.body;
    if (!clientId || !clientSecret) {
      return res.status(400).json({ error: 'Client ID and Client Secret are required' });
    }
    saveGoogleCredentials(clientId.trim(), clientSecret.trim());
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/google/auth-url', (req, res) => {
  try {
    const redirectUri = `${req.protocol}://${req.get('host')}/api/google/callback`;
    const oauth2Client = getOAuth2Client(redirectUri);
    if (!oauth2Client) {
      return res.status(400).json({ error: 'Google OAuth not configured. Please enter Client ID & Secret first.' });
    }

    const scopes = [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/userinfo.email'
    ];

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: scopes
    });

    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/google/callback', async (req, res) => {
  try {
    const { code, error } = req.query;
    if (error) {
      return res.redirect('/?google_auth_error=' + encodeURIComponent(error));
    }
    if (!code) {
      return res.redirect('/?google_auth_error=No_code_provided');
    }

    const redirectUri = `${req.protocol}://${req.get('host')}/api/google/callback`;
    const oauth2Client = getOAuth2Client(redirectUri);
    if (!oauth2Client) {
      return res.redirect('/?google_auth_error=OAuth_client_not_configured');
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    let userEmail = null;
    try {
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const userInfo = await oauth2.userinfo.get();
      userEmail = userInfo.data.email || null;
    } catch (e) {
      console.warn('Could not fetch user info:', e.message);
    }

    saveGoogleTokens(tokens, userEmail);
    res.redirect('/?google_auth=success');
  } catch (err) {
    console.error('Google callback error:', err);
    res.redirect('/?google_auth_error=' + encodeURIComponent(err.message));
  }
});

router.get('/google/calendars', async (req, res) => {
  try {
    const oauth2Client = getOAuth2Client();
    if (!oauth2Client) {
      return res.status(400).json({ error: 'Google OAuth not connected' });
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const response = await calendar.calendarList.list();
    const items = response.data.items || [];

    const existingFeeds = db.prepare("SELECT * FROM calendar_feeds WHERE feed_type = 'google'").all();
    const subscribedMap = new Map(existingFeeds.map(f => [f.google_calendar_id, f]));

    const result = items.map(c => {
      const sub = subscribedMap.get(c.id);
      return {
        id: c.id,
        summary: c.summary,
        description: c.description || '',
        backgroundColor: c.backgroundColor || '#4285F4',
        primary: Boolean(c.primary),
        subscribed: Boolean(sub),
        feedId: sub ? sub.id : null,
        enabled: sub ? Boolean(sub.enabled) : false,
        feedColor: sub ? sub.color : (c.backgroundColor || '#4285F4')
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/google/calendars/subscribe', async (req, res) => {
  try {
    const { google_calendar_id, summary, color } = req.body;
    if (!google_calendar_id) {
      return res.status(400).json({ error: 'google_calendar_id is required' });
    }

    const existing = db.prepare("SELECT * FROM calendar_feeds WHERE feed_type = 'google' AND google_calendar_id = ?").get(google_calendar_id);
    if (existing) {
      db.prepare("UPDATE calendar_feeds SET enabled = 1, color = ?, name = ? WHERE id = ?").run(
        color || existing.color,
        summary || existing.name,
        existing.id
      );
    } else {
      db.prepare(`
        INSERT INTO calendar_feeds (name, color, enabled, feed_type, google_calendar_id)
        VALUES (?, ?, 1, 'google', ?)
      `).run(summary || 'Google Calendar', color || '#4285F4', google_calendar_id);
    }

    await refreshAllFeeds();
    broadcast('CALENDAR_SYNCED', { feedsUpdated: true });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/google/calendars/unsubscribe', async (req, res) => {
  try {
    const { google_calendar_id } = req.body;
    db.prepare("DELETE FROM calendar_feeds WHERE feed_type = 'google' AND google_calendar_id = ?").run(google_calendar_id);

    await refreshAllFeeds();
    broadcast('CALENDAR_SYNCED', { feedsUpdated: true });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/google/disconnect', async (req, res) => {
  try {
    disconnectGoogle();
    await refreshAllFeeds();
    broadcast('CALENDAR_SYNCED', { feedsUpdated: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
