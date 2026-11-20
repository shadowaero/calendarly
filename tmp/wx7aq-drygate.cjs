#!/usr/bin/env node
// wx7aq-drygate.cjs — dry-run proof for the ws7aq wave (OPEN-METEO credit unit nudged 5px right +
// 5px down via a layout-free transform on the credit column). Parses the DRY-patched bundle and
// asserts the wave's own contracts (token + markers + wx region + comps + parse + nudge).
// Run local (old-style dry dir):  node tmp/wx7aq-drygate.cjs c:/Users/xxtoo/Documents/IDX6011/tmp/wx7aq-dry
// Run on the Pi (new dry dist):   node /home/xxtoon/fdwship/wx7aq-drygate.cjs /tmp/wx7aq-dry-dist
const fs = require('fs');
const vm = require('vm');
const R = process.argv[2] || 'c:/Users/xxtoo/Documents/IDX6011/tmp/wx7aq-dry';
const html = fs.readFileSync(R + '/index.html', 'utf8');
const m = html.match(/src="(\/assets\/index-[^"?]+\.js)(\?v=([^"]+))?"/);
if (!m) { console.log('FAIL html.src'); process.exit(1); }
const js = fs.readFileSync(R + m[1], 'utf8');
new vm.SourceTextModule(js);
const S = js.slice(js.indexOf('function wxGUI'), js.indexOf('function wsWS({'));
const atWS = js.indexOf('\nfunction wsWS');
const atCM = js.lastIndexOf('// wxGUI', atWS);
const g = [];
const chk = (name, ok) => g.push((ok ? 'OK  ' : 'FAIL') + ' ' + name);
chk('parse.bundle', true);
chk('token.ws7aq', /index-[A-Za-z0-9_-]*\.js\?v=ws7aq/.test(html));
chk('stale.ws7ap.gone', !/index-[A-Za-z0-9_-]*\.js\?v=ws7ap/.test(html));
chk('wxGUI.x1', (js.match(/function wxGUI/g) || []).length === 1);
chk('WG_CSS.x1', (js.match(/const WG_CSS/g) || []).length === 1);
chk('WX_SVG.intact', (js.match(/const WX_SVG/g) || []).length === 1);
chk('comps.intact', (js.match(/function rwWindy/g) || []).length === 1 && (js.match(/function rwRV/g) || []).length === 1);
chk('marker.firstLine', atCM >= 0 && js.slice(atCM, atCM + 8) === '// wxGUI');
chk('wxSrc', S.includes('OPEN-METEO'));
chk('omSm', S.includes('.49cqw') && S.includes('OPEN-METEO'));
chk('omHalf', S.includes(".075cqh"));
chk('omNudge', S.includes("transform: 'translate(5px, 5px)'"));
chk('wxAnim', S.includes('wgXBob') && S.includes('wgXBreath') && S.includes('wgIcoBob'));
chk('n12Gone', !S.includes('NEXT 12H'));
chk('omLowGone', !S.includes("paddingBottom: '.15cqh'"));
chk('fx5', S.includes('5-DAY FORECAST') && S.includes('&days=6') && !S.includes('&days=2') && S.includes('TODAY'));
chk('rwInWxCard', S.includes('n.jsx(rwRV') && S.includes('wgXScene'));
let fail = 0;
for (const l of g) { console.log(l); if (l.startsWith('FAIL')) fail++; }
console.log('WX7AQ-DRYGATE fail=' + fail);
process.exit(fail ? 1 : 0);