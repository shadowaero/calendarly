// Fetch one Meteocon icon from the official GitHub Pages CDN into assets/icons/.
// Usage: node tmp/fetch-icon.cjs hurricane   (adds animated fill SVG; verified MIT set)
const fs = require('fs');
const path = require('path');
const name = process.argv[2];
if (!name) { console.error('no icon name'); process.exit(1); }
const https = require('https');
const url = 'https://basmilius.github.io/meteocons/production/fill/svg/' + name + '.svg';
https.get(url, function (res) {
  if (res.statusCode !== 200) { console.error('HTTP ' + res.statusCode + ' for ' + url); process.exit(1); }
  let body = '';
  res.on('data', function (d) { body += d; });
  res.on('end', function () {
    const out = path.join('wave4', 'fd_weather', 'assets', 'icons', name + '.svg');
    fs.writeFileSync(out, body);
    console.log('OK ' + out + ' bytes=' + body.length + ' animated=' + (body.indexOf('<animate') >= 0 || body.indexOf('animateTransform') >= 0));
  });
}).on('error', function (e) { console.error('FETCH ERR ' + e.message); process.exit(1); });
