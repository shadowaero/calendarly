# Calendarly

A self-hosted, real-time family command center and DAKboard replacement built for containerized deployment on NAS hosts (such as IDX6011 Pro) and multi-device clients (Raspberry Pi 4 with Elo Touchscreen, Raspberry Pi 5 Wall Display, and desktop/mobile browsers).

---

## 🏗️ Architecture & Features

1. **Multi-Feed Calendar Engine:**
   - Aggregates multiple Google Calendars (public or secret iCal URLs) + generic iCal feeds.
   - Background background polling (cron every 15 mins) with in-memory caching for zero UI latency.
   - Live feed management modal in the UI to add/remove feeds and customize color badges.
2. **Interactive Touch Month Grid & Overflow Modal:**
   - Month view optimized for high-contrast visibility.
   - **Overflow Modal:** Days with 3+ events present an expandable chronological modal/drawer.
   - Touchscreen "+" button to create local family events and instantly persist to SQLite.
3. **Chore Economy & Award Redemption Store:**
   - Real-time chore checklists with one-tap completion.
   - Weekly accumulated point totals with automatic week-number tracking (`YYYY-WW`).
   - Award store with point deductions and transaction logs.
4. **Instant Multi-Device Sync:**
   - WebSockets broadcast all actions (event added, chore toggled, reward redeemed) instantly to all connected screens.
5. **Multi-Client View Modes:**
   - **Interactive Touch Center (Pi 4 + Elo Touchscreen):** Full interactive mode (`/`).
   - **Display-Only Wall Unit (Pi 5):** Auto-split calendar + chore dashboard (`/?mode=display`).
   - **Web Browser:** Responsive access from phones, tablets, or PC browsers.

---

## 📁 Project Directory Structure

```
family-dashboard/
├── Dockerfile                   # Multi-stage ARM64/AMD64 Docker build
├── docker-compose.yml           # Compose file with volume mappings
├── server/                      # Node.js backend (Express + better-sqlite3 + node-ical + ws)
│   ├── package.json
│   └── src/
│       ├── index.js             # Main server entry & background cron
│       ├── db.js                # SQLite initialization & default seeds
│       ├── calendar.js          # iCal fetcher, parser & recurrence expander
│       ├── websocket.js         # Real-time WebSocket broadcaster
│       └── routes/
│           ├── events.js        # Calendar events & iCal feeds API
│           └── chores.js        # Chores, members, points & rewards API
├── client/                      # React frontend (Vite + Tailwind CSS + Lucide)
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx              # Main dashboard controller & WS listener
│       ├── index.css
│       └── components/
│           ├── Header.jsx       # Real-time clock & navigation
│           ├── CalendarView.jsx # Touch-friendly month grid
│           ├── CreateEventModal.jsx # Touch event creation form
│           ├── DayOverflowModal.jsx # Scrollable day events modal
│           ├── FeedManagerModal.jsx # iCal feeds manager
│           ├── ChoreRewardDashboard.jsx # Chores list & rewards store
│           └── ChoreRewardModals.jsx   # Chore & Reward creator modals
└── kiosk/
    ├── kiosk.sh                 # Chromium kiosk launch script with Elo flags
    └── kiosk.service            # Systemd service unit for autostart
```

---

## 🚀 Deployment on IDX6011 Pro NAS

1. **Verify Environment:**
   - Path: `/volume1/docker/family-dashboard`
   - Port: `3080`
   - UIDs: `PUID=999`, `PGID=10`, `TZ=America/New_York`

2. **Deploy via Docker Compose:**
   ```bash
   cd /volume1/docker/family-dashboard
   docker compose up -d --build
   ```

3. **Access Dashboard:**
   - **Interactive Browser / Pi 4 Touch:** `http://192.168.76.188:3080/`
   - **Pi 5 Display-Only:** `http://192.168.76.188:3080/?mode=display`

---

## 🖥️ Raspberry Pi Kiosk Setup (Elo Touchscreen & Pi 5)

### 1. Install prerequisites:
```bash
sudo apt-get update
sudo apt-get install -y chromium-browser unclutter xdotool
```

### 2. Configure Kiosk Script (`/home/pi/kiosk.sh`):
Make executable:
```bash
chmod +x /home/pi/kiosk.sh
```

### 3. Chromium Touchscreen Flags Included:
- `--touch-events=enabled` : Enables touch event generation from Elo digitizer.
- `--enable-features=TouchEvents,OverlayScrollbar` : Smoother scrolling and gesture handling.
- `--kiosk` & `--noerrdialogs` : Fullscreen lockdown without popups.
- `--overscroll-history-navigation=0` : Disables accidental swipe back/forward gestures.

### 4. Enable Systemd Autostart:
```bash
sudo cp kiosk/kiosk.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now kiosk.service
```
