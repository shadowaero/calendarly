const http = require('http');
const get = (p) => new Promise((res, rej) => {
  http.get({ host: '127.0.0.1', port: 3000, path: p }, (r) => {
    let s = ''; r.on('data', (d) => s += d); r.on('end', () => res(s));
  }).on('error', rej);
});
(async () => {
  const w = JSON.parse(await get('/api/weather'));
  console.log('KEYS ' + Object.keys(w).join(','));
  console.log('PRESSURE ' + JSON.stringify(w.pressure));
  console.log('DAILY ' + JSON.stringify((w.daily || []).slice(0, 2)));
  console.log('HOURLY_PRECIP ' + JSON.stringify((w.hourly || []).slice(0, 6).map(h => h.precip)));
  console.log('SOLAR ' + JSON.stringify(w.solar || null).slice(0, 160));
  console.log('TZ ' + JSON.stringify(w.timezone) + ' UNITS ' + JSON.stringify(w.units));
  const r = JSON.parse(await get('/api/weather/radar?zip=32757'));
  console.log('RADAR_KEYS ' + Object.keys(r).join(','));
  console.log('RADAR ' + 'lon=' + r.lon + ' lat=' + r.lat + ' host=' + r.host + ' frames=' + r.frames.length + ' first=' + JSON.stringify(r.frames[0]) + ' last=' + JSON.stringify(r.frames[r.frames.length - 1]));
})().catch(e => { console.error('ERR ' + e.message); process.exit(1); });
