import crypto from 'crypto';
import db from './db.js';

// Simple admin auth. Username comes from env; the password defaults to env
// (or 'admin') but can be changed from the admin UI and is stored hashed in DB.
export const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const DEFAULT_PASS = process.env.ADMIN_PASS || 'admin';

const sessions = new Set(); // active session tokens (in-memory)

export const COOKIE_NAME = 'fd_admin';

function computeHash(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function getStoredHash() {
  try {
    const row = db.prepare("SELECT value FROM settings WHERE key = 'admin_password_hash'").get();
    return row ? row.value : null;
  } catch (e) {
    return null;
  }
}

export function verifyCredentials(username, password) {
  if (username !== ADMIN_USER) return false;
  const stored = getStoredHash();
  if (stored && stored.includes(':')) {
    const [salt, hash] = stored.split(':');
    try {
      return computeHash(password, salt) === hash;
    } catch (e) {
      return false;
    }
  }
  return password === DEFAULT_PASS;
}

export function setAdminPassword(newPassword) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = computeHash(newPassword, salt);
  const value = `${salt}:${hash}`;
  const existing = db.prepare("SELECT key FROM settings WHERE key = 'admin_password_hash'").get();
  if (existing) {
    db.prepare("UPDATE settings SET value = ? WHERE key = 'admin_password_hash'").run(value);
  } else {
    db.prepare("INSERT INTO settings (key, value) VALUES ('admin_password_hash', ?)").run(value);
  }
}

export function issueToken() {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.add(token);
  return token;
}

export function revokeToken(token) {
  sessions.delete(token);
}

export function isValidToken(token) {
  return !!token && sessions.has(token);
}

export function getCookie(req, name) {
  const header = req.headers.cookie || '';
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    if (key === name) {
      try { return decodeURIComponent(part.slice(idx + 1).trim()); } catch { return part.slice(idx + 1).trim(); }
    }
  }
  return null;
}

export function requireAuth(req, res, next) {
  const token = getCookie(req, COOKIE_NAME);
  if (isValidToken(token)) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}
