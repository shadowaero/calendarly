// rwRV — standalone RainViewer radar block (RainViewer public API animated over dark OSM base; resizable via block size)
// Timeline (rvT30): the last ~30 min of radar + RainViewer's nowcast forecast, always playing FORWARD
// in time (oldest -> now -> forecast, then wraps). Future frames get an "FCST +Nm" badge by the clock.
// config keys: lat, lon, zoom (3-11, default 7), color (palette id), label, pause (1 = freeze frame), ctl (1 = +/- zoom buttons + two-finger pinch on the map; zoom persists per label in localStorage)
function rwRV(props) {
  const a = (props && props.config) || {};
  const lat = isFinite(Number(a.lat)) ? Number(a.lat) : 28.817422;
  const lon = isFinite(Number(a.lon)) ? Number(a.lon) : -81.620514;
  const NZ = Math.min(Math.max(Math.round(Number(a.zoom)) || 7, 3), 11);
  const COLRV = (a.color !== '' && a.color != null && isFinite(Number(a.color))) ? Number(a.color) : 6;
  const rvLabel = a.label || 'RAINVIEWER RADAR';
  const PAUSE = (a.pause === true || Number(a.pause) === 1);
  const CTL = (a.ctl === true || Number(a.ctl) === 1);
  let rvZ0 = NZ;
  if (CTL) { try { const lz = Math.round(Number(localStorage.getItem('rwRVz:' + rvLabel))); if (lz >= 3 && lz <= 11) rvZ0 = lz; } catch (e) {} }
  const rvZ = b.useState(rvZ0); const rvZoom = rvZ[0];
  const rvSet = function (z) { z = Math.min(Math.max(Math.round(Number(z)), 3), 11); if (CTL) { try { localStorage.setItem('rwRVz:' + rvLabel, String(z)); } catch (e) {} } rvZ[1](z); };
  const rvPinch = b.useRef(null);
  const pvStart = function (e) { if (!CTL || !e.touches || e.touches.length !== 2) return; const dx = e.touches[0].clientX - e.touches[1].clientX, dy = e.touches[0].clientY - e.touches[1].clientY; rvPinch.current = Math.sqrt(dx * dx + dy * dy); };
  const pvMove = function (e) { if (!CTL || rvPinch.current == null || !e.touches || e.touches.length !== 2) return; const dx = e.touches[0].clientX - e.touches[1].clientX, dy = e.touches[0].clientY - e.touches[1].clientY; const d = Math.sqrt(dx * dx + dy * dy); const r = d / rvPinch.current; if (r > 1.35) { rvSet(rvZoom + 1); rvPinch.current = d; } else if (r < 0.74) { rvSet(rvZoom - 1); rvPinch.current = d; } };
  const pvEnd = function () { rvPinch.current = null; };
  const rvD = b.useState(null); const rvData = rvD[0]; const setRvData = rvD[1];
  // rvBuffer: n = frame index painted on the front layer, o = on the back layer, k = which layer is front
  const rvB = b.useState({ n: -1, o: -1, k: 0 }); const rvBuf = rvB[0]; const setBuf = rvB[1];
  const rvP = b.useState(!PAUSE); const rvPlay = rvP[0]; const setRvPlay = rvP[1];
  const rvM = b.useState({ w: 0, h: 0 }); const rvBox = rvM[0]; const setRvBox = rvM[1];
  const rvRef = b.useRef(null);
  b.useEffect(function () {
    let dead = false;
    const pull = function () { fetch('https://api.rainviewer.com/public/weather-maps.json').then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('http ' + r.status)); }).then(function (j) { if (!dead) setRvData(j); }).catch(function () { if (!dead) setRvData(null); }); };
    pull(); const iv = setInterval(pull, 300000); return function () { dead = true; clearInterval(iv); };
  }, []);
  // rvT30 — timeline: last ~4 past frames (~30 min of trend) + RainViewer's nowcast forecast frames
  // (the public API only forecasts ~+30 min ahead). Older frames are deliberately dropped: the kiosk
  // wants "recent trend -> what's coming", not a two-hour history replay.
  const rvFrames = (rvData && rvData.radar) ? (rvData.radar.past || []).slice(-4).concat(rvData.radar.nowcast || []) : [];
  // rvXF v2 — crossfade + forward-only radar loop. Two stacked overlay layers: the outgoing frame
  // stays painted while the incoming one fades in over it ('opacity .48s linear'), every frame's
  // tiles are prefetched (rvPL), and the playhead (rvPP) always steps forward — 30 min of radar
  // trend, through now, into the nowcast — wrapping back to the oldest after a beat on the newest.
  const rvPos = b.useRef(-1); const rvHold = b.useRef(0);
  const rvN = b.useRef(-1); const rvK = b.useRef(0); const rvPre = b.useRef([]);
  // start on the NOW frame (latest past frame in the trimmed timeline); rebuild when frames change
  b.useEffect(function () {
    if (!rvData || !rvData.radar) return;
    const nPast = Math.min(4, (rvData.radar.past || []).length);
    const L = rvFrames.length;
    const cur = nPast > 0 ? nPast - 1 : Math.max(0, L - 1);
    rvPos.current = cur; rvN.current = cur; rvK.current = 0; rvHold.current = 0;
    setBuf({ n: cur, o: cur, k: 0 });
  }, [rvData]);
  // rvPP — forward-only playback: 620 ms/step, 480 ms crossfade, 2-beat hold on the newest
  // (forecast) frame, then wrap back to the oldest so every loop replays trend -> forecast
  b.useEffect(function () {
    if (!rvPlay || rvFrames.length < 2) return;
    const t = setInterval(function () {
      const L = rvFrames.length;
      if (rvHold.current > 0) { rvHold.current--; return; }
      const p = (rvPos.current + 1) % L;
      if (p === rvPos.current) return;
      const prevN = rvN.current;
      rvPos.current = p; rvN.current = p; rvK.current = 1 - rvK.current;
      if (p === L - 1) rvHold.current = 2;
      setBuf({ n: p, o: prevN, k: rvK.current });
    }, 620);
    return function () { clearInterval(t); };
  }, [rvPlay, rvData]);
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
  // RainViewer tilecache caps radar tiles at zoom 7 -> overlay at OZ<=7, scaled up to match NZ
  const OZ = Math.min(rvZoom, 7);
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
  // rvPL — prefetch every overlay tile of every frame once, so crossfades never wait on the network
  b.useEffect(function () {
    if (!rvData || !rvData.host || rvBox.w < 2 || rvTiles.length === 0 || rvFrames.length === 0) return;
    const ims = [];
    for (let F = 0; F < rvFrames.length; F++) {
      const f = rvFrames[F]; if (!f || !f.path) continue;
      for (let T = 0; T < rvTiles.length; T++) { const t = rvTiles[T]; try { const im = new Image(); im.src = rvData.host + f.path + '/' + TS + '/' + OZ + '/' + t.wx + '/' + t.y + '/' + COLRV + '/1_1.png'; ims.push(im); } catch (e) {} }
    }
    rvPre.current = ims;
  }, [rvData, rvZoom, rvBox.w, rvBox.h]);
  const rvTime = rvFrame ? new Date(rvFrame.time * 1000) : null;
  const rvTimeStr = rvTime ? (((rvTime.getHours() % 12) === 0 ? 12 : rvTime.getHours() % 12) + ':' + (rvTime.getMinutes() < 10 ? '0' : '') + rvTime.getMinutes() + (rvTime.getHours() < 12 ? ' AM' : ' PM')) : '';
  // rvFC — forecast badge: nowcast frames sit in the future, so show an "FCST +Nm" pill by the clock
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
        rvFcst ? n.jsx('span', { style: { fontSize: '8pt', fontWeight: 800, letterSpacing: '.08em', color: '#7ff3ff', background: 'rgba(0,140,160,.28)', border: '1px solid rgba(127,243,255,.55)', borderRadius: 6, padding: '1px 6px', whiteSpace: 'nowrap' }, children: 'FCST +' + rvFcMin + 'm' }) : null
      ] })
    ] }),
    n.jsx('div', { ref: rvRef, onTouchStart: pvStart, onTouchMove: pvMove, onTouchEnd: pvEnd, onTouchCancel: pvEnd, style: { position: 'relative', flex: '1 1 auto', minHeight: 0, overflow: 'hidden', touchAction: CTL ? 'none' : undefined }, children: rvBox.w ? n.jsxs('div', { style: { position: 'absolute', left: 0, top: 0 }, children: [
      baseTiles.map(function (t) {
        return n.jsx('div', { style: { position: 'absolute', left: t.left + 'px', top: t.top + 'px', width: btS + 'px', height: btS + 'px', backgroundImage: 'url(https://tile.openstreetmap.org/' + BZ + '/' + t.wx + '/' + t.y + '.png)', backgroundSize: btS + 'px ' + btS + 'px', display: 'block', filter: 'invert(.88) hue-rotate(175deg) brightness(.85) saturate(.35)' } }, t.key);
      }),
      // rvXF — two stacked radar layers: the incoming frame stays blended over the outgoing one.
      // GEOMETRY (rvXF wrapper): rain tiles live at zoom OZ (<=7, API cap) but the panel shows NZ,
      // so each layer wraps its tile grid in a scale(OV) wrapper pinned at (halfW - cpxO*OV,
      // halfH - cpyO*OV) with transformOrigin '0 0' — without it tiles land at raw zoom-7 px
      // coords (~9000px) far outside the panel and only the map shows.
      [0, 1].map(function (K) {
        const fi = rvBuf.k === K ? rvBuf.n : rvBuf.o;
        const f = (fi >= 0 && rvFrames.length > 0) ? rvFrames[Math.min(fi, rvFrames.length - 1)] : null;
        return n.jsxs('div', { style: { position: 'absolute', left: 0, top: 0, opacity: rvBuf.k === K ? 1 : 0, transition: 'opacity .48s linear', pointerEvents: 'none' }, children: [n.jsxs('div', { style: { position: 'absolute', left: (halfW - cpxO * OV) + 'px', top: (halfH - cpyO * OV) + 'px', transform: 'scale(' + OV + ')', transformOrigin: '0 0', width: '1px', height: '1px' }, children: [rvTiles.map(function (t) {
          return n.jsxs('div', { style: { position: 'absolute', left: t.tx * TS + 'px', top: t.y * TS + 'px', width: TS + 'px', height: TS + 'px' }, children: [
            (f && rvData && rvData.host) ? n.jsx('div', { style: { position: 'absolute', left: 0, top: 0, width: TS + 'px', height: TS + 'px', backgroundImage: 'url(' + rvData.host + f.path + '/' + TS + '/' + OZ + '/' + t.wx + '/' + t.y + '/' + COLRV + '/1_1.png)', backgroundSize: '256px 256px', pointerEvents: 'none' } }, 'fr' + fi + 'L' + K) : null
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
    n.jsx('div', { style: { padding: '3px 12px 6px', fontSize: '7.5pt', color: 'rgba(147,167,192,.65)', textAlign: 'right', flexShrink: 0 }, children: '\u00A9 OpenStreetMap \u00B7 RainViewer' })
  ] });
}

