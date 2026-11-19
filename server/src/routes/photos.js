import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { requireAuth } from '../auth.js';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
export const PHOTOS_DIR = path.join(DATA_DIR, 'photos');
const INDEX_FILE = path.join(PHOTOS_DIR, 'photos.json');

const ALLOWED = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp'
};

function ensureDir() {
  if (!fs.existsSync(PHOTOS_DIR)) fs.mkdirSync(PHOTOS_DIR, { recursive: true });
}

function readIndex() {
  ensureDir();
  try {
    return JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeIndex(photos) {
  ensureDir();
  fs.writeFileSync(INDEX_FILE, JSON.stringify(photos, null, 2));
}

const router = Router();
router.use((req, res, next) => {
  if (req.path !== '/photos' && !req.path.startsWith('/photos/')) return next();
  return req.method === 'GET' ? next() : requireAuth(req, res, next);
});

router.get('/photos', (req, res) => {
  res.json(readIndex());
});

router.post('/photos', (req, res) => {
  try {
    const { filename, mimeType, data } = req.body || {};
    if (!data) return res.status(400).json({ error: 'No photo data provided' });

    const ext = ALLOWED[mimeType];
    if (!ext) return res.status(400).json({ error: 'Unsupported image type (use JPG, PNG, GIF, or WebP)' });

    const buf = Buffer.from(data, 'base64');
    if (buf.length === 0) return res.status(400).json({ error: 'Invalid image data' });
    if (buf.length > 20 * 1024 * 1024) return res.status(400).json({ error: 'Photo too large (max 20MB)' });

    ensureDir();
    const id = Date.now().toString(36) + crypto.randomBytes(3).toString('hex');
    const name = `${id}.${ext}`;
    fs.writeFileSync(path.join(PHOTOS_DIR, name), buf);

    const photos = readIndex();
    const photo = {
      id,
      filename: name,
      originalName: filename || name,
      mimeType,
      size: buf.length,
      uploadedAt: new Date().toISOString(),
      url: `/photos/${name}`
    };
    photos.unshift(photo);
    writeIndex(photos);
    res.status(201).json(photo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/photos/:id', (req, res) => {
  const photos = readIndex();
  const photo = photos.find((p) => p.id === req.params.id || p.filename === req.params.id);
  if (!photo) return res.status(404).json({ error: 'Photo not found' });

  try {
    const filePath = path.join(PHOTOS_DIR, photo.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (e) {
    console.error('Failed to delete photo file:', e.message);
  }

  writeIndex(photos.filter((p) => p.id !== photo.id));
  res.json({ ok: true });
});

export default router;
