#!/usr/bin/env node
// fdw-apply-eventedit.cjs — injects calendar event-editing kit into a deployed
// vite bundle (in place, no rebuild; keeps all previously injected kits intact).
// Token policy (matches radar patchers): the cache-bust token lives in index.html
// only — this kit bumps ?v=ws6zv there (bundle carries no jsVer literal).
// Chain: ws6zs → ws6zt (v1, shadowed-prop bug) → ws6zv (v2, editEv + ml-6) → ws6zv
// (v3, timezone-correct prefill + timed-save true UTC).
// usage: node --experimental-vm-modules fdw-apply-eventedit.cjs <index-*.js> [index.html]
// Idempotent: skips if "Edit Family Event" already present. Backup: *.bak-eventedit
const fs = require('fs');
const bundlePath = process.argv[2];
const htmlPath = process.argv[3];
if (!bundlePath || !fs.existsSync(bundlePath)) { console.log('FAIL usage: fdw-apply-eventedit.cjs <bundle> [index.html]'); process.exit(1); }
let js = fs.readFileSync(bundlePath, 'utf8');
const EOL = js.includes('\r\n') ? '\r\n' : '\n';
if (js.includes('Edit Family Event')) { console.log('SKIP eventedit already present'); process.exit(0); }

const edits = [
  // E1 CreateEventModal: edit-mode useEffect (prefill on open, reset on close).
  // v3: prefill converts stored UTC -> LOCAL via new Date()+date-fns Ge(), so the
  // time input matches what the calendar rows show (raw-slice v2 showed UTC "11:00"
  // for an event the rows displayed as 6:00 AM EST). Date likewise local-converted
  // for timed events; all-day keeps the stored raw day (its T00Z convention is
  // day-stable and feeds day-grouping).
  ['[m,R]=b.useState(!1);if(!a)return null;',
   '[m,R]=b.useState(!1);b.useEffect(()=>{if(a){const F=window.__fdvEdit;if(F&&F.id!=null){window.__fdvEditId=F.id;const T=F.start_time?new Date(F.start_time):null;p(F.title||"");g(F.all_day?(F.start_time||"").slice(0,10):T?Ge(T,"yyyy-MM-dd"):(F.start_time||"").slice(0,10)||h);N(T&&!F.all_day?Ge(T,"HH:mm"):"09:00");v(F.all_day?1:0);P(F.category||"Family");k(F.color||"#3B82F6")}else{window.__fdvEditId=null}}else if(window.__fdvEditId!=null){window.__fdvEditId=null;window.__fdvEdit=null;p("");g(u||new Date().toISOString().split("T")[0]);N("09:00");v(!1);P("Family");k("#3B82F6")}else{window.__fdvEdit=null}},[a]);if(!a)return null;'],
  // E2 submit handler: PUT when editing, POST when adding
  ['"/api/events",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:d,start_time:E,end_time:Q,all_day:M?1:0,color:_,category:w})})).ok&&(o(),i(),p(""))',
   'window.__fdvEditId!=null?"/api/events/"+window.__fdvEditId:"/api/events",{method:window.__fdvEditId!=null?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:d,start_time:E,end_time:Q,all_day:M?1:0,color:_,category:w})})).ok&&(o(),i(),p(""),window.__fdvEditId=null)'],
  // E3 modal heading reflects edit vs add
  ['," Add Family Event"]',
   ',window.__fdvEditId!=null?"Edit Family Event":"Add Family Event"]'],
  // E4 DayOverflowModal: add ✎ button before delete button (local events).
  // NOTE: the row map uses local consts h,g,x — the prop MUST NOT be named `g` there
  // (a prop named g is shadowed ⇒ tap calls a string ⇒ TypeError, button dead). Use editEv.
  // User spacing request: delete button gains ml-6 so ✎ sits further from 🗑.
  ['h.source==="local"&&d&&n.jsx("button",{onClick:()=>d(h.id),className:"p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition shrink-0",title:"Delete event",children:n.jsx(At,{className:"w-4 h-4"})})',
   'h.source==="local"&&editEv&&n.jsx("button",{onClick:()=>editEv(h),className:"p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-950/40 rounded-lg transition shrink-0",title:"Edit event",children:n.jsx("svg",{className:"w-4 h-4",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[n.jsx("path",{d:"M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"}),n.jsx("path",{d:"m15 5 4 4"})]})}),h.source==="local"&&d&&n.jsx("button",{onClick:()=>d(h.id),className:"ml-6 p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition shrink-0",title:"Delete event",children:n.jsx(At,{className:"w-4 h-4"})})'],
  // E5 DayOverflowModal props: accept onEditEvent (collision-proof arg name editEv)
  ['function Gx({isOpen:a,onClose:i,date:o,events:u,onDeleteEvent:d}){',
   'function Gx({isOpen:a,onClose:i,date:o,events:u,onDeleteEvent:d,onEditEvent:editEv}){'],
  // E6 CalendarView: wire onEditEvent -> stash payload, open create-modal
  ['n.jsx(Gx,{isOpen:I,onClose:()=>K(!1),date:R,events:R?Y(R):[],onDeleteEvent:h})',
   'n.jsx(Gx,{isOpen:I,onClose:()=>K(!1),date:R,events:R?Y(R):[],onDeleteEvent:h,onEditEvent:ee=>{window.__fdvEdit=ee,X(Ge(R,"yyyy-MM-dd")),K(!1),E(!0)}})'],
  // E8 timed Save: compose from LOCAL pick then serialize true UTC (v3 timezone fix).
  // Old inline `${h}T${x}:00.000Z` stored the picked wall time AS UTC ⇒ every timed
  // hand-entry displayed -offset hours early (11:00 pick → 6:00 AM EST rows).
  // All-day branches untouched (their T00Z/T23:59Z raw-day convention is day-stable
  // and feeds day-grouping).
  ['const E=M?`${h}T00:00:00.000Z`:`${h}T${x}:00.000Z`,Q=M?`${h}T23:59:59.000Z`:`${h}T${x}:00.000Z`;',
   'const E=M?`${h}T00:00:00.000Z`:new Date(`${h}T${x}:00`).toISOString(),Q=M?`${h}T23:59:59.000Z`:new Date(`${h}T${x}:00`).toISOString();']
];

const report = [];
for (const [find, rep] of edits) {
  const cnt = js.split(find).length - 1;
  if (cnt !== 1) { console.log('FAIL anchor count=' + cnt + ' :: ' + find.slice(0, 80)); process.exit(1); }
  js = js.replace(find, rep);
  report.push(rep.slice(0, 46));
}
// E7: no bundle token (bundle carries no jsVer literal — ?v= lives in index.html)
fs.copyFileSync(bundlePath, bundlePath + '.bak-eventedit');
fs.writeFileSync(bundlePath, js);
// parse check (ESM bundle)
new (require('vm').SourceTextModule)(js);
for (const marker of ['Edit Family Event', 'window.__fdvEditId', 'onEditEvent:ee=>{', 'title:"Edit event"']) {
  if (js.split(marker).length - 1 < 1) { console.log('FAIL post-marker missing: ' + marker); process.exit(1); }
}
console.log('APPLY EVENTEDIT OK bundle=' + bundlePath + ' len=' + js.length + EOL + report.join(EOL));
if (htmlPath && fs.existsSync(htmlPath)) {
  let html = fs.readFileSync(htmlPath, 'utf8');
  const hEOL = html.includes('\r\n') ? '\r\n' : '\n';
  const hc = html.split('?v=ws6zs').length - 1;
  if (hc === 1) {
    fs.copyFileSync(htmlPath, htmlPath + '.bak-eventedit');
    html = html.replace('?v=ws6zs', '?v=ws6zv');
    fs.writeFileSync(htmlPath, html);
    console.log('APPLY HTML OK ?v=ws6zv');
  } else {
    console.log('HTML skip (q-count=' + hc + (html.includes('?v=ws6zv') ? ' already ws6zt' : '') + ') eol=' + (hEOL === '\r\n' ? 'CRLF' : 'LF'));
  }
}