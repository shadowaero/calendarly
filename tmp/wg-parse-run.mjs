const n={jsx:function(t,p,k){return {t:t,p:p}},jsxs:function(t,p,k){return {t:t,p:p,k:k}}};const b={useState:function(){return [new Date(),function(){}]},useEffect:function(){},useRef:function(){return {current:null}}};const wm=function(){return null};const WX_SVG={};const wxIco=function(){return null};const wxIconKey=function(){return "pc"};const wmoBucket=function(){return "pc"};const fOf=function(x){return x};const inHg=function(){return 29.9};const fmt12=function(){return "6:00 AM"};const fmtHour=function(){return "6 AM"};const minsOf=function(){return 360};const DIRS=["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
// wxGUI — full-screen "Weather GUI" block, replicating out/weathergui.jpg (v1 duplicate build)
// Injected into the client bundle right before `function wsWS` — module scope here already has:
// n (jsx), b (react), WX_SVG, wxIco, wxIconKey, wmoBucket, fOf, inHg, fmt12, fmtHour, minsOf, DIRS,
// rwRV (RainViewer animated radar block — injected by fdw-apply-radar-widgets.cjs before this comp)
const WG_CSS = '@keyframes wgDrift{from{transform:translate3d(-6%,0,0)}to{transform:translate3d(6%,-2%,0)}}' +
  '@keyframes wgTw{0%,100%{opacity:.15}50%{opacity:.9}}' +
  '@keyframes wgRainA{from{background-position:0 0}to{background-position:-8px 140px}}' +
  '@keyframes wgFlash{0%,93%,100%{opacity:0}94%{opacity:.32}96%{opacity:.05}97%{opacity:.2}98%{opacity:0}}' +
  '@keyframes wgGlow{0%,100%{box-shadow:0 0 .9cqh .2cqh rgba(232,236,246,.55)}50%{box-shadow:0 0 1.6cqh .5cqh rgba(232,236,246,.75)}}' +
  '@keyframes wgSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}' +
  '.wgCloud{position:absolute;border-radius:50%;background:radial-gradient(ellipse at center,rgba(255,255,255,.5) 0%,rgba(255,255,255,0) 68%);animation:wgDrift 60s ease-in-out infinite alternate;pointer-events:none}' +
  '.wgStar{position:absolute;background:#fff;border-radius:50%;animation:wgTw 3.6s ease-in-out infinite;pointer-events:none}' +
  '.wgRain{position:absolute;left:-8%;top:-15%;width:116%;height:135%;opacity:.26;pointer-events:none;background-image:repeating-linear-gradient(96deg,rgba(255,255,255,.3) 0 1px,transparent 1px 8px);animation:wgRainA .8s linear infinite}' +
  '.wgSnow{position:absolute;left:-8%;top:-15%;width:116%;height:135%;opacity:.5;pointer-events:none;background-image:radial-gradient(rgba(255,255,255,.85) 1.5px,transparent 1.5px);background-size:14px 14px;animation:wgRainA 3.4s linear infinite}' +
  '.wgFlash{position:absolute;inset:0;background:#fff;opacity:0;animation:wgFlash 8s infinite;pointer-events:none}' +
  '.wgMoon{position:absolute;border-radius:50%;background:radial-gradient(circle at 38% 34%,#f4f6f9 0%,#dfe5ee 52%,#c9d2e0 100%);box-shadow:0 0 3cqh 1cqh rgba(226,232,242,.5),0 0 9cqh 3cqh rgba(180,196,220,.16);animation:wgGlow 7s ease-in-out infinite;pointer-events:none}' +
  '.wgMoon::after{content:"";position:absolute;left:22%;top:30%;width:16%;height:16%;border-radius:50%;background:rgba(176,188,206,.5);box-shadow:2.1cqh 1.1cqh 0 -.15ex rgba(176,188,206,.42),-.7cqh 2.4cqh 0 -.35ex rgba(176,188,206,.35)}' +
  '.wgSun{position:absolute;border-radius:50%;background:radial-gradient(circle at 40% 35%,#fff7e0 0%,#ffdf8a 55%,#f7b733 100%);box-shadow:0 0 3.4cqh 1cqh rgba(255,209,110,.55),0 0 10cqh 3.5cqh rgba(255,190,90,.18);pointer-events:none}' +
  '.wgTile{position:absolute;pointer-events:none;font-weight:700;white-space:nowrap;text-shadow:0 1px 3px rgba(0,0,0,.8)}' +
  '@keyframes wgXDrift{from{transform:translate(-4%,1.5%)}to{transform:translate(4%,-1.5%)}}' +
  '@keyframes wgXFall{from{transform:translateY(-20px)}to{transform:translateY(126px)}}' +
  '@keyframes wgXFallS{from{transform:translateY(-12px)}to{transform:translateY(118px)}}' +
  '@keyframes wgXSway{from{transform:translateX(-5px)}to{transform:translateX(5px)}}' +
  '@keyframes wgXPulse{from{opacity:.5}to{opacity:.22}}' +
  '@keyframes wgXBolt{0%,89%{opacity:0}90%{opacity:.9}92%{opacity:.08}94%{opacity:.75}96%{opacity:0}98%{opacity:.25}100%{opacity:0}}' +
  '@keyframes wgXFlash{0%,89%{opacity:0}90%{opacity:.38}92%{opacity:.04}94%{opacity:.3}96%{opacity:0}98%{opacity:.12}100%{opacity:0}}' +
  '@keyframes wgXFog{from{transform:translateX(-16px)}to{transform:translateX(16px)}}' +
  '@keyframes wgXShoot{0%{opacity:0;transform:translate(0,0)}2%{opacity:1;transform:translate(10px,6px)}7%{opacity:0;transform:translate(34px,20px)}100%{opacity:0;transform:translate(34px,20px)}}';
function wxGUI(props) {
  const c = (props && props.config) || {};
  const ff = (props && props.fontFamilyClass) || '';
  const zip = c.zip || '32757';
  const city = String(c.city || 'MOUNT DORA').toUpperCase();
  const outCh = String(c.outdoorChannel || 'A');
  const inCh = String(c.indoorChannel || 'B');
  const wxR = b.useState(null); const wx = wxR[0]; const setWx = wxR[1];
  const snR = b.useState(null); const sn = snR[0]; const setSn = snR[1];
  const alR = b.useState(null); const al = alR[0]; const setAl = alR[1];
  const tkR = b.useState(new Date()); const tk = tkR[0]; const setTk = tkR[1];
  const upR = b.useState(null); const upd = upR[0]; const setUpd = upR[1];
  // ---- data pulls ----
  b.useEffect(function () {
    let dead = false;
    const pull = function () {
      fetch('/api/weather?zip=' + encodeURIComponent(zip) + '&units=fahrenheit&days=2').then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('http ' + r.status)); }).then(function (j) { if (!dead) { setWx(j); setUpd(new Date()); } }).catch(function () {});
    };
    pull(); const iv = setInterval(pull, 300000); return function () { dead = true; clearInterval(iv); };
  }, [zip]);
  b.useEffect(function () {
    let dead = false;
    const pull = function () { fetch('/api/sensors').then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('http ' + r.status)); }).then(function (j) { if (!dead) setSn(j || { sensors: [] }); }).catch(function () {}); };
    pull(); const iv = setInterval(pull, 60000); return function () { dead = true; clearInterval(iv); };
  }, []);
  b.useEffect(function () {
    let dead = false;
    const pull = function () { fetch('/api/weather/alerts?zip=' + encodeURIComponent(zip)).then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('http ' + r.status)); }).then(function (j) { if (!dead) setAl(j || { alerts: [] }); }).catch(function () {}); };
    pull(); const iv = setInterval(pull, 600000); return function () { dead = true; clearInterval(iv); };
  }, [zip]);
  b.useEffect(function () {
    let dead = false;
    const t = setInterval(function () { if (!dead) setTk(new Date()); }, 1000);
    return function () { dead = true; clearInterval(t); };
  }, []);
  // ---- derived ----
  // ---- derived ----
  const cur = (wx && wx.current) || null;
  const pr = (wx && wx.pressure) || null;
  const dly = (wx && wx.daily) || [];
  const d0 = dly[0] || null;
  const sens = (sn && sn.sensors) || [];
  const out = sens.filter(function (s) { return String(s.channel) === outCh; })[0] || null;
  const inn = sens.filter(function (s) { return String(s.channel) === inCh; })[0] || null;
  const isDay = !(cur && Number(cur.is_day) === 0);
  const buck = cur && cur.code != null ? wmoBucket(cur.code) : 'pc';
  const stormy = !!(cur && cur.wind != null && Number(cur.wind) >= 39);
  const heroKey = stormy ? 'hurricane' : (cur ? wxIconKey(cur.code, cur.is_day) : (isDay ? 'partly-cloudy-day' : 'partly-cloudy-night'));
  const outT = out && out.tempC != null ? fOf(out.tempC) : (cur ? cur.temp : null);
  const outHr = out && out.humidity != null ? out.humidity : (cur ? cur.humidity : null);
  const inT = inn && inn.tempC != null ? fOf(inn.tempC) : null;
  const inHr = inn ? inn.humidity : null;
  const cond = cur && cur.condition ? (cur.condition.label || '') : '';
  const feels = cur && cur.apparent != null ? cur.apparent : null;
  const wDeg = cur && cur.wind_dir != null ? Number(cur.wind_dir) : null;
  const wDir = wDeg != null ? DIRS[Math.round(wDeg / 22.5) % 16] : null;
  const wMph = cur && cur.wind != null ? Math.round(Number(cur.wind)) : null;
  const gust = cur && cur.wind_gusts != null ? Math.round(Number(cur.wind_gusts)) : null;
  const pIn = pr && pr.hpa != null ? inHg(pr.hpa) : null;
  const pTrend = pr && pr.trend ? String(pr.trend) : null;
  const srM = d0 ? minsOf(d0.sunrise) : null;
  const ssM = d0 ? minsOf(d0.sunset) : null;
  const dayLen = srM != null && ssM != null ? (ssM - srM) : null;
  const nowMins = tk.getHours() * 60 + tk.getMinutes();
  const dayProg = (srM != null && ssM != null && ssM > srM) ? Math.max(0, Math.min(1, (nowMins - srM) / (ssM - srM))) : 0;
  const headerTime = ((tk.getHours() % 12) === 0 ? 12 : tk.getHours() % 12) + ':' + (tk.getMinutes() < 10 ? '0' : '') + tk.getMinutes() + ' ' + (tk.getHours() < 12 ? 'AM' : 'PM');
  const headerDate = tk.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();
  const updTimeStr = upd ? ((upd.getHours() % 12) === 0 ? 12 : upd.getHours() % 12) + ':' + (upd.getMinutes() < 10 ? '0' : '') + upd.getMinutes() + ' ' + (upd.getHours() < 12 ? 'AM' : 'PM') : null;
  // hour-of-day is_day for a given hourly time string
  const hourIsDay = function (t) {
    const dpart = String(t).split('T')[0]; const m = minsOf(t);
    const d = dly.filter(function (x) { return x.date === dpart; })[0] || d0;
    if (!d) return true;
    const a = minsOf(d.sunrise); const z = minsOf(d.sunset);
    if (a == null || z == null || m == null) return true;
    return m >= a && m <= z;
  };
  const hl = [];
  (function () {
    const hy = (wx && wx.hourly) || [];
    let s = hy.findIndex(function (h) { return h.current; });
    if (s < 0) s = 0;
    for (let i = s; i < hy.length && hl.length < 12; i++) {
      const h = hy[i];
      hl.push({ time: h.time, temp: h.temp != null ? Math.round(Number(h.temp)) : null, p: h.precip != null ? Math.round(Number(h.precip)) : 0, key: stormy ? 'hurricane' : wxIconKey(h.code != null ? h.code : 3, hourIsDay(h.time) ? 1 : 0) });
    }
  })();
  const alerts = (al && al.alerts) || [];
  const a0 = alerts[0] || null;
  // ---- moon phase (real synodic cycle, for the animated sky scene) ----
  const phAge = (((tk.getTime() - 947182440000) / 86400000) % 29.53058867 + 29.53058867) % 29.53058867;
  const phP = phAge / 29.53058867;
  const phK = (1 - Math.cos(phP * 2 * Math.PI)) / 2;
  const phWax = phP < .5;
  // ---- animated current-conditions scene (hero card: fills the empty zone under the "Weather updated" chip) ----
  // SVG + CSS/SMIL animation; visuals keyed off the live WMO bucket (d/pc/cl/fg/dr/ra/sn/ts) + day/night.
  const wxScene = (function () {
    const SB = stormy ? 'ts' : buck;
    const night = !isDay;
    const isRn = SB === 'ra', isDz = SB === 'dr', isS = SB === 'sn', isT = SB === 'ts';
    const isC = SB === 'cl', isP = SB === 'pc', isD = SB === 'd', isF = SB === 'fg';
    const clFill = (night || isT) ? 'url(#wgXCN)' : 'url(#wgXCD)';
    const kids = []; let moonD = null; let moonX = 100; let moonY = 36; let moonR = 15;
    const star = function (x, y, r, i) {
      return n.jsx('circle', { cx: x, cy: y, r: r, fill: '#eaf1fb', style: { animation: 'wgTw 3.4s ease-in-out infinite', animationDelay: (i * .41) + 's' } }, 'st' + i);
    };
    const moon = function (x, y, r, key) {
      moonX = x; moonY = y; moonR = r;
      const rx = Math.abs(r * (1 - 2 * phK));
      moonD = 'M' + x + ' ' + (y - r) + ' A' + r + ' ' + r + ' 0 0 ' + (phWax ? 1 : 0) + ' ' + x + ' ' + (y + r) +
        ' A' + rx.toFixed(2) + ' ' + r + ' 0 0 ' + (((phK < .5) === phWax) ? 1 : 0) + ' ' + x + ' ' + (y - r) + ' Z';
      return n.jsxs('g', { children: [
        n.jsx('circle', { cx: x, cy: y, r: r * 2, fill: '#dbe6f4', opacity: .13, filter: 'url(#wgXB3)' }),
        n.jsx('circle', { cx: x, cy: y, r: r, fill: '#101c30', opacity: .9 }),
        n.jsx('path', { d: moonD, fill: 'url(#wgXMoonG)' }),
        n.jsxs('g', { clipPath: 'url(#wgXMC)', children: [
          n.jsx('circle', { cx: x + r * .26, cy: y - r * .2, r: r * .16, fill: 'rgba(150,166,188,.45)' }),
          n.jsx('circle', { cx: x - r * .22, cy: y + r * .3, r: r * .22, fill: 'rgba(150,166,188,.38)' }),
          n.jsx('circle', { cx: x - r * .42, cy: y - r * .36, r: r * .11, fill: 'rgba(150,166,188,.4)' })
        ] })
      ] }, key);
    };
    const sun = function (cx, cy, r, rays, dur, key) {
      const ry = [];
      for (let i = 0; i < rays; i++) {
        ry.push(n.jsx('polygon', { points: (r + 1.5) + ',-4.2 ' + (r + 1.5 + r * .95) + ',0 ' + (r + 1.5) + ',4.2Z', transform: 'rotate(' + Math.round(360 / rays * i) + ')', fill: '#ffdf8a', opacity: .55 }, 'ry' + i));
      }
      return n.jsxs('g', { children: [
        n.jsx('circle', { cx: cx, cy: cy, r: r * 2.1, fill: 'url(#wgXSunH)', style: { animation: 'wgXPulse 4.5s ease-in-out infinite alternate' } }),
        n.jsxs('g', { transform: 'translate(' + cx + ' ' + cy + ')', children: [
          n.jsx('g', { children: [n.jsx('animateTransform', { attributeName: 'transform', type: 'rotate', from: '0', to: '360', dur: dur + 's', repeatCount: 'indefinite' }, 'spin')].concat(ry) }),
          n.jsx('circle', { r: r, fill: 'url(#wgXSunG)' }),
          n.jsx('circle', { r: r * 1.28, fill: 'none', stroke: 'rgba(255,226,140,.55)', strokeWidth: 1.1 })
        ] })
      ] }, key);
    };
    const cloud = function (cx, cy, s, dur, delay, op, key) {
      return n.jsx('g', { style: { animation: 'wgXDrift ' + dur + 's ease-in-out infinite alternate', animationDelay: delay + 's' }, children: n.jsxs('g', { transform: 'translate(' + cx + ' ' + cy + ') scale(' + s + ')', opacity: op, filter: 'url(#wgXB2)', children: [
        n.jsx('ellipse', { cx: -17, cy: 4, rx: 14, ry: 9.5, fill: clFill }),
        n.jsx('ellipse', { cx: 1, cy: -5, rx: 17, ry: 11.5, fill: clFill }),
        n.jsx('ellipse', { cx: 17, cy: 2, rx: 15, ry: 10, fill: clFill }),
        n.jsx('ellipse', { cx: 1, cy: 6, rx: 22, ry: 9.5, fill: clFill })
      ] }) }, key);
    };
    if (isD) {
      if (!night) {
        kids.push(sun(100, 40, 15, 14, 55, 'sunD'));
      } else {
        [[16, 16, 1.1], [40, 10, 1.5], [68, 22, 1], [94, 12, 1.3], [150, 18, 1.4], [174, 10, 1], [122, 26, 1], [30, 32, 1], [58, 40, 1.2], [138, 44, 1.1]].forEach(function (p, i) { kids.push(star(p[0], p[1], p[2], i)); });
        kids.push(n.jsx('g', { style: { animation: 'wgXShoot 12s linear infinite', animationDelay: '2.5s' }, children: n.jsx('line', { x1: 130, y1: 10, x2: 144, y2: 18, stroke: '#eef4ff', strokeWidth: 1.5, strokeLinecap: 'round', opacity: 0 }) }, 'shoot'));
        kids.push(moon(98, 34, 15.5, 'moonD'));
      }
    } else if (isP) {
      if (!night) {
        kids.push(sun(136, 28, 10.5, 10, 72, 'sunP'));
        kids.push(cloud(86, 62, 1.7, 19, -6, .95, 'c0'));
      } else {
        [[22, 12, 1.2], [64, 10, 1.4], [116, 16, 1.1], [168, 12, 1.2]].forEach(function (p, i) { kids.push(star(p[0], p[1], p[2], i)); });
        kids.push(moon(140, 27, 11.5, 'moonP'));
        kids.push(cloud(76, 58, 1.7, 21, -9, .65, 'c0'));
      }
    } else if (isC) {
      kids.push(cloud(56, 32, 1.9, 23, -5, night ? .6 : .85, 'c0'));
      kids.push(cloud(126, 52, 2.2, 18, -11, night ? .65 : .9, 'c1'));
      kids.push(cloud(90, 78, 1.5, 27, -17, night ? .5 : .75, 'c2'));
    } else if (isRn || isDz || isT) {
      kids.push(cloud(64, 40, 2, 21, -3, isT ? .95 : .92, 'c0'));
      kids.push(cloud(152, 28, 1.5, 17, -8, isT ? .85 : .8, 'c1'));
      if (isT) kids.push(cloud(108, 20, 1.25, 24, -14, .78, 'c2'));
      const rc = isT ? 18 : (isDz ? 12 : 16);
      const sl = isT ? -5.5 : -2.5;
      for (let i = 0; i < rc; i++) {
        const x = 6 + ((i * 47) % 190);
        const L = (isDz ? 7 : 11) + (i % 3) * 5;
        kids.push(n.jsx('line', { x1: x, y1: -22, x2: x + sl, y2: -22 + L, stroke: 'url(#wgXRainG)', strokeWidth: isDz ? 1.6 : 2.2, strokeLinecap: 'round', opacity: isDz ? .55 : (isT ? .9 : .8), style: { animation: 'wgXFall ' + ((isDz ? 1.15 : .78) + (i % 5) * .08) + 's linear infinite', animationDelay: (-(i % 8) * .31) + 's' } }, 'rn' + i));
      }
      if (isT) {
        kids.push(n.jsx('path', { d: 'M104 36 L93 62 L100.5 62 L90 94 L106 60 L98.5 60 L112 36Z', fill: '#fff7d6', filter: 'url(#wgXGlow)', style: { animation: 'wgXBolt 7.5s linear infinite', opacity: 0 } }, 'bolt'));
        kids.push(n.jsx('rect', { x: 0, y: 0, width: 200, height: 110, fill: '#dfe9ff', style: { animation: 'wgXFlash 7.5s linear infinite', opacity: 0 } }, 'flash'));
      }
    } else if (isS) {
      kids.push(cloud(74, 34, 1.5, 21, -4, .9, 'c0'));
      kids.push(cloud(140, 44, 1.9, 18, -10, .85, 'c1'));
      for (let i = 0; i < 12; i++) {
        const x = 10 + ((i * 61) % 180);
        const rf = 1.2 + (i % 3) * .9;
        kids.push(n.jsx('g', { style: { animation: 'wgXFallS ' + (5.4 + (i % 4) * 1.4) + 's linear infinite', animationDelay: (-(i % 9) * .8) + 's' }, children: n.jsx('circle', { cx: x, cy: -6, r: rf, fill: '#eef5fc', opacity: .85, style: { animation: 'wgXSway ' + (2 + (i % 3) * .9) + 's ease-in-out infinite alternate' } }) }, 'fl' + i));
      }
    } else if (isF) {
      kids.push(n.jsx('circle', { cx: 100, cy: 44, r: 34, fill: night ? '#dbe6f4' : '#ffdf8a', opacity: night ? .12 : .18, filter: 'url(#wgXB3)' }, 'fgGlow'));
      kids.push(n.jsx('rect', { x: -34, y: 26, width: 268, height: 22, rx: 11, fill: 'url(#wgXFogG)', opacity: .5, filter: 'url(#wgXB3)', style: { animation: 'wgXFog 13s ease-in-out infinite alternate' } }, 'fg0'));
      kids.push(n.jsx('rect', { x: -34, y: 52, width: 268, height: 20, rx: 10, fill: 'url(#wgXFogG)', opacity: .38, filter: 'url(#wgXB3)', style: { animation: 'wgXFog 17s ease-in-out infinite alternate', animationDelay: '-4s' } }, 'fg1'));
      kids.push(n.jsx('rect', { x: -34, y: 78, width: 268, height: 18, rx: 9, fill: 'url(#wgXFogG)', opacity: .3, filter: 'url(#wgXB3)', style: { animation: 'wgXFog 21s ease-in-out infinite alternate', animationDelay: '-9s' } }, 'fg2'));
    } else {
      kids.push(cloud(96, 66, 1.15, 20, 0, .8, 'c0'));
    }
    // wgXDEFS
    const defs = n.jsxs('defs', { children: [
      n.jsx('radialGradient', { id: 'wgXSunG', children: [
        n.jsx('stop', { offset: '0%', stopColor: '#fff8dc' }),
        n.jsx('stop', { offset: '55%', stopColor: '#ffd76a' }),
        n.jsx('stop', { offset: '100%', stopColor: '#f2a145' })
      ] }),
      n.jsx('radialGradient', { id: 'wgXSunH', children: [
        n.jsx('stop', { offset: '0%', stopColor: 'rgba(255,213,110,.55)' }),
        n.jsx('stop', { offset: '60%', stopColor: 'rgba(255,203,100,.14)' }),
        n.jsx('stop', { offset: '100%', stopColor: 'rgba(255,203,100,0)' })
      ] }),
      n.jsx('linearGradient', { id: 'wgXMoonG', x1: 0, y1: 0, x2: .9, y2: 1, children: [
        n.jsx('stop', { offset: '0%', stopColor: '#fdfeff' }),
        n.jsx('stop', { offset: '55%', stopColor: '#e4ebf4' }),
        n.jsx('stop', { offset: '100%', stopColor: '#b7c5d8' })
      ] }),
      n.jsx('linearGradient', { id: 'wgXCD', x1: 0, y1: 0, x2: 0, y2: 1, children: [
        n.jsx('stop', { offset: '0%', stopColor: '#ffffff' }),
        n.jsx('stop', { offset: '50%', stopColor: '#ccd9e7' }),
        n.jsx('stop', { offset: '100%', stopColor: '#9db1c6' })
      ] }),
      n.jsx('linearGradient', { id: 'wgXCN', x1: 0, y1: 0, x2: 0, y2: 1, children: [
        n.jsx('stop', { offset: '0%', stopColor: '#8494ab' }),
        n.jsx('stop', { offset: '45%', stopColor: '#47536a' }),
        n.jsx('stop', { offset: '100%', stopColor: '#293043' })
      ] }),
      n.jsx('linearGradient', { id: 'wgXRainG', x1: 0, y1: 0, x2: 0, y2: 1, children: [
        n.jsx('stop', { offset: '0%', stopColor: 'rgba(206,227,255,0)' }),
        n.jsx('stop', { offset: '45%', stopColor: 'rgba(206,227,255,1)' }),
        n.jsx('stop', { offset: '100%', stopColor: 'rgba(206,227,255,0)' })
      ] }),
      n.jsx('linearGradient', { id: 'wgXFogG', x1: 0, y1: 0, x2: 0, y2: 1, children: [
        n.jsx('stop', { offset: '0%', stopColor: 'rgba(198,213,231,0)' }),
        n.jsx('stop', { offset: '40%', stopColor: 'rgba(208,222,238,.9)' }),
        n.jsx("stop", { offset: '100%', stopColor: 'rgba(198,213,231,0)' })
      ] }),
      n.jsx('clipPath', { id: 'wgXMC', children: n.jsx('path', { d: moonD || 'M0 0Z' }) }),
      n.jsx('filter', { id: 'wgXB2', x: '-40%', y: '-40%', width: '180%', height: '180%', children: n.jsx('feGaussianBlur', { stdDeviation: 2 }) }),
      n.jsx('filter', { id: 'wgXB3', x: '-60%', y: '-60%', width: '220%', height: '220%', children: n.jsx('feGaussianBlur', { stdDeviation: 4 }) }),
      n.jsxs('filter', { id: 'wgXGlow', children: [
        n.jsx('feGaussianBlur', { stdDeviation: 2.2, result: 'bl' }),
        n.jsxs('feMerge', { children: [n.jsx('feMergeNode', { in: 'bl' }), n.jsx('feMergeNode', { in: 'SourceGraphic' })] })
      ] })
    ] });
    return n.jsxs('svg', { className: 'wgXScene', viewBox: '0 0 200 110', preserveAspectRatio: 'xMidYMid meet', style: { width: '100%', height: '100%', display: 'block' }, children: [defs].concat(kids) });
  })();
  // ---- shared styles ----
  const st = {
    root: { position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '1cqh', padding: '1.2cqh 1.55cqw', background: 'linear-gradient(180deg,#0e1e38 0%,#0a1626 52%,#070f1d 100%)', overflow: 'hidden' },
    card: { position: 'relative', borderRadius: '1.05cqw', background: 'linear-gradient(180deg,#0e1b30 0%,#0a1526 100%)', border: '1px solid rgba(255,255,255,.055)', boxShadow: '0 .5cqh 2.2cqh rgba(0,0,0,.4)' },
    lbl: { fontSize: '1.28cqw', letterSpacing: '.13em', color: '#8fa3bd', fontWeight: 700 },
    lblS: { fontSize: '1.05cqw', letterSpacing: '.12em', color: '#7288a2', fontWeight: 700 },
    head: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' },
    hCity: { fontSize: '3.1cqw', fontWeight: 800, letterSpacing: '.06em', color: '#e8eef7', textTransform: 'uppercase' },
    hTime: { fontSize: '1.55cqw', fontWeight: 600, color: '#c4d2e2', letterSpacing: '.05em' },
    banner: { display: 'flex', alignItems: 'center', gap: '1cqw', minHeight: '5.6cqh', borderRadius: '.75cqw', padding: '0 1cqw 0 1.2cqw', background: 'linear-gradient(90deg,#e05f68 0%,#e98079 60%,#f0a48f 100%)', color: '#fff' },
    big: { fontSize: '8.8cqh', fontWeight: 800, color: '#f2f6fb', lineHeight: .95, letterSpacing: '-.02em' },
    amber: { color: '#f5b969', fontWeight: 700 },
    white: { color: '#eef3fa' },
    mut: { color: '#93a7c0' },
    pill: { display: 'inline-flex', alignItems: 'center', gap: '.45cqw', padding: '.45cqh .85cqw', borderRadius: '999px', background: 'rgba(255,255,255,.10)', border: '1px solid rgba(255,255,255,.22)', fontSize: '1.9cqh', fontWeight: 600, color: '#e6edf5' },
    val: { fontSize: '4.6cqh', fontWeight: 800, color: '#eef3fa' },
    valB: { fontSize: '4.2cqh', fontWeight: 800, color: '#eef3fa', lineHeight: 1 },
    dunit: { fontSize: '1.05cqw', color: '#7288a2', fontWeight: 600 },
    hum: { fontSize: '2.5cqh', fontWeight: 800, color: '#63b3f2' },
    windTxt: { fontSize: '1.85cqw', fontWeight: 800, color: '#eef3fa' },
    windMut: { fontSize: '1.55cqh', fontWeight: 600, color: '#8fa3bd' },
    tl: { fontSize: '1.35cqw', fontWeight: 700, color: '#eef3fa', letterSpacing: '.08em' },
    tls: { fontSize: '1.05cqw', fontWeight: 600, color: '#7288a2', letterSpacing: '.06em' }
  };
  // ---- sky backdrop wash only (the animated conditions scene lives in the hero content column now) ----
  const SKYBG = {
    d: 'linear-gradient(180deg,#3b6ea8 0%,#2c5687 55%,#24466f 100%)',
    n: 'linear-gradient(180deg,#1d2f55 0%,#152238 55%,#0d1728 100%)',
    tsd: 'linear-gradient(180deg,#374a63 0%,#27354a 60%,#1c2739 100%)',
    tsn: 'linear-gradient(180deg,#2a2f4a 0%,#1c2338 60%,#131a2c 100%)'
  };
  const skyKids = [
    n.jsx('div', { key: 'bg', style: { position: 'absolute', inset: 0, background: stormy ? (isDay ? SKYBG.tsd : SKYBG.tsn) : (isDay ? SKYBG.d : SKYBG.n) } })
  ];
  // ---- wind compass (SVG dial, needle points to wind origin) ----
  const needle = n.jsx('g', { transform: 'rotate(' + (wDeg != null ? wDeg : 0) + ' 50 50)', children: n.jsx('polygon', { points: '50 14 54 50 50 46 46 50', fill: '#eef3fa', style: { filter: 'drop-shadow(0 0 2px rgba(0,0,0,.6))' } }) });
  const dial = n.jsx('div', { style: { width: '9.4cqh', height: '9.4cqh' }, children: n.jsxs('svg', { viewBox: '0 0 100 100', width: '100%', height: '100%', children: [
    n.jsx('circle', { cx: 50, cy: 50, r: 47, fill: 'rgba(9,18,34,.55)', stroke: 'rgba(255,255,255,.32)', strokeWidth: 2.4 }),
    n.jsx('circle', { cx: 50, cy: 50, r: 37, fill: 'none', stroke: 'rgba(255,255,255,.14)', strokeWidth: 1 }),
    n.jsx('text', { x: 50, y: 17, textAnchor: 'middle', fontSize: 11, fill: '#dbe6f2', fontWeight: 800, children: 'N' }),
    n.jsx('text', { x: 50, y: 92, textAnchor: 'middle', fontSize: 9, fill: '#93a7c0', fontWeight: 700, children: 'S' }),
    n.jsx('text', { x: 8, y: 54, textAnchor: 'middle', fontSize: 9, fill: '#93a7c0', fontWeight: 700, children: 'W' }),
    n.jsx('text', { x: 92, y: 54, textAnchor: 'middle', fontSize: 9, fill: '#93a7c0', fontWeight: 700, children: 'E' }),
    needle,
    n.jsx('circle', { cx: 50, cy: 50, r: 3.4, fill: '#f5b969' })
  ] }) });
  // ---- hero pieces ----
  const sunT = dayProg > 0 && dayProg < 1;
  const sx = (1 - dayProg) * (1 - dayProg) * 18 + 2 * dayProg * (1 - dayProg) * 110 + dayProg * dayProg * 202;
  const sy = (1 - dayProg) * (1 - dayProg) * 88 + 2 * dayProg * (1 - dayProg) * 4 + dayProg * dayProg * 88;
  const drip = n.jsx('svg', { viewBox: '0 0 10 14', style: { width: '.9cqw' }, children: n.jsx('path', { d: 'M5 .8C5 .8 2 4.6 2 7.2a3 3 0 0 0 6 0C8 4.6 5 .8 5 .8Z', fill: '#63b3f2' }) });
  const heroTop = n.jsxs('div', { style: { display: 'flex', alignItems: 'flex-start', gap: '1.6cqw' }, children: [
    n.jsxs('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1.4cqh' }, children: [
      n.jsx('div', { style: st.big, children: outT != null ? outT + '\u00B0' : '\u2014' }),
      n.jsxs('div', { style: st.pill, children: [
        wxIco(heroKey, '2.5cqh', { height: '2.5cqh', filter: 'brightness(1.2) saturate(1.1)' }),
        n.jsx('span', { children: cond || (isDay ? 'Partly cloudy' : 'Clear') })
      ] })
    ] }),
    n.jsxs('div', { style: { display: 'flex', flexDirection: 'column', gap: '.5cqh', paddingTop: '1.2cqh' }, children: [
      n.jsx('div', { style: Object.assign({ fontSize: '3cqh' }, st.amber), children: feels != null ? 'Feels like ' + feels + '\u00B0' : 'Feels like \u2014' }),
      n.jsx('div', { style: Object.assign({ fontSize: '2.7cqh', fontWeight: 600 }, st.mut), children: cond || '\u2014' })
    ] })
  ] });
  const sensorCols = n.jsxs('div', { style: { display: 'flex', gap: '1.4cqw', flexShrink: 0 }, children: [
    n.jsxs('div', { style: { display: 'flex', flexDirection: 'column', gap: '.4cqh' }, children: [
      n.jsx('div', { style: st.lbl, children: 'OUTDOOR' }),
      n.jsxs('div', { children: [
        n.jsx('div', { style: st.valB, children: outT != null ? outT + '\u00B0' : '\u2014' }),
        n.jsxs('div', { style: { display: 'flex', alignItems: 'center', gap: '.3cqw', marginTop: '.4cqh', whiteSpace: 'nowrap' }, children: [
          drip,
          n.jsx('span', { style: st.hum, children: outHr != null ? outHr + '%' : '\u2014' }),
          n.jsx('span', { style: Object.assign({ fontSize: '.82cqw' }, st.mut), children: 'humidity' })
        ] })
      ] })
    ] }),
    n.jsxs('div', { style: { display: 'flex', flexDirection: 'column', gap: '.4cqh' }, children: [
      n.jsxs('div', { style: Object.assign({}, st.lbl, { borderBottom: '1px solid #d9b06a', alignSelf: 'flex-start', paddingBottom: '2px', whiteSpace: 'nowrap' }), children: 'INDOOR' }),
      n.jsxs('div', { children: [
        n.jsx('div', { style: st.valB, children: inT != null ? inT + '\u00B0' : '\u2014' }),
        n.jsxs('div', { style: { display: 'flex', alignItems: 'center', gap: '.3cqw', marginTop: '.4cqh', whiteSpace: 'nowrap' }, children: [
          drip,
          n.jsx('span', { style: st.hum, children: inHr != null ? inHr + '%' : '\u2014' }),
          n.jsx('span', { style: Object.assign({ fontSize: '.82cqw' }, st.mut), children: 'humidity' })
        ] })
      ] })
    ] })
  ] });
  const windBlock = n.jsx('div', { style: { display: 'flex', gap: '1cqw', alignItems: 'center', whiteSpace: 'nowrap', alignSelf: 'flex-start', flexShrink: 0 }, children: [
    dial,
    n.jsxs('div', { style: { display: 'flex', flexDirection: 'column', gap: '.4cqh', alignItems: 'flex-start' }, children: [
      n.jsx('div', { style: st.lbl, children: 'WIND' }),
      n.jsx('div', { style: st.windTxt, children: (wDir || '\u2014') + ' ' + (wMph != null ? wMph : '\u2014') + ' mph' }),
      n.jsx('div', { style: st.windMut, children: gust != null ? 'Gusts ' + gust + ' mph' : 'Gusts \u2014' })
    ] })
  ] });
  const arcCol = n.jsxs('div', { style: { flex: '1 1 auto', display: 'flex', flexDirection: 'column', gap: '.8cqh', minWidth: 0, minHeight: 0 }, children: [
    n.jsxs('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: '.55cqw', alignItems: 'baseline' }, children: [
      n.jsx('div', { style: st.lbl, children: 'PRESSURE' }),
      n.jsx('span', { style: Object.assign({}, st.white, { fontSize: '2.7cqh', fontWeight: 800 }), children: pIn != null ? pIn.toFixed(2) : '\u2014' }),
      n.jsx('span', { style: Object.assign({}, st.dunit, { color: '#b9c8da' }), children: 'inHg' }),
      n.jsx('span', { style: { fontSize: '2cqh', fontWeight: 800, color: pTrend === 'falling' ? '#f87171' : (pTrend === 'rising' ? '#4ade80' : '#93a7c0') }, children: pTrend === 'falling' ? '\u2198 Falling' : (pTrend === 'rising' ? '\u2197 Rising' : '\u2192 Steady') })
    ] }),
    n.jsxs('div', { style: { display: 'flex', alignItems: 'flex-end', gap: '.5cqw', flex: '1 1 auto', minHeight: 0 }, children: [
      n.jsxs('div', { style: { flex: '1 1 auto', display: 'flex', flexDirection: 'column', alignSelf: 'stretch', justifyContent: 'flex-end', minWidth: 0 }, children: [
        n.jsx('svg', { viewBox: '0 0 220 100', preserveAspectRatio: 'none', style: { width: '100%', height: '9.5cqh', display: 'block' }, children: [
          n.jsx('line', { x1: 8, y1: 88, x2: 212, y2: 88, stroke: 'rgba(255,255,255,.26)', strokeWidth: 1.2 }),
          n.jsx('defs', { children: n.jsx('linearGradient', { id: 'wgArcG', x1: 0, y1: 0, x2: 1, y2: 0, children: [
            n.jsx('stop', { offset: '0%', stopColor: '#f7b733' }),
            n.jsx('stop', { offset: '50%', stopColor: '#ffe9a8' }),
            n.jsx('stop', { offset: '100%', stopColor: '#fb923c' })
          ] }) }),
          n.jsx('path', { d: 'M18 88 Q110 4 202 88', fill: 'none', stroke: 'url(#wgArcG)', strokeWidth: 3.2, strokeLinecap: 'round' }),
          sunT ? n.jsx('circle', { cx: sx, cy: sy, r: 7, fill: '#fff2c7', style: { filter: 'drop-shadow(0 0 6px rgba(255,220,130,.95))' } }) : null,
          n.jsx('circle', { cx: 18, cy: 88, r: 6, fill: '#ffe9a8', style: { filter: 'drop-shadow(0 0 5px rgba(255,220,130,.9))' } }),
          n.jsx('circle', { cx: 202, cy: 88, r: 6, fill: '#fb923c', style: { filter: 'drop-shadow(0 0 5px rgba(251,146,60,.9))' } })
        ] }),
        n.jsxs('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '.2cqh' }, children: [
          n.jsxs('div', { style: { textAlign: 'center', flex: 1, whiteSpace: 'nowrap' }, children: [
            n.jsx('div', { style: Object.assign({}, st.lblS, { fontSize: '.82cqw' }), children: 'SUNRISE' }),
            n.jsx('div', { style: Object.assign({ fontSize: '1.15cqw' }, st.white, { fontWeight: 700, whiteSpace: 'nowrap' }), children: d0 ? fmt12(d0.sunrise) : '\u2014' })
          ] }),
          n.jsxs('div', { style: { textAlign: 'center', flex: 1.4, whiteSpace: 'nowrap' }, children: [
            n.jsx('div', { style: Object.assign({}, st.lblS, { fontSize: '.82cqw' }), children: 'DAYLIGHT' }),
            n.jsx('div', { style: Object.assign({ fontSize: '1.05cqw' }, st.white, { fontWeight: 700, whiteSpace: 'nowrap' }), children: dayLen != null ? (Math.floor(dayLen / 60) + 'h ' + (dayLen % 60) + 'm') : '\u2014' })
          ] }),
          n.jsxs('div', { style: { textAlign: 'center', flex: 1, whiteSpace: 'nowrap' }, children: [
            n.jsx('div', { style: Object.assign({}, st.lblS, { fontSize: '.82cqw' }), children: 'SUNSET' }),
            n.jsx('div', { style: Object.assign({ fontSize: '1.15cqw' }, st.white, { fontWeight: 700, whiteSpace: 'nowrap' }), children: d0 ? fmt12(d0.sunset) : '\u2014' })
          ] })
        ] })
      ] }),
      n.jsxs('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.4cqh', flexShrink: 0, paddingBottom: '.6cqh', whiteSpace: 'nowrap' }, children: [
        n.jsx('div', { style: Object.assign({}, st.lblS, { fontSize: '.82cqw' }), children: 'NEXT 12H' }),
        wxIco(isDay ? 'partly-cloudy-night' : 'clear-night', '2.2cqh', { height: '2.2cqh', filter: 'brightness(1.4)' }),
        n.jsx('div', { style: { fontSize: '.75cqw', fontWeight: 700, color: '#eef3fa', whiteSpace: 'nowrap', letterSpacing: '-.02em' }, children: 'OPEN-METEO' })
      ] })
    ] })
  ] });
  const heroBottom = n.jsxs('div', { style: { display: 'flex', alignItems: 'flex-end', gap: '1.6cqw', minHeight: 0, flexShrink: 0 }, children: [
    n.jsxs('div', { style: { display: 'flex', flexDirection: 'column', gap: '1cqh', flexShrink: 0 }, children: [
      sensorCols,
      windBlock
    ] }),
    arcCol
  ] });
  // "Weather updated h:mm" chip — pinned to the hero card's upper-right corner
  // (replaces the old full-width footer row: indoor-sensor text removed per user).
  // NOTE: declared BEFORE heroCard, which mounts it (avoid a TDZ ReferenceError).
  const updChip = n.jsx('div', { style: { position: 'absolute', top: '1.5cqh', right: '1.9cqw', zIndex: 3, fontSize: '1.05cqw', fontWeight: 600, letterSpacing: '.02em', color: 'rgba(226,236,247,.8)', textShadow: '0 1px 3px rgba(9,18,34,.4)', whiteSpace: 'nowrap' }, children: 'Weather updated ' + (updTimeStr || '\u2014') });
  const heroCard = n.jsxs('div', { style: Object.assign({}, st.card, { flex: '1.02 1 0', overflow: 'hidden', minHeight: 0, display: 'flex', flexDirection: 'column' }), children: [
    n.jsx('div', { style: { position: 'absolute', inset: 0, zIndex: 1 }, children: skyKids }),
    n.jsxs('div', { style: { position: 'absolute', inset: 0, zIndex: 2, display: 'flex', flexDirection: 'column', padding: '1.5cqh 1.9cqw', minHeight: 0 }, children: [
      heroTop,
      n.jsx('div', { style: { flex: '1 1 auto', minHeight: 0 } }),
      heroBottom
    ] }),
    n.jsx('div', { style: { position: 'absolute', right: '1.9cqw', top: '7cqh', width: '20cqw', height: '14.8cqh', zIndex: 2, pointerEvents: 'none' }, children: wxScene }),
    updChip
  ] });
  // ---- radar card: animated RainViewer radar (rwRV) — base OSM tiles fill the card edge-to-edge,
  // bright HOME beacon dead-center on 2141 Wolf Ridge Ln, Mount Dora 32757 (28.817422,-81.620514),
  // zoom 11, animated past+nowcast frames ----
  const radarCard = n.jsxs('div', { style: { position: 'relative', flex: '0.98 1 0', display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0, borderRadius: '1.05cqw', boxShadow: '0 .5cqh 2.2cqh rgba(0,0,0,.4)' }, children: [
    n.jsx(rwRV, { config: { lat: 28.817422, lon: -81.620514, zoom: 11, label: 'WEATHER RADAR', ctl: !0 } })
  ] });
  // ---- 12-hour chart card ----
  const temps = hl.map(function (h2) { return h2.temp; }).filter(function (x) { return x != null; });
  const lo = temps.length ? Math.min.apply(null, temps) : 0;
  const hi = temps.length ? Math.max.apply(null, temps) : 1;
  const linePts = hl.map(function (h2, i) { if (h2.temp == null) return null; const y = 24 - ((h2.temp - lo) / ((hi - lo) || 1)) * 17; return { x: (i + .5) * 100, y: y, t: h2.temp }; }).filter(Boolean);
  const lineD = linePts.map(function (p, i) { return (i === 0 ? 'M' : 'L') + p.x.toFixed(1) + ' ' + p.y.toFixed(1); }).join(' ');
  const hourLbl = function (t) {
    const hh = Number((String(t).split('T')[1] || '').split(':')[0]);
    if (isNaN(hh)) return '\u2014';
    const h12 = hh % 12 === 0 ? 12 : hh % 12;
    return h12 + ' ' + (hh < 12 ? 'AM' : 'PM');
  };
  const row = function (kids2, style) { return n.jsx('div', { style: Object.assign({ display: 'flex', flex: '1 1 auto', minHeight: 0 }, style || {}), children: kids2 }); };
  const col12 = function (kids2, k2) {
    return n.jsx('div', { key: k2, style: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', minWidth: 0 }, children: kids2 });
  };
  const chartCard = n.jsxs('div', { style: Object.assign({}, st.card, { padding: '1.2cqh 1.5cqw .8cqh', flexShrink: 0 }), children: [
    n.jsxs('div', { style: { display: 'flex', alignItems: 'baseline', gap: '1cqw', marginBottom: '.8cqh' }, children: [
      n.jsx('div', { style: { fontSize: '2.7cqh', fontWeight: 800, color: '#eef3fa', letterSpacing: '.01em' }, children: 'NEXT 12 HOURS' }),
      n.jsx('div', { style: Object.assign({}, st.lblS, { fontSize: '1.15cqw' }), children: 'Temperature & rain' })
    ] }),
    row(hl.map(function (h2, i) { return col12([n.jsx('div', { key: 't', style: { fontSize: '2.3cqh', fontWeight: 800, color: '#f5b969' }, children: h2.temp != null ? h2.temp + '\u00B0' : '\u2014' })], 'tt' + i); })),
    row(n.jsx('svg', { viewBox: '0 0 1200 30', preserveAspectRatio: 'none', style: { width: '100%', height: '2.2cqh', display: 'block', padding: '0 .4cqw' }, children: [
      n.jsx('path', { d: lineD, fill: 'none', stroke: '#e8a44c', strokeWidth: 2.6, strokeLinejoin: 'round', strokeLinecap: 'round' }),
      linePts.map(function (p, i) { return n.jsx('circle', { cx: p.x, cy: p.y, r: 3, fill: '#e8a44c' }, 'dp' + i); })
    ] }), { height: '2.2cqh', flex: '0 0 auto' }),
    row(hl.map(function (h2, i) { return col12([wxIco(h2.key, '2.4cqh', { height: '2.4cqh', filter: 'grayscale(1) brightness(2.2)', opacity: .85 })], 'wi' + i); })),
    row(hl.map(function (h2, i) { return col12([n.jsx('div', { key: 'p', style: { fontSize: '1.8cqh', fontWeight: 700, color: '#4fc3c9' }, children: h2.p > 0 ? h2.p + '%' : '' })], 'pp' + i); })),
    n.jsx('div', { style: { display: 'flex', height: '3.8cqh', alignItems: 'flex-end', padding: '0 .4cqw' }, children: hl.map(function (h2, i) {
      return col12([n.jsx('div', { key: 'b', style: { width: '62%', height: Math.max(.35, h2.p / 100 * 3.4) + 'cqh', borderRadius: '.25cqh .25cqh .15cqh .15cqh', background: 'linear-gradient(180deg,#43b6b6,#2c8f96)' } }, 'bar'+i)], 'hb' + i);
    }) }),
    row(hl.map(function (h2, i) { return col12([n.jsx('div', { key: 'h', style: { fontSize: '2cqh', fontWeight: 800, color: '#dfe8f2', marginTop: '.5cqh', whiteSpace: 'nowrap' }, children: hourLbl(h2.time) })], 'hh' + i); }), { flex: '0 0 auto' }),
    n.jsxs('div', { style: { display: 'flex', gap: '1.6cqw', alignItems: 'center', marginTop: '.8cqh', flex: '0 0 auto' }, children: [
      n.jsx('div', { style: { width: '.9cqw', height: '.9cqw', borderRadius: '.2cqw', background: '#e8a44c' } }),
      n.jsx('span', { style: { fontSize: '1.05cqw', fontFamily: 'inherit', fontWeight: 600, color: '#93a7c0' }, children: 'Temperature \u00B0F' }),
      n.jsx('div', { style: { width: '.9cqw', height: '.9cqw', borderRadius: '.2cqw', background: '#43b6b6' } }),
      n.jsx('span', { style: { fontSize: '1.05cqw', fontWeight: 600, color: '#93a7c0' }, children: 'Rain chance %' })
    ] })
  ] });
  const alertBanner = a0 ? n.jsxs('div', { style: st.banner, children: [
    n.jsx('svg', { viewBox: '0 0 24 24', style: { width: '2.1cqw', height: '2.1cqw', flexShrink: 0 }, children: n.jsxs('g', { children: [
      n.jsx('path', { d: 'M12 2.6 23 21H1L12 2.6Z', fill: '#ffffff' }),
      n.jsx('rect', { x: 11, y: 9, width: 2, height: 6.4, rx: 1, fill: '#e05f68' }),
      n.jsx('rect', { x: 11, y: 16.8, width: 2, height: 2, rx: 1, fill: '#e05f68' })
    ] }) }),
    n.jsx('div', { style: { fontSize: '1.9cqw', fontWeight: 800, letterSpacing: '.06em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }, children: String(a0.event || 'WEATHER ALERT').toUpperCase() + (alerts.length > 1 ? ' +' + (alerts.length - 1) : '') }),
    n.jsx('div', { style: { flex: '1 1 auto' } }),
    n.jsx('div', { style: { fontSize: '1.35cqw', fontWeight: 600, whiteSpace: 'nowrap', opacity: .92 }, children: 'View details \u203A' })
  ] }) : null;
  // ---- root ----
  return n.jsxs('div', { className: ff, style: st.root, children: [
    n.jsx('style', { children: WG_CSS }),
    n.jsxs('div', { style: st.head, children: [
      n.jsx('div', { style: st.hCity, children: city }),
      n.jsx('div', { style: st.hTime, children: headerDate + ' \u00B7 ' + headerTime })
    ] }),
    alertBanner,
    n.jsxs('div', { style: { display: 'flex', gap: '1.1cqw', flex: '1 1 auto', minHeight: 0 }, children: [heroCard, radarCard] }),
    chartCard
  ] });
}

// rwRV — standalone RainViewer radar block (RainViewer public API animated over dark OSM base; resizable via block size)
// config keys: lat, lon, zoom (3-11, default 7), color (palette id), label, pause (1 = animate off; shows latest past frame), ctl (1 = +/- zoom buttons + two-finger pinch on the map; zoom persists per label in localStorage)
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
  const rvFrames = (rvData && rvData.radar) ? (rvData.radar.past || []).concat(rvData.radar.nowcast || []) : [];
  // rvXF v1 — crossfade + pingpong radar loop. Two stacked overlay layers: the outgoing frame
  // stays painted while the incoming one fades in over it ('opacity .48s linear'), every frame's
  // tiles are prefetched (rvPL), and the playhead ping-pongs (rvPP) with a short beat at the
  // newest frame instead of hard-wrapping from the future frame back to the oldest one.
  const rvPos = b.useRef(-1); const rvDir = b.useRef(1); const rvHold = b.useRef(0);
  const rvN = b.useRef(-1); const rvK = b.useRef(0); const rvPre = b.useRef([]);
  // start on the LATEST past frame (current radar) and rebuild the buffer when frames change
  b.useEffect(function () {
    if (!rvData || !rvData.radar) return;
    const np = (rvData.radar.past || []).length;
    const cur = np > 0 ? np - 1 : Math.max(0, rvFrames.length - 1);
    rvPos.current = cur; rvN.current = cur; rvK.current = 0; rvDir.current = 1; rvHold.current = 0;
    setBuf({ n: cur, o: cur, k: 0 });
  }, [rvData]);
  // rvPP — smooth pingpong playback: 620 ms/step, 480 ms crossfade, 2-beat hold at the newest frame
  b.useEffect(function () {
    if (!rvPlay || rvFrames.length < 2) return;
    const t = setInterval(function () {
      const L = rvFrames.length;
      if (rvHold.current > 0) { rvHold.current--; return; }
      let p = rvPos.current + rvDir.current;
      if (p >= L || p < 0) { rvDir.current = -rvDir.current; if (rvDir.current < 0) { rvHold.current = 2; p = rvPos.current; } else { p = rvPos.current + rvDir.current; } p = Math.max(0, Math.min(L - 1, p)); }
      if (p === rvPos.current) return;
      const prevN = rvN.current;
      rvPos.current = p; rvN.current = p; rvK.current = 1 - rvK.current;
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
  return n.jsxs('div', { className: 'h-full w-full flex flex-col overflow-hidden relative', style: { background: 'linear-gradient(180deg,#101c30 0%,#0a1526 100%)', borderRadius: 14, border: '1px solid rgba(255,255,255,.06)' }, children: [
    n.jsxs('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px 4px', flexShrink: 0 }, children: [
      n.jsx('div', { style: { fontSize: '11pt', fontWeight: 800, letterSpacing: '.08em', color: '#dbe4f0', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }, children: rvLabel }),
      n.jsxs('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }, children: [
        CTL ? n.jsx('button', { type: 'button', onClick: function () { rvSet(rvZoom - 1); }, style: { width: 24, height: 24, borderRadius: '999px', border: '1px solid rgba(255,255,255,.25)', background: 'rgba(255,255,255,.08)', color: '#e2e9f2', fontSize: 13, lineHeight: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, opacity: rvZoom <= 3 ? 0.35 : 1 }, children: '\u2212' }) : null,
        CTL ? n.jsx('button', { type: 'button', onClick: function () { rvSet(rvZoom + 1); }, style: { width: 24, height: 24, borderRadius: '999px', border: '1px solid rgba(255,255,255,.25)', background: 'rgba(255,255,255,.08)', color: '#e2e9f2', fontSize: 12, lineHeight: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, opacity: rvZoom >= 10 ? 0.35 : 1 }, children: '+' }) : null,
        n.jsx('button', { type: 'button', onClick: function () { setRvPlay(!rvPlay); }, style: { width: 22, height: 22, borderRadius: '999px', border: '1px solid rgba(255,255,255,.25)', background: 'rgba(255,255,255,.08)', color: '#e2e9f2', fontSize: 10, lineHeight: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }, children: rvPlay ? '\u23F8' : '\u25B6' }),
        n.jsx('span', { style: { fontSize: '9pt', color: '#93a7c0', fontWeight: 600 }, children: rvTimeStr || 'Loading\u2026' })
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


const RVSRC = "// rwRV — standalone RainViewer radar block (RainViewer public API animated over dark OSM base; resizable via block size)\n// config keys: lat, lon, zoom (3-11, default 7), color (palette id), label, pause (1 = animate off; shows latest past frame), ctl (1 = +/- zoom buttons + two-finger pinch on the map; zoom persists per label in localStorage)\nfunction rwRV(props) {\n  const a = (props && props.config) || {};\n  const lat = isFinite(Number(a.lat)) ? Number(a.lat) : 28.817422;\n  const lon = isFinite(Number(a.lon)) ? Number(a.lon) : -81.620514;\n  const NZ = Math.min(Math.max(Math.round(Number(a.zoom)) || 7, 3), 11);\n  const COLRV = (a.color !== '' && a.color != null && isFinite(Number(a.color))) ? Number(a.color) : 6;\n  const rvLabel = a.label || 'RAINVIEWER RADAR';\n  const PAUSE = (a.pause === true || Number(a.pause) === 1);\n  const CTL = (a.ctl === true || Number(a.ctl) === 1);\n  let rvZ0 = NZ;\n  if (CTL) { try { const lz = Math.round(Number(localStorage.getItem('rwRVz:' + rvLabel))); if (lz >= 3 && lz <= 11) rvZ0 = lz; } catch (e) {} }\n  const rvZ = b.useState(rvZ0); const rvZoom = rvZ[0];\n  const rvSet = function (z) { z = Math.min(Math.max(Math.round(Number(z)), 3), 11); if (CTL) { try { localStorage.setItem('rwRVz:' + rvLabel, String(z)); } catch (e) {} } rvZ[1](z); };\n  const rvPinch = b.useRef(null);\n  const pvStart = function (e) { if (!CTL || !e.touches || e.touches.length !== 2) return; const dx = e.touches[0].clientX - e.touches[1].clientX, dy = e.touches[0].clientY - e.touches[1].clientY; rvPinch.current = Math.sqrt(dx * dx + dy * dy); };\n  const pvMove = function (e) { if (!CTL || rvPinch.current == null || !e.touches || e.touches.length !== 2) return; const dx = e.touches[0].clientX - e.touches[1].clientX, dy = e.touches[0].clientY - e.touches[1].clientY; const d = Math.sqrt(dx * dx + dy * dy); const r = d / rvPinch.current; if (r > 1.35) { rvSet(rvZoom + 1); rvPinch.current = d; } else if (r < 0.74) { rvSet(rvZoom - 1); rvPinch.current = d; } };\n  const pvEnd = function () { rvPinch.current = null; };\n  const rvD = b.useState(null); const rvData = rvD[0]; const setRvData = rvD[1];\n  // rvBuffer: n = frame index painted on the front layer, o = on the back layer, k = which layer is front\n  const rvB = b.useState({ n: -1, o: -1, k: 0 }); const rvBuf = rvB[0]; const setBuf = rvB[1];\n  const rvP = b.useState(!PAUSE); const rvPlay = rvP[0]; const setRvPlay = rvP[1];\n  const rvM = b.useState({ w: 0, h: 0 }); const rvBox = rvM[0]; const setRvBox = rvM[1];\n  const rvRef = b.useRef(null);\n  b.useEffect(function () {\n    let dead = false;\n    const pull = function () { fetch('https://api.rainviewer.com/public/weather-maps.json').then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('http ' + r.status)); }).then(function (j) { if (!dead) setRvData(j); }).catch(function () { if (!dead) setRvData(null); }); };\n    pull(); const iv = setInterval(pull, 300000); return function () { dead = true; clearInterval(iv); };\n  }, []);\n  const rvFrames = (rvData && rvData.radar) ? (rvData.radar.past || []).concat(rvData.radar.nowcast || []) : [];\n  // rvXF v1 — crossfade + pingpong radar loop. Two stacked overlay layers: the outgoing frame\n  // stays painted while the incoming one fades in over it ('opacity .48s linear'), every frame's\n  // tiles are prefetched (rvPL), and the playhead ping-pongs (rvPP) with a short beat at the\n  // newest frame instead of hard-wrapping from the future frame back to the oldest one.\n  const rvPos = b.useRef(-1); const rvDir = b.useRef(1); const rvHold = b.useRef(0);\n  const rvN = b.useRef(-1); const rvK = b.useRef(0); const rvPre = b.useRef([]);\n  // start on the LATEST past frame (current radar) and rebuild the buffer when frames change\n  b.useEffect(function () {\n    if (!rvData || !rvData.radar) return;\n    const np = (rvData.radar.past || []).length;\n    const cur = np > 0 ? np - 1 : Math.max(0, rvFrames.length - 1);\n    rvPos.current = cur; rvN.current = cur; rvK.current = 0; rvDir.current = 1; rvHold.current = 0;\n    setBuf({ n: cur, o: cur, k: 0 });\n  }, [rvData]);\n  // rvPP — smooth pingpong playback: 620 ms/step, 480 ms crossfade, 2-beat hold at the newest frame\n  b.useEffect(function () {\n    if (!rvPlay || rvFrames.length < 2) return;\n    const t = setInterval(function () {\n      const L = rvFrames.length;\n      if (rvHold.current > 0) { rvHold.current--; return; }\n      let p = rvPos.current + rvDir.current;\n      if (p >= L || p < 0) { rvDir.current = -rvDir.current; if (rvDir.current < 0) { rvHold.current = 2; p = rvPos.current; } else { p = rvPos.current + rvDir.current; } p = Math.max(0, Math.min(L - 1, p)); }\n      if (p === rvPos.current) return;\n      const prevN = rvN.current;\n      rvPos.current = p; rvN.current = p; rvK.current = 1 - rvK.current;\n      setBuf({ n: p, o: prevN, k: rvK.current });\n    }, 620);\n    return function () { clearInterval(t); };\n  }, [rvPlay, rvData]);\n  b.useEffect(function () {\n    const el = rvRef.current; if (!el) return;\n    const upd = function () { setRvBox({ w: el.clientWidth || 0, h: el.clientHeight || 0 }); };\n    upd();\n    let ro = null;\n    try { ro = new ResizeObserver(upd); ro.observe(el); } catch (e) { window.addEventListener('resize', upd); }\n    return function () { if (ro) ro.disconnect(); else window.removeEventListener('resize', upd); };\n  }, []);\n  const rvFrame = (rvFrames.length > 0 && rvBuf.n >= 0) ? rvFrames[Math.min(rvBuf.n, rvFrames.length - 1)] : null;\n  const nT = Math.pow(2, rvZoom); const TS = 256;\n  const rfx = (lon + 180) / 360 * nT;\n  const rra = lat * Math.PI / 180;\n  const rfy = (1 - Math.log(Math.tan(rra) + 1 / Math.cos(rra)) / Math.PI) / 2 * nT;\n  const cpx = rfx * TS; const cpy = rfy * TS;\n  const halfW = rvBox.w / 2; const halfH = rvBox.h / 2;\n  // RainViewer tilecache caps radar tiles at zoom 7 -> overlay at OZ<=7, scaled up to match NZ\n  const OZ = Math.min(rvZoom, 7);\n  const OV = Math.pow(2, rvZoom - OZ);\n  const nTo = Math.pow(2, OZ);\n  const fxO = (lon + 180) / 360 * nTo;\n  const rraO = lat * Math.PI / 180;\n  const fyO = (1 - Math.log(Math.tan(rraO) + 1 / Math.cos(rraO)) / Math.PI) / 2 * nTo;\n  const cpxO = fxO * TS; const cpyO = fyO * TS;\n  // rvBS — supersampled base below zoom 10: draw OSM from BZ = rvZoom + SS (SS<=2, BZ capped at 10),\n  // each tile downscaled to btS = 256/2^SS screen px, so zooming out keeps street/lake/label detail\n  // density instead of flipping to sparse low-zoom rasters. sc = nT/nB maps base px -> screen px.\n  const SS = Math.min(2, Math.max(0, 10 - rvZoom));\n  const BZ = rvZoom + SS;\n  const nB = Math.pow(2, BZ);\n  const btS = TS * nT / nB;\n  const fxB = (lon + 180) / 360 * nB;\n  const fyB = (1 - Math.log(Math.tan(rra) + 1 / Math.cos(rra)) / Math.PI) / 2 * nB;\n  const cpxB = fxB * TS; const cpyB = fyB * TS;\n  const sc = nT / nB;\n  const b0x = rvBox.w ? Math.floor((cpxB - halfW / sc) / TS) : Math.floor(fxB) - 1;\n  const b0y = rvBox.h ? Math.floor((cpyB - halfH / sc) / TS) : Math.floor(fyB) - 1;\n  const bcX = rvBox.w ? Math.ceil(rvBox.w / btS) + 1 : 3;\n  const bcY = rvBox.h ? Math.ceil(rvBox.h / btS) + 1 : 3;\n  const baseTiles = [];\n  for (let X = 0; X < bcX; X++) { for (let Y = 0; Y < bcY; Y++) {\n    const tx = b0x + X, ty = b0y + Y;\n    if (ty < 0 || ty >= nB) continue;\n    baseTiles.push({ wx: ((tx % nB) + nB) % nB, y: ty, left: (tx * TS - cpxB) * sc + halfW, top: (ty * TS - cpyB) * sc + halfH, key: 'rvb' + BZ + '_' + tx + '_' + ty });\n  } }\n  const o0x2 = rvBox.w ? Math.floor((cpxO - halfW / OV) / TS) : Math.floor(fxO) - 1;\n  const o0y = rvBox.h ? Math.floor((cpyO - halfH / OV) / TS) : Math.floor(fyO) - 1;\n  const ocntX = rvBox.w ? Math.ceil(rvBox.w / TS / OV) + 1 : 3;\n  const ocntY = rvBox.h ? Math.ceil(rvBox.h / TS / OV) + 1 : 3;\n  const rvTiles = [];\n  for (let X = 0; X < ocntX; X++) { for (let Y = 0; Y < ocntY; Y++) {\n    const tx = o0x2 + X, ty = o0y + Y;\n    if (ty < 0 || ty >= nTo) continue;\n    rvTiles.push({ wx: ((tx % nTo) + nTo) % nTo, y: ty, tx: tx, key: 'rvt' + tx + '_' + ty });\n  } }\n  // rvPL — prefetch every overlay tile of every frame once, so crossfades never wait on the network\n  b.useEffect(function () {\n    if (!rvData || !rvData.host || rvBox.w < 2 || rvTiles.length === 0 || rvFrames.length === 0) return;\n    const ims = [];\n    for (let F = 0; F < rvFrames.length; F++) {\n      const f = rvFrames[F]; if (!f || !f.path) continue;\n      for (let T = 0; T < rvTiles.length; T++) { const t = rvTiles[T]; try { const im = new Image(); im.src = rvData.host + f.path + '/' + TS + '/' + OZ + '/' + t.wx + '/' + t.y + '/' + COLRV + '/1_1.png'; ims.push(im); } catch (e) {} }\n    }\n    rvPre.current = ims;\n  }, [rvData, rvZoom, rvBox.w, rvBox.h]);\n  const rvTime = rvFrame ? new Date(rvFrame.time * 1000) : null;\n  const rvTimeStr = rvTime ? (((rvTime.getHours() % 12) === 0 ? 12 : rvTime.getHours() % 12) + ':' + (rvTime.getMinutes() < 10 ? '0' : '') + rvTime.getMinutes() + (rvTime.getHours() < 12 ? ' AM' : ' PM')) : '';\n  return n.jsxs('div', { className: 'h-full w-full flex flex-col overflow-hidden relative', style: { background: 'linear-gradient(180deg,#101c30 0%,#0a1526 100%)', borderRadius: 14, border: '1px solid rgba(255,255,255,.06)' }, children: [\n    n.jsxs('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px 4px', flexShrink: 0 }, children: [\n      n.jsx('div', { style: { fontSize: '11pt', fontWeight: 800, letterSpacing: '.08em', color: '#dbe4f0', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }, children: rvLabel }),\n      n.jsxs('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }, children: [\n        CTL ? n.jsx('button', { type: 'button', onClick: function () { rvSet(rvZoom - 1); }, style: { width: 24, height: 24, borderRadius: '999px', border: '1px solid rgba(255,255,255,.25)', background: 'rgba(255,255,255,.08)', color: '#e2e9f2', fontSize: 13, lineHeight: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, opacity: rvZoom <= 3 ? 0.35 : 1 }, children: '\\u2212' }) : null,\n        CTL ? n.jsx('button', { type: 'button', onClick: function () { rvSet(rvZoom + 1); }, style: { width: 24, height: 24, borderRadius: '999px', border: '1px solid rgba(255,255,255,.25)', background: 'rgba(255,255,255,.08)', color: '#e2e9f2', fontSize: 12, lineHeight: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, opacity: rvZoom >= 10 ? 0.35 : 1 }, children: '+' }) : null,\n        n.jsx('button', { type: 'button', onClick: function () { setRvPlay(!rvPlay); }, style: { width: 22, height: 22, borderRadius: '999px', border: '1px solid rgba(255,255,255,.25)', background: 'rgba(255,255,255,.08)', color: '#e2e9f2', fontSize: 10, lineHeight: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }, children: rvPlay ? '\\u23F8' : '\\u25B6' }),\n        n.jsx('span', { style: { fontSize: '9pt', color: '#93a7c0', fontWeight: 600 }, children: rvTimeStr || 'Loading\\u2026' })\n      ] })\n    ] }),\n    n.jsx('div', { ref: rvRef, onTouchStart: pvStart, onTouchMove: pvMove, onTouchEnd: pvEnd, onTouchCancel: pvEnd, style: { position: 'relative', flex: '1 1 auto', minHeight: 0, overflow: 'hidden', touchAction: CTL ? 'none' : undefined }, children: rvBox.w ? n.jsxs('div', { style: { position: 'absolute', left: 0, top: 0 }, children: [\n      baseTiles.map(function (t) {\n        return n.jsx('div', { style: { position: 'absolute', left: t.left + 'px', top: t.top + 'px', width: btS + 'px', height: btS + 'px', backgroundImage: 'url(https://tile.openstreetmap.org/' + BZ + '/' + t.wx + '/' + t.y + '.png)', backgroundSize: btS + 'px ' + btS + 'px', display: 'block', filter: 'invert(.88) hue-rotate(175deg) brightness(.85) saturate(.35)' } }, t.key);\n      }),\n      // rvXF — two stacked radar layers: the incoming frame stays blended over the outgoing one.\n      // GEOMETRY (rvXF wrapper): rain tiles live at zoom OZ (<=7, API cap) but the panel shows NZ,\n      // so each layer wraps its tile grid in a scale(OV) wrapper pinned at (halfW - cpxO*OV,\n      // halfH - cpyO*OV) with transformOrigin '0 0' — without it tiles land at raw zoom-7 px\n      // coords (~9000px) far outside the panel and only the map shows.\n      [0, 1].map(function (K) {\n        const fi = rvBuf.k === K ? rvBuf.n : rvBuf.o;\n        const f = (fi >= 0 && rvFrames.length > 0) ? rvFrames[Math.min(fi, rvFrames.length - 1)] : null;\n        return n.jsxs('div', { style: { position: 'absolute', left: 0, top: 0, opacity: rvBuf.k === K ? 1 : 0, transition: 'opacity .48s linear', pointerEvents: 'none' }, children: [n.jsxs('div', { style: { position: 'absolute', left: (halfW - cpxO * OV) + 'px', top: (halfH - cpyO * OV) + 'px', transform: 'scale(' + OV + ')', transformOrigin: '0 0', width: '1px', height: '1px' }, children: [rvTiles.map(function (t) {\n          return n.jsxs('div', { style: { position: 'absolute', left: t.tx * TS + 'px', top: t.y * TS + 'px', width: TS + 'px', height: TS + 'px' }, children: [\n            (f && rvData && rvData.host) ? n.jsx('div', { style: { position: 'absolute', left: 0, top: 0, width: TS + 'px', height: TS + 'px', backgroundImage: 'url(' + rvData.host + f.path + '/' + TS + '/' + OZ + '/' + t.wx + '/' + t.y + '/' + COLRV + '/1_1.png)', backgroundSize: '256px 256px', pointerEvents: 'none' } }, 'fr' + fi + 'L' + K) : null\n          ] }, t.key + 'L' + K);\n        })] })] }, 'rvLy' + K);\n      }),\n      // rwHome — bright beacon at the map center = 2141 Wolf Ridge Ln, Mount Dora (home address).\n      // Magenta pops against NEXRAD green/yellow radar colors AND the dark base; white core pins\n      // the exact point; pulsing halo makes it unmissable on the dim kiosk at glance distance.\n      // IMPORTANT: anchor uses halfW/halfH px — % offsets resolve against the 0x0 offset container\n      // (base tiles are centered the same way), so '50%' here would land at the panel's top-left.\n      n.jsxs('div', { style: { position: 'absolute', left: halfW + 'px', top: halfH + 'px', width: 0, height: 0, pointerEvents: 'none' }, children: [\n        n.jsx('style', { children: '@keyframes rwPulse{0%{transform:scale(.5);opacity:.9}75%{opacity:.18}100%{transform:scale(2.3);opacity:0}}' }),\n        n.jsx('span', { style: { position: 'absolute', left: -27, top: -27, width: 54, height: 54, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,43,214,.5) 0%, rgba(255,43,214,.16) 48%, rgba(255,43,214,0) 72%)', animation: 'rwPulse 1.7s ease-out infinite' } }),\n        n.jsx('span', { style: { position: 'absolute', left: -11, top: -11, width: 22, height: 22, borderRadius: '50%', border: '2px solid #ff2bd6', background: 'rgba(255,43,214,.22)', boxShadow: '0 0 8px 2px rgba(255,43,214,.65), 0 0 18px 6px rgba(255,43,214,.3)', boxSizing: 'border-box' } }),\n        n.jsx('span', { style: { position: 'absolute', left: -4, top: -4, width: 8, height: 8, borderRadius: '50%', background: '#fff', boxShadow: '0 0 6px 2px rgba(255,255,255,.9), 0 0 14px 4px rgba(255,43,214,.55), 0 1px 2px rgba(0,0,0,.9)' } }),\n        n.jsx('span', { style: { position: 'absolute', left: 14, top: 10, fontSize: 8, fontWeight: 800, letterSpacing: '.12em', color: '#fff', background: 'rgba(10,8,18,.72)', border: '1px solid rgba(255,43,214,.65)', borderRadius: 6, padding: '1px 5px', boxShadow: '0 1px 3px rgba(0,0,0,.8)', whiteSpace: 'nowrap' }, children: 'HOME' })\n      ] })\n    ] }) : null }),\n    n.jsx('div', { style: { padding: '3px 12px 6px', fontSize: '7.5pt', color: 'rgba(147,167,192,.65)', textAlign: 'right', flexShrink: 0 }, children: '\\u00A9 OpenStreetMap \\u00B7 RainViewer' })\n  ] });\n}\n\n";
console.log("PARSE_OK", typeof wxGUI, typeof rwRV);
try { const r = wxGUI({config:{zip:"32757",city:"Mount Dora",outdoorChannel:"A",indoorChannel:"B"}}); const s = JSON.stringify(r);console.log("RENDER_OK len=" + s.length);console.log("chip_in_tree=" + s.includes("Weather updated "));console.log("indoor_absent=" + !s.includes("Indoor sensor"));console.log("rv_cfg: " + ((s.indexOf('"zoom":11') >= 0 && s.indexOf("28.817422") >= 0 && s.indexOf("-81.620514") >= 0 && s.indexOf("WEATHER RADAR") >= 0 && s.indexOf('"ctl":true') >= 0) ? "OK" : "MISSING"));console.log("scene: " + (s.includes("wgXScene") ? "OK" : "MISSING"));console.log("scene_kfx: " + ((s.includes("wgXDrift") && s.includes("wgXFall")) ? "OK" : "MISSING"));console.log("wgsrc: " + (s.includes("OPEN-METEO") ? "OK" : "MISSING"));console.log("oldmap_gone: " + (!(s.includes("magnify") || s.includes("center:!0") || s.includes("center: !0")) ? "OK" : "STILL_PRESENT"));const rvc = JSON.stringify(rwRV({config:{lat:28.817422,lon:-81.620514,zoom:10,label:"WEATHER RADAR",ctl:true}}));console.log("rv_ctl: " + ((rvc.includes("touchAction\":\"none") && rvc.includes("\u2212") && RVSRC.includes("onTouchStart") && RVSRC.includes("pvMove") && RVSRC.includes("rwRVz:") && RVSRC.includes("rvSet")) ? "OK" : "MISSING"));const rvp = JSON.stringify(rwRV({config:{lat:28.8,lon:-81.6,zoom:7,label:"PLAIN"}}));console.log("rv_xf: " + ((RVSRC.includes("opacity .48s linear") && RVSRC.indexOf("rvPP") >= 0 && RVSRC.indexOf("rvPL") >= 0 && !RVSRC.includes("setRvFr") && !/[^A-Za-z]rvFr[^A-Za-z]/.test(RVSRC)) ? "OK" : "MISSING"));console.log("rv_ov: " + ((RVSRC.indexOf("halfW - cpxO * OV") >= 0 && RVSRC.indexOf("transformOrigin") >= 0 && RVSRC.indexOf("scale(") >= 0) ? "OK" : "MISSING"));console.log("rv_bs: " + ((RVSRC.indexOf("const SS = Math.min(2") >= 0 && RVSRC.indexOf("const BZ = rvZoom + SS") >= 0 && RVSRC.indexOf("+ BZ +") >= 0 && RVSRC.indexOf("+ btS +") >= 0) ? "OK" : "MISSING"));console.log("rv_ctl_off: " + ((!rvp.includes("touchAction\":\"none") && !rvp.includes("\u2212")) ? "OK" : "LEAKED")); }catch(e){ console.log("RENDER_FAIL " + e.constructor.name + ": " + e.message); }
