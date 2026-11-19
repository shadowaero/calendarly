import { google } from 'googleapis';
import db from './db.js';

export function getOAuth2Client(redirectUri) {
  const authRecord = db.prepare('SELECT * FROM google_auth WHERE id = 1').get();
  if (!authRecord || !authRecord.client_id || !authRecord.client_secret) {
    return null;
  }
  
  const oauth2Client = new google.auth.OAuth2(
    authRecord.client_id,
    authRecord.client_secret,
    redirectUri
  );

  if (authRecord.tokens) {
    try {
      const tokens = JSON.parse(authRecord.tokens);
      oauth2Client.setCredentials(tokens);

      oauth2Client.on('tokens', (newTokens) => {
        const merged = { ...tokens, ...newTokens };
        db.prepare('UPDATE google_auth SET tokens = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1').run(JSON.stringify(merged));
      });
    } catch (err) {
      console.error('Error parsing stored Google tokens:', err);
    }
  }

  return oauth2Client;
}

export function saveGoogleCredentials(clientId, clientSecret) {
  const existing = db.prepare('SELECT id FROM google_auth WHERE id = 1').get();
  if (existing) {
    db.prepare('UPDATE google_auth SET client_id = ?, client_secret = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1').run(clientId, clientSecret);
  } else {
    db.prepare('INSERT INTO google_auth (id, client_id, client_secret) VALUES (1, ?, ?)').run(clientId, clientSecret);
  }
}

export function saveGoogleTokens(tokens, email = null) {
  db.prepare('UPDATE google_auth SET tokens = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1').run(
    JSON.stringify(tokens),
    email
  );
}

export function getGoogleStatus() {
  const authRecord = db.prepare('SELECT * FROM google_auth WHERE id = 1').get();
  if (!authRecord) {
    return { configured: false, connected: false, email: null };
  }
  const configured = Boolean(authRecord.client_id && authRecord.client_secret);
  let connected = false;
  if (authRecord.tokens) {
    try {
      const parsed = JSON.parse(authRecord.tokens);
      connected = Boolean(parsed.access_token || parsed.refresh_token);
    } catch (e) {}
  }
  return {
    configured,
    connected,
    email: authRecord.email || null,
    clientId: authRecord.client_id || ''
  };
}

export function disconnectGoogle() {
  db.prepare('UPDATE google_auth SET tokens = NULL, email = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = 1').run();
  db.prepare("DELETE FROM calendar_feeds WHERE feed_type = 'google'").run();
}
