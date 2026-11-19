import { Router } from 'express';
import { verifyCredentials, issueToken, revokeToken, getCookie, COOKIE_NAME, isValidToken, setAdminPassword, requireAuth, ADMIN_USER } from '../auth.js';

const router = Router();

router.post('/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (verifyCredentials(username || '', password || '')) {
    const token = issueToken();
    res.cookie(COOKIE_NAME, token, { httpOnly: true, sameSite: 'lax', maxAge: 30 * 24 * 3600 * 1000 });
    return res.json({ authenticated: true, username });
  }
  res.status(401).json({ error: 'Invalid username or password' });
});

router.post('/auth/logout', (req, res) => {
  const token = getCookie(req, COOKIE_NAME);
  if (token) revokeToken(token);
  res.clearCookie(COOKIE_NAME);
  res.json({ authenticated: false });
});

router.get('/auth/status', (req, res) => {
  const token = getCookie(req, COOKIE_NAME);
  res.json({ authenticated: isValidToken(token) });
});

router.post('/auth/password', requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!newPassword || String(newPassword).length < 4) {
    return res.status(400).json({ error: 'New password must be at least 4 characters' });
  }
  if (!verifyCredentials(ADMIN_USER, currentPassword || '')) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }
  setAdminPassword(String(newPassword));
  res.json({ success: true });
});

export default router;
