// rwWindy — Windy.com radar embed block (resizable: iframe scales with block size)
function rwWindy(props) {
  const a = (props && props.config) || {};
  const lat = isFinite(Number(a.lat)) ? Number(a.lat) : 28.800;
  const lon = isFinite(Number(a.lon)) ? Number(a.lon) : -81.644;
  const zoom = Math.min(Math.max(Math.round(Number(a.zoom)) || 11, 3), 17);
  const overlay = a.overlay || 'radar';
  const src = 'https://embed.windy.com/embed2.html?lat=' + lat + '&lon=' + lon + '&zoom=' + zoom + '&type=radar&location=coordinates&overlay=' + encodeURIComponent(overlay);
  return n.jsx('div', { className: 'h-full w-full relative overflow-hidden bg-slate-950', children: n.jsx('iframe', { src: src, title: 'Windy radar', width: '100%', height: '100%', style: { border: 0, display: 'block', background: '#0b1220' }, loading: 'lazy', allowFullScreen: true }) });
}
