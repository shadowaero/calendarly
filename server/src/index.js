import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { CronJob } from 'cron';
import { initDatabase } from './db.js';
import { refreshAllFeeds } from './calendar.js';
import { initWebSocketServer } from './websocket.js';
import eventsRouter from './routes/events.js';
import choresRouter from './routes/chores.js';
import googleRouter from './routes/google.js';
import screensRouter from './routes/screens.js';
import backupRouter from './routes/backup.js';
import weatherRouter from './routes/weather.js';
import photosRouter, { PHOTOS_DIR } from './routes/photos.js';
import authRouter from './routes/auth.js';
import aiRouter from './routes/ai.js';
import { writeAutoBackup } from './backup.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

// Initialize Database
initDatabase();

// WebSocket server
initWebSocketServer(server);

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));

// API Routes
app.use('/api', eventsRouter);
app.use('/api', choresRouter);
app.use('/api', googleRouter);
app.use('/api', screensRouter);
app.use('/api', backupRouter);
app.use('/api', weatherRouter);
app.use('/api', photosRouter);
app.use('/api', authRouter);
app.use('/api', aiRouter);

// Serve uploaded photos (persisted in DATA_DIR/photos)
app.use('/photos', express.static(PHOTOS_DIR));

// Weather & System status proxy helper (optional external widget data)
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    systemTime: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Serve static frontend build in production
const clientBuildPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientBuildPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Schedule background iCal feed polling (Every 15 minutes)
const feedCron = new CronJob('*/15 * * * *', async () => {
  console.log('[Cron] Refreshing calendar feeds...');
  try {
    await refreshAllFeeds();
  } catch (e) {
    console.error('[Cron] Calendar refresh failed:', e.message);
  }
});
feedCron.start();

// Daily automatic backup (at 3:00 AM)
const backupCron = new CronJob('0 3 * * *', () => {
  console.log('[Cron] Writing daily automatic backup...');
  writeAutoBackup();
});
backupCron.start();

// Initial iCal fetch on boot
refreshAllFeeds().catch(err => console.error('Initial feed fetch error:', err));

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Calendarly Server running at http://0.0.0.0:${PORT}`);
});
