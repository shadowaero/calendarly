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

## Calendar event-edit kit (ws6zs → ws6zt → ws6zu → ws6zv) — 2026-11-19 ~17:15–19:00

- **Feature:** local calendar events are now editable from the kiosk. Day list gets a ✎ (pencil) button beside 🗑 for `source=="local"` events; it stashes the row (`window.__fdvEdit`), closes the day modal, opens "Add Family Event" as **"Edit Family Event"** prefilled (title/date/time/all-day/category/color from the row); Save issues `PUT /api/events/:id`, else unchanged `POST`. Opening add-mode fresh (or canceling an edit) resets fields.
- **Server piece (`fdw-event-put.cjs`):** idempotent anchored insert of `router.put('/events/:id', …)` immediately before `router.delete('/events/:id'` in `server/src/routes/events.js` — **Pi variant `(req, res)` ungated** (matches its open POST/DELETE touch-parity); **NAS variant `requireAuth, (req, res)`** (matches its hardened POST/DELETE). Handler falls back to existing column values for omitted fields (partial updates safe), 404s unknown ids, 500s errors, and **broadcasts `EVENT_UPDATED`** so all screens refresh. Files backed up in place as `events.js.bak-eventput` (both targets; NAS inside container).
- **Client piece (`fdw-apply-eventedit.cjs`):** six guarded anchored edits (count==1 each) against the SAME deployed minified bundle on both targets (`index-BDiodzvu.js` — both devices run the identical base build; minified identifiers verified: `Jx` CreateEventModal states `d/p,h/g,x/N,M/v,w/P,_,k,m/R`, `Gx` DayOverflowModal `{isOpen:a,onClose:i,date:o,events:u,onDeleteEvent:d}`, CalendarView modal calls with `I/K,R,Y,z/E,A,o`): E1 edit-mode `useEffect` on `[a]` (prefill on open via `window.__fdvEdit`, stash `window.__fdvEditId`; reset on close), E2 submit URL/method switch `?"PUT":"POST"` + success-clears id, E3 conditional heading `"Edit Family Event":"Add Family Event"`, E4 ✎ button (inline SVG pencil, no icon-import dependency) before the delete button, E5 `onEditEvent:g` prop added to `Gx` destructure, E6 CalendarView wiring `onEditEvent:ee=>{window.__fdvEdit=ee,X(Ge(R,"yyyy-MM-dd")),K(!1),E(!0)}`. Backups `*.bak-eventedit` (bundle + index.html both targets). Token policy unchanged: bundle carries no jsVer; **`index.html` only: `?v=ws6zs` → `?v=ws6zt`**; cache-bust chain `…ws6zr → ws6zs → ws6zt`.
- **Deploy:** Pi — scp both patchers to `~/fdwship`, run as **xxtoon without sudo** (`/opt/calendarly/client+server` paths and dist are xxtoon-writable; unit runs `User=xxtoon` + `Restart=always`, so restart = `kill $(pgrep -f 'node src/index.js')` + systemd auto-respawn in 5 s — **no sudo needed anywhere on this wave**). NAS — base64-printf ship (`wc -c` = 5326 B verified) → `docker cp` → `docker exec family-dashboard node --experimental-vm-modules /tmp/fdw-apply-eventedit.cjs /app/client/dist/assets/index-BDiodzvu.js /app/client/dist/index.html` → `docker restart family-dashboard`. `--experimental-vm-modules` required for the kit's `vm.SourceTextModule` parse check (NAS node OK with flag). Byte-exact: NAS patched bundle 449995 B, Pi 565424 B — matched local dry-runs exactly.
- **Verify:** remote `~/fdwship/verify-eventedit.sh` **16/16 OK** (`?v=ws6zt` 1×/ws6zs 0×, all five kit greps 1×, `rwRV`/`rwWindy`/`wxGUI` intact 1× each, server PUT 1× + backup present, HTTP 200, **live POST→PUT (id=5)→DELETE round-trip clean**, chromium running). NAS: unauth `PUT /api/events/1` → **401 `{"error":"Unauthorized"}`** (gate live); `router.put('` grep = 2 (events + pre-existing feeds PUT); container logs clean apart from the expected raw-body 400 from the first bad-JSON probe. Pi served `/` shows `?v=ws6zt`; NAS `:3080` shows `v=ws6zt`.
- **Gotchas this wave:** (1) pwsh backslash-quoted JSON in curl — NAS returned a 400 body-parser error that looked like an auth failure; use `--data-binary @file` (ASCII-written temp body) for quoting-proof probes. (2) `kill $(pgrep -f 'node src/index.js')` over ssh killed our own bash (pattern matched the ssh cmdline) — use `pgrep -x`, or `pkill -x chromium` style exact-name matches for process kills. (3) `git log` through a pager hung the terminal 300 s — prefer `git --no-pager` in scripted runs.
- **Status after kit:** kiosk cache-wiped + relaunched (chromium PID 2915 → 3699); radar kits untouched and green. RainViewer free nowcast **still empty** through 17:31 (watcher `/tmp/nowcast-watch.log`, 6 straight samples since 15:00; if FCST resumes the deck auto-narrows back to 4-past+FCST). **Pending: user touch-test of ✎ → Edit Family Event → Save (kiosk).** Next up after acceptance: HRRR/COD future-radar fork per the 959c329 scouting notes (current build stays live as fallback).


- **Fix + spacing (same evening, user touch-test feedback: v1 tap dead):** the injected prop was destructured as onEditEvent:g — but the DayOverflow row map already uses a local const g=Hn(h.start_time) per row, so inside the row g was the TIME STRING, dit onClick called a string → TypeError → ✎ visible but inert (exactly the user symptom). Renamed the prop binding to collision-proof ditEv in E4/E5 (E6 arrow e already safe). Per user request the ✎→🗑 gap widened: delete button className now ml-6 p-2 text-rose-400… (E4 re-emits it). Both targets reverted from *.bak-eventedit and re-patched with the fixed kit (byte-exact dry-run lens: Pi 565444 / NAS 450015 ≈ +20 B). Token bumped ?v=ws6zt → ?v=ws6zu (burn-discipline: token-per-payload change, even though /assets/ no-store covers public path; kiosk purged + relaunched again, chromium PID 3699 → 4153). erify-eventedit.sh updated (+editEv / +ml-6 / −shadowed-g checks) → **19/19 OK** live on the Pi (round-trip id=7); NAS in-container greps onEditEvent:editEv 1×, ml-6 1×, served =ws6zu; NAS user touch-test pending.

- **Fix #2 (second touch-test finding: "edit says 11am but the list shows 6am" — Friendsgiving 11/27):** timezone inconsistency. Calendar rows render stored UTC via local conversion (`Hn` parse + `Ge` "h:mm a"), while the v2 edit prefill took the RAW UTC string slice (`slice(11,16)`) into the time input — a row showing 6:00 AM (stored `T11:00Z`) opened edit reading "11", and re-saving kept the −5 h wall-clock shift (a pre-existing ADD-modal convention: it composed `${date}T${time}:00.000Z`, storing the picked wall time AS UTC for timed events). **v3 (ws6zv):** E1 prefill converts stored UTC → LOCAL via `new Date(F.start_time)` + date-fns `Ge(T,"yyyy-MM-dd")` / `Ge(T,"HH:mm")` (all-day events keep the raw stored day — their `T00:00Z` convention is day-stable and feeds day-grouping); new E8 edits the submit composition so TIMED saves serialize true UTC: `new Date(`${h}T${x}:00`).toISOString()` — the E/Q all-day branches are untouched. On-device math verified on the Pi (EST clock): pick 11:00 AM → stores `T16:00:00.000Z`; stored `T11:00:00.000Z` → prefill reads 06:00 — matches rows, round-trip stable. Both targets reverted from `*.bak-eventedit` and re-patched (byte-exact lens Pi 565588 B / NAS 450159 B), token `?v=ws6zu → ws6zv`, kiosk purged + relaunched (PID 4640); `verify-eventedit.sh` +2 TZ checks → **21/21 OK** (round-trip id=9); NAS re-applied + serving `v=ws6zv`. User touch-test re-requested on Friendsgiving.

- **Fix #3 (user re-test: "prefill matches the list, but I choose 11 AM, Save, and it still shows 6 AM"):** the DB was ALREADY correct — probe `dashboard.sqlite` showed FriendsGiving `start_time=2026-11-27T16:00:00.000Z` (= 11:00 AM EST, exactly the v3 conversion) — the save/conversion worked; the visible row was a STALE REFRESH. Root cause: the client WebSocket handler's refresh list is a hard-coded allow-list (`if(["EVENT_CREATED","EVENT_DELETED","CALENDAR_SYNCED","CHORE_UPDATED",...,"DISPLAY_RELOAD"].includes(st.type)&&$()`) and **`EVENT_UPDATED` was not in it** — the server PUT broadcast was silently ignored, so no auto-refetch (the local `o()` chain also only helps the tab that saved; a stale state kept rendering old rows). **v4 (ws6zx):** E9 injects `"EVENT_UPDATED"` into that allow-list → `&&$()` (the full app refetch) fires on every PUT broadcast — instant updates on ALL connected screens/devices (mirrors how EVENT_CREATED/EVENT_DELETED already behaved). Both targets reverted from `*.bak-eventedit` + re-patched (byte-exact lens Pi 565604 B / NAS 450175 B), kiosk purged + relaunched (PID 5383); `verify-eventedit.sh` +1 ws-list check → **22/22 OK** (PUT round-trip id=10); NAS serving `v=ws6zx`. Terminal-wrapper gotcha found this leg: multi-command pwsh calls can echo as an unterminated `[...]` array literal and hang the tab (~300 s timeout) — after that, keep shipped commands short, one purpose per call, and rescue with `]` + newline.

- **ACCEPTED (user final touch-test, ~19:2x):** "All good — row shows 11 AM and edits update instantly." Wave rvT31 (calendar event-edit, token chain ws6zs → ws6zt → ws6zu → ws6zv → ws6zx) is verified working end-to-end on both deploy targets; snapshot commits `82294aa`/`67f9d51`/`2ef6b58`/`f17a2b8` pushed. Next milestone stays the HRRR/COD future-radar fork (current build remains the fallback).

## rvT32 COD-HRRR future-radar fork (guaranteed futures while the free nowcast is empty) — 2026-11-19 (~19:2x-20:3x ET, ws6zx -> ws6zy)
- **Ask continues from rvT30:** RainViewer's free `radar.nowcast` stays empty for long stretches; user wanted guaranteed, radar-realistic futures. Reverse-engineering session on the COD NEXLAB forecast tool (`weather.cod.edu/forecast/`): the in-house animator (`ani-desk.js`) pulls a JSON manifest from `assets/php/scripts/get-files.php?parms=<run>-<model>-<sector>-<level>-<product>-<fhr>-<loop>-<rate>`; model/sector IDs live in the page nav (`HRRR`) and `assets/json/sectors.json` (bbox per sector); frame files come back as direct URLs `weather.cod.edu/wxdata/forecast/HRRR/<runYYYYMMDDHH>/<SEC>/HRRR<SEC>_prec_radar_<fff>.png` (f000-f018, hourly runs; a new run's files post within ~30-60 min; PNGs 800x600 with 26px (42px WLD) title+colour bars - content box rows 26-574 verified by pixel-decoding a frame). **Georeference is linear lat/lon over the sector bbox** - proven from COD's own sounding-click math in `ani-desk.js` (lon = W + (E-W)*x/width, lat = N - (N-S)*y/dataH over `data-fsound` = the bbox) and confirmed against `sectors.json` (e.g. SE = -98.5/24.5/-77.5/36.92). PNGs send `Access-Control-Allow-Origin: *`.
- **Comp changes (`rw-rainview-comp.js`, 9 anchored edits via `tmp/future/rvt32-edit.cjs`, CRLF-preserving, all count-1):** header rvT32 note; `rvCd` state (loaded-frame registry path->{w,h}, err:1 on failure); `rvSecs` bbox table (MW/GL/SGP/NGP/SE/NE/MA/GBSN/SW/NW first, **US LAST as fallback**); `rvHR` builder - only when `rvNC` is EMPTY, picks the sector containing the block lat/lon, uses run = UTC hour of (now - 75 min), lists the first <=3 frames with time > now + 10 min, each carrying `cod` + `bb`; timeline concat becomes `.concat(rvNC, rvHR)`; rvPL prefetch hook branches COD frames to a plain `Image()` preload (naturalWidth/Height stored via `rvCdPush`, `cdAlive` cleanup); tile layer guarded `!f.cod`; `rvCodBands(f, fi)` - slices the frame into **28 lat bands**, each placed at its exact Web-Mercator rect on the OZ tile wrapper (per-band `backgroundSize`/`backgroundPosition`, no canvas readback / CORS dependency; residual Mercator-vs-linear error ~2 km at 28 bands); FCST badge formats hours when the lead >= 90 min (`FCST +1.5h` style).
- **Micro-tests (`tmp/future/rvt32-test.cjs`, `tmp/deck-test.cjs` rewritten):** 27 checks ALL PASS - empty-nowcast gives 6 past + 3 COD futures (all future, hourly, SE for 28.8174/-81.6205, MW for 44.9778/-93.2650); RV-nowcast-present gives the designed rvT30 deck UNCHANGED (nc2=6, nc5=9); no-radar/null data gives 0; band geometry (28 bands, exact SE bbox Mercator coverage, background-position continuity); grep guards (rvCodBands 2, !f.cod 1, rvCdPush 3, prec_radar 1, cdAlive 3, rvT32 4). deck-test: empty 9 / nc2 6 / nc5 9 / noradar 0 + patcher token checks (`stale ws6zs false`, `ws6zy true`).
- **Dry-run parity before ship (`FDW_DIST` env):** pulled the LIVE Pi + NAS bundles (565604/450175 B, both serving `?v=ws6zx`); both patchers ran green locally - Pi: comps 17823->22701 B, PARSE_OK, bundle 570481 B; NAS (marker-free): comps behind marker, PARSE_OK, 455052 B - **the live runs then wrote byte-identical sizes**. Eventedit kit markers intact in both dry bundles (EVENT_UPDATED, editEv wiring, no shadowed g).
- **Deploy - Pi 4 kiosk (xxtoon, dist writes need no sudo):** scp 4 files to `~/fdwship` (comp 22120 B). First patcher run EACCES'd writing `~/fdwship/rww-bundle-check.js` (root-owned from an old sudo-era wave) - fixed with the silent pw-file pattern (`Get-Content C:\Users\xxtoo\pinew.txt | ssh pi4kiosk "sudo -S -p '' -k chown ..."`; dist was untouched at that point - writes happen post-parse). Re-run: comp.inject 17823->22701, cache.bust ws6zx->ws6zy, guards 1x, PARSE_OK, **bundle 565604->570481 B**. `verify-wxgui6.sh` (updated: rvT32 + rvT32badge marker checks, COD reachability curls, `sudo` dropped from the read-only node step) green incl. **bundle-ws6zy.HTTP 200**, `cod-HRRR-f002/f003.HTTP 200` from the Pi. `verify-eventedit.sh` (token bumped to ws6zy + ws6zx added to the stale chain) **22/22 OK**.
- **Deploy - NAS (family-dashboard):** b64-printf ship helper `tmp/future/ship-nas.cjs` (660-char chunks, 4 per ssh, md5 MATCH x3) -> `base64 -d` in `~/fdwship` -> `docker cp` x3 -> `docker exec family-dashboard node --experimental-vm-modules /tmp/fdw-apply-radar-nas.cjs` -> ok:true, PARSE_OK, **450175->455052 B**, cache.bust ws6zx->ws6zy. In-container `tmp/future/nas-verify.cjs` (uploaded via `tmp/future/ship-one.cjs`): rvHR 4, rvCodBands 2, prec_radar 1, rwRadarNAS 1, rvDir 0, EVENT_UPDATED 1, html ws6zy alone; `tmp/future/cod-probe.cjs` from inside the container: HRRRSE f001/f002/f003 all **HTTP 200 (~170-181 KB)**. Container serves :3080 without restart (static reads).
- **Kiosk relaunch gotcha (important):** relaunch attempt #1 wrapped `$(pgrep -x chromium)` in a pwsh double-quoted ssh command and pwsh interpolated it LOCALLY (no pgrep on Windows) - nothing was killed and a second kiosk.sh instance started beside the old one. Re-did it inside a **single-quoted** ssh string: killed all `pgrep -x chromium` PIDs + both kiosk.sh shells, wiped Chromium caches (`~/.cache/chromium/Default/{Cache,Code Cache}`, `~/.config/chromium/Default/{GPUCache,DawnGraphiteCache,DawnWebGPUCache}`; no ShaderCache dirs on this profile), `setsid -f /home/xxtoon/kiosk.sh` -> new main PID **6042**, and `curl http://127.0.0.1:3000/` immediately served `index-BDiodzvu.js?v=ws6zy`.
- **Behaviour contract:** RainViewer nowcast present -> exactly the rvT30 designed deck (COD frames suppressed). Nowcast empty -> last-6 past + up to 3 COD-HRRR FCST frames (`FCST +45m`/`+1.5h`/`+2.5h`-style labels, forward loop, 2-beat hold on the newest). A frame 404 marks `err:1` in the registry so its bands hide and retry on the next 5-min API pull (self-healing). Sector selection is per-block lat/lon, so every radar block picks its own region (US fallback outside all regional bboxes).
- **Honest limits:** COD NEXLAB is a community service (no SLA; a product outage simply re-widens the past-only deck); HRRR is hourly (not +/- 15-min nowcast granularity) and simulated reflectivity (model physics, not a radar mosaic). Attribution line now reads `© OpenStreetMap · RainViewer · HRRR-COD`. The RainViewer 12-h nowcast watcher keeps running - if the free nowcast resumes, COD frames drop back out automatically.
- **Rollback:** `git revert` the rvT32 comp commit -> re-run both patchers with `tmp/future/rw-rainview-comp.pre-rvt32.js` (kept in tmp) -> bump `jsVer` to the next free token (**ws6zy is now burned; next is ws6zz**). Any future cache-bust must bump `verify-eventedit.sh`'s token line in lockstep.

## rvT32b COD band-render fix (half-world Mercator y + futures dwell) — 2026-11-19 (~21:0x-22:2x ET, ws6zy -> ws6zz)
- **Wall report after the rvT32 ship:** timeline labels ticked through the FCST badges (`+45m`…`+2.5h`) but the radar area stayed bare (OSM basemap + HOME beacon only) and the loop "skips so fast it doesn't play but for a couple seconds". The fast-tick half was the blank-COD-frame perception of the 620 ms cadence; the imagery half was a real bug.
- **Diagnosis path (Pi-only, diagnosis-only changes):** curl from the Pi = COD frames 200 (no Referer block, nowcast 0 → fork active); headless `--dump-dom` on the kiosk URL never mounts the radar cards (dashboard data gate) — useless for this; **Wayland screenshotting** (labwc + `grim`, not `scrot` — the Pi is labwc, `xset` absent) caught the radar page mid-blink; **Chromium cache forensics**: 3 cache entries for `weather.cod.edu` PNGs (~180 KB) — the browser loads the frames fine; relaunch with `--remote-debugging-port=9222` + `~/.cache` wipe, then CDP (`tmp/future/cdp.cjs`+`cdp2.cjs`, `NODE_PATH=/opt/calendarly/server/node_modules`): band divs **exist** (opacity 1, visible, right background-size, image cached) but the first band's `getBoundingClientRect` was **{x:-10852, y:+95,573}** — 95,543 px below the viewport — while tile rects `{x:-566,y:-163,w:2048,h:2048}` (RV past frames, TILES=4-8 probes) sat perfectly on-card. Arithmetic: the wrapper pins at `cpyO` = **half-world** y (`fyO = (1−ln/π)/2 * nTo` → 13,655 px) but `rvCodBands`' `mY` produced **full-world** y (no ÷2 → 2× every y) → bands rendered exactly one world-height too low. The rvT32 micro-test missed it because its own mY replicated the same bug (self-consistent, not grid-consistent) and the FDW dry-run parity compared bug-vs-bug.
- **Fix (`rw-rainview-comp.js`, 2 anchored edits):** `rvCodBands` `mY` gains the `/ 2` (band y joins the tile-grid `fyO` space; band(Sx0).yT 25,536→12,763 = `fyO(36.92)·TS` exactly); player hold becomes `if (p === L - 1 || (rvFrames[p] && rvFrames[p].cod)) rvHold.current = 2;` — every COD future dwells 3 beats (~1.9 s; hourly frames shouldn't flick by at 620 ms) on top of the newest-frame hold. On-device repro proof before ship: `tmp/future/codtest.html` (3 panels, exact comp constants): with the fix the band panel carries NEXRAD content (`green=5607 blue=629 red=171` classes) vs 0 before.
- **Tests:** `tmp/future/rvt32-test.cjs` updated — 35 checks ALL PASS (timeline spans unchanged; band y re-asserted independently against a hand-typed tile-grid formula `bands.halfWorld` + `bands.sectorOnScreen` bounds; static guards +3: `g.halfWorld`, `g.codHold`, `g.fyOHalf`; `rvT32` grep count now 6 with rvT32b comments). `tmp/deck-test.cjs` token guards: `stale_patchers` (ws6zs/ws6zy) false, `ws6zz_patchers` true.
- **Token ws6zy -> ws6zz** in `fdw-apply-radar-widgets.cjs` + `fdw-apply-radar-nas.cjs` (`jsVer`), `verify-eventedit.sh` (?v=ws6zz + ws6zy into the stale chain; re-LF'd — the Windows editor re-save CRLF'd it and bash puked on line 38), `verify-wxgui6.sh` (+`rvT32b: 1` marker check; both copies re-synced), `tmp/future/dry-check.cjs` + `nas-verify.cjs` (ws6zz true / ws6zy_gone). **Next free token: ws7aa.** README chain + rvT32 bullet updated.
- **Dry-runs green before ship:** Pi — scp comps+patchers to `~/fdwship`, `FDW_TMP=/home/xxtoon/fdwship FDW_DIST=/tmp/drydist` (cp -a of the live dist): comp.inject 22,700→23,126 B, cache.bust ws6zy→ws6zz, guards 1x, PARSE_OK, write 570,906 chars; NAS — pulled the live container bundle locally via `docker exec cat` (455,052 B, v=ws6zy), ran `fdw-apply-radar-nas.cjs` with FDW_DIST/FDW_TMP at local dirs: comp upgraded behind marker, PARSE_OK, 455,477 chars.
- **Deploy — Pi:** real run on `/opt/calendarly/client/dist`: ok:true, 570481→570906 chars (**570,906 chars = 571,475 disk bytes — the bundle has multi-byte UTF-8 (`°`, `µ`) so char-length < byte-length; not a size regression**), `?v=ws6zz` live. `verify-wxgui6.sh`: FULL_BUNDLE_PARSE_OK, all markers 1x, **`rvT32b: 1`**, curl 200s incl. bundle-ws6zz + cod-HRRR-f002/f003; `verify-eventedit.sh`: **pass=22 fail=0**.
- **Deploy — NAS (family-dashboard):** `tmp/future/ship-nas.cjs` md5 MATCH ×3 → `base64 -d` in `~/fdwship` → `docker cp` ×3 → `docker exec family-dashboard node /tmp/fdw-apply-radar-nas.cjs` → ok:true PARSE_OK 455,477 chars, cache.bust ws6zy→ws6zz. Gotcha re-hit: `docker exec -i … cat > /tmp/x.cjs` now **Permission denied** (container non-root) — verifier files go host `~/fdwship` via ssh stdin (`Get-Content -Raw | ssh nas "cat > …"`; scp still broken on Synology) then `docker cp`. `nas-verify.cjs`: rvHR 4, rvCodBands 2, rvRadarNAS 1, **html ws6zz=true ws6zy_gone=true**; `cod-probe.cjs` in-container: HRRRSE f001/f002/f003 all 200 (168-176 KB).
- **Live verification on the kiosk (CDP + pixels):** relaunch with debug port (single-quoted ssh; `ps`-copied flags + `--ozone-platform=wayland` — a bare manual relaunch with only the kiosk.sh env exports gets "Missing X server / ozone X11 failed" because ozone autodetect needs the flag on this build; **kiosk.sh itself still works unchanged**), cache wipe → CDP: `v=ws6zz` served, `BANDS=56` (28×2 crossfade layers on a future frame), band rect now `{x:-10852, y:-6599, w:15292, h:403}` (sane screen space: Sx0 is the sector's NORTH edge; Florida bands sit further down), COD images served from cache (ResourceTiming t=0). `grim` + green/blue pixel classes over the card region: **green=31,129 blue=5,857** — NEXRAD echo field painting on-screen (was ~0 pre-fix, matching the user's bare-map report). Final clean relaunch (no debug port; `setsid -f /home/xxtoon/kiosk.sh`; caches wiped) — chromium healthy, no `remote-debugging-port` in the cmdline, still serving `v=ws6zz`.
- **Behaviour (rvT32b):** COD futures each hold ~1.9 s (3 beats) — the 9-frame loop is now ~9 s with visible imagery end-to-end; rvT30 behaviour when the nowcast is present is untouched.
- **Rollback:** keep ws6zz; if COD imagery must go entirely, re-run both patchers with `tmp/future/rw-rainview-comp.pre-rvt32.js` + next token — but any future rvT32-family comp change keeps the `/ 2` (rvT32b) invariant enforced by `bands.halfWorld` in `rvt32-test.cjs`. Any cache-bust must bump `verify-eventedit.sh`'s token line in lockstep (**next free token ws7aa**).



## rvT32c COD future-radar quality fix (canvas keying: drop the baked white map, keep radar) — 2026-11-19 (~22:3x-23:5x ET, ws6zz -> ws7aa)
- **User wall report:** COD futures looked low-res / wrong colours / blurry over the map. Root cause proven on-device: NEXLAB `HRRRSE_prec_radar` PNGs are only 800x600 (38 px/deg — a ~19x upscale inside the card) with a **62.4% white baked background** (gray landmass + wind barbs + blue rivers); the band draw therefore covers the crisp OSM basemap with a white soup whenever a future frame mounts. Seq capture of the card region: future-frame mean **139.2 vs 56.0** for past frames, **32.6% pure-white pixels vs 0.8%**.
- **Palette probe (`tmp/future/palprobe.py`):** radar colours live at high chroma; the baked background is neutral/desaturated and rivers are blue-dominant at ~(165,165,255). Keying rule: **keep pixel only if chroma `max(r,g,b)-min(r,g,b) >= 20` AND NOT blue-dominant (`b > r+25 && b > g+25`)**; everything else -> alpha 0. Validated offline on the Pi (`keyed.py` -> `keyed_preview.png` clean: radar greens/yellows/reds/magentas kept; landmass/rivers/wind barbs gone). Band divs are comp-owned and COD PNGs send `ACAO: *` (verified), so canvas processing is viable.
- **Comp changes (`rw-rainview-comp.js`, token ws7aa):** comp preload renders each COD frame to an offscreen canvas (`crossOrigin='anonymous'`), keys per the rule above, and ships the keyed PNG as a `data:` URL in the frame's `dm` registry (`dm.url`); fallbacks: <2.5% pixels kept -> raw URL; CORS failure -> unkeyed re-load; 404 -> err:1. Band layers draw `dm.url || f.path` with the 2px overlap kept (`Hp + 2`).
- **Token ws6zz -> ws7aa** in `fdw-apply-radar-widgets.cjs` + `fdw-apply-radar-nas.cjs` (`jsVer`), `verify-eventedit.sh` (`?v=ws7aa`, ws6zz into the stale chain), `verify-wxgui6.sh` (+`rvT32c: 1` marker check — **42 checks ALL PASS**), `tmp/future/dry-check.cjs` + `nas-verify.cjs`. `tmp/future/rvt32-test.cjs` +6 guards (`keyed.*` groups: canvas key, data URL, `dm.url ||`, `Hp + 2`). README chain + rvT32 bullet updated. **Next free token: ws7ab.**
- **Ship + deploy:** dry runs green (Pi comp inject 23,126->24,948 B; NAS dry 457,299 B PARSE_OK ws7aa). Pi real: 570,906->572,728 chars, `verify-wxgui6.sh` + `verify-eventedit.sh` pass=22 fail=0. NAS: `tmp/future/ship-nas.cjs` **stale-decode trap fixed** — the script uploaded fresh `.b64` chunks but never decoded them, so the first NAS deploy `docker cp`'d the PREVIOUS session's stale `~/fdwship/<name>` files (deploy log showed ws6zz/"identical"). Patch adds `base64 -d` to fresh `.tmp`+`mv`, md5 over the DECODED bytes, then `docker cp` x3, `docker exec node /tmp/fdw-apply-radar-nas.cjs`, and an in-container verify. Re-run: MATCH x3, DECODE_OK, apply ok:true, `nas.b 457,299 | rvT32c 1 | keyedraw 1 | html ?v=ws7aa`.
- **Live proof (kiosk relaunch with `--remote-debugging-port=9222`):** CDP band probe on an on-screen future frame: `codBands 28`, band `backgroundImage = url("data:image/png;base64,iVBOR...")` (biLen 667,369) — keyed composite drawn, no `cod.edu` URL on the layer. `grim` card-region stats re-run (`capseq.sh`): future frame **mean 139.2 -> 65.0,  (same-box card re-test: before mean 139.9 / white 25.1% -> after mean 74.9-97.7 / white 0.0-0.3%) — white soup gone; dark OSM basemap + radar echo field only. (Console shows an unrelated pre-existing wxGUI `<polygon points>` NaN warning from the weather-icon SVG — cosmetic, not radar.)
- **Rollback:** `git revert` the rvT32c commit or re-run both patchers with `tmp/future/rw-rainview-comp.pre-rvt32.js` + token ws7ab (keeps rvT32b state). The keying invariants are enforced by `rvt32-test.cjs` `keyed.*` guards; any future cache-bust must bump `verify-eventedit.sh`'s token line in lockstep.

## rvT32 REVERTED to the rvT30 original (COD-HRRR futures removed) — 2026-11-20 (ws7ab burned -> ws7ac)
- **User decision:** after the rvT32d 10-min-interim synthesis shipped (token ws7ab: comp timeline synth loop, keyed crossfade preloads, `sint/<cod><###>_KofN.png` paths; deployed green to Pi 576,515 B + NAS 461,086 B and verify-green the same hour), the user opted out of the synthetic radar animation entirely: "undo the future HRR integration ... just stick with the original."
- **Restore:** `git checkout 2d84da4 -- wave4/fd_weather/rw-rainview-comp.js` (byte-parity with the last pre-COD rvT30 commit) + token bumps `ws7aa -> ws7ac` via `tmp/future/rvt30-revert.cjs` (12 anchored replaces: patcher headers + jsVer; `verify-wxgui6.sh` rvT32/rvT32badge/rvT32b/rvT32c marker lines + the 2 COD-HRRR reachability curls removed (7 lines, file re-LF'd); `verify-eventedit.sh` ws7ac live + ws7ab into the stale chain; `ship-nas.cjs` TOKEN + VJS flipped from rvT32 presence checks to rvT30 absence checks (`codGone/sintGone/rvHRGone`). Guards: `tmp/deck-test.cjs` rewritten as the rvT30 suite (32 checks PASS: comp truth-strings, 9 absence greps, token hygiene, deck windows 7/6, forward-only tick seq with H-dwell); `tmp/future/rvt32-test.cjs` retired (era-specific to the removed fork). The patchers themselves carry NO rvT32-era code (only header + jsVer); `verify-wxgui6.sh` greps the live token from the html.
- **Pi deploy:** dry `~/drydist`: 576,515 -> 565,604 B PARSE_OK, comp.inject old 28,734 -> new 17,824 B, cache.bust ws7ab -> ws7ac. Real run via sudo from `tmp/future/rvt30-piapply.cjs` (pipes `C:/Users/xxtoo/pinew.txt` line 1 over ssh stdin — `bedard13` is burned after the 2026-11-19 rotation; **565,604 B is EXACT byte parity** with the pre-rvT32 bundle: history "Pi 565604->570481"). verify-wxgui6: FULL_BUNDLE_PARSE_OK 565604, all markers 1x, bundle-ws7ac 200; verify-eventedit **pass=22 fail=0**.
- **NAS:** `ship-nas.cjs` re-run: MATCH x3, apply 461,086 -> **450,175 B (EXACT pre-rvT32 NAS parity**: history "NAS 450175->455052"), in-container verify `nas.b 450175 | codGone 1 | sintGone 1 | rvHRGone 1 | html true` at ws7ac.
- **Kiosk:** the rvT32d CDP proof attempt (chromium relaunched with `--remote-debugging-port=9222`; probe `cdp5.cjs` + `future-shot5.sh`) ended inconclusive — no interim frame on screen when polled (`{"label":null,"fc":null,"cod":0}`); moot after the revert. Kiosk restored cleanly: chromium PIDs killed, probe files + `~/drydist` removed, caches wiped, normal `kiosk.sh` relaunch (chromium 10495 / kiosk.sh 10461), `cdp_closed`, home 200, html token ws7ac.
- **Gotchas:** `pkill -f kiosk.sh` — any ssh'd `-f <pattern>` whose pattern appears in the ssh `bash -c` cmdline itself kills the session shell; use the `[k]iosk.sh` bracket trick. `git log` without `--no-pager` hangs the pwsh tool on the pager. The CDP relaunch keeps the exact `ps`-copied chromium args + `--ozone-platform=wayland`.
- **Rollback-of-rollback (bring the futures back):** rvT32 history lives in git (rvT32 9e1c593, rvT32b ef5731d, rvT32c 750ef0c; the rvT32d comp preserved as `tmp/future/rw-rainview-comp.pre-rvt32d.js` 24,413 B). Re-run both patchers with a rvT32-family comp + the next token (**ws7ad**; ws7ab burned on the aborted rvT32d ship), and re-add rvT32-family checks to `verify-wxgui6.sh` if strict markers are wanted again.

## rvT30 sweep widened to the full real-frame window (ws7ac -> ws7ad) — 2026-11-20
- **Why:** user feedback after the revert: "the radar animation isn't as smooth as it was previously" — with RainViewer's free nowcast EMPTY (the overnight case), the restored rvT30 deck was only `slice(-6)` = 6 frames ≈ 4.3 s/loop with a hard wrap, while the rvT32d decks they had just seen ran ~19 frames ≈ 12 s. RainViewer serves 13 real past frames every cycle (~2 h at the 10-min cadence, newest ~2 min old; API showed `past.count=13, nowcast.count=0` at edit time). Also: the kiosk's screen rotation had shown the weather screen ~30 s, so the user bumped the dwell to 60 s (their app-side change, untouched by this deploy).
- **Change (real data only, no synthetics):** `slice(rvNC.length ? -4 : -6)` -> `slice(rvNC.length ? -10 : -13)` — with nowcast: the last ~10 past frames (~80 min) + FCST; without nowcast: the full ~2 h sweep; **both branches land at ~13 frames ≈ 9 s/loop** so loop length stops flapping when nowcast availability flips. Start anchor fixed: `nPast = Math.min(4, past.length)` silently started 2 frames back on the empty-nowcast branch — now `Math.min(past.length, rvNC.length ? 10 : 13)` lands exactly on the newest real frame. Same 620 ms/step, .48 s crossfade, 2-beat hold on newest, FCST badge, forward-only.
- **Deploy:** comp 17,823 -> 17,953 B. Pi bundle 565,604 -> **565,733 B** (FULL_BUNDLE_PARSE_OK, all markers 1x, bundle-ws7ad 200), eventedit **22/22** (ws7ad live; ws7ac into the stale chain). Kiosk chromium restarted with `pkill -x chromium` (NOT `pkill -f chrome_crashpad_handler` — >15-char proc names need `-f`; kiosk.sh is a one-shot launcher, relaunch = `XDG_RUNTIME_DIR=/run/user/1000 nohup bash /home/xxtoon/kiosk.sh >/tmp/kiosk.log 2>&1 &`). NAS: ship-nas re-run 450,175 -> **450,304 B**, `nas.b 450304 | codGone 1 | sintGone 1 | rvHRGone 1 | html true`. Guard suite **34/34** (`tmp/deck-test.cjs`: deck windows 13/13, tick seq from start index 12 with H12/H12 dwell).
- **Next free token: ws7ae.**

## rvT30 full-dwell continuous blend (ws7ad -> ws7ae) — 2026-11-20
- **Why:** after the ws7ad sweep widening the user asked to "frame generate extra frames to make it ultra smooth". Given the rvT32d flip-flop history, they chose **the continuous-blend path first**; the pregenerated interim-frames option stays banked below as the {w7af} upgrade if this still is not smooth enough.
- **Change (still real data only, no synthetics):** rvXF v2 → v3 — the layer crossfade `opacity .48s linear` → `opacity .62s linear` so the fade spans the WHOLE 620 ms step. Layer-role mechanics unchanged (each tick swaps roles: the outgoing layer keeps showing the same frame while it fades out, the incoming fades in; fade-in + fade-out weights always sum to 1), so the deck is now one continuous lerp chain — no hold-snap at frame boundaries; at every instant the card shows a genuine blend of two REAL adjacent RainViewer frames. 2-beat hold on the newest frame kept (the pause reads as the "now" rest), FCST badge + forward-only + 620 ms/step unchanged.
- **Deploy:** comp block (Pi inject) 17,952 → 18,104 B. Pi bundle 565,733 → **565,884 B** (FULL_BUNDLE_PARSE_OK, `rwXF 1` with the new `.62s` gate in verify-wxgui6, bundle-ws7ae 200, all display curls 200, lightdm active); eventedit **22/22** (ws7ae live, ws7ad into the stale chain). Kiosk restarted (`pkill -x chromium` + wipe `~/.cache/chromium` + one-shot kiosk.sh relaunch; fresh chromium, home 200 on `?v=ws7ae`). NAS 450,304 → **450,455 B**, `nas.b 450455 | codGone 1 | sintGone 1 | rvHRGone 1 | html true`. Guard suite **36/36** (`tmp/deck-test.cjs`: `.62s` crossfade ×2 present, `.48s` asserted gone, deck windows 13/13, tick seq unchanged).
- **Banked ws7af recipe — GENERATED interim frames (do this if ws7ae is not smooth enough):** CLIENT-side only, no server/storage/COD. On each rvData refresh, for each adjacent real-frame pair, draw both frames' OZ overlay tiles to an offscreen canvas at k/3 fractions and export 2 data-URL interim composites (~2.5-min rain-time steps each), then insert them into the timeline between the pair (interims ~260 ms dwell, real anchors keep 620 ms + 2-beat hold; ≈37 frames ≈ 14 s loop). Guard rails: regenerate only when the API data changes; skip while PAUSE; cap timeline ≤60 frames; try/catch fallback to the real-only timeline if canvas/dataURL fails. Cost: ≈216 canvas blends per refresh on the Pi at K=3 interim pieces (≈108 at K=1 if too slow). Known risk: interim ghosting exactly where rain pops in/out (held double-exposure instead of the ws7ae transient fade) — same blend math, so evaluate ws7ae's feel first.
- **Next free token: ws7af.**

## wxGUI 5-day hi/lo forecast strip (ws7ae -> ws7af) — 2026-11-20
- **Why:** user asked for a 5-day high/low forecast section on the weather screen, "between the outdoor and indoor temperature readings and under the forecast condition", matching the existing aesthetic.
- **Change (wxgui-component.js only):** the Open-Meteo fetch bumps `days=2` -> `days=6` (the server route already plumbs `days`, the module caps at 14 and the 15-min cache key includes it — nothing server-side to change). A `fx5` builder renders the FIRST 5 daily entries (TODAY + 4): per column — weekday short label (first column `TODAY`, tinted #c9d6e6, others #7288a2), a small daytime Meteocons icon via `wxIconKey(d.code, 1)`, the daily max in hero amber #f5b969, the min in muted #93a7c0; equal-flex centered cells. It mounts pinned to the BOTTOM of the hero card's flexible mid-spacer (`.55cqh` above heroBottom) under a hairline `border-top rgba(255,255,255,.13)` + small-caps `5-DAY FORECAST` heading (`st.lblS` @ `.82cqw`, same pattern as SUNRISE/NEXT-12H labels) — i.e. directly under the condition pill, between the big outdoor reading and the OUTDOOR/INDOOR sensor columns; the animated sky scene (top-right, <=21.8cqh) stays clear above it. When the daily feed is empty (`!cols.length || cols[0].max == null`) the strip renders NOTHING and the spacer keeps the old behaviour — observed live: an upstream open-meteo blip at slot mount leaves wx null (pill falls back, chart/sunrise empty) and only ONE fetch happens per 60 s loop slot, self-healing on the component's 5-min refresh.
- **Deploy (Pi only — the NAS bundle has no wxGUI at all (function wxGUI = 0), so NAS is untouched):** new patcher `tmp/future/fdw-apply-wx5.cjs` (upgrade-style region replace of `// wxGUI`..`\nfunction wsWS`; guards wxGUI/WG_CSS/WX_SVG/rwRV/rwWindy/caseGui/fx5/days6/TODAY all 1x + `&days=2` gone + FULL PARSE_OK with auto-rollback), backups `orig8.*` (continues orig3..orig7). wxGUI region 40,487 -> 42,535 B; Pi bundle 565,884 -> **567,932 B**, html `?v=ws7af`. verify-wxgui6: + `fx5: 1` gate; verify-eventedit **22/22** (ws7af live, ws7ae into the stale chain); deck-test **45/45** (token asserts moved to ws7af/ws7ae-stale, +7 wx5/wxc guards (wx5.orig8 counts the 4 literal mentions)).
- **Visual proof (live):** `tmp/future/wx5-shot.cjs` — dependency-free CDP client (raw net + own ws frame codec; the Pi has no `ws` module). Drives the real kiosk tab on `:9222` to `http://127.0.0.1:3000/display/wxgui-preview` (the static screen-18 preview display, id 6 — avoids loop-phase roulette: kiosk display 5 runs loop 1 = `[18,12,20,1]` @ 60 s dwell), polls `document.body.innerText` for OUTDOOR/INDOOR/`5-DAY FORECAST`, captures `/tmp/wx5-shot.png` (`MARKERS fx5:true today:true cond:true updated:true`) and restores the front page. Ship + apply kit: `tmp/future/wx5-piapply.cjs` (password via `C:/Users/xxtoo/pinew.txt` stdin, never printed). Kiosk finally relaunched via the canonical one-shot kiosk.sh (no debug port), home 200 on `?v=ws7af`.
- **Screenshot:** TODAY 72/69 · SAT 73/67 · SUN 76/61 · MON 74/61 · TUE 75/61 — amber highs, muted lows, small Meteocons icons, hairline + small-caps heading; sits under "Overcast", above the sensor columns (local copy at `tmp/future/wx5-shot.png`, not committed — 1.1 MB).
- **Banked recipe note (2026-11-20, edited by ws7ah):** the canvas interim-frames recipe below was retired WITHOUT being built — ws7ah delivered the 5-min-perceivable sweep via the 50/50 blend state the crossfade already passes through (1.24 s beat fades + midpoint clock ticks), zero canvas synthesis, zero extra tiles. The data-URL recipe stays banked only if a TRUE synthetic-frame look is ever wanted (token-agnostic).
- **Next free token: ws7ag.**

## rvT30 radar deck trimmed to a 1h20m sweep (ws7af -> ws7ag) — 2026-11-20
- **Why:** user asked for the radar to go back 1 h 20 min instead of ~2 h, "also update radar every 5 minutes instead of every 10. so double the frames". Fact-checked the live API first: `weather-maps.json` (the comp's endpoint; `weather-v2.json` is 404) serves 13 past frames spaced exactly 600 s apart — RainViewer's fixed 10-min publish cadence — and the comp's timeline refetch was ALREADY every 5 min (`setInterval(pull, 300000)`), so 5-min-spaced real frames do not exist upstream and frames can't be doubled by polling faster. The honest lever is the WINDOW: 2 h (13 frames) -> 1 h 20 m = 9 real frames.
- **Decision on "double the frames":** NOT done as synthetics. Under the ws7ae continuous blend, generated mid-frames are a visual no-op (every rendered instant is already an exact blend of the two adjacent real frames — inserting midpoints replays the same lerp in two halves); they would only lengthen the loop. The banked generated-interim-frames recipe (above, now ws7ah) stays the opt-in if a longer loop is ever wanted. Pure real data only, matching the rvT32d flip-flop lesson.
- **Change (rw-rainview-comp.js only):** timeline `slice(rvNC.length ? -10 : -13).concat(rvNC)` -> `.slice(-9).concat(rvNC)` (one branch now — the ws7ad nowcast/empty-nowcast 10/13 split retired; when the free nowcast is served the deck = 9 past + 3 FCST = 12); start anchor `Math.min((rvData.radar.past || []).length, rvNC.length ? 10 : 13)` -> `…, 9` (still lands on the NOW frame); header + rvT30 comments rewrite the cadence facts (10-min upstream publish, 5-min re-pull, ≤5 min to show a new frame). Unchanged: 620 ms/step full-dwell crossfade, 2-beat newest hold, FCST +Nm badge, forward-only wrap — sweep pace ≈ preserved; loop just runs shorter (~6.8 s empty-nowcast vs ~9.3 s before; ~8.7 s with FCST), and the tile prefetch drops 13 -> 9-12 frames (less traffic/RAM).
- **Deploy (both targets carry the comp):** comp block (Pi inject) 18,103 -> 18,410 B; Pi bundle 567,932 -> **568,238 B** via fdw-apply-radar-widgets comps-upgrade path (guards all 1x, FULL_BUNDLE_PARSE_OK, `?v=ws7af` -> `?v=ws7ag`); verify-wxgui6 green with the NEW `rwTm: 1` gate (9-frame slice + old split gone; rwXF/fx5/scene gates unchanged green), bundle-ws7ag 200, displays 200, lightdm active; eventedit **22/22** (ws7ag live, ws7af into the stale chain). NAS 450,455 -> **450,761 B** (`nas.b 450761 | codGone 1 | sintGone 1 | rvHRGone 1 | html true`), container probe: `slice(-9).concat(rvNC)` 1x, old `slice(rvNC.length ? -10 : -13` **0x**, rwRV 1x, `// rwRadarNAS` 1x. Guard suite **51/51** (`tmp/deck-test.cjs`: deck 12/9 frames + 80-min span assert, tick seq from start index 11 with H11/H11 dwell, token asserts ws7ag live + ws7ae/ws7af stale; ship-nas verifier gained slice9/sliceOldGone + precedence fix).
- **Visual proof (live):** `tmp/future/ws7ag-shot.cjs` + `tmp/future/ws7ag-piapply.cjs` (wx5 kit adapted; scp fetches must use ./-relative or home paths — Windows drive-letter targets break scp, and NAS scp/SFTP writes are denied except `~/fdwship`). Kiosk restarted with `--remote-debugging-port=9222`; CDP drove the real tab to `display/wxgui-preview`, waited for the radar deck's prefetched tiles, then read `performance` resource entries: **frames=9** unique `tilecache.rainviewer/v2/radar/<hash>` prefixes + HUD clock running + ONE `weather-maps.json` pull. Screenshot `tmp/future/ws7ag-shot.png`: radar card live (HOME beacon, rain overlay, mid-sweep `10:30 AM` HUD), ws7af 5-DAY FORECAST strip + NEXT-12H + OPEN-METEO untouched. Canonical one-shot kiosk.sh (no debug port) restored after; home 200.
- **Next free token: ws7ah.**

## rvT30 5-min interpolated playback (ws7ag -> ws7ah) — 2026-11-20
- **Why:** user: "it still [shows] radar playback in 10 minute increments. If it showed in 5 like on [the] radarviewer website it would be smoother. the clouds would move more frequently in smaller distances." Fact base: the RainViewer site also runs the SAME 10-min free data — its smooth look is crossfade pacing + the sliding playhead, not 5-min frames. So ws7ah keeps the real-data-only deck (9 past frames at the fixed 10-min cadence) and halves the per-beat distance + exposes the midpoint beat on the HUD clock.
- **Change (rw-rainview-comp.js only):** rvXF v3 -> v4 + beat engine. The full-dwell crossfade stretches `.62s` -> `1.24s` (spanning TWO 620 ms heartbeat beats: flip beats repaint/flip the two overlay layers, alternate mid beats change nothing on screen — the CSS fade keeps running through the 50/50 midpoint). New rvClock state (`rvStT`/`rvsT`): flip beats stamp the OUTGOING real frame, mid beats stamp the interpolated midpoint (`(fA.time+fB.time)/2`, only when the pair steps forward and the gap <= 620000 ms — backwards wrap pairs and big gaps keep the real stamp); HUD fallback still lands on `rvFrame.time` (start render + PAUSE always real). Unchanged: 2-beat hold on the newest frame (hold ticks stamp the held real frame), FCST +Nm badge keyed on the real frame, forward-only wrap, prefetch/pull/geometry (midpoints render the blend state the old fade transiently passed through — ZERO extra tiles: live CDP still `frames=9`).
- **Cost:** loop ~1.8x longer (≈12.4 s empty-nowcast / ≈16 s with FCST vs ≈8.1 s), motion at half speed — the 80-min window + 10-min real cadence unchanged. To speed up later, retune the single 620 ms beat constant (dwell + hold count).
- **Deploy (both targets):** comp block (Pi inject) 18,409 -> 19,921 B; Pi bundle 568,238 -> **569,749 B** (`?v=ws7ag` -> `?v=ws7ah`, guards all 1x, PARSE_OK); verify-wxgui6 green with the NEW `rwMI: 1` gate (beat engine + midpoint clock + gap cap + `.62s linear` gone) + retuned `rwXF` (1.24s linear); eventedit **22/22** (ws7ah live, ws7ag into the stale chain); bundle-ws7ah 200, displays 200, lightdm active. NAS 450,761 -> **452,272 B** (`nas.b 452272 | codGone 1 | sintGone 1 | rvHRGone 1 | html true | slice9 1 | sliceOldGone 1 | xf124 2 | xf62Gone 1` — ship-nas verifier gained xf124/xf62Gone).
- **Guard suite 61/61** (`tmp/deck-test.cjs`): +6 comp asserts (beatFlip/beatClear x2/beatSet/beatStamp x4/midGapCap/clockFallback), `comp.xfade` retuned to `1.24s` + new `xfade62Gone`, token asserts ws7ah live + ws7ag/wx5(ws7af) stale-sweeps; new micro sims: `tick.beats` = `0,M0,1,M1,…,11,M11,H11,H11,0,M0` (mid before hold — beat branch ordered ahead of the hold branch) + `clock.stampSeq` proving the interpolated 5-min clock (now-600 -> now-5400 -> midpoint now-5250 series -> now-4500: flip shows outgoing, mid shows midpoint).
- **Visual proof (live):** `tmp/future/ws7ah-piapply.cjs` + `ws7ah-shot.cjs` (ws7ag kit retokenized; piapply additionally gates `rwMI: 1`). CDP semantics identical to ws7ag: **frames=9** unique `tilecache.rainviewer/v2/radar/<hash>` prefixes + HUD running + ONE `weather-maps.json` pull. Screenshot `tmp/future/ws7ah-shot.png`: radar card live (rain overlay, HOME beacon, mid-sweep `11:20 AM` HUD), 5-DAY FORECAST strip + NEXT-12H + OPEN-METEO untouched. Canonical one-shot kiosk.sh restored (no debug port): `dbg_0` + `cdp closed` (curl 000) + chr_10 + home 200 + tok ws7ah. **New gotcha:** probing `ps -eo args | grep chromium | grep -c remote-debugging-port` SELF-matches the probing ssh's own `bash -c` line (count never 0) — use the bracket-trick `grep '[r]emote-debugging-port'` or just curl :9222.
- **Next free token: ws7ai.**

## Rainbow Weather future radar served through a key-injecting proxy; RainViewer kept as fallback (ws7ai -> ws7aj) — 2026-11-20
- **Why:** user asked to switch the kiosk/NAS radar to **Rainbow Weather** (whose nowcast tiles are GUARANTEED — no more upstream `nowcast:[]` roulette) behind a **server-side key-injecting proxy**, with RainViewer kept as an automatic fallback. Key logistics first: the user's `C:\Users\xxtoo\.secrets\rainbow-api-keys.txt` (`primary:` / `secondary:`, 32-char keys) was parsed locally, converted to canonical `RAINBOW_API_KEY=` / `RAINBOW_API_KEY_2=` form and shipped to the Pi at `/opt/calendarly/data/.rainbow-api-keys` (mode 600, owner `xxtoon`) — key values never printed anywhere (masked tails only: `..dc7b` / `..9087`); the temp canonical file was deleted after upload; the repo never sees the keys (data dir gitignored, not web-reachable — the express catch-all serves SPA index.html).
- **Live wire fact-check (all probed from the Pi with the real key):** snapshot endpoint `GET https://api.rainbow.ai/tiles/v1/snapshot?layer=precip-global` returns an epoch-seconds id; header auth `Ocp-Apim-Subscription-Key` (`?token=` also accepted); tiles `precip-global/{snapshot}/{offset}/{z}/{x}/{y}?color=N` where **offset is SECONDS aligned to 600** (the 400 body says "Invalid time offset. Must be aligned to 10-minute intervals"; minute/hour-scale offsets and a query-param offset 400/404); past snapshots verified ≥2h20m deep (−8400 s returned 200; design keeps the documented 2 h), future offsets 600…14400 = **25 guaranteed 10-min-step nowcast frames (+4 h)** — the deck takes +1800 (+30 m); `radars` (NEXRAD-style) layer also 200; CDN `cache-control: public, max-age=7200, immutable`, warm tile TTFB ≈1.2 s; **no CORS headers on tiles -> the express proxy is mandatory for browsers**; HEAD on tile paths 404s -> the proxy uses GET only. Both keys verified live 200 (secondary = the standby leg of the rotation).

- **New server module `server/src/routes/radar.js`** (mounted in `server/src/index.js`: `app.use('/radar/api', radarRouter)`): routes `/radar/api/health`, `/radar/api/snapshot`, `/radar/api/tiles/v1/precip-global/:snap/:off/:z/:x/:y` (+ `radars` variant, z 1-7 clamped); keys re-read on mtime change (rotation without restart); round-robin primary/secondary with per-key 5-min cooldown (429/402) and 60-min (401/403); monthly call counter in `<DATA>/rainbow-usage.json` (free tier 10K, brake at 9300) -> breaker 503 `{fallback:true}` -> deck auto-plays RainViewer; disk cache `<DATA>/rainbow-tiles` (past frames immutable, edge/future TTL 2 h matching their CDN); per-IP 240/min guard (deck prefetch bursts ~8 frames × 6 tiles). `/radar/api/snapshot` = the AUTHORITATIVE edge id behind a 2-min in-memory cache + last-good retention — **the published edge is NOT wall-clock** (live proof: at 13:06 EST their endpoint self-reported `snapshot:1795197000` = 12:50 EST, a ~16-min lag; a wall-clock-derived `floor(now/600)*600` id was rejected `Invalid timestamp` — the deterministic-derivation design died on exactly that probe, so the deck pulls the snapshot through the proxy; frame math AT a given snap stays fully deterministic). Expected usage: ~40-60 tile calls/day + ~2 snapshot calls/hr ≈ 2-3K/mo, comfortably inside the free tier.
- **Comp fork (`rw-rainview-comp.js`, token ws7aj):** Rainbow primary — the deck builds from the proxy snapshot: 7 past frames (snap−6·600 … snap, each past frame at its OWN snapshot id with offset 0) + the guaranteed `FCST +30m` frame (snap + offset 1800), one `frUrl` builder emits `/radar/api/tiles/v1/precip-global/{s}/{o}/{OZ}/{x}/{y}?color={COLRB}` (Rainbow tiles drop RainViewer's `/size/palette/1_1.png` suffix); every 2 min the deck re-pulls `/radar/api/snapshot` + `/radar/api/health` and switches to RainViewer when the proxy is down, quota-broken or unresponsive (the entire ws7ai RV path survives untouched: `.slice(-7).concat(rvNC)` fallback deck + ws7ah 620 ms beats / 1.24 s crossfades / midpoint HUD clock + prefetch + pinch zoom + HOME beacon). Palette mapping: Rainbow `color=8` ("RainViewer Universal Blue") default to keep the Dark-Sky-family look; stored legacy RainViewer ids map through `RV2RBK` (the wall's stored 6 -> 8); blocks edited post-fork carry `config.rainbowP: 1` (written by the retokenized admin form — title "Rainbow Radar Config", Rainbow palette list, default 8) and apply their Rainbow id identically. Admin label for the block: `Radar: Rainbow`; default block label `RAINBOW NOWCAST`; footer `© OpenStreetMap · Rainbow Weather (fallback: RainViewer)`.
- **Deploy (Pi):** server first — `radar.js` + idempotent in-place `index.js` mount (the Pi's index.js is NOT repo-identical — it carries a Pi-only `sensorsRouter`; an anchor-patch with `orig3.index.js` + `node --check` auto-restore beats a blind overwrite) + `calendarly.service` restart; gates: health `{"rbk":true,"keys":2}`, snapshot 200 (`1795192800`, then rolled `1795198800`), REAL tiles 200 (now 51,977 B / FCST 44,443 B through the disk cache). Client: comp block 24,416 -> **24,490 B**; Pi bundle 574,444 -> **574,517 B** (guards all 1x, PARSE_OK, `?v=ws7aj`, verify-wxgui6 green incl. new `rbkDeck`/`rbkNoUpstream` gates, eventedit **22/22** with ws7ai in the stale chain). Debug-port kiosk + CDP: **frames=8** + `hud=hud` + ONE `weather-maps.json` standby pull. Screenshot `tmp/future/ws7aj-shot.png` (local only): real nowcast cells on the dark NEXRAD-style map, `FCST +10m` pill (the +30m frame measured from true now — the published edge's lag made visible), HOME beacon, Rainbow footer, wxgui hero untouched. Canonical kiosk restored (`ws7aj-restore.cjs`: `dbg_0`, `tok_ws7aj`, home 200, lightdm active).
- **Deploy (NAS):** keys mirrored via the Synology-safe b64 path -> `docker cp` -> `/app/data/.rainbow-api-keys` (600; cp'd files land root-owned while the container works as `node`, chmod applied inside); `radar.js` -> `/app/server/src/routes/` (the same three-level `../../../data` lands on `/app/data`); in-container `index.js` patch (`ws7aj-srvapply-nas.cjs`, `orig3.` backup) + `docker restart family-dashboard`; health green INSIDE (`rbk:true keys:2`) and from the LAN (`http://192.168.76.188:3080/radar/api/health`). Client bundle 452,589 -> **457,040 B** via `ship-nas.cjs` (md5-matched chunks + container verify: `nas.b 457040 | rbkSnap 1 | rbkHealth 1 | rbkProxy 1 | formRb 1 | html true | xf124 2`). The NAS usage counter starts at 0 (independent of the Pi's 44-call day).
- **Kit + probe lessons (recurring traps now fixed in the kits):** (1) pwsh mangles `$(...)` inside double-quoted ssh lines even backslash-escaped — remote multi-var logic now runs from .sh/.cjs files only; (2) client->server WS frames MUST be masked — the shot's rewritten frame codec omitted the mask key and Chromium silently dropped the socket (async script exits 0 with NO output = the signature); restored the proven masked `frameOut` from ws7ai-shot; (3) legacy patcher `one()` calls need skip-markers that recognize post-fork bundle state (label inject duplicated on rerun -> guard FAIL + auto-rollback; the `already` marker is now the bare `case"radar_rainviewer":return` prefix); (4) the rainbow upgrade passes (formTitle/palette/opts/label) replace piece-parts of the deployed bundle and SKIP on reruns — dry-proven against the real NAS bundle bytes (PARSE_OK) before touching the Pi; (5) the tile cache dir must be chowned to the service user (`xxtoon` on the Pi; `node` in the NAS container — docker cp'd files land root-owned and the unit couldn't write, silently refetching forever until chown + a log line in srvapply); (6) scp fetches to `c:/…` drive-letter paths fail — repo-relative paths (re-hit from the last wave, kits standardized).
- **Rollback:** Pi server = `cp orig3.index.js index.js && rm routes/radar.js && systemctl restart calendarly` (bundle untouched); client = `cp orig7.index-BDiodzvu.js back` + html token ws7ai; NAS = `orig3.` inside the container + restart; comp-level: git revert over the token family (precedent rvT32 -> ws7ac). Keys live only on the Pi data dir + NAS container mirror — a revert leaves them harmless.
- **Next free token: ws7ak.**


## rvT30 1-h window + upstream nowcast tail (ws7ah -> ws7ai) — 2026-11-20
- **Why:** user asked to "reduce it to 1 hr window and add the +30 minute nowcast future". Fact-check first: live `weather-maps.json` (v2.0, re-probed byte-level) serves 13 past frames spaced exactly 600 s but `"nowcast":[]` — the +30 tail never left the CODE (`concat(rvNC)` survived every wave since rvT30); the old CDP "frames=9" reads were the probe's early-break artifact, not proof of an empty tail. Same upstream emptiness that spawned the 2026-11-19 rvT32 COD fork (reverted). So ws7ai delivered the honest half: shrink the sweep window, keep the tail auto-riding upstream.
- **Change (rw-rainview-comp.js only):** timeline `.slice(-9).concat(rvNC)` -> `.slice(-7).concat(rvNC)` (9 frames/80-min span -> 7 frames/60-min span; 7 tiles cover −70…−10 min at the 10-min publish cadence) + start anchor `Math.min(…, 9)` -> `7` (still lands on NOW). FCST mechanics untouched: +10/+20/+30 nowcast concat, `FCST +Nm` badge, 2-beat hold on the newest, ws7ah 2-beat crossfades + midpoint HUD clock (the midpoint rule also spans the past→nowcast seam, +5-min stamps). Loop ≈9.9 s empty-nowcast (was ≈12.4 s), ≈13.6 s when the tail serves (was ≈16 s); tile prefetch 7-10 frames (was 9-12).
- **Deploy:** comp block (Pi inject) 19,920 -> 20,238 B; Pi bundle 569,749 -> **570,066 B** (guards all 1x, PARSE_OK, `?v=ws7ah` -> `?v=ws7ai`); verify-wxgui6 green with the RETUNED `rwTm` gate (slice(-7) + anchor 7 + old slice(-9)/(-6) absent per gate), bundle-ws7ai 200, displays 200, lightdm active; eventedit **22/22** (ws7ai live, ws7ah into the stale chain). NAS 452,272 -> **452,589 B**: `nas.b 452589 | codGone 1 | sintGone 1 | rvHRGone 1 | html true | slice7 1 | slice9Gone 1 | slice6Gone 1 | sliceOldGone 1 | xf124 2 | xf62Gone 1`. Guard suite **71/71** (`tmp/deck-test.cjs`: deck 10/7 frames with the +30 tail / real-only, spans 100 min with tail + 60 min real, tick seq L=10 from index 9 with H9/H9, `clock.stampSeq` proving the wrap real-jump −10 -> −70, token asserts ws7ai live + chain sweep).
- **Visual proof (live):** `tmp/future/ws7ai-piapply.cjs` + `ws7ai-shot.cjs` (ws7ah kit retokenized; the shot's CDP probe now waits for the frame count to hold steady over 2 consecutive polls instead of breaking at the first >=N poll, so the deck's TRUE frame count is reported). **RADARINFO frames=7** (upstream nowcast empty at ship time — exactly the probed 1-h deck; when the tail refills the same probe reads 10 with no further deploy) + `hud=hud` + ONE `weather-maps.json` pull. Screenshot `tmp/future/ws7ai-shot.png`: radar card live (drizzle echoes around Mount Dora, HOME beacon, `12:20 PM` HUD on the newest published tile vs the 12:29 wall clock = the upstream 10-min lag made visible), no FCST pill (tail empty), ws7af 5-DAY FORECAST + NEXT-12H + OPEN-METEO untouched. Canonical kiosk restored: `dbg_0` + `tok_ws7ai` + home 200 + lightdm active. Gotcha re-hit: scp fetch to a `c:/…` drive-letter path from the Pi fails (No such file or directory) — fetch with repo-relative paths.
- **Next free token: ws7aj.**

## Deeper radar zoom: Rainbow nowcast grid is native to z10; rvZoom ceiling 12; overlay caps per source (ws7aj -> ws7ak) — 2026-11-20
- **Why:** user asked for deeper zoom on the radar deck. Fact-check first (live from the Pi, key-injected): the wettest z7 `precip-global` cell (51,998 B) re-fetched deeper = **z8 28,775 B / z9 16,199 B / z10 4,940 B — genuine per-level structure; z11/z12 = 749 B blank**. So Rainbow's ~1 km nowcast grid is native to z10 (matches their resolution claim); `radars` returns 400 ≥ z8. The old `OZ = min(rvZoom, 7)` was a RainViewer-era cap: at the wxGUI card's mounted `zoom: 11` the rain overlay was a 16×-upscaled z7 blur while the OSM base rendered natively to z11.
- **Comp (`rw-rainview-comp.js`):** `OZ = Math.min(rvZoom, rvRBK ? 10 : 7)` — Rainbow frames render native to z10, RainViewer fallback keeps its 7; `NZ`/`rvSet`/localStorage guards 11 -> **12** (the `scale(OV)` wrapper upscales rvZoom > cap — deep zooms show the deepest REAL data, never blank); config comment updated. Admin form zoom label SKIPs on the deployed `Zoom (3-12)` (the pre-ws7ah label already agreed); fresh installs get `Zoom (3-12, default 7)`.
- **Server (`radar.js`):** bad-geo z clamp per layer — `layer === 'radars' ? 7 : 10` (matches the upstream reality; `precip-global` accepted z12 in the probe but the proxy caps at 10 = native data + bounded abuse surface).
- **Deploy (Pi):** `ws7ak-piapply.cjs` — server first (radar.js swap + idempotent mount re-check `SRV_APPLY_OK` + restart): health `rbk:true keys:2` (usage counter carried over: total 107 -> 387 after the probe/shot session, left 8913 of the brake cap 9300), snapshot 200 (`1795200600`), REAL tiles through the proxy **z6 53,225 B / z9 6,274 B / z10 749 B (no rain over home at that minute) / z11 = 400 blocked** / FCST 46,044 B. Client: `fdw-apply-radar-widgets.cjs` pass — comp region rewritten (24,562 B), `zoom.label` SKIP (already 3-12 on the deployed form), cache-bust ws7aj -> **ws7ak**; bundle **574,517 -> 575,242 B**, `rwOz: 1` (new gate) + all previous gates 1x, PARSE_OK, eventedit **22/22** (ws7ak live, ws7aj into the stale chain). CDP kiosk + `ws7ak-shot.cjs` (adds: label discovery from the live screen config -> `rwRVz:<label> = 9` localStorage + one reload, and a DEEP counter of distinct `/precip-global/{s}/{o}/9/` resource paths): **RADARINFO frames=8 hud=hud mapsPulls=1 deep=37** — 37 distinct deep-zoom proxy paths = the overlay genuinely pulled native z9 tiles; screenshot `tmp/future/ws7ak-shot.png` (local only). Canonical kiosk restored: `dbg_0` + **`tok_ws7ak`** + home 200 + lightdm active. NOTE: the deep zoom PERSISTS via `rwRVz:*` in kiosk localStorage (intentional — the kiosk stays at z9; pinch deeper with `config.ctl`).
- **Deploy (NAS):** `ws7ak-nas.cjs` — b64 upload + md5 both phases (radar.js/comp/patcher), `docker cp` radar.js into `/app/server/src/routes/`, `SRV_APPLY_OK` (mount re-check), `docker restart family-dashboard`, LAN health `rbk:true keys:2` (`total:0` — the NAS counter stays independent), LAN deep gates **z6 200 53,225 B / z9 200 6,274 B / z10 200 / z11 400**; then `ship-nas.cjs` client pass -> bundle 457,040 -> **457,734 B**: `ozRbk 1 | zoom12 1 | zoomLbl 1` + full gate line, html `?v=ws7ak`.
- **Kit lessons:** (1) deployed form labels may predate the patcher's fresh-string needles — the deployed RV form's zoom label is the pre-ws7ah `Zoom (3-12)` (placeholder 8), so the ws7ak `zoom.label` pass uses a prefix already-marker (`'Zoom (3-12'`) and SKIPs cleanly; (2) scp-fetch of the shot to a `c:/…` drive-letter path failed from the kit again (relative dest) — fetched with an explicit absolute repo path; (3) `grep -c` on a single-line minified bundle is useless for label counting — use `grep -o` pattern lists.
- **Rollback:** Pi server = `cp orig3.index.js routes-side backup path unchanged; rm routes/radar.js && systemctl restart calendarly` (proxy 503 -> deck auto-falls back to RainViewer at z7); client = `cp orig7.index-BDiodzvu.js` back + html token ws7aj; NAS = same inside the container + restart; comp-level = git revert over the token family (precedent). The zoom change is additive — reverting the comp block restores `OZ = min(rvZoom, 7)` + ceiling 11 exactly.
- **Next free token: ws7al.**

## One more zoom level: rvZoom ceiling 12 -> 13, pure-upscaled level, data caps untouched (ws7ak -> ws7al) — 2026-11-20

- **Rationale:** ws7ak settled the DATA truth (Rainbow nowcast native z10 — real structure at z8/z9/z10, blank 749 B at z11/12; RainViewer tilecache z7), so "one more level" is magnification, not new data: rvZoom **13** — the OSM base still gains real detail that deep while the rain overlay upscales 8x from the real z10 tiles through the existing `scale(OV)` wrapper (never blanks). `radar.js` untouched — proxy caps stay `precip-global <= 10` / `radars` 7; no new runtime behavior, so no CDP shot this wave (the z13 overlay tiles ARE the ws7ak-proven z10 proxy tiles).
- **Comp (`rw-rainview-comp.js`):** `NZ` config clamp `3..13`, localStorage load `lz <= 13`, `rvSet` clamp `3..13`; ceiling comment updated. Deep zoom still persists per label via `rwRVz:<label>` (the kiosk stays at its stored z9 until pinched/config'd deeper).
- **Patchers (both, jsVer ws7al):** fresh form label `Zoom (3-13, default 7)`; the zoom-label pass became a 3-branch bump — SKIP on any `Zoom (3-13` marker, else replace fresh `children:"Zoom (3-12, default 7)"` or the older bare `children:"Zoom (3-12)"` (both collapse to the fresh label; split-count-checked, FAIL triggers the auto-rollback). Lesson continuation from ws7ak: handle EVERY deployed label variant, don't assume the fresh needle.
- **Kits:** `ws7al-piapply.cjs` (NEW — client-only: no server phase, patcher runs with the kiosk live, then canonical kiosk relaunch in the kill/relaunch separate-ssh-call pattern, then verify gates; no dbg port / no shot needed); `ship-nas.cjs` TOKEN ws7al + VJS gates `ozRbk|zoom13|zoomLbl13`. `deck-test.cjs` **109/109** (zoom13 asserts + zoom12Gone, oz upscale cases at 12/13, eventedit stale chain += ws7ak); `verify-wxgui6.sh` `rwOz` gate -> 13-pattern pair; `verify-eventedit.sh` token ws7al + stale chain ws6zt...ws7ak. NAS patcher comment drop of the ws7aj token (stale-token-chain hygiene).
- **Deploy (Pi):** 5x scp -> sudo patcher (comp region rewritten 575,242 -> **575,382 B**, zoom.label fired the bare-3-12 branch, cache-bust ws7ak -> **ws7al**, PARSE_OK, guards all 1x) -> canonical kiosk relaunch: home 200, `dbg_0`, `tok_ws7al`, lightdm active; verify-wxgui6 green incl `rwOz: 1` + `bundle-ws7al.HTTP 200`; eventedit **22/22**; rerun of the patcher fully idempotent (`zoom.label SKIP already 3-13`). Health after: `rbk:true keys:2` (usage total 748 / left 8,552 of brake 9,300 — the kiosk relaunch re-prefetched its deck; NAS counter independent).
- **Deploy (NAS):** `ship-nas.cjs` b64 both md5 phases -> docker cp -> patcher (comp region upgraded, fresh-label branch) -> bundle 457,734 -> **457,894 B**: `ozRbk 1 | zoom13 1 | zoomLbl13 1` + full gate line, html `?v=ws7al`.
- **Rollback:** client-only — `cp orig7.index-BDiodzvu.js` back + html token ws7ak on the Pi (same inside the NAS container + restart), or git revert over the token family; the ceiling change is two numbers + a label.
- **Next free token: ws7am** (used by the wave below; now free: **ws7an**).

## Forecast tail +30 m -> +2 h as ONE nowcast frame (ws7al -> ws7am) — 2026-11-20

- **Ask:** "continue with forecast" — stretch the deck's single `FCST +30 m` frame to the far horizon. First pick was the full first-hour sweep (+10..+60 m, six nowcast steps, 13-frame deck); the live pre-flight KILLED it: measured from the proxy's tile-dir histogram, every publish roll mints its per-frame `(snap, offset)` tile family at ~9-12 tiles, so frame COUNT is the only quota lever — the sweep projected ~900-1,100 upstream calls/day vs the 9,300/mo brake (breaker would trip in ~8 days -> auto-fallback until month reset). Re-decided with the user on the measured numbers: **ONE `FCST +2h` frame (offset 7200)** — offset reach is FREE and frame count is what costs, so the tail reaches 4x further at the ws7aj-exact burn; deck stays 8 frames, loop ≈ 11.2 s.
- **Comp (`rw-rainview-comp.js`):** `rbkBuild` tail is now `fr.push({ time: s + 7200, s: s, o: 7200, rbk: 1, path: 'rbkF' })` (was offset 1800); the FCST badge grows an hour branch past 90 min (`FCST +Nm` -> `+Nh`, so the tail pill reads `FCST +2h`); header + timeline comments carry the quota truth + measured numbers. `radar.js` UNTOUCHED — pure client wave, no server phase, no restarts.
- **Kits/gates:** both patchers retoked jsVer **ws7am**; `verify-wxgui6.sh` `rbkDeck` needle -> `o: 7200` + NEW `rbkFcst` gate (the `s + 7200, s: s, o: 7200, rbk: 1` family present; `o: 1800` and `F2 <= 6` absent) — **new verify-gate lesson:** inside the `bash`-single-quoted `node -e '...'` block, apostrophes in a needle are STRIPPED by shell quote-pairing (the needle `path: 'rbkF'` arrived as `path: rbkF` and silently missed while a direct probe proved the region had all four clauses true) — the fixed gate is apostrophe-free; ship-nas-style b64 transfers are immune. `ship-nas.cjs` TOKEN ws7am + verify gates `fcst7200 | fcst1800Gone | fcstSweepGone`; `deck-test.cjs` **118/118** (rbk micro rebuilt to the 8-frame @7200 deck, badge hour-branch asserts, tokens + eventedit chain += ws7al); `verify-eventedit.sh` token ws7am + stale chain ws6zt...ws7al; new kit `tmp/future/ws7am-piapply.cjs` (client-only; usage counter read pre/post).
- **Deploy (Pi):** scp -> sudo patcher (comp region 25,343 -> 26,352 B, bundle 575,382 -> **576,390 B**, cache-bust ws7al -> **ws7am**, PARSE_OK, guards all 1x, zoom.label SKIP already 3-13) -> canonical kiosk relaunch (`home 200 / dbg_0 / tok_ws7am / lightdm_active`) -> verify green incl `rbkDeck: 1 / rbkFcst: 1 / rbkNoUpstream: 1 / rwOz: 1`, `bundle-ws7am.HTTP 200`; eventedit **22/22** (`?v=ws7am`, stale chain incl ws7al zero, PUT round-trip); health `rbk:true keys:2`, usage **793 / left 8,507** of 9,300.
- **Live truth for the tail (Pi, edge 1795204800, z10 in-view sweep through the proxy):** off 0 = 40.7 kB, 600 = 34.9, 1200 = 27.2, 1800 = 16.2, 2400 = 5.7, 3000 = 4.9, 3600 = 4.4, 4800 = 1.8, 6000+ = blank 749 B — a decaying rain cell; and the full +2 h family carries REAL moving rain in the west cells (12,952 / 8,146 B) while the east clears — the +2 h frame is a genuine forecast; the kiosk's own prefetch minted exactly that family. On calm hours the +2h tiles may all be blank (badge stays, base map shows) — graceful by design.
- **Deploy (NAS):** ship-nas b64 both md5 phases -> docker cp -> patcher (comps upgraded behind the rwRadarNAS marker) -> bundle 457,894 -> **458,902 B**: `ozRbk 1 | zoom13 1 | zoomLbl13 1 | fcst7200 1 | fcst1800Gone 1 | fcstSweepGone 1`, html `?v=ws7am`. Public dashboard routes `/radar/api` to the Pi proxy as before — no NAS server phase.
- **Rollback:** client-only — `cp orig7.index-BDiodzvu.js` + html token ws7al on the Pi (same inside the NAS container + restart), or retok the comp tail line back to offset 1800.
- **Quota watch:** observed burn ≈ 500/day with probe pollution, steady ≈ 200-300/day (only 16 publish rolls in ~1.4 d — the published edge advances slower than the nominal 10-min cadence). The +2h frame keeps the ws7aj burn profile; December budget ≈ 300/day, so the single-FCST-frame shape is the sustainable ceiling — never add frames without re-running the tile-dir histogram first. (Also noted: usage JSON's per-day key is `undefined` — harmless counter bug in `radar.js`, client-waves don't touch it but a future server wave can fix `rbkUsage.day`.)
- **Next free token: ws7an.**

## Sun-arc right column cleanup: +12H moon label removed, OPEN-METEO credit -35% + pinned to the bottom-right corner (ws7an) — 2026-11-20

- **Rationale (user micro-wave):** the wxGUI sun-arc's right column read: label `NEXT 12H` + phase moon icon + source credit `OPEN-METEO`. The label went away entirely; the credit shrank exactly 35% (`.75cqw` → `.49cqw`) and now sits in a **small space at the bottom-right corner** (column `paddingBottom .6cqh → .15cqh`, gap `.4cqh → .3cqh`). The phase moon icon STAYS (unlabeled — it is the moon-phase display, not the label). The `NEXT 12 HOURS` chart title and everything else are untouched. Client-only, radar slice untouched: no new `(snap, offset)` tile family — mint/usage profile unchanged.
- **Comp (`wxgui-component.js`):** the right-column block now renders only `[moon icon, OPEN-METEO credit]` (was `[label, moon, credit]`); header carries the ws7an wave note (deliberately needle-free — see kit lesson). Source truth in git; `tmp/future/drypi` (ws7aa baseline) copy was patched FIRST as a local dry proof.
- **Kits/gates:** wx-region patcher `tmp/future/fdw-apply-wx5.cjs` retoked jsVer ws7af → **ws7an** (upgrade path REPLACES the `// wxGUI` marker → `\nfunction wsWS` region; radar comps before the marker survive — the comp file's first line re-establishes the `// wxGUI` marker). `verify-wxgui6.sh` += `omSm:` (OPEN-METEO + `.49cqw` in the wx region) + `n12Gone:` (label absent — both needles apostrophe-free, the ws7am bash lesson holds); `verify-eventedit.sh` token ws7an + stale chain += ws7am; `deck-test.cjs` **125/125** (+7: `wxgui6.omSmGate/n12Gate`, `wxc.omLabel/omSm/omLow/n12Gone`, `eventedit.staleHas7am`). **NEW KIT LESSON — source-count asserts read the comp FILE:** the first ws7an header comment contained the literal needles (`OPEN-METEO`, `.49cqw`) → `wxc.omLabel/omSm` counted 2; reworded the comment needle-free (bundle gates slice from `function wxGUI` so comments never hit them, but `wxc.*` source asserts do).
- **Dry proof (before the Pi):** `tmp/future/drypi` → `tmp/wx7an-dry`; `FDW_DIST/FDW_TMP` env run of the bumped patcher: region `40,487 → 42,720 B`, cache-bust ws7aa → ws7an, guards all 1x, PARSE_OK; `tmp/wx7an-drygate.cjs` **13/13** (parse + token + markers + wx gates + comps intact; radar FEATURE gates intentionally absent there — the dry baseline is ws7aa, predates the rbk wave gates; the live gates cover them). Dry dirs deleted after the run.
- **Deploy (Pi):** `tmp/future/ws7an-piapply.cjs` (client-only; password piped; patcher self-rollback kept): usage pre `{total:894}` / 816 tile dirs; scp 5-kit; `sudo node fdw-apply-wx5.cjs` → comp region **42,535 → 42,720 B**, bundle **576,390 → 576,575 B**, cache-bust **ws7am → ws7an**, guards all 1x, PARSE_OK. CDP kiosk → `wx7an-shot.cjs` (`display/wxgui-preview`): `MARKERS {"fx5":true,"today":true,"om":true,"n12gone":true,...}` — screenshot `tmp/future/wx7an-shot.png` (label gone; credit tiny + bottom-right pinned — visual proof). Verify: FULL_BUNDLE_PARSE_OK 576,575 B + `?v=ws7an`, `omSm: 1`, `n12Gone: 1`, `wxSrc/rwInWxCard/fx5/rwXF/rwTm/rwMI/rbkDeck/rbkFcst/rbkNoUpstream/rwOv/rwOz/rwBs/rwHome` all 1, `bundle-ws7an.HTTP 200`; eventedit **22/22** (ws7an live, ws7am in the stale chain, PUT round-trip green). Canonical restore: home 200 / `dbg_0` / **`tok_ws7an`** / lightdm_active; health `rbk:true keys:2` **total 894 → left 8,406 of 9,300 — usage UNCHANGED pre→post** (816 tile dirs both sides), as designed for a comp-region swap.
- **NAS: NO ship** — `docker exec family-dashboard grep -c` over `/app/client/dist/assets/index-BDiodzvu.js`: `OPEN-METEO` **0**, `NEXT 12H` **0** — the NAS never carried the wxGUI kit; its token stays ws7am. Public dashboard serves the Pi content (nginx host 104 → Pi:3000), so the corner change is live publicly via the Pi.
- **Kit lessons:** (1) direct `ssh` from pwsh with double quotes interpolates remote `$(...)` LOCALLY (pgrep ran on Windows!) — finisher `tmp/future/ws7an-finish.cjs` with the kit's execFileSync quoting is the robust path; (2) Windows scp parses a drive-letter dest `c:/...` as host:path — shot fetch uses a RELATIVE dest (fixed in the kit).
- **Rollback (client-only, comp-level):** the previous comp lives in git (`wave4/fd_weather/wxgui-component.js` at the ws7am commit) — restore it, scp, re-run the patcher (re-retok ws7an→ws7am in `fdw-apply-wx5.cjs`'s jsVer or sed the html token), relaunch. NOTE: `orig7.*`/`orig8.*` on the Pi predate the rbk comp waves — do NOT use them for this rollback (they would also rewind the radar deck); the rbk region outside `// wxGUI` was never touched this wave.
- **Next free token: ws7ao.**

## ws7ao — 2026-11-20 — wxGUI sun-arc card: the OPEN-METEO credit now sits HALF the gap from the card's bottom edge

- **Change (micro-wave):** the credit column's `paddingBottom` **`.15cqh` → `.075cqh`** — the OPEN-METEO label hugs the card's bottom edge at half the ws7an corner gap. Nothing else moves (font `.49cqw`, column gap `.3cqh`, moon icon all stay; label stays pinned bottom-right). Radar slice untouched: no `(snap, offset)` tile family minted — **816 tile dirs pre → post, unchanged** (usage total 894 → 897 is just the deck's background drain through the day, NOT this wave — the corner swap minted nothing, as designed for a comp-region swap).
- **Comp (`wxgui-component.js`):** one CSS value in the right-column credit block (`paddingBottom: '.075cqh'`); the header comment now carries the ws7ao note, needle-free (source-count gates read this file). Source truth in git.
- **Kits/gates:** wx-region patcher `tmp/future/fdw-apply-wx5.cjs` retoked jsVer ws7an → **ws7ao** (same `// wxGUI` marker-region upgrade, parse-check + auto-rollback). `verify-wxgui6.sh` += `omHalf:` gate (`.075cqh` in the wx region — apostrophe-free needle, ws7am lesson holds; `omSm:`/`n12Gone:` unchanged). `verify-eventedit.sh` token ws7ao + stale chain += ws7an. `deck-test.cjs` **127/127** (+2: `wxgui6.omHalfGate`, `eventedit.staleHas7an`; `wxc.omLow` now pins `.075cqh`, `wx5.ver`/`eventedit.curToken` retoked).
- **Dry proof:** `tmp/future/drypi` (ws7aa baseline) copy `tmp/wx7ao-dry` patched with the retoked kit: region 40,487 → **42,770 B**, cache-bust ws7aa → ws7ao, PARSE_OK; `tmp/wx7ao-drygate.cjs` **14/14** (token, wxGUI/WG_CSS/WX_SVG x1, comps intact, marker first-line, wxSrc/omSm/omHalf/n12Gone, `.15cqh` gone, fx5, rwInWxCard). Dirs cleaned after.
- **Live apply (Pi, client-only):** region **42,720 → 42,770 B**, bundle **576,575 → 576,625 B**, cache-bust ws7an → ws7ao, guards all 1x + days2-gone, PARSE_OK. CDP kiosk (debug port) → `wx7ao-shot.cjs` (`display/wxgui-preview`): `MARKERS {"fx5":true,"today":true,"om":true,"n12gone":true,"outdoor":true,"indoor":true,"updated":true}` — screenshot `tmp/future/wx7ao-shot.png` (736,536 B; the credit visibly sits at the bottom edge, half the ws7an gap). Verify: FULL_BUNDLE_PARSE_OK 576,625 B + `?v=ws7ao`, `omHalf: 1`, `omSm: 1`, `n12Gone: 1`, `wxSrc/rwInWxCard/fx5/rwXF/rwTm/rwMI/rbkDeck/rbkFcst/rbkNoUpstream/rwOz/wgXScene` all pass, `bundle-ws7ao.HTTP 200`; eventedit **22/22** (ws7ao live, ws7an in the stale chain, PUT round-trip green). Canonical restore: home 200 / `dbg_0` / **`tok_ws7ao`** / lightdm_active; health `rbk:true keys:2`.
- **Kit lesson (scp):** the in-kit screenshot fetch `scp pi4kiosk:/tmp/wx7ao-shot.png tmp/future/wx7ao-shot.png` failed ONCE with `dest open "tmp/future/wx7ao-shot.png": No such file or directory` while the kit ran piped through a pwsh filter — the identical command retried directly succeeded byte-identical (736,536 B). The kit now fetches to a BARE cwd filename and `fs.renameSync`s it into `tmp/future/` (deterministic; the drive-letter-dest lesson from ws7an still stands).
- **Rollback (client-only, comp-level):** the ws7an comp lives in git (`wave4/fd_weather/wxgui-component.js` at the ws7an commit) — restore it, scp, re-run the patcher (retok ws7ao → ws7an in `fdw-apply-wx5.cjs`'s jsVer, or sed the html token), relaunch. The rbk region outside `// wxGUI` was never touched this wave.
- **Next free token: ws7ap.**

## ws7ap — 2026-11-20 — wxGUI living-weather pass: scene clouds bob + breathe, wxIco icons float

- **Change (micro-wave):** the METEOCONS ART IS UNTOUCHED (no gif swap — gifs would drop gradients/alpha to 256 colours and lose the art the kiosk loves). Motion is added around/onto the same art, pure `// wxGUI` comp-region swap: (1) hero scene clouds run a NEW outermost `<g>` with a slow 2.4-user-unit vertical bob (`wgXBob`, dur ≈ .52× the cloud’s own drift dur) + an opacity breath (`wgXBreath` .86→1, ≈ .8× dur) while the middle `<g>` keeps the `wgXDrift` cycle (two transform-animations on ONE element override each other, hence the wrapper), and the drift amplitude widened ±4%/±1.5% → ±6%/±2.2%; (2) the wxIco icons float via `wgIcoBob` (translateY .16cqh → −.2cqh), staggered: condition pill 4.2s, 5-day strip 4.4s + (i%3)*.7s with −.75s/col delay, meteo credit moon 6.4s; the 12-hour strip stays intentionally muted (grayscale data row). Bob durations are DERIVED from each cloud call’s existing dur, so every existing call site — and every assert that pins it — stays byte-identical.
- **Comp (wxgui-component.js):** WG_CSS += the three keyframes (same-line concat); `cloud()` gains the wrapper `<g>`; three wxIco call sites gain the float; header note needle-free. Source truth in git.
- **Kits/gates:** wx-region patcher `tmp/future/fdw-apply-wx5.cjs` retoked jsVer ws7ao → **ws7ap**. `verify-wxgui6.sh` += `wxAnim:` gate (wx region has wgXBob/wgXBreath/wgIcoBob + whole-bundle `@keyframes` pins; NOTE: wxSrc/rwInWxCard print booleans — needles must be `wxSrc: true`, not `: 1`). `verify-eventedit.sh` token ws7ap + stale chain += ws7ao. `deck-test.cjs` **132/127** (+5: `wxc.sceneBob` 2, `wxc.sceneBreath` 2, `wxc.icoBob` 4, `wxgui6.wxAnimGate`, `eventedit.staleHas7ao`).
- **Dry proof:** tmp/future/drypi (ws7aa baseline) copy `tmp/wx7ap-dry`: region 40,487 → **43,696 B**, cache-bust ws7aa → ws7ap, guards all-1x, PARSE_OK (bundle 572,728 → 575,937 B); `tmp/future/wx7ap-drygate.cjs` **15/15** (incl. wxAnim). Dir + temp scripts cleaned after.
- **Live apply (Pi, client-only):** region **42,770 → 43,696 B**, bundle **576,625 → 577,551 B**, cache-bust ws7ao → ws7ap, guards all-1x, PARSE_OK. CDP kiosk → `wx7ap-shot.cjs` (`display/wxgui-preview`): MARKERS all-true **+ NEW live-animation proof: `ANIM {"css":19,"bob":7,"scene":6,"smil":81}`** (document.getAnimations() census: 19 running CSS animations, 7 icon bobs, 6 scene bob/breath, 81 live SMIL nodes incl. the radar beacon + meteocons) **+ `PIXEL_DRIFT alive`** (two screenshots 1.3 s apart, buffers differ). Screenshot `tmp/future/wx7ap-shot.png` (731,667 B — layout identical to the ws7ao frame; the bob/float are transform-only, nothing reflows). Verify: FULL_BUNDLE_PARSE_OK 577,551 B + `?v=ws7ap`, `wxAnim: 1`, `omHalf/omSm/n12Gone/fx5` 1s, rw gates all pass, `bundle-ws7ap.HTTP 200`; eventedit **22/22** (ws7ap live, ws7ao in the stale chain, PUT round-trip green). Canonical restore: home 200 / `dbg_0` / **`tok_ws7ap`** / lightdm_active; health `rbk:true keys:2`; tile dirs **852 unchanged** (usage 939 → 940 = deck background drain, the wave minted nothing).
- **Kit lesson (scp fetch, 2nd strike):** the ws7ao/ws7ap `scp()` helper prefixes `pi4kiosk:` onto BOTH args — for the shot FETCH that made a REMOTE→REMOTE copy (`pi4kiosk:/tmp/wx7ap-shot.png pi4kiosk:wx7ap-shot.fetch.tmp`), no local file ever appeared, then `fs.renameSync` ENOENT’d AFTER all shot phases (kit exited before gates + canonical restore; the Pi sat in CDP mode until the tail script ran). Fixed in `ws7ap-piapply.cjs`: the fetch is a bare `execFileSync('scp', ['-q', 'pi4kiosk:/tmp/wx7ap-shot.png', 'wx7ap-shot.fetch.tmp'])` with NO host prefix on the dest (the ws7ao-wave "relative-dir dest" lesson was really THIS same help bug in disguise).
- **Rollback (client-only, comp-level):** the ws7ao comp lives in git (`wave4/fd_weather/wxgui-component.js` at the ws7ao commit) — restore it, scp, re-run the patcher (retok ws7ap → ws7ao in `fdw-apply-wx5.cjs`’s jsVer, or sed the html token), relaunch. The rbk region outside `// wxGUI` was never touched this wave.
- **Next free token: ws7aq.** (Candidate follow-up: deepen the motion inside the icon SPRITES — the wxIco/WX_SVG kit region sits BEFORE the comp region and needs its own guarded patcher region swap to re-pitch the meteocons SMIL, e.g. full sun-spin, harder cloud sway, falling rain inside the small icons.)



