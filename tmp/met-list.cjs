const f = process.argv[2] || '../tmp/met-gh2.json';
const prefix = process.argv[3] || 'production/fill/svg/';
const j = require(f);
if (j.status || j.error) { console.log('API_ERROR ' + JSON.stringify(j).slice(0, 200)); process.exit(0); }
const files = (j.files || []).map(x => x.name);
console.log('TOTAL', files.length);
const fill = files.filter(n => n.indexOf(prefix) >= 0 && n.endsWith('.svg'));
console.log('PREFIX_COUNT', fill.length);
const want = ['clear-day', 'clear-night', 'partly-cloudy-day', 'partly-cloudy-night', 'overcast', 'cloudy', 'fog-day', 'fog-night', 'drizzle', 'rain', 'raindrops', 'snow', 'sleet', 'thunder', 'thermometer', 'moon', 'house', 'raindrop'];
for (const w of want) {
  const hits = fill.filter(n => n.indexOf('/' + w) >= 0).slice(0, 4);
  console.log(w + ' => ' + (hits.join(', ') || 'NONE'));
}
console.log('SAMPLE ' + fill.slice(0, 14).join(' | '));

