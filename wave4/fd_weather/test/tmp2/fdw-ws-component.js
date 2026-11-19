function wsWS({ config: c, fontFamilyClass: k }) {
  const cfg = c || {};
  const zip = cfg.zip || '32757';
  const outCh = String(cfg.outdoorChannel || 'A');
  const inCh = String(cfg.indoorChannel || 'B');

  const wxR = b.useState(null); const wx = wxR[0]; const setWx = wxR[1];
  const snR = b.useState({ sensors: [] }); const sn = snR[0]; const setSn = snR[1];
  const alR = b.useState({ alerts: [] }); const al = alR[0]; const setAl = alR[1];
  const tkR = b.useState(new Date()); const tk = tkR[0]; const setTk = tkR[1];

  b.useEffect(() => {
    let dead = false;
    const pull = () => { fetch('/api/weather?zip=' + encodeURIComponent(zip) + '&units=fahrenheit&days=2').then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('http ' + r.status)); }).then(function (j) { if (!dead) setWx(j); }).catch(function () {}); };
    pull();
    const t = setInterval(pull, 900000);
    return function () { dead = true; clearInterval(t); };
  }, [zip]);

  b.useEffect(() => {
    let dead = false;
    const pull = () => { fetch('/api/sensors').then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('http ' + r.status)); }).then(function (j) { if (!dead) setSn(j || { sensors: [] }); }).catch(function () {}); };
    pull();
    const t = setInterval(pull, 60000);
    return function () { dead = true; clearInterval(t); };
  }, []);

  b.useEffect(() => {
    let dead = false;
    const pull = () => { fetch('/api/weather/alerts?zip=' + encodeURIComponent(zip)).then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('http ' + r.status)); }).then(function (j) { if (!dead) setAl(j || { alerts: [] }); }).catch(function () {}); };
    pull();
    const t = setInterval(pull, 600000);
    return function () { dead = true; clearInterval(t); };
  }, [zip]);

  b.useEffect(() => {
    const t = setInterval(function () { setTk(new Date()); }, 1000);
    return function () { clearInterval(t); };
  }, []);

  const ICONS = {
    d: { day: '☀️', night: '🌙', label: 'Sunny' },
    m: { day: '🌤️', night: '🌙', label: 'Mostly Sunny' },
    pc: { day: '⛅', night: '☁️', label: 'Partly Cloudy' },
    cl: { day: '☁️', night: '☁️', label: 'Cloudy' },
    fg: { day: '🌫️', night: '🌫️', label: 'Fog' },
    dr: { day: '🌦️', night: '🌧️', label: 'Drizzle' },
    ra: { day: '🌧️', night: '🌧️', label: 'Rain' },
    sh: { day: '🌦️', night: '🌧️', label: 'Showers' },
    sn: { day: '❄️', night: '❄️', label: 'Snow' },
    ts: { day: '⛈️', night: '⛈️', label: 'Thunderstorms' }
  };
  const condFromCode = (code) => {
    if (code === 0) return ICONS.d;
    if (code === 1) return ICONS.m;
    if (code === 2) return ICONS.pc;
    if (code === 3) return ICONS.cl;
    if (code === 45 || code === 48) return ICONS.fg;
    if (code >= 51 && code <= 57) return ICONS.dr;
    if (code >= 61 && code <= 65) return ICONS.ra;
    if (code >= 66 && code <= 67) return ICONS.ra;
    if (code >= 71 && code <= 77) return ICONS.sn;
    if (code >= 80 && code <= 82) return ICONS.sh;
    if (code >= 85 && code <= 86) return ICONS.sn;
    if (code >= 95) return ICONS.ts;
    return ICONS.pc;
  };
  const DIRS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const fOf = (cv) => Math.round(Number(cv) * 9 / 5 + 32);
  const tf = (cv) => cv == null ? '—' : fOf(cv) + '°';
  const inHg = (hpa) => hpa == null ? null : (Number(hpa) * 0.0295208);
  const fmt12 = (t) => {
    if (!t) return '—';
    const hm = (String(t).split('T')[1] || '').split(':');
    if (hm.length < 2) return '—';
    let H = Number(hm[0]); let am = H < 12 ? 'am' : 'pm';
    H = H % 12; if (H === 0) H = 12;
    return H + ':' + hm[1] + ' ' + am;
  };
  const clamp = (v, a, lo) => v < lo ? lo : (v > a ? a : v);
  const cur = (wx && wx.current) || {};
  const daily0 = (wx && wx.daily && wx.daily[0]) || null;
  const pr = (wx && wx.pressure) || null;
  const alerts = (al && al.alerts) || [];
  const top = alerts[0] || null;

  const list = (sn && sn.sensors) || [];
  const pick = (ch) => {
    const hit = list.filter(function (s) { return ((s.channel || '') + '').toUpperCase() === ch.toUpperCase(); });
    if (hit.length) return hit[0];
    if (list.length === 1 && !list[0].channel) return list[0];
    return null;
  };
  const outS = pick(outCh);
  const inS = pick(inCh);

  const cd = condFromCode(cur.code);
  let bigIcon = cur.is_day === 0 ? cd.night : cd.day;
  let bigLabel = cur.is_day === 0 ? 'Night · ' + cd.label : cd.label;
  if (top) {
    const ev = (top.event || '');
    if (/Tornado/i.test(ev)) { bigIcon = '🌪️'; bigLabel = ev; }
    else if (/Hurricane/i.test(ev)) { bigIcon = '🌀'; bigLabel = ev; }
    else if (/Tropical/i.test(ev)) { bigIcon = '🌀'; bigLabel = ev; }
    else if (/Thunderstorm/i.test(ev)) { bigIcon = '⛈️'; bigLabel = ev; }
    else if (/Winter|Snow|Freeze/i.test(ev)) { bigIcon = '❄️'; bigLabel = ev; }
    else if (/Flood/i.test(ev)) { bigIcon = '🌊'; bigLabel = ev; }
  }

  const st = {
    container: { height: '100%', width: '100%', containerType: 'size' },
    grid: { display: 'grid', height: '100%', width: '100%', gap: '1.1cqh', gridTemplateColumns: 'repeat(3,1fr)', gridTemplateRows: top ? 'auto minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)' : 'repeat(3,1fr)' },
    tile: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.4cqh', background: 'rgba(15,23,42,0.72)', border: '1px solid rgba(51,65,85,0.55)', borderRadius: '1.1cqh', boxShadow: 'inset 0 0 24px rgba(2,6,23,0.55)', minWidth: 0, overflow: 'hidden' },
    lbl: { fontSize: 'clamp(9px,1.55cqh,16px)', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', fontWeight: 700, opacity: 0.85, textAlign: 'center' },
    big: { fontSize: 'clamp(18px,6.8cqh,64px)', fontWeight: 800, color: '#e2e8f0', lineHeight: 1, textAlign: 'center', whiteSpace: 'nowrap' },
    med: { fontSize: 'clamp(13px,3.3cqh,30px)', fontWeight: 700, color: '#cbd5e1', lineHeight: 1.05, textAlign: 'center' },
    small: { fontSize: 'clamp(9px,1.6cqh,16px)', color: '#94a3b8', textAlign: 'center', lineHeight: 1.25 },
    chip: { fontSize: 'clamp(8px,1.35cqh,13px)', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
    icon: { fontSize: 'clamp(24px,11cqh,96px)', lineHeight: 1 }
  };
  const span2 = { gridColumn: 'span 2' };

  const alertBar = top ? n.jsx('div', { style: Object.assign({}, st.tile, { background: 'rgba(127,29,29,0.85)', borderColor: 'rgba(252,165,165,0.5)', gridRow: 1, padding: '0.8cqh 1.2cqw', flexDirection: 'row', justifyContent: 'center', gap: '1.2cqw' }), children: [n.jsx('span', { style: { fontSize: 'clamp(12px,2.6cqh,24px)' }, children: '⚠️' }), n.jsx('span', { style: { fontSize: 'clamp(10px,1.8cqh,18px)', fontWeight: 800, color: '#fecaca', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }, children: (top.event || 'ALERT') + ' · ' + (top.headline || '') })] }) : null;

  const tCond = n.jsxs('div', { style: st.tile, children: [
    n.jsx('div', { style: Object.assign({}, st.icon), children: bigIcon }),
    n.jsx('div', { style: st.med, children: bigLabel }),
    n.jsx('div', { style: st.small, children: (cur.apparent != null ? 'Feels like ' + cur.apparent + '°' : '') + (cur.humidity != null ? (cur.apparent != null ? ' · ' : '') + 'Humidity ' + Math.round(cur.humidity) + '%' : '') })
  ] });

  const tBaro = n.jsxs('div', { style: st.tile, children: [
    n.jsx('div', { style: st.lbl, children: 'Barometer' }),
    n.jsx('div', { style: st.big, children: pr && pr.hpa != null ? inHg(pr.hpa).toFixed(2) : '—' }),
    n.jsx('div', { style: st.small, children: pr && pr.delta3h != null ? (pr.trend === 'rising' ? '▲ Rising' : pr.trend === 'falling' ? '▼ Falling' : '→ Steady') + ' (' + (pr.delta3h > 0 ? '+' : '') + pr.delta3h + ' hPa/3h)' : 'Collecting data…' }),
    n.jsx('div', { style: st.chip, children: pr && pr.high24 != null ? '24h ' + inHg(pr.high24).toFixed(2) + '–' + inHg(pr.low24).toFixed(2) + ' inHg' : '' }),
    n.jsx('div', { style: st.chip, children: daily0 ? 'Forecast: ' + daily0.condition.label : '' })
  ] });

  const tWind = n.jsxs('div', { style: st.tile, children: [
    n.jsx('div', { style: st.lbl, children: 'Wind' }),
    n.jsx('div', { style: st.big, children: cur.wind != null ? Math.round(cur.wind) + ' mph' : '—' }),
    n.jsx('div', { style: Object.assign({}, st.med, { color: '#93c5fd' }), children: cur.wind_dir == null ? '—' : DIRS[Math.round(cur.wind_dir / 22.5) % 16] }),
    n.jsx('div', { style: st.chip, children: cur.wind_dir == null ? '' : 'from ' + Math.round(cur.wind_dir) + '°' + (cur.wind_gusts != null ? ' · gusts ' + Math.round(cur.wind_gusts) + ' mph' : '') })
  ] });
  const sensorTile = (title, s, ch) => n.jsxs('div', { style: st.tile, children: [
    n.jsx('div', { style: st.lbl, children: title }),
    n.jsx('div', { style: st.big, children: s && s.tempC != null ? fOf(s.tempC) + '°' : '—' }),
    n.jsx('div', { style: st.med, children: s && s.humidity != null ? Math.round(s.humidity) + '%' : (s ? '—' : 'no ch ' + ch) }),
    n.jsx('div', { style: st.chip, children: s && s.minC != null ? '24h ' + fOf(s.minC) + '°/' + fOf(s.maxC) + '°' : '' }),
    n.jsx('div', { style: st.chip, children: s ? (s.battery ? '🔋 OK' : '🔋 Low') + ' · ' + (s.ageSec < 120 ? s.ageSec + 's ago' : Math.round(s.ageSec / 60) + 'm ago') : '' })
  ] });
  const tOut = sensorTile('Outdoor', outS, outCh);
  const tIn = sensorTile('Indoor', inS, inCh);

  const tSolar = n.jsxs('div', { style: st.tile, children: [
    n.jsx('div', { style: st.lbl, children: 'Solar & UV' }),
    n.jsx('div', { style: st.big, children: cur.shortwave_radiation != null ? Math.round(cur.shortwave_radiation) : '—' }),
    n.jsx('div', { style: st.small, children: cur.shortwave_radiation != null ? 'W/m² solar radiation' : 'No data yet' }),
    n.jsx('div', { style: Object.assign({}, st.med, { color: '#fbbf24' }), children: cur.uv_index != null ? 'UV ' + Number(cur.uv_index).toFixed(1) : 'UV —' }),
    n.jsx('div', { style: st.chip, children: daily0 && daily0.uvMax != null ? 'Max today ' + Number(daily0.uvMax).toFixed(1) : '' })
  ] });

  const tTime = n.jsxs('div', { style: Object.assign({}, st.tile, { alignItems: 'center' }), children: [
    n.jsx('div', { style: Object.assign({}, st.big, { fontSize: 'clamp(22px,10cqh,92px)' }), children: tk.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: cfg.showSeconds === false ? undefined : '2-digit' }) }),
    n.jsx('div', { style: st.med, children: tk.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }) }),
    n.jsx('div', { style: Object.assign({}, st.chip, { fontSize: 'clamp(11px,2.2cqh,20px)', color: '#93c5fd' }), children: '↑ ' + fmt12(daily0 && daily0.sunrise) + '   ↓ ' + fmt12(daily0 && daily0.sunset) })
  ] });

  const tToday = n.jsxs('div', { style: st.tile, children: [
    n.jsx('div', { style: st.lbl, children: 'Today' }),
    n.jsx('div', { style: st.med, children: outS && outS.minC != null ? fOf(outS.minC) + ' / ' + fOf(outS.maxC) : '—' }),
    n.jsx('div', { style: st.small, children: outS ? 'Outdoor 24h low / high' : 'Awaiting sensor data' }),
    n.jsx('div', { style: st.chip, children: list.length ? list.length + ' sensor' + (list.length === 1 ? '' : 's') + ' reporting' : 'rtl_433 not feeding yet' })
  ] });

  return n.jsx('div', { style: st.container, children: n.jsxs('div', { style: st.grid, children: [
    alertBar,
    tCond, tBaro, tWind,
    tOut, tIn, tSolar,
    n.jsx('div', { style: span2, children: tTime }), tToday
  ] }) });
}
