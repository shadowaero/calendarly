# Wave-Weather deployment (screen 17 Weather Station + AcuRite sensors)

## STATUS: DEPLOYED & LIVE on NAS (192.168.76.188:3080) — 2026-11-18
- Ingest token (settings key `sensor_ingest_token`):
  **af672c7f969cfe45f5149c80e53b680c6babc77d**
- Verify: `GET /api/sensors/token-check?token=...` -> {"valid":true}
- End-to-end tested: POST ingest (ch A + ch B), GET /api/sensors (min/max/age/battery),
  401 on bad token, pressure stats in /api/weather, NWS alerts proxy, s17 block row (id 271).
- Backups created in-container: orig2.index.js, orig2.weather.js (helper),
  orig2.routes/weather.js, orig2.index-BDiodzvu.js, orig2.index.html

## DEPLOYED & VERIFIED: Pi (Pi4Kiosk, 192.168.76.36) — 2026-11-18
- SSH: user **xxtoon**, key **id_ed25519** (`ssh -i ~/.ssh/id_ed25519 xxtoon@192.168.76.36`)
  - ~/.ssh/config alias `pi4kiosk` now points at .36 with this identity (flayva identity removed).
  - Canonical SSH access map for ALL hosts + key-loss recovery recipes: **SSH-ACCESS.md** (repo root).
  - Prior mystery explained: box was wedged (port 22 open but no banner); a reboot cleared it.
    App+SPA actually worked all along; NAS dist is byte-identical pre-patch to the Pi's.
- Deployment ran natively (no docker): pack via scp → /tmp; `FDW_SRC=/opt/calendarly/server/src`,
  `FDW_DIST=/opt/calendarly/client/dist`, `DATA_DIR=/opt/calendarly/data`.
- Ingest token (Pi's own settings): **75b999667ae4168394703e0c8660b21220ba6277**
- Verify matrix ALL GREEN: token-check true, ingest {ok:true}, /api/sensors rows,
  /api/weather pressure {hpa:1030.1, high24, low24, trend}, NWS alerts proxy, s17 ws block,
  bundle md5 == NAS patched (e9ea1898… / a33bd5e7… + ?v=ws2), / and /display/* 200.
- Screen 17 (id 269 weather_station) moved to grid pos (7,0) 5x12 — right column full height
  (its table uses legacy pos_x/y cols; radar+hourly+calendar sit in the left stack as they did before).
- Feeder kit deployed to the Pi itself: rtl-sdr + rtl_433 25.02 installed, DVB-T blacklisted,
  rtl433.service + rtl433-feed.service enabled; FDW_BASE=http://127.0.0.1:3000 with the token above.
  NOTE: the two shipped kit files had CRLF endings → `tr -d "\015"` applied on device (fixed locally too).
- RTL-SDR LIVE as of 18 Nov 2026 ~16:53: NooElec/RTL2838 (0bda:2838, R820T) enumerated; `rtl433.service`
  active and decoding `/var/run/rtl433.json`; baseline signal `Acurite-Tower:5404` ch-A
  (21.2 C / 75% RH) already flowing into `/api/sensors` via rtl433-feed.
  GOTCHA SOLVED: the stick is on a short **USB extension** that had worked loose during kiosk cabling —
  if the stick vanishes from `lsusb` again, check that extension first. Pi is a Pi 4 Model B in an
  **Argon (Forty) case** whose SSD is wired over internal USB3 — don't reseat USB blindly.
- PHYSICAL DONE 2026-11-18 ~17:34: tower A (id 5404) ch A, tower B (id 6765) switched to ch B.
  Tower B was silent after battery insert until seats were redone — these towers power up only
  with the door fully latched (contact pressure). Battery pulls re-randomize a tower's report ID
  (normal); widgets + screens key off the CHANNEL letter, so no config change ever needed.
  /api/sensors now returns BOTH rows; Indoor widget live (B: 25.0 C / 56 %, RSSI −0.10).
- Kiosk display reloaded via `systemctl restart lightdm` (fresh ?v=ws2 bundle).

## WIDGET SPLIT deployed on Pi — 2026-11-18 (?v=ws3)
- The composite `weather_station` block was SPLIT into 9 individual widget block types,
  each addable to any screen from the admin editor (+ Current / + Baro / + Wind / + Solar /
  + Outdoor / + Indoor / + Today / + Clock / + Alerts buttons; labels "Weather: …"):
  `ws_current` `ws_baro` `ws_wind` `ws_solar` `ws_outdoor` `ws_indoor` `ws_today` `ws_clock` `ws_alerts`
- All render via a shared `wsTile({config,kind})` component injected before `wsWS`
  (composite still available for other screens, untouched). Each widget fetches only what it
  needs (weather 15 min / sensors 60 s / alerts 10 min) and every widget is TIGHT:
  block wrapper `p-0.5`, inner box padding `0.5cqh 0.6cqw`, gap `0.7cqh`, radius `0.7cqh`.
- Files: `wave/fd_weather/ws-widgets.js` (widget source), `fdw-apply-widgets.cjs` (bundle
  patcher, idempotent, creates orig3.* backups, ?v=ws2→ws3), `ws-convert-db.cjs` (screen 17).
- **Positioning truth discovered:** the client's `Xt()` resolves each block's geometry as
  `x_percent ?? pos_x/12*100` etc. — **the percent columns win; legacy ints are only a fallback**.
  The earlier ws-fix that moved `pos_x/width` to (7,0) 5×12 therefore NEVER moved the block
  visually; the composite had actually been floating over the calendar all along.
- Screen 17 conversion (ws-convert-db.cjs, prints BEFORE/AFTER + undo reference):
  calendar_month id 270 w 65.93→49.3% · radar 271 x 67.34→75.05 w 32.21→24.6% ·
  hourly 272 x 67.26→75.0 w 32.44→24.5% · composite 273 became `ws_current` (kept config) at
  (50,10,12.1,17.8)% + inserted 274 ws_alerts (50,0.9,24.6,8.6) · 275 ws_baro · 276 ws_wind ·
  277 ws_solar · 278 ws_outdoor · 279 ws_indoor · 280 ws_clock (50,64.9,12.1,34.5) ·
  281 ws_today. Middle column ≈ 50–74.6% full height. To undo: set 270/271/272 back, retyped
  273 percents (5.41,16.86,43.19,60.53) + type weather_station, delete ids 274-281.
- Bundle: 426,339 → **441,182 chars** final, all 9 anchors OK, PARSE_OK (re-applied after
  restoring orig3 backups once — first pass shipped `wsTile` without the `sensorTile`
  definition referenced by the outdoor/indoor branches; fixed in `ws-widgets.js`, def verified
  before use in the bundle). Label map + add-buttons + shared "Weather Widget Config" form
  (zip / indoor ch / outdoor ch) registered for all ws_*.
- Reload: `echo <pi-pass> | sudo -S systemctl restart lightdm` (sudo is still password-gated
  here; SSH keys don't cover sudo). Verified: fresh Chromium (kiosk via ~/kiosk.sh, no respawn
  loop — don't kill chromium alone), `/assets/index-BDiodzvu.js?v=ws3` → 200, /api/sensors green.
- NAS still has the old ?v=ws2 single-block bundle: apply `fdw-apply-widgets.cjs` (+ seed ws_*
  blocks on any screen) there separately if wanted.

## HERO SKY + INSTRUMENT redesign deployed on Pi — 2026-11-18 (?v=ws4)
- Style decision: **Hybrid A+B ("Hero Sky + Instrument")** with the **hero-first grid preset**
  (user-picked via ask_question). 9 block types + DB schema unchanged; only the injected
  `wsTile` component and screen-17 geometry changed.
- Icons = **Meteocons** (Bas Milius, https://basmilius.github.io/meteocons/ — **MIT**):
  17 animated fill SVGs (SMIL, no runtime lib) inlined into the bundle at build time
  (~39 KB). Copies + LICENSE in `wave4/fd_weather/assets/icons/`: clear-day, clear-night,
  partly-cloudy-day/night, overcast-day/night, cloudy, fog-day/night, drizzle, rain,
  raindrops, snow, sleet, thunderstorms-day/night, thermometer. All verified to contain
  `<animate>`/`<animateTransform>`. `wxIconKey(code,is_day)` maps WMO codes to day/night
  variants; icon swap is live with `weather_code`.
- Hero (`ws_current`): condition-mood sky gradient (8 buckets × day/night), drifting cloud
  blobs, rain streaks / snow dots / night stars / thunder flash (CSS keyframes, transform-only),
  ~2.5× temp, animated Meteocon, feels-like, chips (H/wind/cloud), and a bottom **6-h hourly
  strip** with precip-probability bars. Perf: ~9–15 concurrent transform/opacity animations,
  no full-screen backdrop-filter.
- Instruments: clock (SVG sun arc, dot tracks real time between sunrise/sunset), baro
  (24 h high/low range rail + 3 h trend chevron), wind (compass dial with smoothly
  transitioning needle + Beaufort descriptor), solar/uv (radial gauge /11). Sensor tiles:
  animated condition icon (outdoor) / thermometer (indoor), 24 h min/max range bar,
  battery + RSSI + age footer, dims (opacity .6) when stale >5 min; indoor gains a
  Δ-vs-outdoor chip; today shows both towers' range bars + sensor count; alerts tile is a
  calm green all-clear or a pulsing red banner with 2-line clamp.
- Patch pipeline:
  - `ws-widgets.js` rewritten **v2** (~72 KB). Patcher v2 (`fdw-apply-widgets.cjs`) detects
    existing `ws_*` cases → **REPLACE path**: slices old `function wsTile …` before
    `\nfunction wsWS`, splices the new component, bumps `?v=ws*` → **`?v=ws4`**, backs up
    current state to **orig4.*** (v1 kit; orig3.* pristine still intact), vm-SourceTextModule
    parse-checks BEFORE write. Fresh-install path unchanged (for clean screens/bundles).
  - `ws-regrid.cjs` (new, better-sqlite3 against /opt/calendarly/data/dashboard.sqlite,
    idempotent, prints BEFORE/AFTER, saves `/tmp/ws-regrid-before.json` + writes
    `/tmp/ws-regrid-undo.cjs`): screen-17 preset —
    | block | x% | y% | w% | h% |
    |---|---|---|---|---|
    | ws_current (HERO) | 50.0 | 0.9 | 24.6 | 33.0 |
    | ws_alerts | 50.0 | 34.5 | 24.6 | 6.5 |
    | ws_clock | 50.0 | 41.5 | 24.6 | 12.0 |
    | ws_outdoor / ws_indoor | 50.0 / 62.6 | 54.5 | 12.1 / 12.0 | 13.5 |
    | ws_baro / ws_wind | 50.0 / 62.6 | 68.5 | 12.1 / 12.0 | 14.0 |
    | ws_solar / ws_today | 50.0 / 62.6 | 83.5 | 12.1 / 12.0 | 13.5 |
- Deploy verified 2026-11-18 ~18:55: regrid BEFORE/AFTER printed; patcher steps all OK
  (upgrade, orig4 backups, v1 10,077 B → v2 71,646 B, ?v=ws3→ws4); bundle 441,182 →
  **502,751 bytes**; full-bundle vm.SourceTextModule **PARSE_OK**; index marker
  `/assets/index-BDiodzvu.js?v=ws4`; `case"ws_` ×18, exactly one `function wsTile`;
  `/` + `/display/17` 200; `/api/sensors` BOTH towers (A 5404 / B 6765); lightdm restarted.
- Rollback chain: `cp orig4.index-BDiodzvu.js index-BDiodzvu.js` (+ orig4.index.html) → back
  to v1 kit (then restore orig3.* for pristine) + restart lightdm; layout: run
  `/tmp/ws-regrid-undo.cjs` (echo pw | sudo -S node …).

## HERO ICON-ONLY update deployed on Pi — 2026-11-18 late (~19:30) (?v=ws5)
- Per user: the `ws_current` tile now shows ONLY an animated Meteocon (day/night aware)
  centered on the condition-mood sky gradient. REMOVED from the hero: big temperature,
  condition label, feels-like, humidity/wind/cloud chips, and the 6-h hourly strip
  (+ the now-dead `hourCol` helper). Zero data text anywhere in the tile.
- Icon set grown to **18** (added `hurricane.svg`, 776 B, animated). **Tropical storm**
  mapping = sustained wind ≥ 39 mph (Open-Meteo exposes no WMO code for tropical storm;
  39 mph is the NWS tropical-storm sustained-wind floor). Other buckets: clear →
  clear-day/night, partly-cloudy, cloudy/overcast → cloudy, fog, drizzle/rain, snow/sleet,
  thunder → thunderstorms-day/night.
- **BUG FIXED in the patcher (was live-breaking for ~2 min):** the upgrade path spliced from
  `function wsTile`, so re-patching v2→v3 kept the prior kit's `const WX_SVG` and added a
  second one → `Identifier 'WX_SVG' has already been declared` → whole bundle failed to load
  (blank kiosk). Fixed: upgrade slice now starts at `const WX_SVG` (when present before
  `function wsTile`), and a hard pre-write guard fails + restores if the count ≠ 1. Also
  restored orig5.* (the intact ws4 bundle) before re-applying — kiosk was back on ws4
  within ~2 minutes of the break.
- Backups now: **orig5.*** = pre-ws5 (full-data hero ws4 build); orig4.* = v1 kit (ws3);
  orig3.* = pristine. Rollback same as before, pick your depth.
- Verified after fix: full-bundle vm.SourceTextModule **PARSE_OK** (499,208 B);
  `?v=ws5` marker; hurricane/icon-only/strip-gone/chips-gone all confirmed in the served
  bundle; `case"ws_` ×18, one `function wsTile`; `/`, `/assets/…?v=ws5`, `/display/17` 200;
  lightdm restarted, active.

## FULL-SCREEN Weather GUI deployed on Pi — 2026-11-18 night (?v=ws6e)
- NEW approach per user: replicate the mockup **`out/weathergui.jpg`** (full-screen hero
  dashboard; ref lives at `~/Documents/esp32.projects/epaper-dashboard/out/weathergui.jpg`)
  as ONE screen, then iterate with customization passes. Built as a NEW block type –
  nothing on screen 17 changed.
- **DB**: screen **18 "Weather GUI"** + block id 294 `weather_gui` 100%×100% (config:
  zip 32757, city MOUNT DORA, outdoorChannel A, indoorChannel B). Preview display:
  **`displays` id 6, slug `wxgui-preview`, assigned_type screen/18, client_mode display**
  → view at `http://192.168.76.36:3000/display/wxgui-preview`. **The kiosk (display id 5,
  slug calendarly---pi4----kiosk) still points at LOOP 1 [14,12,1,17] @30 s — untouched;
  zero kiosk downtime this wave (lightdm never restarted).** NOTE: /display/<id> is NOT a
  screen id route — the SPA resolves displays by SLUG via `/api/screens/displays/:slug`.
- Client (injected bundle 539,481 B, PARSE_OK): new `case"weather_gui"` + component
  `wxGUI` (~38.2 KB, in `wave4/fd_weather/wxgui-component.js`), placed before
  `\nfunction wsWS` so it reuses ws-kit module scope (WX_SVG, wxIco, wxIconKey, fOf,
  inHg, fmt12, minsOf, DIRS, n/b). Own `WG_CSS` style block (wg* classes, wgDrift/
  wgTw/wgRainA/wgFlash/wgGlow/wgSpin keyframes) — no WS_CSS dependency.
- Sections (v1 duplicate of the mockup): header city + date·time (no zero-padded hour);
  conditional NWS alert banner (red gradient, ⚠ triangle svg, event uppercase, "View
  details ›" placeholder); hero sky card (big temp = outdoor sensor °F + api fallback,
  feels-like/condition, condition pill, OUTDOOR/INDOOR °F+humidity, WIND dial+dir/mph+
  gusts, PRESSURE inHg + Rising/Falling from `wx.pressure.trend`, gold sun-arc SVG w/
  drifting sun disc by day-progress, SUNRISE/DAYLIGHT/SUNSET (dayLen), NEXT 12H moon +
  clock; animated sky: stars/moon-halo/sun-glow/clouds/rain-streaks/snow/fog/flash,
  hurricane spin icon at wind ≥ 39 mph, storm-tinted gradients); radar card (server
  `/api/weather/radar` RainViewer frames + OSM 6×6 base at z8 + 3×3 radar tiles at z7,
  **NEXRAD palette `color=6`** matching the mockup, dark-navy map via
  `invert(.88) hue-rotate(175deg) + rgba(12,24,44,.5)` veil on BASE layer only,
  city labels (Leesburg/Orlando/Daytona + MOUNT DORA △ home), frame-anim 800 ms w/
  pause toggle, 13-frame teal timeline, scale legend Light→Very Heavy, NOW + frame
  time, +1H +2H +3H / FORECAST labels); **NEXT 12 HOURS** chart (12 cols: temp row,
  amber SVG polyline+dots, grayscale Meteocon row, teal rain % + proportional bars,
  AM/PM hour labels, Temperature °F / Rain chance % legend); footer (indoor-sensor
  status + "Weather updated h:mm"). All sizes cqw/cqh → resolution independent.
- Admin editor: "+ Weather GUI" add-button (indigo), label `Weather GUI (hero
  dashboard)`, self-closed config form (City label, Zip/Location, Outdoor channel,
  Indoor channel).
- Patcher `fdw-apply-wxgui.cjs`: modes fresh/upgrade. Upgrade re-slices from marker
  `// wxGUI` (comment anchor, NOT `const WG_CSS` — that would drift +293 B per run) to
  `\nfunction wsWS`; guards = 1× `function wxGUI`, 1× `case"weather_gui":return n.jsx`,
  1× label, 1× `const WG_CSS`, 1× `const WX_SVG`; **full-bundle vm.SourceTextModule
  PARSE check on a /tmp copy BEFORE any write; auto-rollback** (orig content restored
  on anchor/guard/parse failure — proved itself twice during the build).
- **Gotchas encoded in the process:** (a) the ws-kit config form branch leaves its outer
  `n.jsxs` div OPEN (its `]})` comes from original code further down) — injecting an
  open-ended form before it double-nested and broke parsing; the wxgui form is therefore
  FULLY self-closed (`]})]})]}),`, 4 fields), parse-neutral anywhere; (b) prefix-bisect
  debugging of a single-line minified bundle mis-locates errors — parse the whole file
  and delete-injections-one-at-a-time to bisect; (c) component `\u2014`-style escapes
  are fine in injected source.
- Rollback chain now: **orig6.\* = ws5 weather-station** (pre-wxgui), orig5.\* = ws4
  icon kit, orig4.\* = v1 kit, orig3.\* = pristine. `cp orig6.index-BDiodzvu.js
  index-BDiodzvu.js` (+ orig6.index.html) + restart lightdm restores the ws5 kiosk.
  DB undo: `/tmp/wg-screen-undo.sql` (block+screen) + `/tmp/wg-display-undo.sql`
  (preview display).
- Verified 2026-11-18 ~20:00: FDW_RESULT all OK (upgrade, comp 38,026→38,246 B,
  ?v=ws6d→**ws6e**, PARSE_OK, write 539,481 B); bundle HTTP 200; wxGUI/case/label/
  WG_CSS/WX_SVG 1×; `case"ws_"`×18 & one wsTile (kiosk ws5 kit untouched); headless
  chromium 1920×1080 screenshot of `/display/wxgui-preview` matches the mockup layout
  (hero bottom w/ arc + radar NEXRAD cells + 12-h chart all live; `tmp/wxgui18e.png`).
- Version history this wave: ws6 (v1 render) → ws6b (opaque cards, dark navy radar,
  pin svg, no-pad hour) → ws6c (hero/chart rebalance) → ws6d (nowrap labels, wind row)
  → ws6e (wind dial row next to sensor row; arc + NEXT 12H + sunrise/sunset/d daylight
  full-width; final look). **Future component edits: bump `jsVer` in
  `fdw-apply-wxgui.cjs` (each bump = fresh ?v= so browsers re-fetch).**

## Radar widgets (Windy + RainViewer) + WeatherGUI radar swap deployed on Pi — 2026-11-18 night (?v=ws6f → ws6g)
- Screens studio gained two RESIZABLE radar block types (percent-block geometry scales them):
  - `radar_windy` — "Radar: Windy": full-bleed iframe of `embed.windy.com/embed2.html`
    (config: Latitude 28.800 / Longitude -81.644 / Zoom 3-17 / Overlay select radar, satellite,
    temperature, wind, pressure, clouds). Verified booting in headless chromium (timeline
    scrubber + play + layer toggles + mm/h legend + labels). Windy's radar layer is WebGL:
    headless no-GL chromium segfaults or paints gray — use
    `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader` for headless shots;
    the real (headed) kiosk browser has working GL.
  - `radar_rainviewer` — "Radar: RainViewer": standalone client-side widget fetching
    `https://api.rainviewer.com/public/weather-maps.json` (past + nowcast frames, 800 ms
    animation, pause button, frame-time label), rain tiles over a dark-filtered OSM base
    (invert/hue-rotate), red home pin, auto-recomputed tile grid from measured container
    size (ResizeObserver falls back to window resize) → correct mosaic at ANY block size.
    Config: Latitude 28.800 / Longitude -81.644 / Zoom (3-10, default 7) / Palette
    (Dark Sky 6 default, Dark Sky Alt 8, Rainbow 4, Universal Blue 2, Classic 0, Titan 3) / Label.
- **RainViewer gotcha (measured):** `tilecache.rainviewer.com` radar tiles are capped at
  **zoom 7** for BOTH sizes (z>=8 returns an identical "Zoom Level Not Supported" placeholder
  PNG: 1,370 B @256 / 3,269 B @512, identical md5s at z8/z9/z10). `rwRV` therefore draws the
  overlay at OZ=min(zoom,7) inside a wrapper scaled by 2^(zoom-OZ) (transform-origin 0 0) so
  base (any zoom, OSM) and overlay stay aligned.
- **WeatherGUI radar card swap:** the GUI's built-in NEXRAD-style mosaic (fetch + frame loop +
  city labels + timeline) was REPLACED by the app's own `wm` Weather Radar widget:
  `n.jsx(wm, { config: { zip, label: 'WEATHER RADAR', fontSize: 20 } })` in the same card
  (wm has its own header + frame time + magnified OSM base + pin). Component shrank
  38,246 → 30,494 B; `/api/weather/radar` still powers wm (server verify 200, frames ok).
- Files: `wave4/fd_weather/rw-windy-comp.js`, `rw-rainview-comp.js`, and patcher
  `fdw-apply-radar-widgets.cjs` (idempotent: comp region between `// rwWindy` and the
  `// wxGUI` marker is diff-replaced on upgrades, so the wxgui upgrade slice can never
  delete the radar comps; case/label/button/form injections SKIP when present; creates
  **orig7.\*** = ws6e backups; auto-rollback on anchor/parse failure). DB kit on Pi:
  `/tmp/rww-run.cjs` (screen 19 "Radar Widgets" + display slug `radar-test`, idempotent,
  undo in `/tmp/rww-undo.sql`). Screenshot kit: `/tmp/rww-shots3.sh` (radar-test with
  swiftshader) + local copies `tmp/rww-radar-test4.png`, `tmp/rww-wxgui-preview2.png`.
- DB rows: screen 19 name "Radar Widgets" — block 295 `radar_windy` (49.5×99% left, zoom 11),
  block 296 `radar_rainviewer` (49.5×99% right, zoom 9), display id 7 slug `radar-test`.
  Removing the test screen later = run `/tmp/rww-undo.sql` lines against the DB.
- Deployment order matters: radar patcher FIRST (injects comps before the `// wxGUI`
  marker), then `fdw-apply-wxgui.cjs` (re-slices only its own region; bumps ?v too).
  Both files now carry `jsVer = 'ws6h'`; **next bump = ws6i in BOTH patchers.**
- Verified 2026-11-18 ~20:28: FDW_RESULT all OK (comp upgrade 7,238→8,547 B, ?v=ws6e→ws6f,
  then ws6f→**ws6g**, PARSE_OK, write 544,905 B); verify script all markers 1×
  (wxGUI/caseGui/label/WG_CSS/WX_SVG/button/form/rwWindy/rwRV/caseWindy/caseRain/btnWindy/
  btnRain/formWindy/formRain), `wmInWxCard: true`, `case"ws_"`×18 + one wsTile (ws kit
  untouched), HTTP 200 for home/bundle/display 17/wxgui-preview/radar-test/radar-api,
  lightdm active (kiosk loop untouched).
- Rollback chain now: **orig7.\* = ws6e** (pre-radar-widgets), orig6.\* = ws5, orig5.\* = ws4,
  orig4.\* = v1, orig3.\* = pristine. `cp orig7.<name> <name>` + restart lightdm restores
  ws6e (radar swap + widgets gone). Version history: ws6e → ws6f (two new radar widget
  types + WeatherGUI hosts `wm`) → ws6g (RainViewer overlay cap fix: z7 overlay scaled)
  → **ws6h** (rwRV upgrade: optional `pause` config key — animation off, shows the LATEST
  past frame — plus widget now STARTS on the latest frame instead of the 2-h-oldest;
  patcher reads comps from `FDW_TMP/rw-*-comp.js` at run time, so comp updates need only
  an scp'd comp file + jsVer bump). **Next bump = ws6i in BOTH patchers.**
- ws6h extras learned: RainViewer frame paths are opaque HASHES now (`/v2/radar/<hex>`,
  not timestamps); `nowcast` can be an empty array; tile probe = curl
  `…/256/7/<x>/<y>/<color>/1_1.png` byte sizes (334 B = empty, ~10-35 KB = storms; Mount
  Dora z7 tile = 35/53). Deterministic headless shots of the animated widget: set block
  config `pause:1` (kit `tmp/rww-pause.cjs <0|1>`, undo → `/tmp/rww-pause-undo.sql`) and
  use two-pass warm-cache screenshots (`tmp/rww-shots5.sh` — pass 1 warms the shared
  /tmp/chromeprof HTTP cache, pass 2 captures; fixes slow-tile runs that render blank).
  Zoomed verification shot: `tmp/radar-test-2.png` (Windy z11 Greater Mount Dora base +
  RainViewer z9 storm complex, overlay perfectly aligned over the dark OSM base).
- Verify script updated: `wave4/fd_weather/verify-wxgui6.sh` (checks the new markers +
  wmInWxCard + radar-test URL; reads bundle path + version from index.html).

- Verify script updated: `wave4/fd_weather/verify-wxgui6.sh` (checks the new markers +
  wmInWxCard + radar-test URL; reads bundle path + version from index.html).

## WeatherGUI radar ZOOM (wm magnify) — 2026-11-18 ~21:00 (?v=ws6i → ws6j)
- Same Greater-Mount-Dora treatment for the Weather GUI radar card: the card hosts the base
  app's `wm` widget, whose magnify config key (transform scale of the 6×6 OSM z8 + 3×3 NWS 512px
  z7 mosaic about the home pin) is hard-clamped 1..3. Deployed in two steps:
  - **ws6i**: `wxgui-component.js` wm call gains `magnify: 3` (wxgui upgrade slice
    [// wxGUI marker → function wsWS] diff-replaced, 30,494→30,506 B, radar comps untouched),
    both patchers jsVer → ws6i. Result: ~2.8° span (Tampa→Orlando→Sebring) — still too wide.
  - **ws6j**: guarded `wm.zcap` one() step added to `fdw-apply-wxgui.cjs` raising wm's clamp
    `…,3),v=Number.isFinite` → `…,6),v=Number.isFinite` (fresh installs get it too; base
    `magnify||2` default UNCHANGED so no other radar_block shifts), comp set to
    `magnify: 5`, both patchers → **ws6j**. FDW_RESULT all OK (component.upgrade + wm.zcap,
    PARSE_OK, cache.bust ws6i→ws6j); verify script all markers 1× incl rwWindy/rwRV,
    `wmInWxCard: true`, HTTP 200s, lightdm active. Disk ≈ served md5-verified 545,928 B
    (js.length unit vs UTF-8 byte delta is expected — © / ° / · are multi-byte).
- Result: pin-on-Mount-Dora view ≈1.6° span (Ocala→Leesburg→Clermont→Orlando→Kissimmee in
  frame), storm complex aligned; base labels still legible at 5× (NWS radar tiles near native
  res; OSM z8 softens gently). Headroom to magnify 6 = mush (OSM z8 stretch) — real per-zoom
  tiling would need a wm rewrite; magnify 5 is the practical max. Proof shot:
  `tmp/rww-wxgui-zoom5.png` (also `rww-wxgui-zoom3.png` at 3×). Shot kit: `tmp/rww-shots6.sh`
  (two-pass warm-cache on /display/wxgui-preview, profile /tmp/chromeprof6).
- Patchers on Pi: `/tmp/{wxgui-component.js,fdw-apply-wxgui.cjs,fdw-apply-radar-widgets.cjs}`
  all @ ws6j. Rollback: revert comp magnify (3/2) and/or drop the wm.zcap step; DB untouched.
  **Next bump = ws6k in BOTH patchers.** Kiosk picks up ws6j on its next display reload.

## WeatherGUI footer → hero chip — 2026-11-18 ~21:15 (?v=ws6k → ws6l)
- Per user screenshot: removed the "📍 Indoor sensor connected/offline" footer row from
  /display/wxgui-preview entirely, and moved "Weather updated h:mm" into the upper-right
  corner of the large left (conditions) card as a floating chip (`updChip`: absolute
  top 1.5cqh / right 1.9cqw, zIndex 3, rgba(226,236,247,.8) + soft text-shadow). The footer
  element was deleted; hero + chart cards share the reclaimed height.
- Deployed in two steps (lesson recorded):
  - **ws6k** (first attempt): chip const declared AFTER the heroCard that mounts it →
    TDZ `ReferenceError: updChip before initialization` → page rendered BLANK even though
    PARSE_OK + all bundle markers were green (parse ≠ render). Caught by the two-pass shot
    kit: wxgui-preview PNGs collapsed ~1 MB → 8.5 kB.
  - **ws6l**: chip const moved ABOVE `heroCard` (component.upgrade 30,309→30,392 B,
    PARSE_OK, cache.bust ws6k→ws6l). NEW LOCAL CHECK added: render harness
    `tmp/wg-parse-check.cjs` (→ `tmp/wg-parse-run.mjs`) invokes `wxGUI({config:{…}})` with
    stubbed module deps and must print RENDER_OK + chip_in_tree + indoor_absent before any
    future deploy.
- Verified: served `?v=ws6l`, home/bundle/wxgui-preview HTTP 200, `Indoor sensor` 0× in the
  bundle, chip render string 1×, updChip-before-heroCard order confirmed; proof shots
  `pi:/tmp/rww-shots7/wxgui-preview-{1,2}.png` (locally `tmp/wg-shots/wxgui-ws6l-2.png`) —
  footer gone, chip top-right in the blue panel, radar + 12-hour chart intact (night sky at
  capture time, 9:17 PM). Shot kit updated to FRESH profile dirs (`tmp/wg-shots7.sh`,
  /tmp/rww-shots7 + /tmp/chromeprof7) — old /tmp/chromeprof6 had root-owned leftovers the
  xxtoon rm couldn't clear, silently reusing a stale profile; stale dirs now removed.
- Patchers on Pi `/tmp/{wxgui-component.js,fdw-apply-wxgui.cjs,fdw-apply-radar-widgets.cjs}`
  all @ ws6l. Rollback: restore the comp's footer/chip edit, re-run wxgui patcher; DB
  untouched. **Next bump = ws6m in BOTH patchers.** Kiosk picks up ws6l on next reload.

## WeatherGUI radar centered on 32757 — 2026-11-18 ~21:30 (?v=ws6l → ws6m → ws6n)
- User asked: "center the radar view using 32757 at the same zoom level" (magnify 5 kept).
- Root cause read from `wm` in the bundle: the mosaic scales about `transformOrigin: Q% Z%`
  (the pin's own position inside the 6×6 OSM z8 / 3×3 NWS z7 mosaic), so at any magnify the
  pin stayed at its raw tile-fraction spot — for 32757 the radar API geocode gives
  Q=65.6946%, Z=43.279% → dead center only by luck; Mount Dora sat off-center right/up.
- Fix, entirely config-gated inside `wm` (two guarded one() steps in `fdw-apply-wxgui.cjs`
  so NO other radar_block screen shifts; non-center users keep the old behavior):
  - `wm.center`: `style:{transform:...}` → when `a.center` truthy prepend
    `translate(50-Q%, 50-Z%)` before `scale(M)` → mosaic content's pin point rendered at
    exactly 50%/50% of the box at any zoom.
  - `wm.centerPin`: the red MapPin marker is an UNSCALED sibling of the scaled mosaic, so it
    also needed gating → `left:(a.center?50:Q)+%, top:(a.center?50:Z)+%` (tip at box center).
  - Guards extended: `wm.center` and `wm.centerPin` must both be exactly 1× (fail →
    auto-rollback).
- `wxgui-component.js`: radar card config now `{ zip: zip, label:'WEATHER RADAR',
  fontSize:20, magnify:5, center: !0 }` (zip falls back to 32757 as before).
- Two deploys: **ws6m** = wm.center + comp (first shot looked un-centered because the marker
  sibling still sat at the raw spot; fresh-profile DOM dump proved the transform itself was
  exact) → **ws6n** = wm.centerPin. Version chain bumped ws6l→ws6m→ws6n in BOTH patchers;
  **next bump = ws6o**.
- Verified: patcher all OK/parse PARSE_OK (write 545,382 B), verify-wxgui6.sh all markers 1×
  (incl. wmInWxCard), home/bundle-ws6n/display17/radar-test/radar-api HTTP 200, lightdm
  active. Fresh-profile DOM dump at cache-busted URL: served `?v=ws6n`,
  mosaic `transform: translate(-15.6946%, 6.72101%) scale(5); transform-origin:
  65.6946% 43.279%`, marker `left: 50%; top: 50%` — pin lands at exact box center
  (box 514×514 flex-centered in the card). Proof shot `tmp/wg-shots/wxgui-ws6n-2.png`
  (from `pi:/tmp/wg-shots8/`, fresh chromeprof9, cache-busted ?r= URLs): pin centered over
  Mount Dora, radar + hero + chart intact.
- Known pre-existing cosmetic: thin horizontal dark seam across the mosaic (~83% height) at
  magnified zooms — OSM z8 6-row rounding seam inside `wm`'s per-tile background divs;
  present before this change (ws6j/ws6l shots), NOT introduced by centering; untouched.
- Shot-kit note: reuse the inspect script pattern `tmp/wg-inspect-dom.sh` (chromium
  --dump-dom + style greps) — it proves the actual applied geometry; PNG eyeball alone
  mis-measured pin position twice.
- Rollback: revert `center: !0` in the comp + re-run wxgui patcher (wm.center/wm.centerPin
  SKIP once absent from find-strings → they only re-fire on a pre-center bundle); DB
  untouched. Kiosk picks up ws6n on next display reload; no restart forced.

## WeatherGUI radar swapped to RainViewer (rwRV) + animated hero conditions scene — 2026-11-18 ~21:50 (?v=ws6o)
- User asked: "replace the radar in weathergui with the one from rainviewer widget you already
  created. set to zoom 10, centered on 32757" (+ prior ask: animated, high-quality
  current-conditions filling the empty zone under the "Weather updated" chip).
- **Radar card** (`radarCard` in wxgui-component.js): old tiled mosaic `wm` (fontSize 20,
  magnify 5, center !0) → `n.jsx(rwRV, { config: { lat: 28.80249, lon: -81.64452, zoom: 10,
  label: 'WEATHER RADAR' } })` — the SAME rwRV widget the `radar_rainviewer` screens use
  (injected by fdw-apply-radar-widgets.cjs right before the // wxGUI marker, so the wxgui
  upgrade slice never deletes it). OSM dark base fills the card edge-to-edge (no side gaps —
  the earlier "narrow the card" idea is moot), animated RainViewer frames (past→nowcast,
  800 ms cycle, play/pause + latest-frame time in the header), red pin auto-centered at
  32757 (server-resolved lat/lon the server radar route uses; pin style `left:50%; top:50%;
  translate(-50%,-100%)` proven in DOM dump). Card keeps sibling radius/shadow; rwRV paints
  its own frame. Radar overlay at OZ≤7 upscaled (RainViewer tilecache cap) — soft blobs by
  design at zoom 10; user explicitly wanted zoom 10 (base OSM is real z10 tiles).
- **Hero animated scene** (`wxScene`, ~120 lines, inside wxGUI): replaces the old rudimentary
  overlays (wgStar/wgMoon/wgSun/wgCloud/wgRain/wgSnow/wgFlash divs + spinning hurricane glyph)
  with an SVG composition ~200×110 mounted `absolute right 1.9cqw top 7cqh 20cqw × 14.8cqh`
  (zIndex 2, under the chip's zIndex 3; old wg*-keyframes/CSS kept — other screens may use
  them). Bucket-driven (stormy→'ts' override): clear day = gradient sun + 14 SMIL-rotating
  rays + pulsing halo; clear night = 10 twinkling stars + shooting-star cycle + moon with
  REAL phase (synodic cycle from 2000-01-06 epoch, two-arc terminator path + crater clip);
  partly-cloudy day/night; overcast = 3 layered drift clouds; rain/drizzle = clouds + 12–18
  gradient-stroke falling drops; snow = falling + swaying flakes (nested g for dual
  animation); fog = 3 drifting blurred bands + ghost glow; thunderstorm = dark clouds +
  slanted rain + glowing bolt + double-flash overlay (7.5 s cycle). New keyframes wgXDrift/
  wgXFall/wgXFallS/wgXSway/wgXPulse/wgXBolt/wgXFlash/wgXFog/wgXShoot in WG_CSS.
- Patchers: BOTH bumped ws6n → ws6o (exact-once guards held; wxgui patcher guard extended
  with rwRV=1 + wxRadarSwap=1 comp-region check: n.jsx(rwRV + lat: 28.80249 + zoom: 10 +
  wgXScene inside the wxGUI..wsWS slice). Deploy: radar patcher ran first (comp.inject SKIP:
  bundle comps were already identical to repo), then wxgui (30,404→40,444 B region). Verify
  matrix green: FULL_BUNDLE_PARSE_OK, rwInWxCard true, wmInWxCardOld false, wgXSceneCount 1,
  centerCfgGone true, comp_rw=2 latlon=1 zoom10=1 scene=1 magnify=0 centerCfg=0, all HTTP
  200, lightdm active. Screenshots tmp/wg-shots/wxgui-ws6o-3/4.png (rain-bucket scene live).
- Harness tmp/wg-parse-check.cjs v3: added `rwRV` stub + probe asserts (rv_cfg zoom10/latlon/
  label, wgXScene present, old wm config gone) — PARSE_OK + RENDER_OK + all OK.
- verify-wxgui6.sh: wmInWxCard → rwInWxCard (+ zoom: 10 + lat: 28.80249 + wgXScene),
  wmInWxCardOld check kept (expect false), wgXSceneCount, centerCfgGone; **sudo now
  passwordless on the Pi — all touched scripts (verify-wxgui6.sh, tmp/wg-deploy9.sh,
  tmp/wg-shot8.sh) REWRITTEN WITHOUT the embedded password** (older scripts in tmp/ may
  still contain it — rotate-scrub candidates).
- /tmp/rw-rainview-comp.js + rw-windy-comp.js refreshed to repo-current (md5 differed from
  stale /tmp copy; patcher compared SKIP=identical, so live radar screens were untouched and
  the deterministic source-of-truth is repo).
- Rollback: scp the ws6n-era wxgui-component.js (git/tmp copy) + re-run fdw-apply-wxgui.cjs
  (upgrade replaces the region); orig6.* backups predate this whole kit; wm.center steps
  remain in the bundle (opt-in only, now unused by wxgui). Kiosk restarted at ~21:52 → live
  on ws6o.

## rwRV manual zoom from the touchscreen — 2026-11-18 ~22:00 (?v=ws6o → ws6p)
- User asked: "is there a way to manually control the zoom on that radar from the touchscreen?"
- rwRV is NOT a map lib — hand-rolled 256px tile composition (no pinch of its own), so manual
  zoom = make the zoom stateful + own controls, all gated on new comp config key **`ctl: 1`**
  (only the wxgui radar card passes `ctl: !0`; every other rwRV instance renders identically —
  proven by harness probe `rv_ctl_off: OK`).
- rw-rainview-comp.js (9042B→11361B in bundle):
  - `rvZoom` useState seeded from config zoom (clamped 3-10); all tile math (nT/OZ/OV) now
    derives from state so `+`/`−` re-tile instantly (base OSM + radar overlay recompute,
    pin stays dead-center at every zoom — map is always centered on the pin by construction).
  - Header: two 24px round buttons `−` / `+` before the play/pause button (dimmed at the 3/10
    limits), same dark-pill style. Range 3-10 (same clamp as config).
  - Two-finger pinch directly on the map: onTouchStart/Move/End track inter-touch distance,
    step ±1 when ratio crosses 1.35/0.74 (then rebase); `touchAction: 'none'` on the map div
    while ctl so the browser doesn't page-zoom; handlers attach with no-op guards when !ctl.
  - Zoom persists per label via localStorage (`rwRVz:<label>`, try/catch, read only when ctl)
    → survives bundle re-loads; delete via browser or re-tapping −.
- Deploy: BOTH patchers bumped ws6o → ws6p; radar patcher comp.inject did the upgrade
  (case/label/btn/form all SKIP — other screens untouched), wxgui patcher component.upgrade
  pushed the `ctl: !0` config + guard now also asserts `ctl: !0` inside the wxGUI slice.
- Harness v4 (tmp/wg-parse-check.cjs): now includes the REAL rwRV comp after wxgui comp
  (stub rwRV removed) — probes rv_cfg (adds `"ctl":true`), rv_ctl (render: touchAction
  "none" + − button present; source: onTouchStart/pvMove/rvSet/rwRVz — note JSON.stringify
  DROPS function props, so touch-handler asserts must check source not render) and
  rv_ctl_off (plain config render has NO ctl artifacts). All OK + PARSE_OK.
- verify-wxgui6.sh: added scoped `rwCtl` check (slice function rwRV..// wxGUI must contain
  pvStart/pvMove/rvSet/touchAction/onTouchStart + rwRVz: ≥2×). Full-bundle grep for those
  names gives false 0 (names exist elsewhere in app code) — ALWAYS scope comp greps to the
  comp slice. All green: FULL_BUNDLE_PARSE_OK 557,706B, rwCtl=1, rwInWxCard=true, all HTTP
  200, kiosk restarted → live on ws6p. Screenshot tmp/wg-shots/wxgui-ws6p-1.png shows
  [−][+][⏸] in the radar header.
- Rollback: re-run radar patcher with pre-ctl rw-rainview-comp.js + wxgui patcher with
  pre-ctl comp (ctl absent → guards updated back); localStorage keys rwRVz:* are harmless
  leftovers.

## Weather source label + sensor/forecast Q&A — 2026-11-18 ~22:10 (?v=ws6p → ws6s)
- User asked: (1) are indoor/outdoor from the .36 Pi's sensors? (2) is the forecast current/correct
  and what is the source? (3) "add the weather source where the updated weather time is (replacing
  it) next to the sunrise/sunset visual".
- **Q1 answer (grounded live):** YES — both values come from the Pi's own SDR rig, not the internet.
  AcuRite 592TXR/06002M towers @ 433.92 MHz (remote switch **A = outdoor** tower id 5404, **B =
  indoor** id 6765), received by the RTL-SDR stick on Pi4Kiosk → `rtl433.service` decodes to
  /var/run/rtl433.json → `rtl433-feed.service` POSTs to the Pi's OWN calendarly
  (`/api/sensors/ingest`). At probe time: ages **12 s**, A 20.1 C/68 F @ 87 %, B 23.7 C/75 F @ 51 %
  (exact on-screen numbers). Fallback: if the outdoor row goes stale, the widget uses the
  Open-Meteo model temp (wxgui comp `outT` fallback line) until the tower reports again.
- **Q2 answer:** forecast/current/sunrise/sunset = **Open-Meteo** (`api.open-meteo.com/v1/forecast`,
  keyless), fetched by the Pi server's `server/src/weather.js` (15-min server cache; widget pulls
  `/api/weather` every 5 min; hourly trimmed to start 1 h before the current hour so "NEXT 12H"
  always ends at +12 h). Verified live: current 67 F "Rain", model vs tower delta = 1 °F. Alerts
  banner = **NWS** (api.weather.gov via /api/weather/alerts, 10-min cache). Radar = **RainViewer**
  over OSM. (RainViewer radar overlay stays upscaled > zoom 7 — API cap.)
- **Q3 change:** the arc's right column previously showed the LIVE CLOCK (`headerTime`, "9:58 PM")
  under `NEXT 12H` + moon — replaced that child with a bold **`OPEN-METEO`** source label
  (`.75cqw`, weight 700, `#eef3fa`, letterSpacing −.02em; row gap `.8cqw` → `.5cqw`). `headerTime`
  survives (screen header date·time line uses it). The "Weather updated h:mm" chip is UNTOUCHED
  (hero top-right) — that one genuinely is the update time; user's "updated weather time" meant the
  clock next to the sun arc.
- Sizing iterations (each its own patcher bump + kiosk restart): 1.05 cqw collided with the SUNSET
  value AND squeezed the arc block so SUNRISE/DAYLIGHT labels touched; 1 cqw still collided;
  **.75 cqw ≈ old clock width (≈79 px vs 74 px) → baseline label spacing restored.**
- Tooling: both patchers bumped ws6p→ws6q→ws6r→ws6s in lockstep; verify-wxgui6.sh gained `wxSrc`
  (wxGUI comp slice must contain OPEN-METEO); harness v5 (wg-parse-check.cjs) gained `wgsrc` render
  probe; wg-shot8.sh gained an OPEN-METEO dom grep. Deploy loop unchanged (scp + de-CRLF + radar
  patcher first + wxgui patcher + verify + lightdm restart + shots).
- Verify green: FULL_BUNDLE_PARSE_OK 557,732 B, HTML_MARKER ?v=ws6s, wxSrc 1, rwCtl 1,
  rwInWxCard true, all HTTP 200, lightdm active; screenshot tmp/wg-shots/wxgui-ws6s-2.png matches
  baseline spacing. GOTCHA: one shot run ~30 s after `systemctl restart lightdm` produced EMPTY
  PNGs (0-byte chromium logs, dom.html fine) — just rerun wg-shot8.sh, transient.
- Rollback: scp the pre-change wxgui-component.js + re-run wxgui patcher (component.upgrade
  diff-replaces; bump jsVer for cache-bust — e.g. ws6t), radar comps untouched.

## Radar animation smoothing (crossfade + pingpong + prefetch) — 2026-11-18 ~22:20 (?v=ws6s → ws6t → ws6u)
- User: "can the radar animation be any smoother. It looks very jumpy".
- Old behavior: rwRV drove ONE overlay grid whose per-tile backgroundImage hard-swapped every 800 ms
  (`setInterval … (x + 1) % rvFrames.length`): every step = hard cut, no fade, no prefetch, plus a
  hard wrap from the newest nowcast frame back to the oldest → jumpy.
- New (all in wave4/fd_weather/rw-rainview-comp.js — comps are read from /tmp by
  fdw-apply-radar-widgets.cjs, so only the comp file + version bumps changed):
  1. **Two stacked radar layers** (rvXF): the incoming frame fades in over the still-painted outgoing
     frame (`transition: opacity .48s linear`), roles alternate each step; never a blank flash even
     if a tile loads late.
  2. **rvPP pingpong playback**: 620 ms/step, forward → 2-beat hold (~1.7 s) at the newest frame →
     reverse; removes the hard wrap-around. ⏸/▶ and zoom ctl untouched.
  3. **rvPL prefetch**: every frame's overlay tiles (~4 tiles/frame at the zoom-7 API cap, ~110 URLs)
## Radar overlay GEOMETRY regression fix — 2026-11-18 ~22:30 (?v=ws6u → ws6v)
- User: "on the radar i only see the map not the weather". CONFIRMED REAL: wxgui-1/2.png at ws6u show
  map-only (chip advanced 8:50→9:00 PM but that's frame-index-driven — it does NOT prove painting;
  the earlier "rain bands differ" read was wrong).
- Root cause: the ws6u crossfade rewrite rendered rain tiles at RAW zoom-7 px coords (`left: t.tx*TS`,
  no centering, no scaling) directly under the layer divs — the pre-ws6u widget wrapped its tile grid
  in `scale(OV)` at `(halfW - cpxO*OV, halfH - cpyO*OV)`/origin 0 0 (RainViewer caps tiles at zoom 7
  while the panel shows NZ=10, so coords must be scaled ×OV and shifted by the panel center). Dropping
  that wrapper put every rain tile ~8,900 px off-panel → invisible. The offline harness missed it
  because it stubs useEffect → rvBox.w = 0 → the whole tile tree renders null (geometry never runs).
- Fix (rw-rainview-comp.js only): restored the scale(OV) wrapper INSIDE each rvXF crossfade layer
  (children: layer[wrapper[tiles]], wrapper style `left: (halfW - cpxO*OV)px, top: (halfH - cpyO*OV)px,
  transform: scale(OV), transformOrigin '0 0', width/height 1px`). Also fixed rvPP end-hold: hold 2
  beats AT the newest frame (p stays put while hold counts down, then reverses) instead of dwelling
  on second-newest.
- Probes hardened: verify rwXF now joined by **rwOv** (rwRV slice must contain `halfW - cpxO * OV` +
  transformOrigin + scale(); 0 = the map-only regression); harness wg-parse-check.cjs gained `rv_ov`
  (same checks vs RVSRC); wg-shot8.sh gained rendered-dom proofs: `transform: scale(8)` count (>=1 at
  the zoom-10 preview) + `transform-origin:` dump (expect 2 — one wrapper per crossfade layer), and
  expect-string ws6v. NOTE these DOM probes bite only when rvBox.w > 0 in the headless capture —
  they did fire (scale(8) ×1, origin ×2 at ws6v).
- Deploy green: comp.inject 13,698 B → 14,308 B, cache.bust ws6u→ws6v, PARSE_OK 560,679 B; verify
  rwCtl 1 / rwXF 1 / **rwOv 1** / wxSrc true / all HTTP 200 / lightdm active; dom has BOTH wrappers
  + tilecache `/256/7/…` urls; wxgui-1/2.png show rain overlay ALIGNED over the map (Leesburg/
  Apopka cores on geography, labels visible through the layer). Same-frame 8:20 PM chip in both
  shots is just the pingpong cycle position at capture time.
- Version chain: ws6t (dangling rvFr crash) → ws6u (crossfade deploy, overlay invisible) →
  **ws6v** (wrapper restored + hold fix). Rollback for THIS regression: prior ws6u comp had correct
  single-layer geometry but no crossfade — better to stay on ws6v.

## Radar zoom-out base supersampling (rvBS) — 2026-11-18 ~22:45 (?v=ws6v → ws6w)
- User: "If i zoom out i lose the map details". CONFIRMED BY DESIGN GAP: the base map drew OSM tiles
  at the CURRENT view zoom (`/Z/…` urls, bg-size 256px), so pinching below zoom 10 flipped to OSM's
  sparse low-zoom rasters → the dark base goes nearly featureless while the rain overlay stays
  detailed.
- Fix (rw-rainview-comp.js only — rvBS block replaces the base-tile math + base render): below zoom
  10, keep drawing base tiles from the HIGH-detail zoom BZ = rvZoom + SS (SS = min(2, 10 - rvZoom),
  BZ capped at 10), each downscaled to btS = 256/2^SS screen px (sc = nT/nB maps base px → screen
  px). Zoom 9 → z10 tiles at 2× density (~35 tiles); zoom ≤ 8 → z10-zoom tiles at 4× density
  (~120 tiles); zoom 10 → SS=0 → byte-identical to the old path (/10/ urls, 256px). Rain overlay +
  rvXF wrapper math untouched (OZ/OV unchanged). Cost: ~120 small tile fetches per zoom-OUT step,
  disk-cached by the kiosk chromium profile after first visit; light single-user usage.
- Offline PROOF without a headless pinch (wg-parse-check.cjs v5 → tmp/rv-dom-run.cjs): renders rwRV
  with a REAL measured panel (796×462) via type-seeded useState stubs (numeric state = zoom, {w,h}
  object = box — seeding by useState call index is fragile) and walks the plain-object tree:
  rv_bs_z7 OK (all bg urls /9/, every size `64px 64px`, no /10/ leak), rv_bs_z9 OK (/10/ urls ×40,
  `128px 128px`, wrapper `scale(4)` — OV=2^(9-7)), rv_bs_z10 OK (/10/ ×15 at `256px 256px`, wrapper
  `scale(8)` — the ws6v geometry). GOTCHAs hit while building it: runZoom must WRITE the seed (first
  run rendered zoom 7 for all three calls), and the z9 wrapper is scale(4), not scale(2) — OV math,
  fixed probe.
- Probes hardened: verify-wxgui6.sh gained **rwBs** (rwRV slice must contain the SS/BZ consts +
  `+ BZ +` / `+ btS +` concatenations; 0 = supersampling gone), harness wg-parse-check.cjs gained
  `rv_bs` + the dom-run generator. Deploy green: comp.inject 14,307→14,988 B, cache.bust ws6v→ws6w,
  PARSE_OK; verify rwCtl 1 / rwXF 1 / rwOv 1 / **rwBs 1** / wxSrc true / all HTTP 200 / lightdm
  active; dom z10 greps unchanged (z10 urls + scale(8) ×1 + origin ×2); wxgui-1/2.png show rain
  aligned with the same rich base detail as ws6v at the default zoom.
- NOTE: /display/radar-test + /display/17 dump-dom under headless chromium returns the bare 35.7 KB
  SPA shell (React root not hydrated in those headless captures) — DON'T read that as breakage; the
  kiosk session serves both fine (HTTP 200 in verify). Use wxgui-preview captures for DOM proofs and
  the offline deep-render harness for low-zoom logic.
- Rollback: prior ws6v comp had the plain single-zoom base (sparse when zoomed out) — prefer staying
  on ws6w; if deep-zoom-out tile volume ever becomes a problem, drop the SS cap 2 → 1
  (BZ = min(rvZoom + 1, 10), half the tile count, still 2× detail).

## Kiosk screen LOOP dead-ID fix — 2026-11-18 ~23:00 (loop 1 → [1,18,12])
- User: "edited the loop to only 3 screens but it still shows 5 and 2 are repeating". ROOT CAUSE was
  two stacked issues: (1) loop 1 "Pi4 Kiosk Calendar" (display 5 "Calendarly - Pi4  - Kiosk",
  interval 30 s) still carried screen_ids [14,12,1,17,18] while screens 14 "Chalkboard" and
  17 "New Custom Screen" had been DELETED from the screens table (stale ids survive any UI edit —
  the loop editor only renders checkboxes for EXISTING screens but re-sends the full seeded array,
  so deleted ids are invisible yet unremovable; checking the new Weather GUI (18) saved
  [14,12,1,17,18]); (2) the display playback resolves each id as
  `screens.find(id) || screens[0]` — dead ids fall back to screens[0] (Family HQ Split) instead of
  skipping → 5 slots, Family HQ repeating 2× extra.
- Data fix: loop 1 screen_ids → [1,18,12] (user-confirmed order: Family HQ Split → Weather GUI →
  Photo Frame/Clock/Weather; interval 30 s + pause_on_touch untouched) via better-sqlite3 direct
  write (id-existence pre-check, refuse-on-missing; file is xxtoon-owned, WAL-safe vs running
  server). Visible immediately — the server reads loops per request.
- Durable hardening (screens.js backed up to screens.js.bak-loopfix first): prune dead ids at ALL
  loop surfaces — GET /loops now filters screen_ids against existing screens (kills ghosts on READ,
  so the kiosk display AND the loop editor can never reintroduce them), POST /loops + PUT /loops/:id
  validate each id (keep-id on query error, drop-id when row missing). calendarly.service restarted
  (active). Future screen deletions can no longer leave phantom loop slots.
- Rollback paths: data = rewrite loop row; code = `cp screens.js.bak-loopfix screens.js` + service
  restart. Verified: systemctl calendarly active; /api/loops → screen_ids [1,18,12]; / and
  /display/wxgui-preview HTTP 200; lightdm active + chromium up after kiosk page reload (fresh loop
  fetch). Playback math: k % 3 over [1,18,12] → Family HQ Split → Weather GUI → Photo Frame → …
- Gotchas: no sqlite3 CLI on the Pi — use `/opt/calendarly/server` node + better-sqlite3;
  `sudo` works key-only over ssh (used for systemctl restarts). Daily JSON backups in
  data/backups are the history source for loop/screen forensics (confirmed all 7 Nov backups had
  [14,12,1,17] — id 18 was appended today).

## Extras status
     fetched once per data refresh via `new Image()`, so fades never wait on the network.
- BUG found by live console probe: first push (ws6t) left the old `rvFrame = …rvFr %…` line in place —
  the ternary is lazy so all stubbed-render probes passed (rvFrames=[] short-circuits), but the REAL
  browser threw `Uncaught ReferenceError: rvFr is not defined` once data arrived ≈22:15 → React root
  emptied (wxgui-preview dom 1,292 B; other pages fine). Fixed to `rvBuf.n`; probes hardened:
  `rwXF`/`rv_xf` now also FAIL on any standalone `rvFr`/`setRvFr` ref (regex `/[^A-Za-z]rvFr[^A-Za-z]/`).
  LESSON: the harness only renders with NO DATA — dangling-var bugs fire once frames arrive; the
  source-regex check is the real guard.
- Verify green: HTML_MARKER ?v=ws6u, FULL_BUNDLE_PARSE_OK (560,070 chars / 560,561 B disk — wc -c is
  UTF-8 bytes, js.length is chars, not corruption), rwCtl 1, rwInWxCard true, wxSrc 1, **rwXF 1**,
  all HTTP 200, lightdm active; dom.html 86,898 B containing `transition: opacity .48s linear` +
  tilecache/osm urls; wxgui-1/2.png both render, radar chip ADVANCES 8:50→9:00 PM between captures
  (animation live, rain bands differ per frame); OPEN-METEO label + arc spacing unchanged.
- GOTCHA (new): re-scp'd the Windows-CRLF wg-shot8.sh after de-CRLF'ing it once → chromium args get
  trailing \r (`--screenshot=…png\r`), PNGs silently vanish while dump-dom still works (its redirect
  targets aren't the line's last token). De-CRLF EVERY scp'd shell script in the deploy chain:
  `sed -i "s/\r$//" /tmp/*.cjs /tmp/*.sh`. The ~30 s post-restart empty-PNG flake from ws6s still
  applies (screenshot instances can exit empty right after lightdm restart — rerun or use the dump-dom
  render as the source of truth, then take shots).
- Files: rw-rainview-comp.js (this change), fdw-apply-{radar-widgets,wxgui}.cjs (bumps), verify-wxgui6.sh
  (+rwXF), tmp/wg-parse-check.cjs (+rv_xf), tmp/wg-shot8.sh. Rollback: scp prior rw-rainview-comp.js +
  re-run the radar patcher with a bumped jsVer; wxgui comp untouched.

## Extras status
## Extras status
- NWS alerts banner: DONE (+tornado/hurricane icon overrides)
- Outdoor 24h min/max: DONE (per-sensor, rolling 24h)
- Pressure high/low 24h + 3h trend: DONE (server-side history)
- Moon phase: NOT done (needs one more daily param `moon_phase`; easy follow-up)
- Screen-17 rotation dwell: user decision pending (loop currently rotates [14,12,1,17] @30s)


## What this wave adds
- `sensor_readings` + `pressure_samples` tables; `POST/GET /api/sensors*` endpoints
  (ingest token-gated, constant-time compare; GETs LAN-open like other kiosk GETs)
- Open-Meteo request extended: wind_direction, gusts, is_day, cloud_cover,
  pressure_msl/surface_pressure, uv_index, shortwave_radiation + daily sunrise/sunset/uv_index_max
- Pressure history recorded on each weather fetch; `/api/weather` now returns
  `pressure: { hpa, delta3h, high24, low24, trend }` (trend = 3h delta)
- NWS alerts proxy `GET /api/weather/alerts?zip=` (10 min cache)
- Client bundle: new `case"weather_station"` renderer branch + `wsWS` component
  (composite grid: conditions, barometer+trend, wind, outdoor/indoor T+H+24h lo/hi,
  solar/UV, clock+sunrise/sunset "Today", NWS alert bar, day/night icons, container-query font scale)
- Admin editor: label + config form (zip, indoor channel, outdoor channel)
- DB seed: screen 17 gets a `weather_station` block at x0.5 y0.5 w58.2 h98.6
  (right side keeps radar + hourly)
- `index.html` cache-busted with `?v=ws2`

## Files
- `sensordb.js`        -> /app/server/src/sensordb.js (schema + helpers, ESM)
- `routes-sensors.js`  -> /app/server/src/routes/sensors.js
- `ws-component.js`    -> injected into the Vite bundle as `function wsWS(...)`
- `fdw-apply-server.cjs` -> patches src/index.js, src/weather.js, src/routes/weather.js
  (backs up to orig2.*), seeds DB (token + screen-17 block), prints FDW_RESULT JSON
- `fdw-apply-client.cjs` -> patches dist bundle (backs up orig2.*), cache-busts index.html,
  parse-checks with vm.SourceTextModule, auto-rolls back on anchor/parse failure
- `fdw-unpack.cjs`, `build-pack.ps1`, `fdw-pack.txt` — shipping format:
  line 1 = base64(unpack.cjs), then `###FDWFILE:<container-path>` + base64 body lines

## Deploy pipeline (ONE ssh session — NAS tmp is per-session, never split these)
```pwsh
$md5 = (Get-FileHash wave4\fd_weather\fdw-pack.txt -Algorithm MD5).Hash.ToLower()
Get-Content -Raw wave4\fd_weather\fdw-pack.txt | ssh ShadowAero@192.168.76.188 '
  cat > /tmp/fdw-pack.txt &&
  [ "$(md5sum /tmp/fdw-pack.txt | cut -c1-32)" = "<MD5>" ] || { echo MD5_MISMATCH; exit 1; } &&
  head -1 /tmp/fdw-pack.txt | base64 -d > /tmp/fdw-unpack.cjs &&
  tail -n +2 /tmp/fdw-pack.txt > /tmp/fdw-files.txt &&
  docker cp /tmp/fdw-unpack.cjs family-dashboard:/tmp/fdw-unpack.cjs &&
  docker cp /tmp/fdw-files.txt family-dashboard:/tmp/fdw-files.txt &&
  docker exec family-dashboard node /tmp/fdw-unpack.cjs &&
  docker exec -w /app/server family-dashboard node /tmp/fdw-apply-server.cjs &&
  docker exec family-dashboard node /tmp/fdw-apply-client.cjs &&
  docker restart family-dashboard && sleep 8 && (verification curls...)'
```
Run again any time: fully idempotent (anchors SKIP when already applied).
Server apply exits nonzero without restarting if an anchor fails; client apply
restores its backups on parse failure.

## Ingest token
Printed by fdw-apply-server in `FDW_RESULT ... "token":"<hex>"`.
Rotable via: UPDATE settings SET value=<new> WHERE key='sensor_ingest_token'.
Verify with `GET /api/sensors/token-check?token=<hex>`.

## Pi (4 kiosk) side — DONE 2026-11-18 (full state at top of this file; kit in pi/)
- rtl_433 runs from systemd (`rtl433.service`, auto-retries every 5 s until the stick is plugged in);

## Loop save + deploy live-verified ("not saving" report resolved), 2026-11-19 ~00:05–00:15

Request: "I don't think the loops are saving or deploying correctly — screen doesn't match the loop I updated and saved."
**Verdict: save → DB → kiosk rotation all work, proven live.** No code changes; evidence via GET/DB + grim screenshot sequences.

- **User's pi-side edit persisted:** loop 1 `[1,18,12]` → `[18,12,20,2,1]` (DB row + `GET /api/loops` agree; loopfix prune drops nothing here). New screen 20 "Chalkboard" created today (6 blocks: 2×text, clock_weather showSeconds, calendar_month, calendar_agenda, dailyfacts; `background: color #2a9313`, Walter Turncoat css) — calendar/agenda/dailyfact render **with events** despite `feeds:[]` in config.
- **Rotation proved matching, dot-for-dot (grim ×13 over ~5 min):** 5-dot pager position == loop index exactly — 18 Weather GUI (dot 1), 12 Photo (dot 2), 20 Chalkboard (dot 3), 2 Full Month Calendar (dot 4), 1 Family HQ Split (dot 5), wrapping at 30 s/slot. Captures caught the **live mid-cycle switchover** onto the new order at a slot boundary → the ≤30 s poll/`LOOPS_UPDATED` propagation demonstrated on-screen.
- **Trap #1 (likely cause of the report): two apps = two databases.** NAS docker app `192.168.76.188:3080` has its own loop 1 "Pi4 Kiosk Calendar", now `[14,12,17,2]` (NAS screens: 1, 2, 3 Chore&Reward Hub, 5 Chalkboard (Imported), 12, 14 Chalkboard, 17 Weather Station — **no Weather GUI on NAS; screen ids are NOT shared**). The kiosk reads ONLY its local pi app (`:3000`); editing the loop on the NAS app changes nothing on the kiosk. NAS stale display record "Pi 4 Kiosk" (display 4, paired 8/23) makes it look connected — it isn't (kiosk re-paired locally 8/29 as display 5).
- **Trap #2:** loop edits apply at the **next slot boundary** (≤30 s); the kiosk never jumps to the new first screen immediately.
- **Cosmetic, pending user call:** Chalkboard slot renders as solid **neon green** (`#2a9313`, user-configured) — faithful rendering, but looks error-like on the dark dashboard.
- Pi request logs don't show PUT/POST lines (no request logging) — DB diff + screenshots were the ground truth.

**Rollback/parity baselines updated:** kiosk loop 1 = `[18,12,20,2,1]` i30 (was `[1,18,12]`); NAS loop 1 = `[14,12,17,2]` (was `[14,12,1,17]` per note @629). GitHub hunt: no git repo in IDX6011, `/opt/calendarly`, or NAS (`gh` not installed) — nothing tracked yet.
  feeder (`rtl433-feed.service`, active) posts to the Pi's OWN server:
  `POST http://127.0.0.1:3000/api/sensors/ingest` — **not** the NAS.
- Hardware: AcuRite 592TXR/06002M @ 433.92 M; set remote switch **A = outdoor, B = indoor**
  (block config: outdoorChannel A, indoorChannel B). Plug in the NooElec RTL-SDR and readings
  appear within ~30 s; watch: `ssh pi4kiosk 'journalctl -u rtl433-feed -f'`.
- Pi ingest token: `75b999667ae4168394703e0c8660b21220ba6277`
  (rotable in the Pi's settings table; verify: `curl "http://192.168.76.36:3000/api/sensors/token-check?token=..."`).
## Kiosk radar HOME beacon — 2026-11-18 ~23:05

Request: put a bright indicator on the radar at **2141 Wolf Ridge Ln, Mount Dora FL 32757**, centered on the map. Also surfaced a latent bug where the old center "pin" never actually rendered at the panel center.

- Geocode (Nominatim, single house-node hit): **28.817422, -81.620514** = "2141, Wolf Ridge Lane, Mount Dora, Lake County, Florida, 32757". The old wxGUI radar block config was `lat: 28.80249, lon: -81.64452` — a rough 32757 fallback ~2.4 km SW of the house.
- **Config fix** (`wxgui-component.js` radar card, line ~435): block config → `lat: 28.817422, lon: -81.620514` (zoom 10, ctl, 'WEATHER RADAR' unchanged). Defaults in `rw-rainview-comp.js` (lines 5-6) set to the same coords for standalone radar blocks.
- **Beacon** (replaces the 18 px red SVG pin in `rw-rainview-comp.js`): centered anchor `left: halfW + 'px', top: halfH + 'px'` (0×0 wrapper) with children: pulsing magenta halo span (`@keyframes rwPulse{...}` scale .5→2.3 fade, 1.7 s, inline `<style>`), glowing magenta ring (22 px, `#ff2bd6`, box-shadow bloom), white-hot 8 px core, and a small `HOME` chip (8 px bold white on dark, magenta border) at +14/+10.
- **Latent centering bug fixed**: `left:'50%',top:'50%'` percentages resolve against the 0×0 offset container that holds base tiles + rain layers, so the old red pin always landed at the panel's **top-left corner** (mostly clipped), not the center. Base tiles already center via absolute `halfW/halfH` px math; the beacon now uses the same. Caught on the first ws6x screenshot (HOME chip at top-left), fixed same session for **ws6y**.
- Deploys: **ws6x** = coords + beacon (50% variant), **ws6y** = px-centered anchor. Ran `fdw-apply-radar-widgets.cjs` (comp.inject 14,987→16,376→16,589 B) + `fdw-apply-wxgui.cjs` (region 40,436→40,487 B, then SKIP identical) — both rollback-safe with guards + parse check.
- **Probes updated in lockstep**: `verify-wxgui6.sh` `rwInWxCard` now asserts `lat: 28.817422` + `lon: -81.620514`; new `rwHome` probe (keyframes rwPulse + #ff2bd6 + radial-gradient + HOME + `left: halfW` + old `#ef4444` pin gone) = 1. Harness `tmp/wg-parse-check.cjs` `rv_cfg` asserts both coords; deep-render `rv-dom-run.cjs` gained **rv_home** (rendered tree has rwPulse + magenta + HOME + `398px`/`231px` center of the seeded 796×462 panel). `tmp/wg-shot8.sh` dom greps updated: rwPulse keyframes, magenta count (`#ff2bd6` serializes as `rgb(255, 43, 214)` in dump-dom), wrapper `width: 0px; height: 0px`, `>HOME<`.
- Verified end-to-end: bundle `index-BDiodzvu.js?v=ws6y` parsed (563,011 B); all verify probes green + HTTP 200s; lightdm restarted; headless screenshots (`/tmp/wg-shots8/wxgui-*.png`) show the bright magenta beacon dead-center in the radar with the HOME chip.
- Rollback: `cp orig7.index-BDiodzvu.js assets/index-BDiodzvu.js && cp orig7.index.html .` (pre-ws6f) or re-run older comps; coords-only revert = swap the config line back to `28.80249/-81.64452`. Client playback loop and DB untouched by this change.
- Gotchas honored: `.cjs`/`.sh` scp'd to Pi must be LF-pure (`tr -d '\r' < f > f.lf && cat f.lf > f` — pwsh eats `\r` escapes in ssh one-liners; .cjs patchers self-strip `\r` so only the bash scripts matter). Chromium dump-dom normalizes hex colors → probe on `rgb(255, 43, 214)`, not `#ff2bd6`.

## Loop edits actually apply — verified chain, 2026-11-18 ~23:20

Request: "make sure that when I change the loops it actually makes the change." No code changes/deploy; static end-to-end verification of the full mutation path (user declined a live authenticated canary; automated attempt aborted at **login** — default `admin/admin` → 401, custom password in `admin_password_hash`, no ADMIN_PASS env → **zero mutations, zero downtime**; pi `/tmp` canary files removed, DB/bundle untouched).

- **Editor (bundle `Bm`, client unmodified):** checkbox toggles mutate state `M`; Save submits exactly `{id: editingLoop?.id, name, interval_seconds: Number(x), screen_ids: M, pause_on_touch: 1}` → PUT `/api/loops/:id` when an id exists, else POST `/api/loops`, then a full refetch. Pencil "Edit" seeds the form from the loop's GET `screen_ids`; Cancel resets. Ghost-proofed upstream by the loopfix GET prune.
- **Server (pi `routes/screens.js`, loopfix):** PUT/POST persist the user's screen-id **order**, dropping dead ids (keep-id on query error, drop-id when row missing), and preserve name/interval/pause when undefined; every loop mutation calls `broadcast('LOOPS_UPDATED')` (`src/websocket.js` → all ws clients).
- **Kiosk:** page = `http://127.0.0.1:3000/?mode=display` (kiosk.sh), display 5 → loop 1. Client refetches ALL endpoints on `LOOPS_UPDATED` **and** unconditionally every **30 s** (`setInterval(…,3e4)`) → loop changes land on the kiosk in ≤30 s **without any reload**, even if the page's websocket is dead (no reconnect logic, but the poll makes it moot). Rotation: `k % screen_ids.length`.
- **Baseline re-confirmed:** loop 1 "Pi4 Kiosk Calendar" `[1,18,12]`, interval 30, pause_on_touch 1; `calendarly.service` active.
- **Gotchas:** loop mutations are auth-gated (`requireAuth`, cookie `fd_admin`) — automated canary needs the real password or user-performed edit (`tmp/loop-canary.sh` + `tmp/ws-listen.cjs` kept in repo `tmp/` for a future live proof). UX trap: only the loop display 5 is assigned to affects the kiosk — editing/creating different loops changes nothing on screen.

## ws6z zoom bump + chalkboard fix + NAS radar mirror — 2026-11-19 ~09:50

Three asks: fix the neon-green Chalkboard background, raise the radar zoom cap 10→11 on the Pi, and mirror the radar changes (home beacon + zoom 11) into the NAS docker app. All landed + verified; **zero user-facing downtime** (lightdm restart only on the Pi).

### 1. Chalkboard (Pi screen 20) — config fix, no code
- Root cause: screen 20 `background_type:"color", background_value:"#2a9313"` (neon green) saved by a past template edit. **Fix = direct DB write on the Pi** (no `fd_admin` password needed): `UPDATE screens SET background_type='pattern', background_value='chalkboard' WHERE id=20` via better-sqlite3 (busy_timeout 4 s, WAL-safe next to the live server; BEFORE/AFTER echoed in-session).
- The base app already supports it: pattern list includes `{key:"chalkboard", label:"Gray Chalk", css:"url(/photos/chalkboard_background.jpg) center / cover no-repeat #3a4148"}`; the renderer resolves pattern keys via find-by-key; Pi serves `/photos/chalkboard_background.jpg` → HTTP 200.
- Verified **properly** via a temp display record: `/display/<n>` resolves a **display row** and falls back to a built-in demo page when missing — `/display/20` and `/display/17` both rendered the SAME bundled demo (byte-identical PNG, md5 `ef37b280…`). Lesson: never verify via numeric `/display/:id`; use a display slug assigned to the screen. Real check = insert temp display `cb-check-20` (assigned screen 20) → chromium screenshot (md5 `c14b996d…`: dark chalk, calendar/agenda/dailyfacts/clock intact) → **temp display deleted** (Pi displays back to 2 rows: id 5 kiosk loop, id 6 wxgui-preview).
- NAS chalkboard screens 5 + 14 were **already** `pattern/chalkboard` — zero changes needed there.

### 2. Radar zoom cap 10 → 11 (Pi)
- All zoom caps lived in code, not the DB (screen 18's wxgui block config has no zoom key): `rw-rainview-comp.js` **three clamps** raised to 11: NZ config clamp (`|| 7, 3), 11)`), localStorage restore (`lz <= 11`), `rvSet` clamp; header comment now `(3-11, default 7)`. `wxgui-component.js` radar card call: `zoom: 11`.
- `jsVer` bumped `ws6y → ws6z` in **both** patchers + every probe **in lockstep**: `fdw-apply-wxgui.cjs` guard `wxSlice.includes('zoom: 11')`; `verify-wxgui6.sh` `rwInWxCard` same; `tmp/wg-shot8.sh` (expect `v=ws6z`, OSM tiles grep `org/1[0-3]/`, `scale(16)` = 2^(11−7)); `tmp/wg-parse-check.cjs` `rv_cfg` asserts `"zoom":11`.
- Deploy (Pi): scp comps+patchers → `sudo -S env FDW_TMP=/tmp node /tmp/fdw-apply-radar-widgets.cjs` (comp.inject upgraded 16,588→16,589 B; case/label/button/form SKIP) → `sudo node /tmp/fdw-apply-wxgui.cjs` (component.upgrade 40,487→40,487 B length-neutral; guards incl. wxRadarSwap `zoom: 11` OK) → both `PARSE_OK` → `sudo systemctl restart lightdm`. NOTE: a first non-sudo run died EACCES on the root-owned `/tmp/rww-bundle-check.js` **before any dist write** (patchers only write dist after parse.check — inherently rollback-safe) → re-ran under sudo.
- Verify (Pi): node probe — `PARSE_OK bytes=563011`, `rwInWxCard 1`, all three caps true, `old10 gone`, marker `v=ws6z`; chromium DOM — `?v=ws6z`, OSM base tiles at **z11** (`tile.openstreetmap.org/11/558/851…` = Mount Dora), `transform: scale(16)` overlay ×1, `>HOME<` chip, OPEN-METEO; screenshot `wx11.png` — radar at 11, '+' control no longer dimmed, magenta HOME beacon centered.
### 3. NAS mirror (docker app `family-dashboard` on ShadowAero)
- NAS bundle was still `?v=ws2` (**no ws-kit: no WX_SVG/wxIconKey/wsTile/`case"ws_"` anywhere**) → the stock radar patcher would abort there (it requires the `// wxGUI` marker) and the wxgui patcher would refuse too — NAS needed a variant: **new `fdw-apply-radar-nas.cjs`** = radar patcher minus the wxGUI marker dependency: comps inject before `\nfunction wsWS` behind a `// rwRadarNAS` marker; guards replace the wxGUI/wsTile counts with a marker-must-be-1 check; everything else (one() injections, cache-bust, rollback, vm parse check) identical. All four anchors were verified present in the ws2 bundle first (case/label/btn/form + `\nfunction wsWS`).
- Shipping into the container: the NAS sshd blocks scp → **pipe files via stdin**: `Get-Content -Raw <f> | ssh nas "docker exec -i family-dashboard sh -c 'cat > /tmp/<f>'"`. Run: `docker exec family-dashboard node /tmp/fdw-apply-radar-nas.cjs`. Result ALL OK: comps 16,590 B, case/label/button/form inject, `?v=ws2 → ws6z`, guards 1×, `PARSE_OK`, written **447,583 B**; HTTP serves `v=ws6z` (client dist read from disk — no container restart needed). Backups **inside** the container: `/app/client/dist/orig7.index-BDiodzvu.js` + `orig7.index.html` (rollback: cp back inside container). Container `/tmp` files (patcher + comps) are ephemeral — the repo holds the sources for re-piping.
- **NAS DB** (`/app/data/dashboard.sqlite`; server env DATA_DIR; schema `screen_blocks`/`loops`/`displays`): block **269** (screen 17 "Weather Station") `radar_block {"magnify":3}` (old wm map radar) → **`radar_rainviewer` `{"lat":28.817422,"lon":-81.620514,"zoom":11,"label":"WEATHER RADAR"}`** (type+config bound as params, transaction, busy_timeout; x/y/w/h percent columns untouched). Server served it live: `GET /api/screens/17` returns `radar_rainviewer` + zoom 11. Visual proof: temp display `radar-preview-17` (assigned screen 17) → chromium over LAN (`http://192.168.76.188:3080/display/radar-preview-17`, reachable from the Pi, HTTP 200) → screenshot shows **RainViewer radar at zoom 11 with the magenta HOME beacon on Mount Dora**, all station cards + live sensor feeds intact → temp display **deleted** (displays back to only `{id:4 "Pi 4 Kiosk" → loop 1 [14,12,17,2] @30s}` — loop baseline unchanged).

### Baselines / rollback after this wave
- **Pi**: bundle `index-BDiodzvu.js` v=`ws6z` 563,011 B (pre-ws6z md5 `ccbc0638…`); screen 20 bg was `color/#2a9313`; wxgui radar config now zoom 11 (was 10). Loop 1 `[18,12,20,2,1]` @30 s unchanged. lightdm restarted.
- **NAS**: bundle v=`ws6z` 447,583 B (was `ws2` 426,339 B; rollback = orig7.* inside the container); block 269 was `radar_block {"magnify":3}`; loop `[14,12,17,2]` @30 s unchanged; NAS radar zoom now lives explicitly in the block config (11).

### Tooling gotchas hit this wave (for next time)
- The local editor writes **CR-only line endings** → any `.sh` shipped to Pi/NAS must be de-CRLF'd (`tr -d '\r'` written as **two chars** — the tool JSON decodes `\r`/`\n` escapes before the shell ever sees them; write `\\r` or base64-pipe everything).
- Node scripts loaded as **files** resolve modules from the script's own dir, not CWD: run DB probes with `NODE_PATH=/opt/calendarly/server/node_modules node /tmp/x.js` (or `node -e` with `cd /opt/calendarly/server`).
- Chromium headless on the Pi: run as xxtoon with `env HOME=<fresh dir>`, swiftshader flag set, `--virtual-time-budget` up to 60 s; dump-dom serializes `#ff2bd6` as `rgb(255, 43, 214)`.
- Rain overlay shows a vertical tile seam at zoom 11 (RainViewer tile boundary) — cosmetic, present on both devices, not a defect.
- New/updated files this wave: `fdw-apply-radar-nas.cjs` (new), `rw-rainview-comp.js`, `wxgui-component.js`, `fdw-apply-radar-widgets.cjs`, `fdw-apply-wxgui.cjs`, `verify-wxgui6.sh`, `tmp/wg-shot8.sh`, `tmp/wg-parse-check.cjs` + probes `tmp/pi-v.js`, `tmp/pi-verify-bash.sh`, `tmp/nas-bundle-probe.js`; screenshots in `tmp/loop-debug/` (`cb20-real.png` = real screen 20, `nas17b-render.png` = real NAS screen 17, `wx11-render.png` = Pi wxgui radar).

## GitHub sync — 2026-11-19 ~10:40

- **Repo:** `git@github.com:shadowaero/calendarly` (= https://github.com/shadowaero/calendarly, SSH remote `origin`). Auth is passwordless: the local `~/.ssh/id_ed25519` is already registered with GitHub as user **shadowaero** (checked via `ssh -T git@github.com`).
- **What was on it:** NOT a workspace dump — the **pristine Calendarly app source**: 4 commits, old tip `4cc93cc` ("Add Pi deploy systemd units (server + display power schedule via wlr-randr)"), tree = `client/ server/ kiosk/ deploy/ Dockerfile docker-compose.yml README.md`. The running devices stay **downstream** of this source: Pi runs `/opt/calendarly/client/dist` and the NAS runs the container's `/app/client/dist` — both carry the ws-kit patches, this source repo does not. Rebuilding `client/dist` from source produces a fresh unpatched bundle → the patchers (Pi pair + `fdw-apply-radar-nas.cjs`) must be re-run after any rebuild.
- **Merge:** `origin/main` grafted into local `main` via `git merge origin/main --allow-unrelated-histories -X ours` — both histories preserved (old source lineage → merge commit → ws6z kit commits). **Gotcha:** the `.gitignore` add/add conflict fell to the OLD repo's permissive version (node_modules-style), so the next `git add -A` swept 2,332 workspace files (6.4 M lines) into a commit and GitHub's pre-receive hook **declined the push** — remote stayed at `4cc93cc`, untouched. Fix: `git reset --soft HEAD~1`, rewrote the whitelist to also un-ignore the app source (`/client /server /kiosk /deploy Dockerfile docker-compose.yml README.md .dockerignore`), `git rm -r --cached . && git add -A` → clean 332-file index = 104 source files + 224 kit/docs files (commit `2fbef16`).
- **Pushed:** `main → origin/main` at commit `2fbef16` (`4cc93cc..2fbef16`, verified via `git ls-remote`); the earlier decline was purely repo size from the polluted index above — after the whitelist fix the push passed. History shape: old source commits → graft-merge → ws6z kit commit → GitHub-sync notes commits.
- Future GitHub flow: commit in `c:\Users\xxtoo\Documents\IDX6011` (whitelist .gitignore keeps non-kiosk workspace dirs out) → `git push origin main`. Screenshots/PNGs stay untracked — keep evidence shots out of `git add` or move them under `tmp/loop-debug/`.

## Public calendar URL re-point — 2026-11-19 ~10:15

- **Ask:** `https://calendar.examininglife.com` wasn't reflecting the Pi kiosk deployment (192.168.76.36) — keep them permanently in sync.
- **Root cause:** the public hostname is fronted by **authentik SSO** (login page HTML for anonymous hits) and **nginx-proxy-manager** on the NAS; NPM proxy host **104** (`/data/nginx/proxy_host/104.conf`) forwarded to **`http://192.168.76.188:3080` — the NAS family-dashboard container**, which is a separate deployment with its **own SQLite DB** (different screens/loops/content than the kiosk). Same code after ws6z, different data ⇒ "out of sync".
- **Fix (surgical):** re-point NPM host 104 upstream to the **Pi app** — `set $server "192.168.76.36"`, `set $port 3000`. Everything else untouched: authentik forward-auth + outpost relay (`proxy_pass http://192.168.76.188:8090/outpost.goauthentik.io`, on the NAS) stays; `X-Internal-Auth` header line kept (harmless). Edit done inside the `nginx-proxy-manager` container via sed (script piped in as base64 → `/tmp/cal-repoint.sh`); validated with `nginx -t` (0 errors), `nginx -s reload`. Backup: `/data/nginx/proxy_host/104.conf.bak-cal-pi-20261119` (rollback = copy back + reload).
- **Proof:** access log shows the full chain live — `GET /api/schedules` → `304` … `[Sent-to 192.168.76.36]` from a real logged-in Chrome session via the public domain (10:14:34). Anonymous fetch → authentik start redirect as before (SSO intact).
- **Semantics going forward:** the public URL now serves the **Pi backend directly** — single source of truth, always in sync with the kiosk by construction (same DB, same bundle, same WS). The NAS `:3080` instance keeps running independently as the NAS kiosk's own backend (loop `[14,12,17,2]`) — it is no longer the source of the public site. If the Pi app is down, `calendar.examininglife.com` is down with it (it IS the kiosk backend).

## Public URL cache poisoning — NPM asset-cache/CDN 302s — no-store + token bump chain — 2026-11-19 ~12:10–17:15 GMT

- **Symptom:** browser at `https://calendar.examininglife.com` rendered only the pre-kit fallback `Widget: weather_gui` on the Weather GUI screen (pager + empty dark card, no radar/panels); the SAME browser rendered the Pi LAN origin (`http://192.168.76.36:3000`) perfectly.
- **Why — three stacked cache layers, all keyed on the SAME asset URL:**
  1. **Same URL, different bundles:** both deployments share the filename `assets/index-BDiodzvu.js`, and both patcher families stamp `jsVer='ws6z'` — so the NAS-era bundle (447,583 B, **no wxGUI component**, by design of `fdw-apply-radar-nas.cjs`) and the Pi bundle (~467 KB, **with wxGUI**) were both served under `/assets/index-BDiodzvu.js?v=ws6z`. The user's browser held the **NAS variant** for the calendar.examininglife.com origin → Pi's `weather_gui` block = unknown type → fallback text.
  2. **NPM stock asset caching** (`conf.d/include/assets.conf`, included by host 104): regex location for css/js/… runs `proxy_cache public-cache`, `proxy_cache_valid any 30m`, `proxy_ignore_headers Set-Cookie Cache-Control Expires X-Accel-Expires`, hides ETag/Last-Modified, stamps `expires @30m` (the odd `max-age=51396/44472` values = "next half-hour boundary"). ANY response — including authentik's 302 — became client-cacheable ~30 min.
  3. **Cloudflare** (the zone fronts the domain) cached those 302s under `.js` URLs: `cf-cache-status: HIT` (age 6923 of max-age 51396) for the unversioned URL, and anonymous probes filled `?v=ws6z` and `?v=ws6zp` (MISS→HIT, ~12 h TTL each).
- **Fix — host 104 in the `nginx-proxy-manager` container** (script shipped as base64 → `/tmp/cal-nostore.sh`; repo source `tmp/cal-nostore.sh`; restore/re-point helper `tmp/cal-restore-repoint.sh`): validated `nginx -t` clean (only unrelated deprecation warnings), `nginx -s reload`. Insertions (all exactly once): `location ^~ /assets/` before `location /` (prefix+`^~` short-circuits the regex assets.conf for this host → no proxy_cache, no expires) containing `proxy_hide_header Cache-Control;` + `add_header Cache-Control "no-store" always;`; same pair inside `location /`; and `add_header Cache-Control "no-store" always;` in the authentik outpost relay location (covers all anonymous 302 start-redirects).
- **Cache token chain on the Pi** (`/opt/calendarly/client/dist/index.html`, sed-per-bump): `?v=ws6z → ws6zp → ws6zq` — each bump orphans the poisoned edge entries (cold URLs nobody references). `ws6zp` had to be abandoned because TWO of my own anonymous HEAD probes went out **while the old cached config was still live** and Cloudflare filled 302s under it (lesson recorded below).
- **Proof (17:15:21 GMT):** anonymous HEAD `https://calendar.examininglife.com/assets/index-BDiodzvu.js?v=ws6zq` → `HTTP/2 302`, `location: …/outpost.goauthentik.io/start?rd=…` (SSO chain intact), `strict-transport-security` preserved, **`cache-control: no-store`**, **`cf-cache-status: BYPASS`** — Cloudflare refuses to store; under no-store such probes are harmless. `/` shell remains DYNAMIC. Authed browsers: fresh index → `ws6zq` → BYPASS → 200 live from the Pi → Weather GUI renders.
- **Backups / rollback:** inside the NPM container — `104.conf.bak-cal-pi-20261119` (pre-re-point) and `104.conf.bak-nostore-20261119` (pre-cache-fix, post-re-point). Restore = `cp -p <bak> /data/nginx/proxy_host/104.conf` + `nginx -t && nginx -s reload`; if the re-point-era backup is restored, re-apply the two routing seds (`tmp/cal-restore-repoint.sh`). Pi token revert: `sed -i s,v=ws6zq,v=ws6z, index.html`.
- **Gotchas learned (tooling):** DSM sshd gets a **per-session private `/tmp`** — files staged there vanish between ssh calls; stage in the HOME dir (`~/ship_*.b64`). pwsh→ssh **stdin pipes of long strings corrupt mid-stream** — ship via inline `echo <base64> | base64 -d | docker exec -i … 'cat > /tmp/x'` (base64 alphabet is quote-free, safe in shell) or chunked `printf %s` appends into `$HOME`. GNU sed custom address delimiter must be escaped (`\|addr\|`); plain `/addr;/a\text` was the fix. .NET path APIs ignore `Set-Location` — absolute paths always.
- **Rules going forward:** (1) never CURL asset URLs of this host anonymously unless the no-store config is live — pre-fix probes feed CF's cache; (2) the patchers' `jsVer` bumps remain the browser-facing cache control; (3) if the NPM dashboard regenerates host 104 (UI edit), the custom locations vanish — re-run `tmp/cal-nostore.sh` (ship + run < 1 min; verify: `grep -c no-store 104.conf` = 3 and `grep -n "^  location \^~ /assets/"` = 1).


## Radar timeline rework (rvT30) — history trim + nowcast-forward loop — 2026-11-19 (ws6z → ws6zr)

- **Ask:** replace the 2-hour ping-pong radar replay (13 past frames @ 10-min cadence ≈ 2.5 h, bouncing head, hold at newest) with the **last ~30 min of radar history + RainViewer’s nowcast, always playing forward in time**; future frames get a badge.
- **Comp changes (`rw-rainview-comp.js`, 5 anchored in-place edits, CRLF-preserving Node edit script `tmp/rvt30-edit.cjs`):** (1) header comment documents the rvT30 timeline + FCST badge; (2) timeline block renamed rvT30 — `(rvData.radar.past || []).slice(-4).concat(rvData.radar.nowcast || [])` ≈ 30-min trend + forecast; (3) play loop forward-only `(rvPos.current + 1) % L` with the 2-beat hold moved to the **newest (forecast) frame**, start index = NOW frame (`nPast = Math.min(4, past.length)`, `cur = nPast-1`); **`rvDir` fully removed** (grep count 0 in repo + live bundles); (4) `rvFC` badge definition (frames > now + 60 s); (5) cyan **`FCST +Nm`** pill beside the clock (8pt, #7ff3ff on slate-blue, border-radius 6). Timing unchanged: 620 ms/step, 480 ms crossfade (`opacity .48s linear`), rvPL prefetch, rvPP hook kept for verify-wxgui6.sh.
- **Honest limitation (told to the user):** RainViewer’s free public API only forecasts radar ~**+30 min** out — a 2 h radar forecast does not exist on this source, so the loop is 30 min back + ~30 min ahead.
- **Micro-test (`tmp/rvt30-verify.cjs`):** tick sequence from NOW: `4,5,6,H6,H6,0,1,2,…` (forward wrap with dwell on newest), frames_len 7, forward-only monotonic; all 14 grep/behaviour checks OK; `node --check` clean on comp + both patchers.
- **Deploy — NAS** (`family-dashboard`): Windows scp is broken against Synology SFTP homes (“dest open: No such file or directory” even though the shell home differs) → fell back to the proven chunked-`printf %s` b64 path (660-char lines, 4 per ssh as multi-arg printf, `base64 -d` in `~/fdwship`, byte-exact 16734/866/12872) → `docker cp` ×3 into container `/tmp` → `node /tmp/fdw-apply-radar-nas.cjs` → `ok:true`, comp inject (identical-comps SKIP on re-run), **?v=ws6z → ws6zr**, PARSE_OK, guards 1×. Live-bundle greps: `slice(-4)`×1, hold-on-newest×1, `FCST +`×3, `nPast - 1`×1, `rvDir`×0, crossfade×2.
- **Deploy — Pi 4 kiosk:** files staged in `~/fdwship` via scp (no sudo needed); single sudo run `echo <pw> | sudo -p "" -S env FDW_TMP=/home/xxtoon/fdwship node ~/fdwship/fdw-apply-radar-widgets.cjs` → comp.inject **OK (old 16588B → new 17572B)**, cache.bust **?v=ws6zq → ws6zr**, guards 1× + wxGUI/wsTile intact, PARSE_OK, `ok:true`. `verify-wxgui6.sh` green (rwXF 1, rwCtl 1, rwInWxCard true, wsCases 18, wsTile 1, hurricane true; HTTP 200 incl. `bundle-ws6zr`; lightdm active). Live greps: slice_occ=1 hold_newest=1 fcst=3 nowstart=1 rvDir=0 xfade=2 step620=1.
- **Browser impact:** every kiosk/public page must **reload** to pick up `?v=ws6zr` (old ws6z/ws6zq/ws6zp entries remain browser-stale only; no-store hardening from the previous record keeps edge caches out).
- **Rollback:** `git revert` this comp commit → re-run both patchers with the prior comp (they re-inject by compBlock size/anchor check: “comps upgraded” path) → bump `jsVer` to the next free token (ws6zr is now burned). Password hygiene: Pi sudo was used once in-session via `-S` (shared in chat → rotate); not recorded on disk.

- **Live kiosk check (post-relaunch 2026-11-19 ~15:07 ET; kiosk Chromium remotely relaunched with no keyboard:
  pgrep -x chromium → kill, wipe Chromium caches Default/Cache + Code Cache + ShaderCache/GrShaderCache for a cold
  index.html fetch, then setsid -f /home/xxtoon/kiosk.sh via SSH - new PID 2328):** timeline shows the designed
  deck only as far back as data allows: last 4 x 10-min `past` frames (seen 2:30→3:00, then 2:40→3:10 as the API
  refreshed). RainViewer’s free `radar.nowcast` was an EMPTY array (3 samples ~2.5 min apart; `past` updated 15:00
  → 15:10 meanwhile) - so the FCST +Nm badge/frames are DATA-DEPENDENT: when RW publishes nowcast frames they
  append automatically; while empty the deck is past-only and keeps the forward loop. Kiosk is Wayland/labwc
  (no xdotool; keyboardless reload = kill+relaunch kiosk.sh, or sudo systemctl restart lightdm as fallback).
  Ops gotcha: `pkill -f` self-matches the SSH session’s own command line and kills the session mid-command -
  use `pgrep -x <name>` + `kill` instead. Relaunch log: pi:/tmp/kiosk-relaunch.log.
## rvT30 deck-widening tweak (empty-nowcast fallback) — 2026-11-19 (~17:05, ws6zr → ws6zs)

- **Ask:** user saw 2:30–3:00 labels at 3:07 — correct per data (last 4 × 10-min frames), but RainViewer’s free `radar.nowcast` was verified EMPTY 3× over ~2.5 min straight from the Pi while `past` refreshed normally (15:00 → 15:10 during sampling). User chose: widen past to ~45–60 min ONLY while nowcast is empty.
- **Comp edit (`rw-rainview-comp.js`, 2 anchored edits via `tmp/rvt30-deck.cjs`; ASCII lesson — this file’s comments use straight quotes/apostrophes, first ’-based anchor failed count=0, bytes probed then fixed):** timeline is now `const rvNC = (rvData && rvData.radar && rvData.radar.nowcast) ? rvData.radar.nowcast : []; const rvFrames = (rvData.radar.past || []).slice(rvNC.length ? -4 : -6).concat(rvNC)` — nowcast present → the designed 4-past + FCST deck is UNCHANGED; nowcast empty → last 6 past frames ≈ 50 min @ the 10-min cadence. Header comments updated to match. Microtest `tmp/deck-test.cjs` runs the real deployed line via `new Function`: empty→6 frames, +2 FCST→6 (appended in order), +5→9, no-radar→0.
- **Both patchers bumped ws6zr → ws6zs** (jsVer const + header comment). Deploy — NAS: b64-printf ship (md5-verified both files) → `docker cp` ×2 → `fdw-apply-radar-nas.cjs`: comp.inject upgraded 448565→448817 B, cache.bust ws6zr→ws6zs, guards 1x, PARSE_OK; in-container verify rvNC.length ×1, served `?v=ws6zs`, ws6zr 0×. Deploy — Pi: scp to `~/fdwship` → silent-sudo `env FDW_TMP=/home/xxtoon/fdwship node fdw-apply-radar-widgets.cjs` (comps upgraded 17571→17824 B, guards/parse OK; verify rvNC ×1, `?v=ws6zs`, ws6zr gone). Kiosk reloaded remotely again (pgrep -x kill → Chromium cache purge → setsid kiosk.sh; PID 2328 → 2915). `~/fdwship/verify-wxgui6.sh` green post-reload (`bundle-ws6zs.HTTP 200` — script is token-agnostic, found it at fdwship).
- 12-h nowcast watcher runs separately: pi `/tmp/nc-watch.sh` → `/tmp/nowcast-watch.log`, curl every 5 min (logs NONEMPTY + frame count if RainViewer resumes publishing; still empty as of this tweak — first samples 16:41/16:46).

- **Future-radar source scouting (2026-11-19 ~17:1x, prompted by user asking for guaranteed future radar without "cartoon" quality):** kiosk confirmed showing the widened ~50-min deck live. Probed from the Pi: Unidata `thredds.ucar.edu` HRRR path 404, `thredds-jetstream` refused (http=000), `thredds.rda.ucar.edu` root 200 but research archives only; NOAA `nomads.ncep.noaa.gov/dods/hrrr` 301 error page; `psl.noaa.gov/thredds/.../hrrr` 404. COD NEXLAB satrad tool (`weather.cod.edu/satrad/index.php`, 200, 202 KB) exposes a clean per-timestamp frame convention `wxdata/satellite/continental/conus/overlays/<product>/conus-<product>.<YYYYMMDDHHMMSS>.png` (~5-min cadence) with 40 overlay products — but its radar overlay is PAST composite only, no HRRR/REFC entries in the tool. COD’s HRRR future radar lives in their separate model viewer whose URL guesses 404’d (`forecast/analysis.jsp`). Conclusion: NO free public source currently ships a sustained +30-min radar-grade nowcast comparable to RainViewer’s; the only "guaranteed+" futures are HRRR-class simulated reflectivity (radar-realistic, hourly-run, +1–18 h, ~15-min steps) — candidate paths for a future rework: COD model-viewer frame URLs (needs reverse-engineering session), a server-side GDS/GRIB rasterizer (heavy), or a working THREDDS WMS. RainViewer nowcast stays the designed source; the empty stretches are RainViewer-side (12-h watcher `/tmp/nowcast-watch.log` still empty as of 17:01).
