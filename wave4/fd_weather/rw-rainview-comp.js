// rwRV — standalone radar deck (ws7aj): Rainbow Weather nowcast is PRIMARY (its Tiles API is the
// guaranteed future radar), served through the local express proxy /radar/api so the subscription
// key never leaves the server; the original RainViewer public-API deck stays untouched as an
// AUTOMATIC fallback the moment the proxy health says otherwise (offline / quota-broken).
// Timeline (ws7aj): Rainbow publishes its global frames at a fixed 10-min cadence but the
// snapshot id IS NOT wall-clock (their published edge lags real time), so the deck takes the
// snapshot from the proxy (/radar/api/snapshot — 1 upstream call, 2-min proxy cache, last-good
// kept). Frame math at that snap is fully deterministic. Deck = the 7 past
// frames at that cadence (the last hour) + ONE Rainbow nowcast frame at +2 h (ws7am: offset 7200
// — the old tail was +30 m; Rainbow guarantees nowcasts to +4 h in 10-min steps, offsets
// 600..14400, so any offset is available — and the free-tier proxy quota charges per (snap,
// offset) family minted on every publish roll (~12 tiles), so ONE further-out frame costs the
// same as the old +30 m while reaching four times further). Playback (ws7ah)
// engine kept: 620 ms beats, 1.24 s full-dwell crossfades, HUD clock in interpolated 5-min
// stamps, 2-beat hold on the newest frame, forward-only loop (oldest -> now -> forecast, wraps).
// Fallback (health = 0): RainViewer's last 7 past frames (1 h sweep at its 10-min publish
// cadence, re-pulled every 5 min) + the free nowcast tail when upstream serves it
// ("nowcast":[] is upstream-intermittent; the tail reappears by itself).
// Palette: Rainbow tiles use color=0..9 (4 "Nexrad", 5 "Rainviewer", 8 = "RainViewer Universal
// Blue"); the stored RainViewer palette id maps to the closest Rainbow one (RV2RBK below).
// config keys: lat, lon, zoom (3-13, default 7), color (palette id), label, pause (1 = freeze
// frame), ctl (1 = +/- zoom buttons + two-finger pinch on the map; zoom persists per label in
// localStorage). Zoom ceiling ws7al: max rvZoom is 13 (ws7ak took it 11 -> 12; Rainbow's nowcast
// grid is native to z10 — live-probed: real structure at z8/z9/z10 over a wet z7 cell, z11/12
// blank — so rbk frames render to z10 and only upscale beyond; RainViewer's tilecache still caps
// at z7). 13 is the last useful level: the OSM base keeps real detail while the rain overlay
// upscales 8x from real z10 tiles.
function rwRV(props) {
  const a = (props && props.config) || {};
  const lat = isFinite(Number(a.lat)) ? Number(a.lat) : 28.817422;
  const lon = isFinite(Number(a.lon)) ? Number(a.lon) : -81.620514;
  const NZ = Math.min(Math.max(Math.round(Number(a.zoom)) || 7, 3), 13);
  // color semantics (ws7aj): config.rainbowP = 1 => a.color is ALREADY a Rainbow palette id
  // (blocks edited after the fork); otherwise a.color is a legacy RainViewer id mapped through
  // RV2RBK (the wall's stored 6 = RV "Dark Sky" -> Rainbow 8 "Universal Blue").
  const RV2RBK = { 0: 0, 1: 1, 2: 8, 3: 2, 4: 6, 5: 5, 6: 8, 7: 7, 8: 9, 9: 4 };
  const cc0 = (a.color !== '' && a.color != null && isFinite(Number(a.color))) ? Math.max(0, Math.min(9, Number(a.color))) : null;
  const COLRV = (cc0 != null) ? cc0 : 6;
  const COLRB = ((cc0 != null) && (a.rainbowP === 1)) ? cc0 : ((RV2RBK[(cc0 != null) ? cc0 : 6] != null) ? RV2RBK[(cc0 != null) ? cc0 : 6] : 8);
  const rvLabel = a.label || 'RAINBOW NOWCAST';
  const PAUSE = (a.pause === true || Number(a.pause) === 1);
  const CTL = (a.ctl === true || Number(a.ctl) === 1);
  let rvZ0 = NZ;
  if (CTL) { try { const lz = Math.round(Number(localStorage.getItem('rwRVz:' + rvLabel))); if (lz >= 3 && lz <= 13) rvZ0 = lz; } catch (e) {} }
  const rvZ = b.useState(rvZ0); const rvZoom = rvZ[0];
  const rvSet = function (z) { z = Math.min(Math.max(Math.round(Number(z)), 3), 13); if (CTL) { try { localStorage.setItem('rwRVz:' + rvLabel, String(z)); } catch (e) {} } rvZ[1](z); };
  const rvPinch = b.useRef(null);
  const pvStart = function (e) { if (!CTL || !e.touches || e.touches.length !== 2) return; const dx = e.touches[0].clientX - e.touches[1].clientX, dy = e.touches[0].clientY - e.touches[1].clientY; rvPinch.current = Math.sqrt(dx * dx + dy * dy); };
  const pvMove = function (e) { if (!CTL || rvPinch.current == null || !e.touches || e.touches.length !== 2) return; const dx = e.touches[0].clientX - e.touches[1].clientX, dy = e.touches[0].clientY - e.touches[1].clientY; const d = Math.sqrt(dx * dx + dy * dy); const r = d / rvPinch.current; if (r > 1.35) { rvSet(rvZoom + 1); rvPinch.current = d; } else if (r < 0.74) { rvSet(rvZoom - 1); rvPinch.current = d; } };
  const pvEnd = function () { rvPinch.current = null; };
  const rvD = b.useState(null); const rvData = rvD[0]; const setRvData = rvD[1];
  // ws7aj state: rbkOK = proxy health (null unknown / 1 ok / 0 down), rbkSnap = { s, tier, f }
  // with the AUTHORED edge snapshot (proxy-served from Rainbow's snapshot endpoint; the published
  // edge is NOT wall-clock — it lags real time — so the deck never derives it locally; the proxy
  // caches it for 2 min and keeps the last good) and its ladder deck (7 real frames + the
  // tier-scaled future tail of ws7ar); refreshed every 2 min. rbkLeft = the proxy's monthly-quota
  // meter (health usage.left) that picks the tier; the tier ladder itself lives in rbkTier below.
  const rbkH = b.useState(null); const rbkOK = rbkH[0]; const setRbkOK = rbkH[1];
  const rbkM = b.useState(null); const rbkSnap = rbkM[0]; const setRbkSnap = rbkM[1];
  const rbkLeft = b.useRef(null);
  b.useEffect(function () {
    let dead = false;
    const hp = function () { fetch('/radar/api/health', { cache: 'no-store' }).then(function (r) { if (!dead) setRbkOK(r.ok ? 1 : 0); }).catch(function () { if (!dead) setRbkOK(0); }); };
    hp(); const iv = setInterval(hp, 120000); return function () { dead = true; clearInterval(iv); };
  }, []);
  b.useEffect(function () {
    let dead = false;
    // ws7ar ladder — the proxy quota charges ~9-12 upstream tiles per (snap, offset) family minted
    // on each publish roll, and only FRESH future offsets are new mints every roll (past frames
    // recycle disk cache from earlier rolls), so the future tail COUNT is the quota lever (offset
    // reach is free). The ws7am pre-flight measured a 6-step first-hour sweep at ~900-1100
    // upstream calls/day vs the 9300/month brake — it would trip in ~8 days and kill the future
    // tail until the month reset. This ladder instead scales the tail to usage.left (read fresh
    // from /radar/api/health on every tick, ordered before the snapshot fetch): tier 2 = six real
    // steps +10..+60 (13-frame deck); tier 1 = every other step +20/+40/+60 (10 frames); tier 0 =
    // the single +2 h frame (8 frames). Thresholds 7800/7000 are budget-balanced against the
    // measured per-tier burn (~970 / ~610 / ~250 calls/day), so a rich meter sweeps, a draining
    // meter trims gracefully, and the deck never collapses (unknown left stays starve-safe on
    // tier 0; the monthly reset restores the sweep automatically). Real anchors stay on Rainbow's
    // 10-min grid — a literal 5-min offset would be rejected (snap/offset lattice is 600 s).
    const rbkTier = function (l) { return (l == null) ? 0 : (l >= 7800 ? 2 : (l >= 7000 ? 1 : 0)); };
    const rbkBuild = function (s, tier) {
      const fr = [];
      for (let K2 = 6; K2 >= 1; K2--) fr.push({ time: s - K2 * 600, s: s - K2 * 600, o: 0, rbk: 1, path: 'rbk' + K2 });
      fr.push({ time: s, s: s, o: 0, rbk: 1, path: 'rbk0' });
      if (tier === 2) { for (let F3 = 600; F3 <= 3600; F3 += 600) fr.push({ time: s + F3, s: s, o: F3, rbk: 1, path: 'rbkFw' + F3 }); }
      else if (tier === 1) { for (let F4 = 1200; F4 <= 3600; F4 += 1200) fr.push({ time: s + F4, s: s, o: F4, rbk: 1, path: 'rbkFw' + F4 }); }
      else { fr.push({ time: s + 7200, s: s, o: 7200, rbk: 1, path: 'rbkF' }); }
      return { s: s, tier: tier, f: fr };
    };
    const tk = function () {
      if (dead) return;
      fetch('/radar/api/health', { cache: 'no-store' }).then(function (r3) { return (r3 && r3.ok) ? r3.json() : null; }).then(function (j3) {
        if (j3 && j3.usage && Number.isFinite(j3.usage.left)) rbkLeft.current = j3.usage.left;
        return fetch('/radar/api/snapshot', { cache: 'no-store' });
      }).then(function (r2) { return r2.ok ? r2.json() : Promise.reject(new Error('http ' + r2.status)); }).then(function (j2) {
        if (dead || !j2 || !j2.snapshot) return;
        const t3 = rbkTier(rbkLeft.current);
        setRbkSnap(function (old) { return (old && old.s === j2.snapshot && old.tier === t3) ? old : rbkBuild(j2.snapshot, t3); });
      }).catch(function () {});
    };
    tk(); const iv2 = setInterval(tk, 120000); return function () { dead = true; clearInterval(iv2); };
  }, []);
  // rvBuffer: n = frame index painted on the front layer, o = on the back layer, k = which layer is front
  const rvB = b.useState({ n: -1, o: -1, k: 0 }); const rvBuf = rvB[0]; const setBuf = rvB[1];
  const rvP = b.useState(!PAUSE); const rvPlay = rvP[0]; const setRvPlay = rvP[1];
  const rvM = b.useState({ w: 0, h: 0 }); const rvBox = rvM[0]; const setRvBox = rvM[1];
  const rvRef = b.useRef(null);
  // rvClock (ws7ah): HUD timestamp = the time the visible blend represents. Flip beats keep the
  // outgoing real frame's time; mid beats show the interpolated 5-min stamp (0 falls back to
  // rvFrame.time, so the initial render and PAUSE always show a real frame).
  const rvS = b.useState(0); const rvStT = rvS[0]; const rvsT = rvS[1];
  b.useEffect(function () {
    let dead = false;
    const pull = function () { fetch('https://api.rainviewer.com/public/weather-maps.json').then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('http ' + r.status)); }).then(function (j) { if (!dead) setRvData(j); }).catch(function () { if (!dead) setRvData(null); }); };
    pull(); const iv = setInterval(pull, 300000); return function () { dead = true; clearInterval(iv); };
  }, []);
  // ws7ar timeline: Rainbow mode (proxy healthy) = the ladder deck — 7 real frames of the past
  // hour at the fixed 10-min cadence + a tier tail chosen by the quota ladder above: tier 2 =
  // six future steps +10..+60, tier 1 = +20/+40/+60, tier 0 = the single +2 h frame (offset
  // 7200; measured on the live proxy 2026-11-20: every publish roll mints its (snap, offset)
  // family at ~12 tiles and only FRESH future families are new mints each roll — past frames
  // recycle earlier rolls' disk cache — so the tail COUNT is the quota lever and offset reach
  // is free; the blind 6-step sweep measured ~900+ upstream calls/day vs the 9300/month brake,
  // hence the ladder instead of a fixed ramp).
  // Fallback mode (rbkOK 0/ null, or no data yet): the original RainViewer deck — the last 7
  // past frames (1 h sweep at RainViewer's 10-min publish cadence; the timeline refetch below
  // runs every 5 min so new frames land within ≤5 min) + the free +30 min nowcast tail when
  // upstream serves it (probed 2026-11-20 weather-maps.json even served "nowcast":[] — the tail
  // appears by itself when frames return). Wall: 1 h + FCST in both modes.
  // Playback (ws7ah) halves the perceived step: each crossfade spans TWO 620 ms beats and the
  // HUD clock ticks in interpolated 5-min stamps between adjacent real anchors (10 min apart),
  // so an anchor sweep reads in ~5-minute increments — motion stays continuous; the loop runs
  // ~9.9 s without FCST, ~11.2-16.1 s with the tier tail, and the prefetch covers the whole deck.
  const rvNC = (rvData && rvData.radar && rvData.radar.nowcast) ? rvData.radar.nowcast : [];
  const rvRBK = (rbkOK === 1 && rbkSnap);
  const rvFrames = (rvRBK && rbkSnap) ? rbkSnap.f : (rvData && rvData.radar) ? (rvData.radar.past || []).slice(-7).concat(rvNC) : [];
  rvFrames.np = (rvRBK && rbkSnap) ? 7 : Math.min((rvData && rvData.radar && rvData.radar.past || []).length, 7);
  // rvXF v4 (ws7ah) — full-dwell continuous blend + forward-only radar loop. Two stacked overlay
  // layers swap roles every second 620 ms beat: the outgoing frame fades out while the incoming
  // fades in ('opacity 1.24s linear' = the whole 2-beat crossfade), so the loop morphs
  // continuously with no hold-snap between frames (fade-in + fade-out weights always sum to 1).
  // Every frame's tiles are prefetched (rvPL), and the playhead (rvPP) always steps forward —
  // through now, into the nowcast — wrapping back to the oldest after a beat on the newest.
  const rvPos = b.useRef(-1); const rvHold = b.useRef(0);
  const rvN = b.useRef(-1); const rvK = b.useRef(0); const rvPre = b.useRef([]);
  const rvBeat = b.useRef(0); const rvPrev = b.useRef(-1);
  // start on the NOW frame (latest past frame in the current deck); rebuild when the source
  // flips (proxy health) or a new Rainbow snapshot rolls — same-snapshot recomputes are no-ops
  b.useEffect(function () {
    const L = rvFrames.length;
    if (!L) return;
    const nPast = Math.min(rvFrames.np || 7, L - 1);
    const cur = nPast > 0 ? nPast - 1 : Math.max(0, L - 1);
    rvPos.current = cur; rvN.current = cur; rvK.current = 0; rvHold.current = 0; rvBeat.current = 0;
    setBuf({ n: cur, o: cur, k: 0 });
    rvsT(0);
  }, [rvData, rbkSnap, rbkOK]);
  // rvPP (ws7ah) — forward-only playback with the interpolated clock: every second 620 ms beat
  // flips the layers and starts the next 1.24 s crossfade (HUD = outgoing frame's time); the
  // alternate mid beat only advances the HUD to the midpoint stamp between the two blending real
  // frames (the on-screen blend genuinely IS that midpoint; skipped when the pair steps
  // backwards on the wrap). 2-beat hold on the newest (forecast) frame, then wrap to the oldest.
  b.useEffect(function () {
    if (!rvPlay || rvFrames.length < 2) return;
    const stampOf = function (i) { const f = rvFrames[i]; return f && f.time ? f.time : 0; };
    const t = setInterval(function () {
      const L = rvFrames.length;
      if (rvBeat.current === 1) {
        rvBeat.current = 0;
        const fA = rvFrames[rvPrev.current], fB = rvFrames[rvN.current];
        const gp = (fA && fB && fA.time && fB.time) ? (fB.time - fA.time) : 0;
        rvsT((gp > 0 && gp <= 620000) ? Math.round((fA.time + fB.time) / 2) : stampOf(rvN.current));
        return;
      }
      if (rvHold.current > 0) { rvHold.current--; rvsT(stampOf(rvN.current)); return; }
      const p = (rvPos.current + 1) % L;
      if (p === rvPos.current) return;
      rvPrev.current = rvN.current;
      rvPos.current = p; rvN.current = p; rvK.current = 1 - rvK.current;
      rvBeat.current = 1;
      if (p === L - 1) rvHold.current = 2;
      rvsT(stampOf(rvPrev.current));
      setBuf({ n: p, o: rvPrev.current, k: rvK.current });
    }, 620);
    return function () { clearInterval(t); };
  }, [rvPlay, rbkSnap, rbkOK, rvData]);
  b.useEffect(function () {
    const el = rvRef.current; if (!el) return;
    const upd = function () { setRvBox({ w: el.clientWidth || 0, h: el.clientHeight || 0 }); };
    upd();
    let ro = null;
    try { ro = new ResizeObserver(upd); ro.observe(el); } catch (e) { window.addEventListener('resize', upd); }
    return function () { if (ro) ro.disconnect(); else window.removeEventListener('resize', upd); };
  }, []);
  const rvFrame = (rvFrames.length > 0 && rvBuf.n >= 0) ? rvFrames[Math.min(rvBuf.n, rvFrames.length - 1)] : null;
  const nT = Math.pow(2, rvZoom); const TS = 256;
  const rfx = (lon + 180) / 360 * nT;
  const rra = lat * Math.PI / 180;
  const rfy = (1 - Math.log(Math.tan(rra) + 1 / Math.cos(rra)) / Math.PI) / 2 * nT;
  const cpx = rfx * TS; const cpy = rfy * TS;
  const halfW = rvBox.w / 2; const halfH = rvBox.h / 2;
  // Per-source overlay caps (ws7ak): RainViewer's public tilecache caps radar tiles at zoom 7,
  // Rainbow's nowcast grid is native to z10 (probed: real structure per level z8-10, z11+ blank)
  // -> overlay renders at OZ<=10 for Rainbow frames / <=7 for RV frames, scaled up to match NZ
  // (the existing OV scale wrapper handles rvZoom > OZ, so deep zooms never blank — they upscale
  // the deepest REAL data instead of the old z7 mush).
  const OZ = Math.min(rvZoom, rvRBK ? 10 : 7);
  const OV = Math.pow(2, rvZoom - OZ);
  const nTo = Math.pow(2, OZ);
  const fxO = (lon + 180) / 360 * nTo;
  const rraO = lat * Math.PI / 180;
  const fyO = (1 - Math.log(Math.tan(rraO) + 1 / Math.cos(rraO)) / Math.PI) / 2 * nTo;
  const cpxO = fxO * TS; const cpyO = fyO * TS;
  // rvBS — supersampled base below zoom 10: draw OSM from BZ = rvZoom + SS (SS<=2, BZ capped at 10),
  // each tile downscaled to btS = 256/2^SS screen px, so zooming out keeps street/lake/label detail
  // density instead of flipping to sparse low-zoom rasters. sc = nT/nB maps base px -> screen px.
  const SS = Math.min(2, Math.max(0, 10 - rvZoom));
  const BZ = rvZoom + SS;
  const nB = Math.pow(2, BZ);
  const btS = TS * nT / nB;
  const fxB = (lon + 180) / 360 * nB;
  const fyB = (1 - Math.log(Math.tan(rra) + 1 / Math.cos(rra)) / Math.PI) / 2 * nB;
  const cpxB = fxB * TS; const cpyB = fyB * TS;
  const sc = nT / nB;
  const b0x = rvBox.w ? Math.floor((cpxB - halfW / sc) / TS) : Math.floor(fxB) - 1;
  const b0y = rvBox.h ? Math.floor((cpyB - halfH / sc) / TS) : Math.floor(fyB) - 1;
  const bcX = rvBox.w ? Math.ceil(rvBox.w / btS) + 1 : 3;
  const bcY = rvBox.h ? Math.ceil(rvBox.h / btS) + 1 : 3;
  const baseTiles = [];
  for (let X = 0; X < bcX; X++) { for (let Y = 0; Y < bcY; Y++) {
    const tx = b0x + X, ty = b0y + Y;
    if (ty < 0 || ty >= nB) continue;
    baseTiles.push({ wx: ((tx % nB) + nB) % nB, y: ty, left: (tx * TS - cpxB) * sc + halfW, top: (ty * TS - cpyB) * sc + halfH, key: 'rvb' + BZ + '_' + tx + '_' + ty });
  } }
  const o0x2 = rvBox.w ? Math.floor((cpxO - halfW / OV) / TS) : Math.floor(fxO) - 1;
  const o0y = rvBox.h ? Math.floor((cpyO - halfH / OV) / TS) : Math.floor(fyO) - 1;
  const ocntX = rvBox.w ? Math.ceil(rvBox.w / TS / OV) + 1 : 3;
  const ocntY = rvBox.h ? Math.ceil(rvBox.h / TS / OV) + 1 : 3;
  const rvTiles = [];
  for (let X = 0; X < ocntX; X++) { for (let Y = 0; Y < ocntY; Y++) {
    const tx = o0x2 + X, ty = o0y + Y;
    if (ty < 0 || ty >= nTo) continue;
    rvTiles.push({ wx: ((tx % nTo) + nTo) % nTo, y: ty, tx: tx, key: 'rvt' + tx + '_' + ty });
  } }
  // frUrl (ws7aj): one URL builder for both sources — Rainbow frames go through the local express
  // proxy (/radar/api/tiles/v1/precip-global/{snap}/{off}/{z}/{x}/{y}?color=N; key injected by
  // the server, tiles disk-cached) while RainViewer fallback frames keep the public tilecache
  // scheme (host + path + size/zoom/tile/palette/1_1.png).
  const frUrl = function (f, x, y) {
    if (!f) return '';
    if (f.rbk) return '/radar/api/tiles/v1/precip-global/' + f.s + '/' + f.o + '/' + OZ + '/' + x + '/' + y + '?color=' + COLRB;
    return (rvData && rvData.host) ? rvData.host + f.path + '/' + TS + '/' + OZ + '/' + x + '/' + y + '/' + COLRV + '/1_1.png' : '';
  };
  // rvPL — prefetch every overlay tile of every frame once, so crossfades never wait on the network
  b.useEffect(function () {
    if (rvBox.w < 2 || rvTiles.length === 0 || rvFrames.length === 0) return;
    const ims = [];
    for (let F = 0; F < rvFrames.length; F++) {
      const f = rvFrames[F]; if (!f) continue;
      for (let T = 0; T < rvTiles.length; T++) { const t = rvTiles[T]; try { const u2 = frUrl(f, t.wx, t.y); if (u2) { const im = new Image(); im.src = u2; ims.push(im); } } catch (e) {} }
    }
    rvPre.current = ims;
  }, [rvData, rbkSnap, rbkOK, rvZoom, rvBox.w, rvBox.h]);
  const rvShowT = rvStT || (rvFrame && rvFrame.time ? rvFrame.time : 0);
  const rvTime = rvShowT ? new Date(rvShowT * 1000) : null;
  const rvTimeStr = rvTime ? (((rvTime.getHours() % 12) === 0 ? 12 : rvTime.getHours() % 12) + ':' + (rvTime.getMinutes() < 10 ? '0' : '') + rvTime.getMinutes() + (rvTime.getHours() < 12 ? ' AM' : ' PM')) : '';
  // rvFC — forecast badge: nowcast frames sit in the future, so show an "FCST +Nm" pill by the
  // clock (past 90 min the badge reads "+Nh" so the +2 h tail frame stays compact)
  const rvNow = Date.now() / 1000;
  const rvFcst = rvFrame && rvFrame.time && rvFrame.time > rvNow + 60;
  const rvFcMin = rvFcst ? Math.round((rvFrame.time - rvNow) / 60) : 0;
  return n.jsxs('div', { className: 'h-full w-full flex flex-col overflow-hidden relative', style: { background: 'linear-gradient(180deg,#101c30 0%,#0a1526 100%)', borderRadius: 14, border: '1px solid rgba(255,255,255,.06)' }, children: [
    n.jsxs('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px 4px', flexShrink: 0 }, children: [
      n.jsx('div', { style: { fontSize: '11pt', fontWeight: 800, letterSpacing: '.08em', color: '#dbe4f0', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }, children: rvLabel }),
      n.jsxs('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }, children: [
        CTL ? n.jsx('button', { type: 'button', onClick: function () { rvSet(rvZoom - 1); }, style: { width: 24, height: 24, borderRadius: '999px', border: '1px solid rgba(255,255,255,.25)', background: 'rgba(255,255,255,.08)', color: '#e2e9f2', fontSize: 13, lineHeight: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, opacity: rvZoom <= 3 ? 0.35 : 1 }, children: '\u2212' }) : null,
        CTL ? n.jsx('button', { type: 'button', onClick: function () { rvSet(rvZoom + 1); }, style: { width: 24, height: 24, borderRadius: '999px', border: '1px solid rgba(255,255,255,.25)', background: 'rgba(255,255,255,.08)', color: '#e2e9f2', fontSize: 12, lineHeight: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, opacity: rvZoom >= 10 ? 0.35 : 1 }, children: '+' }) : null,
        n.jsx('button', { type: 'button', onClick: function () { setRvPlay(!rvPlay); }, style: { width: 22, height: 22, borderRadius: '999px', border: '1px solid rgba(255,255,255,.25)', background: 'rgba(255,255,255,.08)', color: '#e2e9f2', fontSize: 10, lineHeight: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }, children: rvPlay ? '\u23F8' : '\u25B6' }),
        n.jsx('span', { style: { fontSize: '9pt', color: '#93a7c0', fontWeight: 600 }, children: rvTimeStr || 'Loading\u2026' }),
        rvFcst ? n.jsx('span', { style: { fontSize: '8pt', fontWeight: 800, letterSpacing: '.08em', color: '#7ff3ff', background: 'rgba(0,140,160,.28)', border: '1px solid rgba(127,243,255,.55)', borderRadius: 6, padding: '1px 6px', whiteSpace: 'nowrap' }, children: 'FCST +' + (rvFcMin < 90 ? rvFcMin + 'm' : (Math.round(rvFcMin / 30) / 2) + 'h') }) : null
      ] })
    ] }),
    n.jsx('div', { ref: rvRef, onTouchStart: pvStart, onTouchMove: pvMove, onTouchEnd: pvEnd, onTouchCancel: pvEnd, style: { position: 'relative', flex: '1 1 auto', minHeight: 0, overflow: 'hidden', touchAction: CTL ? 'none' : undefined }, children: rvBox.w ? n.jsxs('div', { style: { position: 'absolute', left: 0, top: 0 }, children: [
      baseTiles.map(function (t) {
        return n.jsx('div', { style: { position: 'absolute', left: t.left + 'px', top: t.top + 'px', width: btS + 'px', height: btS + 'px', backgroundImage: 'url(https://tile.openstreetmap.org/' + BZ + '/' + t.wx + '/' + t.y + '.png)', backgroundSize: btS + 'px ' + btS + 'px', display: 'block', filter: 'invert(.88) hue-rotate(175deg) brightness(.85) saturate(.35)' } }, t.key);
      }),
      // rvXF — two stacked radar layers: the incoming frame stays blended over the outgoing one.
      // GEOMETRY (rvXF wrapper): rain tiles live at the overlay's native zoom (OZ<=10 for
      // Rainbow frames, <=7 for RainViewer ones — server API caps) but the panel shows NZ,
      // so each layer wraps its tile grid in a scale(OV) wrapper pinned at (halfW - cpxO*OV,
      // halfH - cpyO*OV) with transformOrigin '0 0' — without it tiles land at raw zoom-7 px
      // coords (~9000px) far outside the panel and only the map shows.
      [0, 1].map(function (K) {
        const fi = rvBuf.k === K ? rvBuf.n : rvBuf.o;
        const f = (fi >= 0 && rvFrames.length > 0) ? rvFrames[Math.min(fi, rvFrames.length - 1)] : null;
        return n.jsxs('div', { style: { position: 'absolute', left: 0, top: 0, opacity: rvBuf.k === K ? 1 : 0, transition: 'opacity 1.24s linear', pointerEvents: 'none' }, children: [n.jsxs('div', { style: { position: 'absolute', left: (halfW - cpxO * OV) + 'px', top: (halfH - cpyO * OV) + 'px', transform: 'scale(' + OV + ')', transformOrigin: '0 0', width: '1px', height: '1px' }, children: [rvTiles.map(function (t) {
          return n.jsxs('div', { style: { position: 'absolute', left: t.tx * TS + 'px', top: t.y * TS + 'px', width: TS + 'px', height: TS + 'px' }, children: [
            (f && frUrl(f, t.wx, t.y)) ? n.jsx('div', { style: { position: 'absolute', left: 0, top: 0, width: TS + 'px', height: TS + 'px', backgroundImage: 'url(' + frUrl(f, t.wx, t.y) + ')', backgroundSize: '256px 256px', pointerEvents: 'none' } }, 'fr' + fi + 'L' + K) : null
          ] }, t.key + 'L' + K);
        })] })] }, 'rvLy' + K);
      }),
      // rwHome — bright beacon at the map center = 2141 Wolf Ridge Ln, Mount Dora (home address).
      // Magenta pops against NEXRAD green/yellow radar colors AND the dark base; white core pins
      // the exact point; pulsing halo makes it unmissable on the dim kiosk at glance distance.
      // IMPORTANT: anchor uses halfW/halfH px — % offsets resolve against the 0x0 offset container
      // (base tiles are centered the same way), so '50%' here would land at the panel's top-left.
      n.jsxs('div', { style: { position: 'absolute', left: halfW + 'px', top: halfH + 'px', width: 0, height: 0, pointerEvents: 'none' }, children: [
        n.jsx('style', { children: '@keyframes rwPulse{0%{transform:scale(.5);opacity:.9}75%{opacity:.18}100%{transform:scale(2.3);opacity:0}}' }),
        n.jsx('span', { style: { position: 'absolute', left: -27, top: -27, width: 54, height: 54, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,43,214,.5) 0%, rgba(255,43,214,.16) 48%, rgba(255,43,214,0) 72%)', animation: 'rwPulse 1.7s ease-out infinite' } }),
        n.jsx('span', { style: { position: 'absolute', left: -11, top: -11, width: 22, height: 22, borderRadius: '50%', border: '2px solid #ff2bd6', background: 'rgba(255,43,214,.22)', boxShadow: '0 0 8px 2px rgba(255,43,214,.65), 0 0 18px 6px rgba(255,43,214,.3)', boxSizing: 'border-box' } }),
        n.jsx('span', { style: { position: 'absolute', left: -4, top: -4, width: 8, height: 8, borderRadius: '50%', background: '#fff', boxShadow: '0 0 6px 2px rgba(255,255,255,.9), 0 0 14px 4px rgba(255,43,214,.55), 0 1px 2px rgba(0,0,0,.9)' } }),
        n.jsx('span', { style: { position: 'absolute', left: 14, top: 10, fontSize: 8, fontWeight: 800, letterSpacing: '.12em', color: '#fff', background: 'rgba(10,8,18,.72)', border: '1px solid rgba(255,43,214,.65)', borderRadius: 6, padding: '1px 5px', boxShadow: '0 1px 3px rgba(0,0,0,.8)', whiteSpace: 'nowrap' }, children: 'HOME' })
      ] })
    ] }) : null }),
    n.jsx('div', { style: { padding: '3px 12px 6px', fontSize: '7.5pt', color: 'rgba(147,167,192,.65)', textAlign: 'right', flexShrink: 0 }, children: '\u00A9 OpenStreetMap \u00B7 Rainbow Weather (fallback: RainViewer)' })
  ] });
}

