# Calendarly

A self-hosted, real-time family command center and DAKboard replacement built for containerized deployment on NAS hosts (such as IDX6011 Pro) and multi-device clients (Raspberry Pi 4 with Elo Touchscreen, Raspberry Pi 5 Wall Display, and desktop/mobile browsers).


## 🛠️ Kiosk Patch State (ws6z) — live devices vs. this source

The deployed devices run **downstream, patched copies** of this repo:

| Deploy target | What runs | Patch entry point |
|---|---|---|
| **Pi 4 kiosk** (`ssh pi4kiosk`) | patched dist at `/opt/calendarly/client/dist` + SQLite at `/opt/calendarly/data` | `fdw-apply-radar-widgets.cjs` + `fdw-apply-wxgui.cjs` + `fdw-apply-eventedit.cjs` in `wave4/fd_weather/` (+ server `fdw-event-put.cjs`) |
| **NAS** (`ShadowAero@192.168.76.188`) | patched dist inside docker container `family-dashboard` (`/app/client/dist`) | `fdw-apply-radar-nas.cjs` (marker-free variant) + `fdw-apply-eventedit.cjs` (+ server `fdw-event-put.cjs`, requireAuth-gated) |
| **Public** (`https://calendar.examininglife.com`) | **same as the Pi 4 kiosk** — authentik SSO in front; nginx-proxy-manager (NAS) host 104 forwards to `http://192.168.76.36:3000` | re-pointed 2026-11-19; cache-hardened same day (`location ^~ /assets/` + `no-store`, shell token `?v=ws6zy` after the 2026-11-19 rvT32 COD-HRRR radar fork (page token chain rides one line: rvT31 eventedit wave finished its chain at ws6zx) (v1 ws6zt → shadowed-prop fix ws6zu → timezone fix ws6zv → live-refresh listener ws6zx, all same evening); token chain ws6z → ws6zp → ws6zq → ws6zr → ws6zs → ws6zt → ws6zu → ws6zv → ws6zx → ws6zy); rollback = `104.conf.bak-cal-pi-20261119` / `104.conf.bak-nostore-20261119` inside the NPM container; if the NPM dashboard regenerates host 104, re-ship + run `tmp/cal-nostore.sh` |

- All kiosk-side code changes (weather kit, radar comps, zoom caps, `jsVer=ws6z`) live in **`wave4/fd_weather/`** — **see [`wave4/fd_weather/DEPLOY-NOTES.md`](wave4/fd_weather/DEPLOY-NOTES.md) for the authoritative status, exact baselines, rollback recipes and verify scripts**. This README documents the pristine source, not the deployed state.
- ⚠️ **Rebuilding `client/dist` from this source produces a fresh, unpatched bundle** (the patches live outside `client/src`). After any rebuild you must re-run the patchers — Pi pair then NAS variant — before those devices reflect the new build.
- 🛰 **rvT32 COD-HRRR future-radar fork (jsVer=ws6zy, 2026-11-19, same day as rvT31)**: while RainViewer's free `radar.nowcast` is empty, the radar deck appends **guaranteed future radar** — College of DuPage NEXLAB HRRR simulated-reflectivity (simulated radar / REFC) frames for the region sector containing the block's lat/lon (hourly model runs, first ≤3 frames still ≥10 min in the future, drawn as ~28 lat-linear→Web-Mercator bands; `FCST +1.5h`-style hourly labels). RainViewer nowcast frames always win when the free API serves them. Comp = `rw-rainview-comp.js` rvT32 edits; shipped + verified on both targets (Pi 565604→570481 B, NAS 450175→455052 B); story in DEPLOY-NOTES.
- 📡 **rvT30 radar cards (jsVer=ws6zs, 2026-11-19)** play the last ~30 min of radar history plus RainViewer’s nowcast FORWARD-only (oldest → now → forecast, then wrap); future frames wear a cyan FCST +Nm badge. RainViewer’s free public API only forecasts radar ~+30 min — 2 h of radar forecast does not exist on this source. Applied to both deploy targets via the patchers (jsVer ws6z → ws6zs; nowcast-empty fallback widens past to ~50 min).
- 🔐 **Never curl the public site's `/assets/*.js` URLs anonymously** unless the `no-store` hardening is live — pre-fix probes made Cloudflare cache authentik 302s under those URLs (symptom: `Widget: weather_gui` fallback; full story in the DEPLOY-NOTES "Public URL cache poisoning" record). Post-hardening, anonymous probes are safe (`cf-cache-status: BYPASS`).
- 🗓️ **Calendar event-edit kit (token ws6zx, 2026-11-19)**: local events get a ✎ edit button in the day list (next to 🗑 delete); it re-opens "Add Family Event" as "Edit Family Event" prefilled and saves via a new server `PUT /api/events/:id` (partial-update-safe, existing-field fallbacks, broadcasts `EVENT_UPDATED`; v3 makes the time inputs timezone-correct — prefilled in local time from the stored UTC and saved back as true UTC, fixing the long-standing wall-clock shift on hand-added timed events; v4 adds `EVENT_UPDATED` to the WebSocket auto-refresh list so every connected screen updates instantly after a save — previously the app ignored that broadcast type, so rows could look stale until the next natural refetch). Server patcher `wave4/fd_weather/fdw-event-put.cjs` (Pi variant open/ungated to match its kiosk touch-parity; NAS variant `requireAuth`-gated with POST/DELETE). Client patcher `fdw-apply-eventedit.cjs` (six guarded anchored edits, in-place, keeps radar/wxGUI/ws kits intact; bumps `?v=ws6zt` in index.html). Verify: `~/fdwship/verify-eventedit.sh` on the Pi (16 checks incl. live PUT round-trip). Rollback: `*.bak-eventput` (events.js) and `*.bak-eventedit` (bundle + index.html) on both targets.


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
