#!/usr/bin/env node
// deck-test.cjs — ws7ar quota-ladder radar deck + ws7ao wx credit micro-wave (Rainbow primary: the edge snapshot comes from /radar/api/snapshot; deck
// = 7 real frames + a tier tail scaled by the proxy's usage.left (from /radar/api/health) — tier
// 2: six future steps +10..+60 (13-frame deck), tier 1: +20/+40/+60 (10 frames), tier 0: ONE +2 h
// frame (offset 7200, the ws7am deck; frame count is the quota lever and offset reach is free),
// tiles through /radar/api with the key on the server; the RainViewer path is kept as automatic
// fallback so the slice(-7) timeline + the ws7ah beat engine stay). Asserts the rbk ladder builder
// + the tier-0 deck micro + fallback timeline + ws7ah beat engine + 1.24s crossfade + tokens.
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
want('comp.token', cnt(comp, 'ws7ar') >= 1, true);
want('comp.fcst7200', cnt(comp, 'o: 7200'), 1);
want('comp.fcstSweepGone', cnt(comp, 'F2 <= 6'), 0);
want('comp.fcst1800Gone', cnt(comp, 'o: 1800'), 0);
want('comp.rvT30Gone', cnt(comp, 'rvT30'), 0);
want('comp.rbkFloorGone', cnt(comp, 'Math.floor(Date.now() / 600000)'), 0);
want('comp.rbkSnapFetch', cnt(comp, '/radar/api/snapshot') >= 1, true);
want('comp.rbkHealth', cnt(comp, '/radar/api/health') >= 2, true);
want('comp.rbkProxyUrl', cnt(comp, 'precip-global'), 2);
want('comp.rbkFcst', cnt(comp, 'o: 7200'), 1);
want('comp.rbkFcstPath', cnt(comp, "path: 'rbkF'"), 1);
want('comp.rbkTier', cnt(comp, 'rbkTier'), 3);
want('comp.leftRef', cnt(comp, 'rbkLeft'), 4);
want('comp.healthLeft', cnt(comp, 'j3.usage.left'), 2);
want('comp.ladderTh', cnt(comp, '(l >= 7800') + cnt(comp, '(l >= 7000'), 2);
want('comp.ladderT2', cnt(comp, 'F3 <= 3600') + cnt(comp, 'F3 += 600'), 2);
want('comp.ladderT1', cnt(comp, 'F4 <= 3600') + cnt(comp, 'F4 += 1200'), 2);
want('comp.ladderMemo', cnt(comp, 'old.tier === t3'), 1);
want('comp.tierField', cnt(comp, 'tier: tier'), 1);
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
want('comp.fcstBadge', cnt(comp, "'FCST +' + (rvFcMin < 90") >= 1, true);
want('comp.fcstBadgeHour', cnt(comp, "rvFcMin / 30) / 2") >= 1, true);
want('comp.fcstWindow', cnt(comp, 'rvFrame.time > rvNow + 60'), 1);
want('comp.startAnchor', cnt(comp, 'rvFrames.np || 7'), 1);
want('comp.rbkNP', cnt(comp, 'rvFrames.np = (rvRBK && rbkSnap) ? 7 :'), 1);
want('comp.startAnchorOld', cnt(comp, 'rvNC.length ? 10 : 13'), 0);
for (const gone of ['rvHR', 'prec_radar', 'sint/', 'keyedraw', 'getImageData', 'if (f.syn)', 'f.cod', 'codHold', 'rvCodBands'])
  want('comp.gone:' + gone, cnt(comp, gone), 0);
want('comp.zoom13NZ', cnt(comp, 'Number(a.zoom)) || 7, 3), 13)'), 1);
want('comp.zoom13Set', cnt(comp, 'Number(z)), 3), 13)'), 1);
want('comp.zoom13Load', cnt(comp, 'lz >= 3 && lz <= 13'), 1);
want('comp.zoom12Gone', cnt(comp, '3), 12)') + cnt(comp, 'lz <= 12'), 0);
want('comp.ozRbk', cnt(comp, 'const OZ = Math.min(rvZoom, rvRBK ? 10 : 7)'), 1);
want('comp.oz7Gone', cnt(comp, 'const OZ = Math.min(rvZoom, 7)'), 0);
want('widgets.ver', cnt(wp, "const jsVer = 'ws7ar';"), 1);
want('widgets.staleTokens', cnt(wp, 'ws7aa') + cnt(wp, 'ws7ab') + cnt(wp, 'ws7ac') + cnt(wp, 'ws7ad') + cnt(wp, 'ws7ae') + cnt(wp, 'ws7af') + cnt(wp, 'ws7ag') + cnt(wp, 'ws7ah') + cnt(wp, 'ws7ai') + cnt(wp, 'ws7aj') + cnt(wp, 'ws7ak') + cnt(wp, 'ws7al') + cnt(wp, 'ws7am'), 0);
want('nas.ver', cnt(np, "const jsVer = 'ws7ar';"), 1);
want('nas.staleTokens', cnt(np, 'ws7aa') + cnt(np, 'ws7ab') + cnt(np, 'ws7ac') + cnt(np, 'ws7ad') + cnt(np, 'ws7ae') + cnt(np, 'ws7af') + cnt(np, 'ws7ag') + cnt(np, 'ws7ah') + cnt(np, 'ws7ai') + cnt(np, 'ws7aj') + cnt(np, 'ws7ak') + cnt(np, 'ws7al') + cnt(np, 'ws7am'), 0);
want('wxgui6.rvT32ChecksGone', cnt(wsh, 'rvT32') + cnt(wsh, 'cod-HRRR'), 0);
want('wxgui6.rwXFKept', cnt(wsh, 'opacity 1.24s linear'), 1);
want('wxgui6.rwMIGate', cnt(wsh, 'rwMI:'), 1);
want('wxgui6.rwTmGate', cnt(wsh, '.slice(-7).concat(rvNC)'), 1);
want('wxgui6.rwTm9GoneGate', cnt(wsh, '.slice(-9).concat") < 0'), 1);
want('wxgui6.rwTm6GoneGate', cnt(wsh, '.slice(-6).concat") < 0'), 1);
want('wxgui6.rbkDeckGate', cnt(wsh, 'rbkDeck'), 1);
want('wxgui6.rbkLadderGate', cnt(wsh, 'rbkLadder:'), 1);
want('wxgui6.rbkNoUpstreamGate', cnt(wsh, 'rbkNoUpstream'), 1);
want('wxgui6.formRainbowGate', cnt(wsh, 'Rainbow Radar Config'), 1);
want('wxgui6.rwOzGate', cnt(wsh, 'rwOz:'), 1);
want('wxgui6.omSmGate', cnt(wsh, 'omSm:'), 1);
want('wxgui6.n12Gate', cnt(wsh, 'n12Gone:'), 1);
want('wxgui6.omHalfGate', cnt(wsh, 'omHalf:'), 1);
want('wxgui6.omNudgeGate', cnt(wsh, 'omNudge:'), 1);
want('wxgui6.wxAnimGate', cnt(wsh, 'wxAnim:'), 1);
want('eventedit.curToken', cnt(ev, '?v=ws7ar'), 2);
want('eventedit.staleHas7aq', cnt(ev, "grep -c '?v=ws7aq'"), 1);
want('eventedit.staleHas7al', cnt(ev, "grep -c '?v=ws7al'"), 1);
want('eventedit.staleHas7am', cnt(ev, "grep -c '?v=ws7am'"), 1);
want('eventedit.staleHas7an', cnt(ev, "grep -c '?v=ws7an'"), 1);
want('eventedit.staleHas7ao', cnt(ev, "grep -c '?v=ws7ao'"), 1);
want('eventedit.staleHas7ap', cnt(ev, "grep -c '?v=ws7ap'"), 1);
want('eventedit.cur7aiGone', cnt(ev, "'?v=ws7ai'"), 1);
want('eventedit.staleHas7aj', cnt(ev, "grep -c '?v=ws7aj'"), 1);
want('eventedit.staleHas7ak', cnt(ev, "grep -c '?v=ws7ak'"), 1);
want('eventedit.staleHas7ai', cnt(ev, "grep -c '?v=ws7ai'"), 1);
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
want('wxc.omLabel', cnt(wxc, 'OPEN-METEO'), 1);
want('wxc.omSm', cnt(wxc, '.49cqw'), 1);
want('wxc.omLow', cnt(wxc, "paddingBottom: '.075cqh'"), 1);
want('wxc.omNudge', cnt(wxc, "translate(5px, 5px)"), 1);
want('wxc.sceneBob', cnt(wxc, 'wgXBob'), 2);
want('wxc.sceneBreath', cnt(wxc, 'wgXBreath'), 2);
want('wxc.icoBob', cnt(wxc, 'wgIcoBob'), 4);
want('wxc.n12Gone', cnt(wxc, 'NEXT 12H'), 0);
want('wx5.ver', cnt(xp, "const jsVer = 'ws7aq';"), 1);
want('wx5.orig8', cnt(xp, 'orig8.'), 4);
want('wx5.guardFx5', cnt(xp, 'fx5='), 1);
want('shipnas.token', cnt(sn, 'const TOKEN = "ws7ar";'), 1);
want('shipnas.staleToken', cnt(sn, 'ws7ah') + cnt(sn, 'ws7ai') + cnt(sn, 'ws7aj') + cnt(sn, 'ws7ak') + cnt(sn, 'ws7al') + cnt(sn, 'ws7am'), 0);
want('shipnas.fcstGate', cnt(sn, "js.includes('o: 7200')"), 1);
want('shipnas.ladderGate', cnt(sn, "js.includes('usage.left')") + cnt(sn, "js.includes('F3 <= 3600')"), 2);
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
want('tick.beats.rv10', seq.join(','), '0,M0,1,M1,2,M2,3,M3,4,M4,5,M5,6,M6,7,M7,8,M8,9,M9,H9,H9,0,M0');
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
// micro (ws7am): wall-clock snapshot builder — snap floored to 10-min; deck = 7 past frames +
// ONE +2h nowcast frame; past frames target offset 0 of their own snapshot; the FCST frame hits
// offset 7200 of the ONE edge snapshot (one (snap, offset) family per publish roll — the same
// mint cost as the old ws7aj +30m family, at 4x the reach).
const rbkNow = Math.floor(Date.now() / 1000);
const rbkSnap = Math.floor(rbkNow / 600) * 600;
const frR = []; for (let K = 6; K >= 1; K--) frR.push({ time: rbkSnap - K * 600, s: rbkSnap - K * 600, o: 0, rbk: 1, path: 'rbk' + K }); frR.push({ time: rbkSnap, s: rbkSnap, o: 0, rbk: 1, path: 'rbk0' }); frR.push({ time: rbkSnap + 7200, s: rbkSnap, o: 7200, rbk: 1, path: 'rbkF' });
frR.np = 7;
want('rbkDeck.len', frR.length, 8);
want('rbkDeck.np', frR.np, 7);
want('rbkDeck.firstTime', frR[0].time, rbkSnap - 3600);
want('rbkDeck.pastOwnSnap', frR[2].s, rbkSnap - 4 * 600);
want('rbkDeck.nowIsSelf', frR[6].s, rbkSnap);
want('rbkDeck.tailIsFcst', frR[7].time - rbkSnap, 7200);
want('rbkDeck.fcstOffset', frR[7].o, 7200);
want('rbkDeck.fcstEdgeSnap', frR[7].s, rbkSnap);
want('rbkDeck.spanMin', Math.round((frR[7].time - frR[0].time) / 60), 180);
want('rbkDeck.proxyUrlPast', ('/radar/api/tiles/v1/precip-global/' + frR[3].s + '/' + frR[3].o + '/7/17/26?color=8').indexOf('/radar/api/tiles/v1/precip-global/' + (rbkSnap - 3 * 600) + '/0/7/17/26?color=8'), 0);
want('rbkDeck.proxyUrlFcst', ('/radar/api/tiles/v1/precip-global/' + frR[7].s + '/' + frR[7].o + '/7/17/26?color=8').indexOf('/radar/api/tiles/v1/precip-global/' + rbkSnap + '/7200/7/17/26?color=8'), 0);
// micro (ws7ar ladder): tier-2 = six real future steps +10..+60 (13-frame deck, 2 h wall span);
// tier-1 = every other step +20/+40/+60 (10-frame deck); tier-0 stays the +2 h tail (the rbkDeck
// micro above). The future tail is the only fresh-mint cost per publish roll (past frames recycle
// earlier rolls' disk cache); the ladder picks the tier from usage.left (9300 budget: tiers run
// ~970 / ~610 / ~250 calls/day measured, so thresholds 7800/7000 keep every month inside the 9300
// brake with margin, sweep early-month and never collapse).
const frT2 = []; for (let K = 6; K >= 1; K--) frT2.push({ time: rbkSnap - K * 600, s: rbkSnap - K * 600, o: 0, rbk: 1, path: 'rbk' + K }); frT2.push({ time: rbkSnap, s: rbkSnap, o: 0, rbk: 1, path: 'rbk0' }); for (let F = 600; F <= 3600; F += 600) frT2.push({ time: rbkSnap + F, s: rbkSnap, o: F, rbk: 1, path: 'rbkFw' + F });
want('ladder.t2.len', frT2.length, 13);
want('ladder.t2.fcsts', frT2.slice(7).map(function (f2) { return f2.o; }).join(','), '600,1200,1800,2400,3000,3600');
want('ladder.t2.spanMin', Math.round((frT2[12].time - frT2[0].time) / 60), 120);
want('ladder.t2.step10', (frT2[8].time - frT2[7].time) / 60, 10);
want('ladder.t2.url', ('/radar/api/tiles/v1/precip-global/' + frT2[7].s + '/' + frT2[7].o + '/7/17/26?color=8').indexOf('/radar/api/tiles/v1/precip-global/' + rbkSnap + '/600/7/17/26?color=8'), 0);
const frT1 = []; for (let K = 6; K >= 1; K--) frT1.push({ time: rbkSnap - K * 600, s: rbkSnap - K * 600, o: 0, rbk: 1, path: 'rbk' + K }); frT1.push({ time: rbkSnap, s: rbkSnap, o: 0, rbk: 1, path: 'rbk0' }); for (let F = 1200; F <= 3600; F += 1200) frT1.push({ time: rbkSnap + F, s: rbkSnap, o: F, rbk: 1, path: 'rbkFw' + F });
want('ladder.t1.len', frT1.length, 10);
want('ladder.t1.fcsts', frT1.slice(7).map(function (f2) { return f2.o; }).join(','), '1200,2400,3600');
const rbkTestTier = function (l) { return (l == null) ? 0 : (l >= 7800 ? 2 : (l >= 7000 ? 1 : 0)); };
want('ladder.map', [9300, 7800, 7799, 7000, 6999, null].map(rbkTestTier).join(''), '221100');
want('ladder.mapRich', rbkTestTier(9299), 2);
want('ladder.mapTrim', rbkTestTier(7799) + '' + rbkTestTier(6999), '10');
// micro (ws7ak): per-source overlay zoom — Rainbow frames render native to z10 (real data
// probed at z8-10; z11/12 blank upstream), RainViewer frames stay at its z7 tilecache cap; the
// scale(OV) wrapper upscales rvZoom beyond the cap (never blank, never raw z7 mush).
const ozc = function (zV, rbk) { return Math.min(zV, rbk ? 10 : 7); };
want('oz.rbk7', ozc(7, 1), 7);
want('oz.rbk9', ozc(9, 1), 9);
want('oz.rbk10', ozc(10, 1), 10);
want('oz.rbk11Upscaled', ozc(11, 1), 10);
want('oz.rv11', ozc(11, 0), 7);
want('oz.rv9', ozc(9, 0), 7);
// micro (ws7al): user ceiling 13 — one more upscale level on TOP of the same data caps (Rainbow
// nowcast native z10 / RV tilecache z7 / z11+ upstream-blank); the OSM base keeps real detail
// that deep while the rain overlay upscales beyond its per-source cap.
want('oz.rbk12Upscaled', ozc(12, 1), 10);
want('oz.rbk13Upscaled', ozc(13, 1), 10);
let fail = 0;
for (const r of results) {
  const ok = r[1] === r[2];
  if (!ok) fail++;
  console.log((ok ? 'OK  ' : 'FAIL') + ' ' + r[0] + ' = ' + String(r[1]) + (ok ? '' : ' (want ' + String(r[2]) + ')'));
}
console.log('DECK-TEST pass=' + (results.length - fail) + ' fail=' + fail);
process.exit(fail ? 1 : 0);

