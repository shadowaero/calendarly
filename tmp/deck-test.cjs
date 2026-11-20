#!/usr/bin/env node
// deck-test.cjs — rvT30 (ws7ai: 1 h window = the last 7 real frames at the 10-min upstream cadence,
// + the RainViewer nowcast tail when upstream serves it; ws7ah 5-min interpolated playback kept —
// 1.24 s crossfades + HUD clock ticking midpoints). Asserts the slice(-7) timeline + beat engine
// + 1.24s full-dwell crossfade + tokens across all kits.
const fs = require('fs');
const R = 'c:/Users/xxtoo/Documents/IDX6011/';
const comp = fs.readFileSync(R + 'wave4/fd_weather/rw-rainview-comp.js', 'utf8');
const wp = fs.readFileSync(R + 'wave4/fd_weather/fdw-apply-radar-widgets.cjs', 'utf8');
const np = fs.readFileSync(R + 'wave4/fd_weather/fdw-apply-radar-nas.cjs', 'utf8');
const wsh = fs.readFileSync(R + 'wave4/fd_weather/verify-wxgui6.sh', 'utf8');
const ev = fs.readFileSync(R + 'tmp/eventedit/verify-eventedit.sh', 'utf8');
const sn = fs.readFileSync(R + 'tmp/future/ship-nas.cjs', 'utf8');
const wxc = fs.readFileSync(R + 'wave4/fd_weather/wxgui-component.js', 'utf8');
const xp = fs.readFileSync(R + 'tmp/future/fdw-apply-wx5.cjs', 'utf8');
const cnt = function (s, needle) { return s.split(needle).length - 1; };
const results = [];
const want = function (name, got, exp) { results.push([name, got, exp]); };
want('comp.rvT30.x2', cnt(comp, 'rvT30'), 2);
want('comp.timeline.slice7', cnt(comp, '.slice(-7).concat(rvNC)'), 1);
want('comp.timeline.slice9Gone', cnt(comp, '.slice(-9).concat'), 0);
want('comp.timeline.slice6Gone', cnt(comp, '.slice(-6).concat'), 0);
want('comp.timeline.branchGone', cnt(comp, 'slice(rvNC.length'), 0);
want('comp.fwdwrap', cnt(comp, '(rvPos.current + 1) % L'), 1);
want('comp.holdNewest', cnt(comp, 'if (p === L - 1) rvHold.current = 2;'), 1);
want('comp.step620', cnt(comp, '}, 620);') >= 1, true);
want('comp.beatFlip', cnt(comp, 'rvBeat.current === 1'), 1);
want('comp.beatClear', cnt(comp, 'rvBeat.current = 0'), 2);
want('comp.beatSet', cnt(comp, 'rvBeat.current = 1'), 1);
want('comp.beatStamp', cnt(comp, 'rvsT('), 4);
want('comp.midGapCap', cnt(comp, '620000'), 1);
want('comp.clockFallback', cnt(comp, 'rvStT ||'), 1);
want('comp.xfade', cnt(comp, 'opacity 1.24s linear') >= 2, true);
want('comp.xfade62Gone', cnt(comp, '.62s linear'), 0);
want('comp.fcstBadge', cnt(comp, "'FCST +' + rvFcMin") >= 1, true);
want('comp.fcstWindow', cnt(comp, 'rvFrame.time > rvNow + 60'), 1);
want('comp.startAnchor7', cnt(comp, 'Math.min((rvData.radar.past || []).length, 7)'), 1);
want('comp.startAnchorOld', cnt(comp, 'rvNC.length ? 10 : 13'), 0);
for (const gone of ['rvHR', 'prec_radar', 'sint/', 'keyedraw', 'getImageData', 'if (f.syn)', 'f.cod', 'codHold', 'rvCodBands'])
  want('comp.gone:' + gone, cnt(comp, gone), 0);
want('widgets.ver', cnt(wp, "const jsVer = 'ws7ai';"), 1);
want('widgets.staleTokens', cnt(wp, 'ws7aa') + cnt(wp, 'ws7ab') + cnt(wp, 'ws7ac') + cnt(wp, 'ws7ad') + cnt(wp, 'ws7ae') + cnt(wp, 'ws7af') + cnt(wp, 'ws7ag') + cnt(wp, 'ws7ah'), 0);
want('nas.ver', cnt(np, "const jsVer = 'ws7ai';"), 1);
want('nas.staleTokens', cnt(np, 'ws7aa') + cnt(np, 'ws7ab') + cnt(np, 'ws7ac') + cnt(np, 'ws7ad') + cnt(np, 'ws7ae') + cnt(np, 'ws7af') + cnt(np, 'ws7ag') + cnt(np, 'ws7ah'), 0);
want('wxgui6.rvT32ChecksGone', cnt(wsh, 'rvT32') + cnt(wsh, 'cod-HRRR'), 0);
want('wxgui6.rwXFKept', cnt(wsh, 'opacity 1.24s linear'), 1);
want('wxgui6.rwMIGate', cnt(wsh, 'rwMI:'), 1);
want('wxgui6.rwTmGate', cnt(wsh, '.slice(-7).concat(rvNC)'), 1);
want('wxgui6.rwTm9GoneGate', cnt(wsh, '.slice(-9).concat") < 0'), 1);
want('wxgui6.rwTm6GoneGate', cnt(wsh, '.slice(-6).concat") < 0'), 1);
want('eventedit.curToken', cnt(ev, '?v=ws7ai'), 2);
want('eventedit.staleHas7ae', cnt(ev, "grep -c '?v=ws7ae'"), 1);
want('eventedit.staleHas7af', cnt(ev, "grep -c '?v=ws7af'"), 1);
want('eventedit.staleHas7ag', cnt(ev, "grep -c '?v=ws7ag'"), 1);
want('eventedit.staleHas7ah', cnt(ev, "grep -c '?v=ws7ah'"), 1);
want('eventedit.staleHas7ab', cnt(ev, "grep -c '?v=ws7ab'"), 1);
want('eventedit.staleHas7ac', cnt(ev, "grep -c '?v=ws7ac'"), 1);
want('eventedit.staleHas7ad', cnt(ev, "grep -c '?v=ws7ad'"), 1);
want('eventedit.lf', cnt(ev, '\r'), 0);
want('wxc.days6', cnt(wxc, '&days=6'), 1);
want('wxc.days2Gone', cnt(wxc, 'days=2'), 0);
want('wxc.fx5strip', cnt(wxc, '5-DAY FORECAST'), 1);
want('wxc.fx5spacer', cnt(wxc, 'children: fx5 || undefined'), 1);
want('wxc.fx5nullguard', cnt(wxc, "cols[0].max == null"), 1);
want('wx5.ver', cnt(xp, "const jsVer = 'ws7af';"), 1);
want('wx5.orig8', cnt(xp, 'orig8.'), 4);
want('wx5.guardFx5', cnt(xp, 'fx5='), 1);
want('shipnas.token', cnt(sn, 'const TOKEN = "ws7ai";'), 1);
want('shipnas.staleToken', cnt(sn, 'ws7ah'), 0);
want('shipnas.absenceChecks', cnt(sn, "js.includes('prec_radar')?0:1") + cnt(sn, "js.includes('sint/')?0:1") + cnt(sn, "js.includes('rvHR')?0:1"), 3);
want('shipnas.slice7', cnt(sn, ".slice(-7).concat(rvNC"), 1);
want('shipnas.slice9Gone', cnt(sn, "js.includes('.slice(-9).concat')?0:1"), 1);
want('shipnas.slice6Gone', cnt(sn, "js.includes('.slice(-6).concat')?0:1"), 1);
want('shipnas.xfChecks', cnt(sn, 'opacity 1.24s linear') + cnt(sn, '.62s linear'), 2);
want('shipnas.rvT32ChecksGone', cnt(sn, 'rvT32c ') + cnt(sn, "'synth '") + cnt(sn, "'keyedraw '"), 0);
// micro: deck window (7 past frames @10-min = 1 h real sweep; 10 total with the +30 min nowcast tail)
const now = Math.floor(Date.now() / 1000);
const past = []; for (let i = 13; i >= 1; i--) past.push({ time: now - i * 600, path: 'p' + i });
const nc = []; for (let i = 1; i <= 3; i++) nc.push({ time: now + i * 600, path: 'n' + i });
const framesNC = past.slice(-7).concat(nc);
const nc0 = [];
const framesNoNC = past.slice(-7).concat(nc0);
want('deck.lenWithNC', framesNC.length, 10);
want('deck.lenNoNC', framesNoNC.length, 7);
want('deck.spanMin', Math.round((framesNoNC[framesNoNC.length - 1].time - framesNoNC[0].time) / 60), 60);
want('deck.spanNC', Math.round((framesNC[framesNC.length - 1].time - framesNC[0].time) / 60), 100);
want('deck.tailIsF30', framesNC[framesNC.length - 1].time - now, 1800);
// micro (ws7ah engine, ws7ai window): flip on every second 620 ms beat, HUD mid-stamps on
// alternate beats, 2-hold dwell on the newest (L=10 = 7 real + 3 FCST, start idx 9)
const rvPos = { current: 9 }, rvHold = { current: 0 }, rvN = { current: 9 }, rvPrev = { current: -1 }, rvBeat = { current: 0 }; const L = 10; const seq = [];
for (let i = 0; i < 24; i++) {
  if (rvBeat.current === 1) { rvBeat.current = 0; seq.push('M' + rvN.current); continue; }
  if (rvHold.current > 0) { rvHold.current--; seq.push('H' + rvN.current); continue; }
  const p = (rvPos.current + 1) % L;
  rvPrev.current = rvN.current;
  rvPos.current = p; rvN.current = p; rvBeat.current = 1;
  if (p === L - 1) rvHold.current = 2;
  seq.push(String(p));
}
want('tick.beats', seq.join(','), '0,M0,1,M1,2,M2,3,M3,4,M4,5,M5,6,M6,7,M7,8,M8,9,M9,H9,H9,0,M0');
// micro: interpolated 5-min HUD clock on a real-only deck (7 past frames, start on NOW index 6)
let sPos = 6, sN = 6, sPrev = -1, sBeat = 0, sHold = 0; const stamps = [];
for (let i = 0; i < 6; i++) {
  if (sBeat === 1) { sBeat = 0; const fA = framesNoNC[sPrev], fB = framesNoNC[sN]; const gp = fB.time - fA.time; stamps.push((gp > 0 && gp <= 620000) ? Math.round((fA.time + fB.time) / 2) : fB.time); continue; }
  if (sHold > 0) { sHold--; stamps.push(framesNoNC[sN].time); continue; }
  const p = (sPos + 1) % 7;
  sPrev = sN; sPos = p; sN = p; sBeat = 1;
  if (p === 6) sHold = 2;
  stamps.push(framesNoNC[sPrev].time);
}
want('clock.stampSeq', stamps.join(','), (now - 600) + ',' + (now - 4200) + ',' + (now - 4200) + ',' + (now - 3900) + ',' + (now - 3600) + ',' + (now - 3300));
let fail = 0;
for (const r of results) {
  const ok = r[1] === r[2];
  if (!ok) fail++;
  console.log((ok ? 'OK  ' : 'FAIL') + ' ' + r[0] + ' = ' + String(r[1]) + (ok ? '' : ' (want ' + String(r[2]) + ')'));
}
console.log('DECK-TEST pass=' + (results.length - fail) + ' fail=' + fail);
process.exit(fail ? 1 : 0);

