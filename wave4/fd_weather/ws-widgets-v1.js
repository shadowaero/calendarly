function wsTile({ config: c, kind }) {
  const cfg = c || {};
  const zip = cfg.zip || '32757';
  const outCh = String(cfg.outdoorChannel || 'A');
  const inCh = String(cfg.indoorChannel || 'B');
  const wxR = b.useState(null); const wx = wxR[0]; const setWx = wxR[1];
  const snR = b.useState(null); const sn = snR[0]; const setSn = snR[1];
  const alR = b.useState(null); const al = alR[0]; const setAl = alR[1];
  const tkR = b.useState(new Date()); const tk = tkR[0]; const setTk = tkR[1];
  const needWx = ['current','baro','wind','solar','clock'].indexOf(kind) >= 0;
  const needSn = ['outdoor','indoor','today'].indexOf(kind) >= 0;
  b.useEffect(function () {
    if (!needWx) return;
    let dead = false;
    const pull = function () { fetch('/api/weather?zip=' + encodeURIComponent(zip) + '&units=fahrenheit&days=2').then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('http ' + r.status)); }).then(function (j) { if (!dead) setWx(j); }).catch(function () {}); };
    pull();
    const t = setInterval(pull, 900000);
    return function () { dead = true; clearInterval(t); };
  }, [zip]);
  b.useEffect(function () {
    if (!needSn) return;
    let dead = false;
    const pull = function () { fetch('/api/sensors').then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('http ' + r.status)); }).then(function (j) { if (!dead) setSn(j || { sensors: [] }); }).catch(function () {}); };
    pull();
    const t = setInterval(pull, 60000);
    return function () { dead = true; clearInterval(t); };
  }, []);
  b.useEffect(function () {
    if (kind !== 'alerts') return;
    let dead = false;
    const pull = function () { fetch('/api/weather/alerts?zip=' + encodeURIComponent(zip)).then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('http ' + r.status)); }).then(function (j) { if (!dead) setAl(j || { alerts: [] }); }).catch(function () {}); };
    pull();
    const t = setInterval(pull, 600000);
    return function () { dead = true; clearInterval(t); };
  }, [zip]);
  b.useEffect(function () {
    if (kind !== 'clock') return;
    const t = setInterval(function () { setTk(new Date()); }, 1000);
    return function () { clearInterval(t); };
  }, []);
  const DIRS = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  const fOf = function (cv) { return Math.round(Number(cv) * 9 / 5 + 32); };
  const inHg = function (hpa) { return hpa == null ? null : (Number(hpa) * 0.0295208); };
  const fmt12 = function (t) {
    if (!t) return '—';
    const hm = (String(t).split('T')[1] || '').split(':');
    if (hm.length < 2) return '—';
    let H = Number(hm[0]); const am = H < 12 ? 'am' : 'pm';
    H = H % 12; if (H === 0) H = 12;
    return H + ':' + hm[1] + ' ' + am;
  };
  const cur = (wx && wx.current) || {};
  const daily0 = (wx && wx.daily && wx.daily[0]) || null;
  const pr = (wx && wx.pressure) || null;
  const list = (sn && sn.sensors) || [];
  const pick = function (ch) {
    const hit = list.filter(function (s) { return ((s.channel || '') + '').toUpperCase() === ch.toUpperCase(); });
    if (hit.length) return hit[0];
    if (list.length === 1 && !list[0].channel) return list[0];
    return null;
  };
  const outS = pick(outCh); const inS = pick(inCh);
  const alerts = (al && al.alerts) || [];
  const top = alerts[0] || null;
  const st = {
    box: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.7cqh', background: 'rgba(15,23,42,0.72)', border: '1px solid rgba(51,65,85,0.55)', borderRadius: '0.7cqh', boxShadow: 'inset 0 0 14px rgba(2,6,23,0.4)', minWidth: 0, overflow: 'hidden', padding: '0.5cqh 0.6cqw' },
    lbl: { fontSize: 'clamp(9px,1.55cqh,16px)', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', fontWeight: 700, opacity: 0.85, textAlign: 'center' },
    big: { fontSize: 'clamp(16px,6.4cqh,60px)', fontWeight: 800, color: '#e2e8f0', lineHeight: 1, textAlign: 'center', whiteSpace: 'nowrap' },
    med: { fontSize: 'clamp(12px,3.1cqh,28px)', fontWeight: 700, color: '#cbd5e1', lineHeight: 1.05, textAlign: 'center' },
    small: { fontSize: 'clamp(9px,1.6cqh,16px)', color: '#94a3b8', textAlign: 'center', lineHeight: 1.25 },
    chip: { fontSize: 'clamp(8px,1.35cqh,13px)', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
    icon: { fontSize: 'clamp(22px,8.5cqh,76px)', lineHeight: 1 }
  };
  const sensorTile = function (title, s, ch) {
    return [
      n.jsx('div', { style: st.lbl, children: title }),
      n.jsx('div', { style: st.big, children: s && s.tempC != null ? fOf(s.tempC) + '°' : '—' }),
      n.jsx('div', { style: st.med, children: s && s.humidity != null ? Math.round(s.humidity) + '%' : (s ? '—' : 'no ch ' + ch) }),
      n.jsx('div', { style: st.chip, children: s && s.minC != null ? '24h ' + fOf(s.minC) + '°/' + fOf(s.maxC) + '°' : '' }),
      n.jsx('div', { style: st.chip, children: s ? (s.battery ? '🔋 OK' : '🔋 Low') + ' · ' + (s.ageSec < 120 ? s.ageSec + 's ago' : Math.round(s.ageSec / 60) + 'm ago') : '' })
    ];
  };
  let kids = null;
  if (kind === 'current') {
    const cd = (cur.condition && cur.condition.icon) || '🌡️';
    const lab = (cur.condition && cur.condition.label) || '';
    kids = [
      n.jsx('div', { style: st.icon, children: cd }),
      n.jsx('div', { style: Object.assign({}, st.big, { fontSize: 'clamp(24px,9cqh,96px)' }), children: cur.temp != null ? Math.round(cur.temp) + '°' : '—' }),
      n.jsx('div', { style: st.med, children: lab }),
      n.jsx('div', { style: st.small, children: (cur.apparent != null ? 'Feels like ' + cur.apparent + '°' : '') + (cur.humidity != null ? (cur.apparent != null ? ' · ' : '') + 'Humidity ' + Math.round(cur.humidity) + '%' : '') })
    ];
  } else if (kind === 'baro') {
    kids = [
      n.jsx('div', { style: st.lbl, children: 'Barometer' }),
      n.jsx('div', { style: st.big, children: pr && pr.hpa != null ? inHg(pr.hpa).toFixed(2) : '—' }),
      n.jsx('div', { style: st.small, children: pr && pr.delta3h != null ? (pr.trend === 'rising' ? '▲ Rising' : pr.trend === 'falling' ? '▼ Falling' : '→ Steady') + ' (' + (pr.delta3h > 0 ? '+' : '') + pr.delta3h + ' hPa/3h)' : 'Collecting data…' }),
      n.jsx('div', { style: st.chip, children: pr && pr.high24 != null ? '24h ' + inHg(pr.high24).toFixed(2) + '–' + inHg(pr.low24).toFixed(2) + ' inHg' : '' })
    ];
  } else if (kind === 'wind') {
    kids = [
      n.jsx('div', { style: st.lbl, children: 'Wind' }),
      n.jsx('div', { style: st.big, children: cur.wind != null ? Math.round(cur.wind) + ' mph' : '—' }),
      n.jsx('div', { style: Object.assign({}, st.med, { color: '#93c5fd' }), children: cur.wind_dir == null ? '—' : DIRS[Math.round(cur.wind_dir / 22.5) % 16] }),
      n.jsx('div', { style: st.chip, children: cur.wind_dir == null ? '' : 'from ' + Math.round(cur.wind_dir) + '°' + (cur.wind_gusts != null ? ' · gusts ' + Math.round(cur.wind_gusts) + ' mph' : '') })
    ];
  } else if (kind === 'solar') {
    kids = [
      n.jsx('div', { style: st.lbl, children: 'Solar & UV' }),
      n.jsx('div', { style: st.big, children: cur.shortwave_radiation != null ? Math.round(cur.shortwave_radiation) : '—' }),
      n.jsx('div', { style: st.small, children: cur.shortwave_radiation != null ? 'W/m² solar radiation' : 'No data yet' }),
      n.jsx('div', { style: Object.assign({}, st.med, { color: '#fbbf24' }), children: cur.uv_index != null ? 'UV ' + Number(cur.uv_index).toFixed(1) : 'UV —' }),
      n.jsx('div', { style: st.chip, children: daily0 && daily0.uvMax != null ? 'Max today ' + Number(daily0.uvMax).toFixed(1) : '' })
    ];
  } else if (kind === 'outdoor') {
    kids = sensorTile('Outdoor', outS, outCh);
  } else if (kind === 'indoor') {
    kids = sensorTile('Indoor', inS, inCh);
  } else if (kind === 'today') {
    kids = [
      n.jsx('div', { style: st.lbl, children: 'Today' }),
      n.jsx('div', { style: st.med, children: outS && outS.minC != null ? fOf(outS.minC) + ' / ' + fOf(outS.maxC) : '—' }),
      n.jsx('div', { style: st.small, children: outS ? 'Outdoor 24h low / high' : 'Awaiting sensor data' }),
      n.jsx('div', { style: st.chip, children: list.length ? list.length + ' sensor' + (list.length === 1 ? '' : 's') + ' reporting' : 'rtl_433 not feeding yet' })
    ];
  } else if (kind === 'clock') {
    kids = [
      n.jsx('div', { style: Object.assign({}, st.big, { fontSize: 'clamp(22px,9.5cqh,92px)' }), children: tk.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: cfg.showSeconds === false ? undefined : '2-digit' }) }),
      n.jsx('div', { style: st.med, children: tk.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }) }),
      n.jsx('div', { style: Object.assign({}, st.chip, { fontSize: 'clamp(11px,2.2cqh,20px)', color: '#93c5fd' }), children: '↑ ' + fmt12(daily0 && daily0.sunrise) + '   ↓ ' + fmt12(daily0 && daily0.sunset) })
    ];
  } else if (kind === 'alerts') {
    kids = top ? [
      n.jsx('span', { style: { fontSize: 'clamp(14px,3.2cqh,30px)' }, children: '⚠️' }),
      n.jsx('span', { style: { fontSize: 'clamp(10px,2cqh,20px)', fontWeight: 800, color: '#fecaca', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }, children: (top.event || 'ALERT') + ' · ' + (top.headline || '') })
    ] : [
      n.jsx('span', { style: { fontSize: 'clamp(11px,2.4cqh,24px)', fontWeight: 800, color: '#86efac', textAlign: 'center' }, children: 'No active alerts' }),
      n.jsx('span', { style: st.chip, children: 'Checking NWS every 10 min' })
    ];
  } else {
    kids = [n.jsx('div', { style: st.small, children: 'ws widget: ' + kind })];
  }
  const boxStyle = (kind === 'alerts' && top) ? Object.assign({}, st.box, { flexDirection: 'row', background: 'rgba(127,29,29,0.85)', border: '1px solid rgba(252,165,165,0.5)' }) : st.box;
  return n.jsxs('div', { style: boxStyle, children: kids });
}
