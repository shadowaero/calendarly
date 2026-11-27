// fdwKit.js — Wave-Weather (wave4/fd_weather) widget kit, ported VERBATIM from the
// hand-patched kiosk bundle back into source (phase-1 port-back). Bundle-era aliases:
//   n = react/jsx-runtime ({jsx, jsxs, Fragment}), b = React. Meteocons icons (c) Bas
//   Milius — https://basmilius.github.io/meteocons/ — MIT (assets/icons/LICENSE).
import * as b from 'react';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from 'react/jsx-runtime';
import { format as Ge } from 'date-fns';
import { fetchJSON as fdFetch, reportHealth as fdHealth } from './healthKit'; // ws7bf
const n = { jsx: _jsx, jsxs: _jsxs, Fragment: _Fragment };

// ===== ported from wave4/fd_weather/ws-widgets.js =====
// ws-widgets.js v3 — CURRENT = animated weather icon only (?v=ws5): sunny/day-night, partly-cloudy,
// cloudy/overcast, stormy, rain, tropical-storm (hurricane on sustained wind >= 39 mph). No temp/no data.
// Meteocons icons © Bas Milius — https://basmilius.github.io/meteocons/ — MIT license
// (assets preserved in wave4/fd_weather/assets/icons/, see assets/icons/LICENSE)
const WX_SVG = {
  'clear-day': '<svg preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;display:block" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512"><defs><linearGradient id="a" x1="150" x2="234" y1="119.2" y2="264.8" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fbbf24"/><stop offset=".5" stop-color="#fbbf24"/><stop offset="1" stop-color="#f59e0b"/></linearGradient><symbol id="b" viewBox="0 0 384 384"><circle cx="192" cy="192" r="84" fill="url(#a)" stroke="#f8af18" stroke-miterlimit="10" stroke-width="6"/><path fill="none" stroke="#fbbf24" stroke-linecap="round" stroke-miterlimit="10" stroke-width="24" d="M192 61.7V12m0 360v-49.7m92.2-222.5 35-35M64.8 319.2l35.1-35.1m0-184.4-35-35m254.5 254.5-35.1-35.1M61.7 192H12m360 0h-49.7"><animateTransform additive="sum" attributeName="transform" dur="6s" repeatCount="indefinite" type="rotate" values="0 192 192; 45 192 192"/></path></symbol></defs><use xlink:href="#b" width="384" height="384" transform="translate(64 64)"/></svg>',
  'clear-night': '<svg preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;display:block" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512"><defs><linearGradient id="a" x1="54.3" x2="187.2" y1="29" y2="259.1" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#86c3db"/><stop offset=".5" stop-color="#86c3db"/><stop offset="1" stop-color="#5eafcf"/></linearGradient><symbol id="b" overflow="visible" viewBox="0 0 270 270"><path fill="url(#a)" stroke="#72b9d5" stroke-linecap="round" stroke-linejoin="round" stroke-width="6" d="M252.3 168.6A133.4 133.4 0 01118 36.2 130.5 130.5 0 01122.5 3 133 133 0 003 134.6C3 207.7 63 267 137.2 267c62.5 0 114.8-42.2 129.8-99.2a135.6 135.6 0 01-14.8.8Z"><animateTransform additive="sum" attributeName="transform" dur="6s" repeatCount="indefinite" type="rotate" values="-15 135 135; 9 135 135; -15 135 135"/></path></symbol></defs><use xlink:href="#b" width="270" height="270" transform="translate(121 121)"/></svg>',
  'cloudy': '<svg preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;display:block" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512"><defs><linearGradient id="a" x1="99.5" x2="232.6" y1="30.7" y2="261.4" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f3f7fe"/><stop offset=".5" stop-color="#f3f7fe"/><stop offset="1" stop-color="#deeafb"/></linearGradient><symbol id="b" viewBox="0 0 350 222"><path fill="url(#a)" stroke="#e6effc" stroke-miterlimit="10" stroke-width="6" d="m291 107-2.5.1A83.9 83.9 0 00135.6 43 56 56 0 0051 91a56.6 56.6 0 00.8 9A60 60 0 0063 219l4-.2v.2h224a56 56 0 000-112Z"/></symbol></defs><use xlink:href="#b" width="350" height="222" transform="translate(81 145)"><animateTransform additive="sum" attributeName="transform" dur="6s" repeatCount="indefinite" type="translate" values="-18 0; 18 0; -18 0"/></use></svg>',
  'drizzle': '<svg preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;display:block" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512"><defs><linearGradient id="a" x1="99.5" x2="232.6" y1="30.7" y2="261.4" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f3f7fe"/><stop offset=".5" stop-color="#f3f7fe"/><stop offset="1" stop-color="#deeafb"/></linearGradient><linearGradient id="b" x1="1314.8" x2="1324.2" y1="-739.9" y2="-715.3" gradientTransform="rotate(-9 7682.04 6929.539)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#0b65ed"/><stop offset=".5" stop-color="#0a5ad4"/><stop offset="1" stop-color="#0950bc"/></linearGradient><linearGradient xlink:href="#b" id="c" x1="1370.1" x2="1379.5" y1="-731.1" y2="-706.5"/><linearGradient xlink:href="#b" id="d" x1="1425.4" x2="1434.9" y1="-722.4" y2="-697.8"/><symbol id="e" viewBox="0 0 350 222"><path fill="url(#a)" stroke="#e6effc" stroke-miterlimit="10" stroke-width="6" d="m291 107-2.5.1A83.9 83.9 0 00135.6 43 56 56 0 0051 91a56.6 56.6 0 00.8 9A60 60 0 0063 219l4-.2v.2h224a56 56 0 000-112Z"/></symbol></defs><use xlink:href="#e" width="350" height="222" transform="translate(81 145)"/><path fill="url(#b)" stroke="#0a5ad4" stroke-miterlimit="10" d="M200 376a8 8 0 01-8-8v-12a8 8 0 0116 0v12a8 8 0 01-8 8Z" opacity="0"><animateTransform id="x1" additive="sum" attributeName="transform" begin="0s; x1.end+1s" dur="1s" keyTimes="0; .25; 1" type="translate" values="0 -32; 0 -32; 0 120;"/><animate id="y1" attributeName="opacity" begin="0s; y1.end+1s" dur="1s" keyTimes="0; .25; 1" values="0; 1; 0"/></path><path fill="url(#c)" stroke="#0a5ad4" stroke-miterlimit="10" d="M256 376a8 8 0 01-8-8v-12a8 8 0 0116 0v12a8 8 0 01-8 8Z" opacity="0"><animateTransform id="x2" additive="sum" attributeName="transform" begin="1.34s; x2.end+1s" dur="1s" keyTimes="0; .25; 1" type="translate" values="0 -32; 0 -32; 0 120;"/><animate id="y2" attributeName="opacity" begin="1.34s; y2.end+1s" dur="1s" keyTimes="0; .25; 1" values="0; 1; 0"/></path><path fill="url(#d)" stroke="#0a5ad4" stroke-miterlimit="10" d="M312 376a8 8 0 01-8-8v-12a8 8 0 0116 0v12a8 8 0 01-8 8Z" opacity="0"><animateTransform id="x3" additive="sum" attributeName="transform" begin=".67s; x3.end+1s" dur="1s" keyTimes="0; .25; 1" type="translate" values="0 -32; 0 -32; 0 120;"/><animate id="y3" attributeName="opacity" begin=".67s; y3.end+1s" dur="1s" keyTimes="0; .25; 1" values="0; 1; 0"/></path></svg>',
  'fog-day': '<svg preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;display:block" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512"><defs><linearGradient id="a" x1="96" x2="168" y1="-2.4" y2="122.3" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#d4d7dd"/><stop offset=".5" stop-color="#d4d7dd"/><stop offset="1" stop-color="#bec1c6"/></linearGradient><linearGradient xlink:href="#a" id="b" x2="168" y1="-50.4" y2="74.3"/><linearGradient id="c" x1="150" x2="234" y1="119.2" y2="264.8" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fbbf24"/><stop offset=".5" stop-color="#fbbf24"/><stop offset="1" stop-color="#f59e0b"/></linearGradient><symbol id="e" viewBox="0 0 384 384"><circle cx="192" cy="192" r="84" fill="url(#c)" stroke="#f8af18" stroke-miterlimit="10" stroke-width="6"/><path fill="none" stroke="#fbbf24" stroke-linecap="round" stroke-miterlimit="10" stroke-width="24" d="M192 61.7V12m0 360v-49.7m92.2-222.5 35-35M64.8 319.2l35.1-35.1m0-184.4-35-35m254.5 254.5-35.1-35.1M61.7 192H12m360 0h-49.7"><animateTransform additive="sum" attributeName="transform" dur="6s" repeatCount="indefinite" type="rotate" values="0 192 192; 45 192 192"/></path></symbol><symbol id="f" overflow="visible" viewBox="0 0 264 72"><path fill="none" stroke="url(#a)" stroke-linecap="round" stroke-miterlimit="10" stroke-width="24" d="M12 60h240"><animateTransform additive="sum" attributeName="transform" dur="6s" repeatCount="indefinite" type="translate" values="-24 0; 24 0; -24 0"/></path><path fill="none" stroke="url(#b)" stroke-linecap="round" stroke-miterlimit="10" stroke-width="24" d="M12 12h240"><animateTransform additive="sum" attributeName="transform" dur="6s" repeatCount="indefinite" type="translate" values="24 0; -24 0; 24 0"/></path></symbol><clipPath id="d"><path fill="none" d="M0 0h512v306H0z"/></clipPath></defs><g clip-path="url(#d)"><use xlink:href="#e" width="384" height="384" transform="translate(64 100)"/></g><use xlink:href="#f" width="264" height="72" transform="translate(124 336)"/></svg>',
  'fog-night': '<svg preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;display:block" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512"><defs><linearGradient id="a" x1="96" x2="168" y1="-2.4" y2="122.3" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#d4d7dd"/><stop offset=".5" stop-color="#d4d7dd"/><stop offset="1" stop-color="#bec1c6"/></linearGradient><linearGradient xlink:href="#a" id="b" x2="168" y1="-50.4" y2="74.3"/><linearGradient id="c" x1="54.3" x2="187.2" y1="29" y2="259.1" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#86c3db"/><stop offset=".5" stop-color="#86c3db"/><stop offset="1" stop-color="#5eafcf"/></linearGradient><symbol id="e" viewBox="0 0 270 270"><path fill="url(#c)" stroke="#72b9d5" stroke-linecap="round" stroke-linejoin="round" stroke-width="6" d="M252.3 168.6A133.4 133.4 0 01118 36.2 130.5 130.5 0 01122.5 3 133 133 0 003 134.6C3 207.7 63 267 137.2 267c62.5 0 114.8-42.2 129.8-99.2a135.6 135.6 0 01-14.8.8Z"><animateTransform additive="sum" attributeName="transform" dur="6s" repeatCount="indefinite" type="rotate" values="-15 135 135; 9 135 135; -15 135 135"/></path></symbol><symbol id="f" overflow="visible" viewBox="0 0 264 72"><path fill="none" stroke="url(#a)" stroke-linecap="round" stroke-miterlimit="10" stroke-width="24" d="M12 60h240"><animateTransform additive="sum" attributeName="transform" dur="6s" repeatCount="indefinite" type="translate" values="-24 0; 24 0; -24 0"/></path><path fill="none" stroke="url(#b)" stroke-linecap="round" stroke-miterlimit="10" stroke-width="24" d="M12 12h240"><animateTransform additive="sum" attributeName="transform" dur="6s" repeatCount="indefinite" type="translate" values="24 0; -24 0; 24 0"/></path></symbol><clipPath id="d"><path fill="none" d="M0 0h512v306H0z"/></clipPath></defs><g clip-path="url(#d)"><use xlink:href="#e" width="270" height="270" transform="translate(121 121)"/></g><use xlink:href="#f" width="264" height="72" transform="translate(124 336)"/></svg>',
  'hurricane': '<svg preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;display:block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><linearGradient id="a" x1="175.8" x2="336.2" y1="117" y2="395" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#d4d7dd"/><stop offset=".5" stop-color="#d4d7dd"/><stop offset="1" stop-color="#bec1c6"/></linearGradient></defs><path fill="none" stroke="url(#a)" stroke-linecap="round" stroke-miterlimit="10" stroke-width="24" d="M344 256a88 88 0 11-88-88 88 88 0 0188 88ZM200 116.9l-3.8 7.7A269.7 269.7 0 00169 267h0m143.1 128 3.8-7.7A269.7 269.7 0 00343.2 245h0"><animateTransform additive="sum" attributeName="transform" dur="6s" repeatCount="indefinite" type="rotate" values="1440 256 256; 0 256 256"/></path></svg>',
  'overcast-day': '<svg preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;display:block" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512"><defs><symbol id="e" viewBox="0 0 196 196"><circle cx="98" cy="98" r="40" fill="url(#c)" stroke="#f8af18" stroke-miterlimit="10" stroke-width="4"/><path fill="none" stroke="#fbbf24" stroke-linecap="round" stroke-miterlimit="10" stroke-width="12" d="M98 31.4V6m0 184v-25.4M145.1 51l18-17.9M33 163l18-17.9M51 51 33 33m130.1 130.1-18-18M6 98h25.4M190 98h-25.4"><animateTransform additive="sum" attributeName="transform" dur="6s" repeatCount="indefinite" type="rotate" values="0 98 98; 45 98 98"/></path></symbol><symbol id="g" viewBox="0 0 200.3 126.1"><path fill="url(#b)" stroke="#848b98" stroke-miterlimit="10" d="M.5 93.2a32.4 32.4 0 0032.4 32.4h129.8v-.1l2.3.1a34.8 34.8 0 006.5-68.9 32.4 32.4 0 00-48.5-33 48.6 48.6 0 00-88.6 37.1h-1.5A32.4 32.4 0 00.5 93.1Z"/></symbol><symbol id="h" viewBox="0 0 350 222"><path fill="url(#a)" stroke="#e6effc" stroke-miterlimit="10" stroke-width="6" d="m291 107-2.5.1A83.9 83.9 0 00135.6 43 56 56 0 0051 91a56.6 56.6 0 00.8 9A60 60 0 0063 219l4-.2v.2h224a56 56 0 000-112Z"/></symbol><symbol id="f" overflow="visible" viewBox="0 0 398 222"><use xlink:href="#g" width="200.3" height="126.1" transform="translate(198 27)"><animateTransform additive="sum" attributeName="transform" dur="6s" repeatCount="indefinite" type="translate" values="-9 0; 9 0; -9 0"/></use><use xlink:href="#h" width="350" height="222"><animateTransform additive="sum" attributeName="transform" dur="6s" repeatCount="indefinite" type="translate" values="-18 0; 18 0; -18 0"/></use></symbol><symbol id="d" overflow="visible" viewBox="0 0 410.8 258"><use xlink:href="#e" width="196" height="196"/><use xlink:href="#f" width="398" height="222" transform="translate(12.84 36)"/></symbol><linearGradient id="a" x1="99.5" x2="232.6" y1="30.7" y2="261.4" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f3f7fe"/><stop offset=".5" stop-color="#f3f7fe"/><stop offset="1" stop-color="#deeafb"/></linearGradient><linearGradient id="b" x1="52.7" x2="133.4" y1="9.6" y2="149.3" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#9ca3af"/><stop offset=".5" stop-color="#9ca3af"/><stop offset="1" stop-color="#6b7280"/></linearGradient><linearGradient id="c" x1="78" x2="118" y1="63.4" y2="132.7" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fbbf24"/><stop offset=".5" stop-color="#fbbf24"/><stop offset="1" stop-color="#f59e0b"/></linearGradient></defs><use xlink:href="#d" width="410.8" height="258" transform="translate(56 109)"/></svg>',
  'overcast-night': '<svg preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;display:block" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512"><defs><symbol id="e" viewBox="0 0 172 172"><path fill="url(#c)" stroke="#72b9d5" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M160.6 107.4a84.8 84.8 0 01-85.4-84.3A83.3 83.3 0 0178 2 84.7 84.7 0 002 85.7 84.8 84.8 0 0087.4 170a85.2 85.2 0 0082.6-63.1 88 88 0 01-9.4.5Z"><animateTransform additive="sum" attributeName="transform" dur="6s" repeatCount="indefinite" type="rotate" values="-15 86 86; 9 86 86; -15 86 86"/></path></symbol><symbol id="g" viewBox="0 0 200.3 126.1"><path fill="url(#b)" stroke="#848b98" stroke-miterlimit="10" d="M.5 93.2a32.4 32.4 0 0032.4 32.4h129.8v-.1l2.3.1a34.8 34.8 0 006.5-68.9 32.4 32.4 0 00-48.5-33 48.6 48.6 0 00-88.6 37.1h-1.5A32.4 32.4 0 00.5 93.1Z"/></symbol><symbol id="h" viewBox="0 0 350 222"><path fill="url(#a)" stroke="#e6effc" stroke-miterlimit="10" stroke-width="6" d="m291 107-2.5.1A83.9 83.9 0 00135.6 43 56 56 0 0051 91a56.6 56.6 0 00.8 9A60 60 0 0063 219l4-.2v.2h224a56 56 0 000-112Z"/></symbol><symbol id="f" overflow="visible" viewBox="0 0 398 222"><use xlink:href="#g" width="200.3" height="126.1" transform="translate(198 27)"><animateTransform additive="sum" attributeName="transform" dur="6s" repeatCount="indefinite" type="translate" values="-9 0; 9 0; -9 0"/></use><use xlink:href="#h" width="350" height="222"><animateTransform additive="sum" attributeName="transform" dur="6s" repeatCount="indefinite" type="translate" values="-18 0; 18 0; -18 0"/></use></symbol><symbol id="d" overflow="visible" viewBox="0 0 398.8 246"><use xlink:href="#e" width="172" height="172"/><use xlink:href="#f" width="398" height="222" transform="translate(.84 24)"/></symbol><linearGradient id="a" x1="99.5" x2="232.6" y1="30.7" y2="261.4" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f3f7fe"/><stop offset=".5" stop-color="#f3f7fe"/><stop offset="1" stop-color="#deeafb"/></linearGradient><linearGradient id="b" x1="52.7" x2="133.4" y1="9.6" y2="149.3" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#9ca3af"/><stop offset=".5" stop-color="#9ca3af"/><stop offset="1" stop-color="#6b7280"/></linearGradient><linearGradient id="c" x1="34.7" x2="119.2" y1="18.6" y2="165" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#86c3db"/><stop offset=".5" stop-color="#86c3db"/><stop offset="1" stop-color="#5eafcf"/></linearGradient></defs><use xlink:href="#d" width="398.8" height="246" transform="translate(68 121)"/></svg>',
  'partly-cloudy-day': '<svg preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;display:block" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512"><defs><symbol id="d" viewBox="0 0 196 196"><circle cx="98" cy="98" r="40" fill="url(#b)" stroke="#f8af18" stroke-miterlimit="10" stroke-width="4"/><path fill="none" stroke="#fbbf24" stroke-linecap="round" stroke-miterlimit="10" stroke-width="12" d="M98 31.4V6m0 184v-25.4M145.1 51l18-17.9M33 163l18-17.9M51 51 33 33m130.1 130.1-18-18M6 98h25.4M190 98h-25.4"><animateTransform additive="sum" attributeName="transform" dur="6s" repeatCount="indefinite" type="rotate" values="0 98 98; 45 98 98"/></path></symbol><symbol id="e" viewBox="0 0 350 222"><path fill="url(#a)" stroke="#e6effc" stroke-miterlimit="10" stroke-width="6" d="m291 107-2.5.1A83.9 83.9 0 00135.6 43 56 56 0 0051 91a56.6 56.6 0 00.8 9A60 60 0 0063 219l4-.2v.2h224a56 56 0 000-112Z"/></symbol><symbol id="c" viewBox="0 0 363 258"><use xlink:href="#d" width="196" height="196"/><use xlink:href="#e" width="350" height="222" transform="translate(13 36)"/></symbol><linearGradient id="a" x1="99.5" x2="232.6" y1="30.7" y2="261.4" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f3f7fe"/><stop offset=".5" stop-color="#f3f7fe"/><stop offset="1" stop-color="#deeafb"/></linearGradient><linearGradient id="b" x1="78" x2="118" y1="63.4" y2="132.7" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fbbf24"/><stop offset=".5" stop-color="#fbbf24"/><stop offset="1" stop-color="#f59e0b"/></linearGradient></defs><use xlink:href="#c" width="363" height="258" transform="translate(68 109)"/></svg>',
  'partly-cloudy-night': '<svg preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;display:block" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512"><defs><symbol id="d" viewBox="0 0 172 172"><path fill="url(#b)" stroke="#72b9d5" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M160.6 107.4a84.8 84.8 0 01-85.4-84.3A83.3 83.3 0 0178 2 84.7 84.7 0 002 85.7 84.8 84.8 0 0087.4 170a85.2 85.2 0 0082.6-63.1 88 88 0 01-9.4.5Z"><animateTransform additive="sum" attributeName="transform" dur="6s" repeatCount="indefinite" type="rotate" values="-15 86 86; 9 86 86; -15 86 86"/></path></symbol><symbol id="e" viewBox="0 0 350 222"><path fill="url(#a)" stroke="#e6effc" stroke-miterlimit="10" stroke-width="6" d="m291 107-2.5.1A83.9 83.9 0 00135.6 43 56 56 0 0051 91a56.6 56.6 0 00.8 9A60 60 0 0063 219l4-.2v.2h224a56 56 0 000-112Z"/></symbol><symbol id="c" viewBox="0 0 351 246"><use xlink:href="#d" width="172" height="172"/><use xlink:href="#e" width="350" height="222" transform="translate(1 24)"/></symbol><linearGradient id="a" x1="99.5" x2="232.6" y1="30.7" y2="261.4" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f3f7fe"/><stop offset=".5" stop-color="#f3f7fe"/><stop offset="1" stop-color="#deeafb"/></linearGradient><linearGradient id="b" x1="34.7" x2="119.2" y1="18.6" y2="165" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#86c3db"/><stop offset=".5" stop-color="#86c3db"/><stop offset="1" stop-color="#5eafcf"/></linearGradient></defs><use xlink:href="#c" width="351" height="246" transform="translate(80 121)"/></svg>',
  'rain': '<svg preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;display:block" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512"><defs><linearGradient id="a" x1="99.5" x2="232.6" y1="30.7" y2="261.4" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f3f7fe"/><stop offset=".5" stop-color="#f3f7fe"/><stop offset="1" stop-color="#deeafb"/></linearGradient><linearGradient id="b" x1="1381.3" x2="1399.5" y1="-1144.7" y2="-1097.4" gradientTransform="rotate(-9 8002.567 8233.063)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#0b65ed"/><stop offset=".5" stop-color="#0a5ad4"/><stop offset="1" stop-color="#0950bc"/></linearGradient><linearGradient xlink:href="#b" id="c" x1="1436.7" x2="1454.9" y1="-1137" y2="-1089.7" gradientTransform="rotate(-9 8009.537 8233.037)"/><linearGradient xlink:href="#b" id="d" x1="1492.1" x2="1510.3" y1="-1129.3" y2="-1082.1" gradientTransform="rotate(-9 8016.566 8233.078)"/><symbol id="e" viewBox="0 0 350 222"><path fill="url(#a)" stroke="#e6effc" stroke-miterlimit="10" stroke-width="6" d="m291 107-2.5.1A83.9 83.9 0 00135.6 43 56 56 0 0051 91a56.6 56.6 0 00.8 9A60 60 0 0063 219l4-.2v.2h224a56 56 0 000-112Z"/></symbol><symbol id="f" overflow="visible" viewBox="0 0 129 57"><path fill="url(#b)" stroke="#0a5ad4" stroke-miterlimit="10" d="M8.5 56.5a8 8 0 01-8-8v-40a8 8 0 0116 0v40a8 8 0 01-8 8Z" opacity="0"><animateTransform id="x1" additive="sum" attributeName="transform" begin="0s; x1.end+.33s" dur=".67s" type="translate" values="0 -60; 0 60"/><animate id="y1" attributeName="opacity" begin="0s; y1.end+.33s" dur=".67s" keyTimes="0; .25; 1" values="0; 1; 0"/></path><path fill="url(#c)" stroke="#0a5ad4" stroke-miterlimit="10" d="M64.5 56.5a8 8 0 01-8-8v-40a8 8 0 0116 0v40a8 8 0 01-8 8Z" opacity="0"><animateTransform id="x2" additive="sum" attributeName="transform" begin=".33s; x2.end+.33s" dur=".67s" type="translate" values="0 -60; 0 60"/><animate id="y2" attributeName="opacity" begin=".33s; y2.end+.33s" dur=".67s" keyTimes="0; .25; 1" values="0; 1; 0"/></path><path fill="url(#d)" stroke="#0a5ad4" stroke-miterlimit="10" d="M120.5 56.5a8 8 0 01-8-8v-40a8 8 0 0116 0v40a8 8 0 01-8 8Z" opacity="0"><animateTransform id="x3" additive="sum" attributeName="transform" begin="-.33s; x3.end+.33s" dur=".67s" type="translate" values="0 -60; 0 60"/><animate id="y3" attributeName="opacity" begin="-.33s; y3.end+.33s" dur=".67s" keyTimes="0; .25; 1" values="0; 1; 0"/></path></symbol></defs><use xlink:href="#e" width="350" height="222" transform="translate(81 145)"/><use xlink:href="#f" width="129" height="57" transform="translate(191.5 343.5)"/></svg>',
  'raindrops': '<svg preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;display:block" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512"><defs><linearGradient id="a" x1="14.8" x2="124.2" y1="42.3" y2="231.7" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#3392d6"/><stop offset=".5" stop-color="#3392d6"/><stop offset="1" stop-color="#2477b2"/></linearGradient><symbol id="b" viewBox="0 0 164 245.6"><path fill="url(#a)" stroke="#2885c7" stroke-miterlimit="10" stroke-width="4" d="M82 3.6c-48.7 72-80 117-80 160.7s35.8 79.3 80 79.3 80-35.5 80-79.3S130.7 75.5 82 3.6Z"/></symbol></defs><use xlink:href="#b" width="164" height="245.6" transform="translate(128 133.43)"><animateTransform additive="sum" attributeName="transform" calcMode="spline" dur="6s" keySplines=".42, 0, .58, 1; .42, 0, .58, 1" repeatCount="indefinite" type="scale" values="1 1; 1 .9; 1 1"/></use><use xlink:href="#b" width="164" height="245.6" transform="translate(220 133.43)"><animateTransform additive="sum" attributeName="transform" calcMode="spline" dur="6s" keySplines=".42, 0, .58, 1; .42, 0, .58, 1" repeatCount="indefinite" type="scale" values="1 .9; 1 1; 1 .9"/></use></svg>',
  'sleet': '<svg preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;display:block" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512"><defs><linearGradient id="a" x1="99.5" x2="232.6" y1="30.7" y2="261.4" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f3f7fe"/><stop offset=".5" stop-color="#f3f7fe"/><stop offset="1" stop-color="#deeafb"/></linearGradient><linearGradient id="b" x1="1399.3" x2="1408.7" y1="-1137.3" y2="-1112.7" gradientTransform="rotate(-9 8016.182 8229.021)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#0b65ed"/><stop offset=".5" stop-color="#0a5ad4"/><stop offset="1" stop-color="#0950bc"/></linearGradient><linearGradient xlink:href="#b" id="c" x1="1454.6" x2="1464" y1="-1128.6" y2="-1104"/><linearGradient xlink:href="#b" id="d" x1="1509.9" x2="1519.3" y1="-1119.8" y2="-1095.2"/><linearGradient id="e" x1="11.4" x2="32.8" y1="5.9" y2="43.1" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#86c3db"/><stop offset=".5" stop-color="#86c3db"/><stop offset="1" stop-color="#5eafcf"/></linearGradient><linearGradient xlink:href="#e" id="f" x1="67.4" x2="88.8" y1="5.9" y2="43.1"/><linearGradient xlink:href="#e" id="g" x1="123.4" x2="144.8" y1="5.9" y2="43.1"/><symbol id="h" viewBox="0 0 350 222"><path fill="url(#a)" stroke="#e6effc" stroke-miterlimit="10" stroke-width="6" d="m291 107-2.5.1A83.9 83.9 0 00135.6 43 56 56 0 0051 91a56.6 56.6 0 00.8 9A60 60 0 0063 219l4-.2v.2h224a56 56 0 000-112Z"/></symbol><symbol id="j" overflow="visible" viewBox="0 0 156.2 49"><g><path fill="url(#e)" stroke="#86c3db" stroke-miterlimit="10" d="m41.7 31-5.8-3.3a13.7 13.7 0 000-6.5l5.8-3.2a4 4 0 001.5-5.5 4 4 0 00-5.6-1.5l-5.8 3.3a13.6 13.6 0 00-2.6-2 13.8 13.8 0 00-3-1.3V4.5a4 4 0 00-8.1 0v6.6a14.3 14.3 0 00-5.7 3.2L6.6 11A4 4 0 001 12.5 4 4 0 002.5 18l5.8 3.3a13.7 13.7 0 000 6.5L2.5 31A4 4 0 001 36.5a4 4 0 003.5 2 4 4 0 002-.5l5.8-3.3a13.6 13.6 0 002.6 2 13.8 13.8 0 003 1.2v6.6a4 4 0 008.2 0v-6.6a14.2 14.2 0 005.6-3.2l6 3.3a4 4 0 002 .5 4 4 0 003.4-2 4 4 0 00-1.4-5.5ZM19 29.7a6 6 0 01-2.3-8.2 6.1 6.1 0 015.3-3 6.2 6.2 0 013 .8 6 6 0 012.2 8.2 6.1 6.1 0 01-8.2 2.2Z" opacity="0"><animateTransform additive="sum" attributeName="transform" dur="6s" repeatCount="indefinite" type="rotate" values="0 24 24; 360 24 24"/><animate id="t1" attributeName="opacity" begin="0s; t1.end+1s" dur="2s" keyTimes="0; .17; .83; 1" values="0; 1; 1; 0"/></path><animateTransform id="s1" additive="sum" attributeName="transform" begin="0s; s1.end+1s" dur="2s" type="translate" values="0 -36; 0 92;"/></g><g><path fill="url(#f)" stroke="#86c3db" stroke-miterlimit="10" d="m97.7 31-5.8-3.3a13.7 13.7 0 000-6.5l5.8-3.2a4 4 0 001.5-5.5 4 4 0 00-5.6-1.5l-5.8 3.3a13.6 13.6 0 00-2.6-2 13.8 13.8 0 00-3-1.3V4.5a4 4 0 00-8.1 0v6.6a14.3 14.3 0 00-5.7 3.2L62.6 11a4 4 0 00-5.6 1.5 4 4 0 001.5 5.5l5.8 3.3a13.7 13.7 0 000 6.5L58.5 31a4 4 0 00-1.5 5.5 4 4 0 003.5 2 4 4 0 002-.5l5.8-3.3a13.6 13.6 0 002.7 2 13.8 13.8 0 003 1.2v6.6a4 4 0 008 0v-6.6a14.2 14.2 0 005.7-3.2l6 3.3a4 4 0 002 .5 4 4 0 003.4-2 4 4 0 00-1.4-5.5ZM75 29.7a6 6 0 01-2.3-8.2 6.1 6.1 0 015.3-3 6.2 6.2 0 013 .8 6 6 0 012.2 8.2 6.1 6.1 0 01-8.2 2.2Z" opacity="0"><animateTransform additive="sum" attributeName="transform" dur="6s" repeatCount="indefinite" type="rotate" values="0 80 24; 360 80 24"/><animate id="t2" attributeName="opacity" begin="-.83s; t2.end+1s" dur="2s" keyTimes="0; .17; .83; 1" values="0; 1; 1; 0"/></path><animateTransform id="s2" additive="sum" attributeName="transform" begin="-.83s; s2.end+1s" dur="2s" type="translate" values="0 -36; 0 92;"/></g><g><path fill="url(#g)" stroke="#86c3db" stroke-miterlimit="10" d="m153.7 31-5.8-3.3a13.7 13.7 0 000-6.5l5.8-3.2a4 4 0 001.5-5.5 4 4 0 00-5.6-1.5l-5.8 3.3a13.6 13.6 0 00-2.6-2 13.8 13.8 0 00-3-1.3V4.5a4 4 0 00-8.1 0v6.6a14.3 14.3 0 00-5.7 3.2l-5.8-3.3a4 4 0 00-5.6 1.5 4 4 0 001.5 5.5l5.8 3.3a13.7 13.7 0 000 6.5l-5.8 3.2a4 4 0 00-1.5 5.5 4 4 0 003.5 2 4 4 0 002-.5l5.8-3.3a13.6 13.6 0 002.7 2 13.8 13.8 0 003 1.2v6.6a4 4 0 008 0v-6.6a14.2 14.2 0 005.7-3.2l5.8 3.3a4 4 0 002 .5 4 4 0 003.5-2 4 4 0 00-1.3-5.5ZM131 29.7a6 6 0 01-2.3-8.2 6.1 6.1 0 015.3-3 6.2 6.2 0 013 .8 6 6 0 012.2 8.2 6.1 6.1 0 01-8.2 2.2Z" opacity="0"><animateTransform additive="sum" attributeName="transform" dur="6s" repeatCount="indefinite" type="rotate" values="0 136 24; 360 136 24"/><animate id="t3" attributeName="opacity" begin=".83s; t3.end+1s" dur="2s" keyTimes="0; .17; .83; 1" values="0; 1; 1; 0"/></path><animateTransform id="s3" additive="sum" attributeName="transform" begin=".83s; s3.end+1s" dur="2s" type="translate" values="0 -36; 0 92;"/></g></symbol><symbol id="i" overflow="visible" viewBox="0 0 156.2 49"><use xlink:href="#j" width="156.2" height="49"/><path fill="url(#b)" stroke="#0a5ad4" stroke-miterlimit="10" d="M22.1 38.5a8 8 0 01-8-8v-12a8 8 0 0116 0v12a8 8 0 01-8 8Z" opacity="0"><animateTransform id="x1" additive="sum" attributeName="transform" begin="0s; x1.end+1s" dur="1s" keyTimes="0; .25; 1" type="translate" values="0 -32; 0 -32; 0 120;"/><animate id="y1" attributeName="opacity" begin="0s; y1.end+1s" dur="1s" keyTimes="0; .25; 1" values="0; 1; 0"/></path><path fill="url(#c)" stroke="#0a5ad4" stroke-miterlimit="10" d="M78.1 38.5a8 8 0 01-8-8v-12a8 8 0 0116 0v12a8 8 0 01-8 8Z" opacity="0"><animateTransform id="x2" additive="sum" attributeName="transform" begin="1.34s; x2.end+1s" dur="1s" keyTimes="0; .25; 1" type="translate" values="0 -32; 0 -32; 0 120;"/><animate id="y2" attributeName="opacity" begin="1.34s; y2.end+1s" dur="1s" keyTimes="0; .25; 1" values="0; 1; 0"/></path><path fill="url(#d)" stroke="#0a5ad4" stroke-miterlimit="10" d="M134.1 38.5a8 8 0 01-8-8v-12a8 8 0 0116 0v12a8 8 0 01-8 8Z" opacity="0"><animateTransform id="x3" additive="sum" attributeName="transform" begin=".67s; x3.end+1s" dur="1s" keyTimes="0; .25; 1" type="translate" values="0 -32; 0 -32; 0 120;"/><animate id="y3" attributeName="opacity" begin=".67s; y3.end+1s" dur="1s" keyTimes="0; .25; 1" values="0; 1; 0"/></path></symbol></defs><use xlink:href="#h" width="350" height="222" transform="translate(81 145)"/><use xlink:href="#i" width="156.2" height="49" transform="translate(177.9 337.5)"/></svg>',
  'snow': '<svg preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;display:block" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512"><defs><linearGradient id="a" x1="99.5" x2="232.6" y1="30.7" y2="261.4" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f3f7fe"/><stop offset=".5" stop-color="#f3f7fe"/><stop offset="1" stop-color="#deeafb"/></linearGradient><linearGradient id="b" x1="11.4" x2="32.8" y1="5.9" y2="43.1" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#86c3db"/><stop offset=".5" stop-color="#86c3db"/><stop offset="1" stop-color="#5eafcf"/></linearGradient><linearGradient xlink:href="#b" id="c" x1="67.4" x2="88.8" y1="5.9" y2="43.1"/><linearGradient xlink:href="#b" id="d" x1="123.4" x2="144.8" y1="5.9" y2="43.1"/><symbol id="e" viewBox="0 0 350 222"><path fill="url(#a)" stroke="#e6effc" stroke-miterlimit="10" stroke-width="6" d="m291 107-2.5.1A83.9 83.9 0 00135.6 43 56 56 0 0051 91a56.6 56.6 0 00.8 9A60 60 0 0063 219l4-.2v.2h224a56 56 0 000-112Z"/></symbol><symbol id="f" overflow="visible" viewBox="0 0 156.2 49"><g><path fill="url(#b)" stroke="#86c3db" stroke-miterlimit="10" d="m41.7 31-5.8-3.3a13.7 13.7 0 000-6.5l5.8-3.2a4 4 0 001.5-5.5 4 4 0 00-5.6-1.5l-5.8 3.3a13.6 13.6 0 00-2.6-2 13.8 13.8 0 00-3-1.3V4.5a4 4 0 00-8.1 0v6.6a14.3 14.3 0 00-5.7 3.2L6.6 11A4 4 0 001 12.5 4 4 0 002.5 18l5.8 3.3a13.7 13.7 0 000 6.5L2.5 31A4 4 0 001 36.5a4 4 0 003.5 2 4 4 0 002-.5l5.8-3.3a13.6 13.6 0 002.6 2 13.8 13.8 0 003 1.2v6.6a4 4 0 008.2 0v-6.6a14.2 14.2 0 005.6-3.2l6 3.3a4 4 0 002 .5 4 4 0 003.4-2 4 4 0 00-1.4-5.5ZM19 29.7a6 6 0 01-2.3-8.2 6.1 6.1 0 015.3-3 6.2 6.2 0 013 .8 6 6 0 012.2 8.2 6.1 6.1 0 01-8.2 2.2Z" opacity="0"><animateTransform additive="sum" attributeName="transform" dur="6s" repeatCount="indefinite" type="rotate" values="0 24 24; 360 24 24"/><animate id="t1" attributeName="opacity" begin="0s; t1.end+1s" dur="2s" keyTimes="0; .17; .83; 1" values="0; 1; 1; 0"/></path><animateTransform id="s1" additive="sum" attributeName="transform" begin="0s; s1.end+1s" dur="2s" type="translate" values="0 -36; 0 92;"/></g><g><path fill="url(#c)" stroke="#86c3db" stroke-miterlimit="10" d="m97.7 31-5.8-3.3a13.7 13.7 0 000-6.5l5.8-3.2a4 4 0 001.5-5.5 4 4 0 00-5.6-1.5l-5.8 3.3a13.6 13.6 0 00-2.6-2 13.8 13.8 0 00-3-1.3V4.5a4 4 0 00-8.1 0v6.6a14.3 14.3 0 00-5.7 3.2L62.6 11a4 4 0 00-5.6 1.5 4 4 0 001.5 5.5l5.8 3.3a13.7 13.7 0 000 6.5L58.5 31a4 4 0 00-1.5 5.5 4 4 0 003.5 2 4 4 0 002-.5l5.8-3.3a13.6 13.6 0 002.7 2 13.8 13.8 0 003 1.2v6.6a4 4 0 008 0v-6.6a14.2 14.2 0 005.7-3.2l6 3.3a4 4 0 002 .5 4 4 0 003.4-2 4 4 0 00-1.4-5.5ZM75 29.7a6 6 0 01-2.3-8.2 6.1 6.1 0 015.3-3 6.2 6.2 0 013 .8 6 6 0 012.2 8.2 6.1 6.1 0 01-8.2 2.2Z" opacity="0"><animateTransform additive="sum" attributeName="transform" dur="6s" repeatCount="indefinite" type="rotate" values="0 80 24; 360 80 24"/><animate id="t2" attributeName="opacity" begin="-.83s; t2.end+1s" dur="2s" keyTimes="0; .17; .83; 1" values="0; 1; 1; 0"/></path><animateTransform id="s2" additive="sum" attributeName="transform" begin="-.83s; s2.end+1s" dur="2s" type="translate" values="0 -36; 0 92;"/></g><g><path fill="url(#d)" stroke="#86c3db" stroke-miterlimit="10" d="m153.7 31-5.8-3.3a13.7 13.7 0 000-6.5l5.8-3.2a4 4 0 001.5-5.5 4 4 0 00-5.6-1.5l-5.8 3.3a13.6 13.6 0 00-2.6-2 13.8 13.8 0 00-3-1.3V4.5a4 4 0 00-8.1 0v6.6a14.3 14.3 0 00-5.7 3.2l-5.8-3.3a4 4 0 00-5.6 1.5 4 4 0 001.5 5.5l5.8 3.3a13.7 13.7 0 000 6.5l-5.8 3.2a4 4 0 00-1.5 5.5 4 4 0 003.5 2 4 4 0 002-.5l5.8-3.3a13.6 13.6 0 002.7 2 13.8 13.8 0 003 1.2v6.6a4 4 0 008 0v-6.6a14.2 14.2 0 005.7-3.2l5.8 3.3a4 4 0 002 .5 4 4 0 003.5-2 4 4 0 00-1.3-5.5ZM131 29.7a6 6 0 01-2.3-8.2 6.1 6.1 0 015.3-3 6.2 6.2 0 013 .8 6 6 0 012.2 8.2 6.1 6.1 0 01-8.2 2.2Z" opacity="0"><animateTransform additive="sum" attributeName="transform" dur="6s" repeatCount="indefinite" type="rotate" values="0 136 24; 360 136 24"/><animate id="t3" attributeName="opacity" begin=".83s; t3.end+1s" dur="2s" keyTimes="0; .17; .83; 1" values="0; 1; 1; 0"/></path><animateTransform id="s3" additive="sum" attributeName="transform" begin=".83s; s3.end+1s" dur="2s" type="translate" values="0 -36; 0 92;"/></g></symbol></defs><use xlink:href="#e" width="350" height="222" transform="translate(81 145)"/><use xlink:href="#f" width="156.2" height="49" transform="translate(177.9 337.5)"/></svg>',
  'thermometer': '<svg preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;display:block" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512"><defs><symbol id="d" viewBox="0 0 72 168"><circle cx="36" cy="132" r="36" fill="#ef4444"/><path fill="none" stroke="#ef4444" stroke-linecap="round" stroke-miterlimit="10" stroke-width="24" d="M36 12v120"><animateTransform attributeName="transform" calcMode="spline" dur="1s" keySplines=".42, 0, .58, 1; .42, 0, .58, 1" repeatCount="indefinite" type="translate" values="0 0; 0 18; 0 0"/></path></symbol><symbol id="e" viewBox="0 0 118 278"><path fill="url(#a)" stroke="url(#b)" stroke-linecap="round" stroke-linejoin="round" stroke-width="6" d="M115 218.2c0 31.4-25 56.8-56 56.8S3 249.6 3 218.2a57 57 0 0124-46.6V35.5a32 32 0 1164 0v136a57 57 0 0124 46.7ZM63 83h28M63 51h28m-28 64h28"/></symbol><symbol id="c" viewBox="0 0 118 278"><use xlink:href="#d" width="72" height="168" transform="translate(23 87)"/><use xlink:href="#e" width="118" height="278"/></symbol><linearGradient id="a" x1="-7.2" x2="116.4" y1="36.3" y2="250.4" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#515a69" stop-opacity=".1"/><stop offset=".5" stop-color="#6b7280" stop-opacity=".1"/><stop offset="1" stop-color="#384354" stop-opacity=".1"/></linearGradient><linearGradient id="b" x1="-8.7" x2="117.9" y1="33.7" y2="253" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#d4d7dd"/><stop offset=".5" stop-color="#d4d7dd"/><stop offset="1" stop-color="#bec1c6"/></linearGradient></defs><use xlink:href="#c" width="118" height="278" transform="translate(197 117)"/></svg>',
  'thunderstorms-day': '<svg preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;display:block" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512"><defs><symbol id="e" viewBox="0 0 196 196"><circle cx="98" cy="98" r="40" fill="url(#c)" stroke="#f8af18" stroke-miterlimit="10" stroke-width="4"/><path fill="none" stroke="#fbbf24" stroke-linecap="round" stroke-miterlimit="10" stroke-width="12" d="M98 31.4V6m0 184v-25.4M145.1 51l18-17.9M33 163l18-17.9M51 51 33 33m130.1 130.1-18-18M6 98h25.4M190 98h-25.4"><animateTransform additive="sum" attributeName="transform" dur="6s" repeatCount="indefinite" type="rotate" values="0 98 98; 45 98 98"/></path></symbol><symbol id="f" viewBox="0 0 350 222"><path fill="url(#a)" stroke="#e6effc" stroke-miterlimit="10" stroke-width="6" d="m291 107-2.5.1A83.9 83.9 0 00135.6 43 56 56 0 0051 91a56.6 56.6 0 00.8 9A60 60 0 0063 219l4-.2v.2h224a56 56 0 000-112Z"/></symbol><symbol id="d" viewBox="0 0 363 258"><use xlink:href="#e" width="196" height="196"/><use xlink:href="#f" width="350" height="222" transform="translate(13 36)"/></symbol><symbol id="g" viewBox="0 0 102.7 186.8"><path fill="url(#b)" stroke="#f6a823" stroke-miterlimit="10" stroke-width="4" d="m34.8 2-32 96h32l-16 80 80-112h-48l32-64h-48z"><animate id="x1" attributeName="opacity" begin="0s; x1.end+.67s" dur="1.33s" keyTimes="0; .38; .5; .63; .75; .86; .94; 1" values="1; 1; 0; 1; 0; 1; 0; 1"/></path></symbol><linearGradient id="a" x1="99.5" x2="232.6" y1="30.7" y2="261.4" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f3f7fe"/><stop offset=".5" stop-color="#f3f7fe"/><stop offset="1" stop-color="#deeafb"/></linearGradient><linearGradient id="b" x1="8.7" x2="80.9" y1="17.1" y2="142.1" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f7b23b"/><stop offset=".5" stop-color="#f7b23b"/><stop offset="1" stop-color="#f59e0b"/></linearGradient><linearGradient id="c" x1="78" x2="118" y1="63.4" y2="132.7" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fbbf24"/><stop offset=".5" stop-color="#fbbf24"/><stop offset="1" stop-color="#f59e0b"/></linearGradient></defs><use xlink:href="#d" width="363" height="258" transform="translate(68 109)"/><use xlink:href="#g" width="102.7" height="186.7" transform="translate(205.23 291)"/></svg>',
  'thunderstorms-night': '<svg preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;display:block" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512"><defs><symbol id="e" viewBox="0 0 172 172"><path fill="url(#c)" stroke="#72b9d5" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M160.6 107.4a84.8 84.8 0 01-85.4-84.3A83.3 83.3 0 0178 2 84.7 84.7 0 002 85.7 84.8 84.8 0 0087.4 170a85.2 85.2 0 0082.6-63.1 88 88 0 01-9.4.5Z"><animateTransform additive="sum" attributeName="transform" dur="6s" repeatCount="indefinite" type="rotate" values="-15 86 86; 9 86 86; -15 86 86"/></path></symbol><symbol id="f" viewBox="0 0 350 222"><path fill="url(#a)" stroke="#e6effc" stroke-miterlimit="10" stroke-width="6" d="m291 107-2.5.1A83.9 83.9 0 00135.6 43 56 56 0 0051 91a56.6 56.6 0 00.8 9A60 60 0 0063 219l4-.2v.2h224a56 56 0 000-112Z"/></symbol><symbol id="d" viewBox="0 0 351 246"><use xlink:href="#e" width="172" height="172"/><use xlink:href="#f" width="350" height="222" transform="translate(1 24)"/></symbol><symbol id="g" viewBox="0 0 102.7 186.8"><path fill="url(#b)" stroke="#f6a823" stroke-miterlimit="10" stroke-width="4" d="m34.8 2-32 96h32l-16 80 80-112h-48l32-64h-48z"><animate id="x1" attributeName="opacity" begin="0s; x1.end+.67s" dur="1.33s" keyTimes="0; .38; .5; .63; .75; .86; .94; 1" values="1; 1; 0; 1; 0; 1; 0; 1"/></path></symbol><linearGradient id="a" x1="99.5" x2="232.6" y1="30.7" y2="261.4" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f3f7fe"/><stop offset=".5" stop-color="#f3f7fe"/><stop offset="1" stop-color="#deeafb"/></linearGradient><linearGradient id="b" x1="8.7" x2="80.9" y1="17.1" y2="142.1" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f7b23b"/><stop offset=".5" stop-color="#f7b23b"/><stop offset="1" stop-color="#f59e0b"/></linearGradient><linearGradient id="c" x1="34.7" x2="119.2" y1="18.6" y2="165" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#86c3db"/><stop offset=".5" stop-color="#86c3db"/><stop offset="1" stop-color="#5eafcf"/></linearGradient></defs><use xlink:href="#d" width="351" height="246" transform="translate(80 121)"/><use xlink:href="#g" width="102.7" height="186.7" transform="translate(205.23 291)"/></svg>'
};
const WS_CSS = '@keyframes wsDrift{from{transform:translate3d(-6%,0,0)}to{transform:translate3d(6%,-2%,0)}}@keyframes wsRainPos{from{background-position:0px 0px}to{background-position:-9px 140px}}@keyframes wsSnowFall{from{transform:translate3d(0,-9cqh,0)}to{transform:translate3d(2cqh,64cqh,0)}}@keyframes wsTwinkle{0%,100%{opacity:.18}50%{opacity:.9}}@keyframes wsFlash{0%,93%,100%{opacity:0}94%{opacity:.30}96%{opacity:.04}97%{opacity:.18}98%{opacity:0}}@keyframes wsPulse{0%,100%{box-shadow:0 0 0 0 rgba(248,113,113,.45)}50%{box-shadow:0 0 0 4px rgba(248,113,113,.16)}}.wsWc{position:absolute;border-radius:50%;background:radial-gradient(ellipse at center,rgba(255,255,255,.55) 0%,rgba(255,255,255,0) 68%);animation:wsDrift 55s ease-in-out infinite alternate;pointer-events:none}.wsWst{position:absolute;background:#fff;border-radius:50%;animation:wsTwinkle 3.4s ease-in-out infinite;pointer-events:none}.wsRain{position:absolute;left:-6%;top:-18%;width:112%;height:130%;opacity:.30;pointer-events:none;background-image:repeating-linear-gradient(96deg,rgba(255,255,255,.30) 0 1px,transparent 1px 9px);animation:wsRainPos .85s linear infinite}.wsFlash{position:absolute;inset:0;background:#fff;opacity:0;animation:wsFlash 7.5s infinite;pointer-events:none}.wsClamp2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}';
const SKY = {
  d: { day: 'linear-gradient(175deg,#1d4ed8 0%,#2563eb 34%,#60a5fa 66%,#bfdbfe 100%)', night: 'linear-gradient(175deg,#020617 0%,#1e1b4b 48%,#312e81 100%)', clouds: 0, stars: true },
  pc: { day: 'linear-gradient(175deg,#0369a1 0%,#38bdf8 62%,#7dd3fc 100%)', night: 'linear-gradient(175deg,#0f172a 0%,#1e293b 55%,#334155 100%)', clouds: 2, stars: true },
  cl: { day: 'linear-gradient(175deg,#475569 0%,#64748b 55%,#94a3b8 100%)', night: 'linear-gradient(175deg,#020617 0%,#0f172a 50%,#1e293b 100%)', clouds: 3, stars: false },
  fg: { day: 'linear-gradient(175deg,#64748b 0%,#94a3b8 60%,#cbd5e1 100%)', night: 'linear-gradient(175deg,#111827 0%,#1f2937 55%,#374151 100%)', clouds: 1, stars: false },
  dr: { day: 'linear-gradient(175deg,#0c4a6e 0%,#155e75 55%,#0e7490 100%)', night: 'linear-gradient(175deg,#020617 0%,#082f49 55%,#0c4a6e 100%)', clouds: 3, stars: false },
  ra: { day: 'linear-gradient(175deg,#0c4a6e 0%,#155e75 55%,#0f766e 100%)', night: 'linear-gradient(175deg,#010614 0%,#082f49 55%,#115e59 100%)', clouds: 3, stars: false },
  sn: { day: 'linear-gradient(175deg,#64748b 0%,#94a3b8 55%,#cbd5e1 100%)', night: 'linear-gradient(175deg,#0f172a 0%,#334155 55%,#475569 100%)', clouds: 2, stars: false },
  ts: { day: 'linear-gradient(175deg,#1e1b4b 0%,#3730a3 55%,#4c1d95 100%)', night: 'linear-gradient(175deg,#020617 0%,#1e1b4b 55%,#312e81 100%)', clouds: 3, stars: false }
};
const wmoBucket = function (code) {
  if (code === 0 || code === 1) return 'd';
  if (code === 2) return 'pc';
  if (code === 3) return 'cl';
  if (code === 45 || code === 48) return 'fg';
  if (code >= 51 && code <= 57) return 'dr';
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return 'ra';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'sn';
  if (code >= 95) return 'ts';
  return 'pc';
};
const wxIconKey = function (code, isDay) {
  const night = Number(isDay) === 0;
  if (code === 0 || code === 1) return night ? 'clear-night' : 'clear-day';
  if (code === 2) return night ? 'partly-cloudy-night' : 'partly-cloudy-day';
  if (code === 3) return night ? 'overcast-night' : 'overcast-day';
  if (code === 45 || code === 48) return night ? 'fog-night' : 'fog-day';
  if (code >= 51 && code <= 57) return 'drizzle';
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if (code >= 95) return night ? 'thunderstorms-night' : 'thunderstorms-day';
  return night ? 'partly-cloudy-night' : 'partly-cloudy-day';
};
const wxIco = function (name, w, extra) {
  const raw = WX_SVG[name] || WX_SVG['partly-cloudy-day'] || '';
  return n.jsx('div', { style: Object.assign({ width: w, display: 'flex', flexShrink: 0 }, extra || {}), dangerouslySetInnerHTML: { __html: raw } });
};
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
const fmtHour = function (t) {
  const hm = (String(t).split('T')[1] || '').split(':');
  if (hm.length < 1) return '—';
  let H = Number(hm[0]); const am = Number(hm[0]) < 12 ? 'a' : 'p';
  H = H % 12; if (H === 0) H = 12;
  return H + am;
};
const minsOf = function (t) {
  const hm = (String(t).split('T')[1] || '').split(':');
  if (hm.length < 2) return null;
  return Number(hm[0]) * 60 + Number(hm[1]);
};
const DIRS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
const beaufort = function (mph) {
  if (mph == null) return '—';
  const v = Number(mph);
  if (v < 1) return 'Calm';
  if (v < 4) return 'Light air';
  if (v < 8) return 'Light breeze';
  if (v < 13) return 'Gentle breeze';
  if (v < 19) return 'Moderate breeze';
  if (v < 25) return 'Fresh breeze';
  if (v < 32) return 'Strong breeze';
  if (v < 39) return 'Near gale';
  if (v < 47) return 'Gale';
  if (v < 55) return 'Strong gale';
  return 'Storm';
};
const tempPct = function (cv) {
  const t = (Number(cv) - (-20)) / (45 - (-20));
  return Math.max(2, Math.min(98, Math.round(t * 100)));
};
const rangeBar = function (loC, hiC, curC, accent) {
  if (loC == null || hiC == null) return n.jsx('div', { style: { height: '1.35cqh' } });
  const kids = [
    n.jsx('div', { style: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, borderRadius: '999px', background: 'linear-gradient(90deg,#0ea5e9,#7dd3fc 25%,#f8fafc 50%,#fdba74 75%,#f97316)' }, key: 't' }),
    n.jsx('div', { style: { position: 'absolute', left: tempPct(loC) + '%', top: '-38%', width: '0.45cqw', height: '176%', borderRadius: '2px', background: 'rgba(226,232,240,.92)', boxShadow: '0 0 4px rgba(0,0,0,.5)' }, key: 'lo' }),
    n.jsx('div', { style: { position: 'absolute', left: tempPct(hiC) + '%', top: '-38%', width: '0.45cqw', height: '176%', borderRadius: '2px', background: 'rgba(226,232,240,.92)', boxShadow: '0 0 4px rgba(0,0,0,.5)' }, key: 'hi' })
  ];
  if (curC != null) kids.push(n.jsx('div', { style: { position: 'absolute', left: 'calc(' + tempPct(curC) + '% - 0.55cqw)', top: '-85%', width: '1.15cqw', height: '270%', borderRadius: '999px', background: accent || '#fff', boxShadow: '0 0 8px rgba(0,0,0,.55)', border: '1px solid rgba(15,23,42,.55)' }, key: 'cur' }));
  return n.jsx('div', { style: { position: 'relative', width: '100%', height: '1.35cqh', margin: '0.3cqh 0' }, children: kids });
};
const cloudLayer = function (count, night) {
  const arr = [];
  for (let i = 0; i < count; i++) {
    arr.push(n.jsx('div', {
      className: 'wsWc',
      style: {
        width: (44 + i * 16) + '%', height: (26 + i * 9) + '%',
        left: (i === 0 ? -10 : 26 + i * 14) + '%', top: (4 + i * 21) + '%',
        opacity: (night ? 0.16 : 0.4) - i * 0.07,
        filter: 'blur(' + (2 + i * 2) + 'px)',
        animationDuration: (52 + i * 21) + 's', animationDelay: (-i * 13) + 's'
      }
    }, 'c' + i));
  }
  return arr;
};
const starLayer = function () {
  const spots = [[12, 14, 3], [30, 8, 2], [52, 16, 2], [70, 9, 3], [86, 18, 2], [22, 26, 2], [63, 28, 2], [44, 6, 2]];
  return spots.map(function (s, i) {
    return n.jsx('div', {
      className: 'wsWst',
      style: { left: s[0] + '%', top: s[1] + '%', width: s[2] + 'px', height: s[2] + 'px', animationDelay: (i * 0.7) + 's', animationDuration: (2.6 + (i % 4)) + 's' }
    }, 's' + i);
  });
};
const snowLayer = function () {
  const spots = [[9, 7], [24, 9], [38, 6], [55, 10], [66, 7], [79, 9], [88, 6], [47, 8]];
  return spots.map(function (s, i) {
    return n.jsx('div', {
      className: 'wsWst',
      style: {
        left: s[0] + '%', top: 0, width: s[1] + 'px', height: s[1] + 'px',
        opacity: 0.6, animationName: 'wsSnowFall', animationTimingFunction: 'linear',
        animationDuration: (6.5 + (i % 5)) + 's', animationDelay: (-i * 2.3) + 's'
      }
    }, 'fl' + i);
  });
};
const senseFoot = function (s) {
  if (!s) return '';
  return (s.battery ? 'Battery OK' : 'BATTERY LOW') + ' · antenna ' + (s.rssi != null ? s.rssi.toFixed(1) : '—') + ' dB · ' + (s.ageSec < 120 ? s.ageSec + 's' : Math.round(s.ageSec / 60) + 'm') + ' ago';
};
function wsTile({ config: c, kind }) {
  const cfg = c || {};
  const zip = cfg.zip || '32757';
  const outCh = String(cfg.outdoorChannel || 'A');
  const inCh = String(cfg.indoorChannel || 'B');
  const wxR = b.useState(null); const wx = wxR[0]; const setWx = wxR[1];
  const snR = b.useState(null); const sn = snR[0]; const setSn = snR[1];
  const alR = b.useState(null); const al = alR[0]; const setAl = alR[1];
  const tkR = b.useState(new Date()); const tk = tkR[0]; const setTk = tkR[1];
  const needWx = ['current', 'baro', 'wind', 'solar', 'clock', 'outdoor'].indexOf(kind) >= 0;
  const needSn = ['outdoor', 'indoor', 'today'].indexOf(kind) >= 0;
  b.useEffect(function () {
    if (!needWx) return;
    let dead = false;
    const pull = function () { fdFetch('/api/weather?zip=' + encodeURIComponent(zip) + '&units=fahrenheit&days=2').then(function (j) { if (!dead) { setWx(j); fdHealth('weather', true); pull.attempt = 0; } }).catch(function () { if (!dead) fdHealth('weather', false); if (!pull.retry) { pull.retry = true; pull.attempt = (pull.attempt || 0) + 1; window.setTimeout(function () { pull.retry = false; pull(); }, [30000, 60000, 120000, 900000][Math.min(pull.attempt - 1, 3)]); } }); };
    pull();
    const t = setInterval(pull, 900000);
    return function () { dead = true; clearInterval(t); };
  }, [zip]);
  b.useEffect(function () {
    if (!needSn) return;
    let dead = false;
    const pull = function () { fdFetch('/api/sensors').then(function (j) { if (!dead) setSn(j || { sensors: [] }); }).catch(function () {}); };
    pull();
    const t = setInterval(pull, 60000);
    return function () { dead = true; clearInterval(t); };
  }, []);
  b.useEffect(function () {
    if (kind !== 'alerts') return;
    let dead = false;
    const pull = function () { fdFetch('/api/weather/alerts?zip=' + encodeURIComponent(zip)).then(function (j) { if (!dead) setAl(j || { alerts: [] }); }).catch(function () {}); };
    pull();
    const t = setInterval(pull, 600000);
    return function () { dead = true; clearInterval(t); };
  }, [zip]);
  b.useEffect(function () {
    if (kind !== 'clock') return;
    const t = setInterval(function () { setTk(new Date()); }, 1000);
    return function () { clearInterval(t); };
  }, []);
  const cur = (wx && wx.current) || {};
  const daily0 = (wx && wx.daily && wx.daily[0]) || null;
  const pr = (wx && wx.pressure) || null;
  const hourly = (wx && wx.hourly) || [];
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
  const night = Number(cur.is_day) === 0;
  const buck = wmoBucket(cur.code != null ? cur.code : (wx ? 2 : null));
  const sky = SKY[buck] || SKY.pc;
  const iconKey = wx && cur.wind != null && Number(cur.wind) >= 39 ? 'hurricane' : wxIconKey(cur.code, cur.is_day);
  const st = {
    box: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5cqh', boxSizing: 'border-box', padding: '2cqh 1.6cqw', background: 'rgba(2,6,23,0.55)', border: '1px solid rgba(148,163,184,0.16)', borderRadius: '16px', overflow: 'hidden', position: 'relative', color: '#e2e8f0', textAlign: 'center', transition: 'opacity .8s' },
    lbl: { fontSize: 'clamp(9px,1.8cqh,17px)', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(125,211,252,0.9)', textShadow: '0 1px 8px rgba(0,0,0,.45)', zIndex: 2 },
    big: { fontSize: 'clamp(24px,8cqh,84px)', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.02em', textShadow: '0 2px 16px rgba(0,0,0,.4)', zIndex: 2 },
    med: { fontSize: 'clamp(12px,2.5cqh,26px)', fontWeight: 700, zIndex: 2 },
    small: { fontSize: 'clamp(9px,1.95cqh,18px)', fontWeight: 600, color: '#cbd5e1', zIndex: 2 },
    chip: { fontSize: 'clamp(8.5px,1.7cqh,15px)', fontWeight: 700, color: '#93c5fd', background: 'rgba(8,20,36,0.5)', border: '1px solid rgba(125,211,252,0.18)', borderRadius: '999px', padding: '0.45cqh 1.1cqw', whiteSpace: 'nowrap', zIndex: 2 },
    foot: { fontSize: 'clamp(7.5px,1.4cqh,12px)', fontWeight: 600, letterSpacing: '0.06em', color: 'rgba(148,163,184,0.85)', zIndex: 2 }
  };
  const kids = [];
  let boxOpacity = 1;
if (kind === 'current') {
    kids.push(n.jsx('style', { key: 'css', children: WS_CSS }));
    kids.push(n.jsx('div', { key: 'ico', style: { position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', flex: '1 1 auto', minHeight: 0 }, children: wxIco(iconKey, 'min(64cqw,58cqh)', { animation: 'wsDrift 9s ease-in-out infinite alternate' }) }));
  }
else if (kind === 'baro') {
    const hpa = pr ? pr.hpa : null;
    const d3 = pr && pr.trend != null ? Number(pr.trend) : null;
    const arrow = d3 == null ? '' : (d3 > 0.4 ? ' ↗' : (d3 < -0.4 ? ' ↘' : ' →'));
    const trendColor = d3 == null ? '#93c5fd' : (d3 > 0.4 ? '#4ade80' : (d3 < -0.4 ? '#f87171' : '#93c5fd'));
    kids.push(n.jsx('style', { key: 'css', children: WS_CSS }));
    kids.push(n.jsx('div', { key: 'l', style: st.lbl, children: 'Barometer' }));
    kids.push(n.jsx('div', { key: 'b', style: st.big, children: hpa != null ? inHg(hpa).toFixed(2) : '—' }));
    kids.push(n.jsx('div', { key: 'u', style: Object.assign({}, st.small, { fontSize: 'clamp(8px,1.6cqh,14px)', color: 'rgba(148,163,184,.9)' }), children: 'inHg' }));
    if (pr && pr.high24 != null) {
      const prPct = function (inhg) { return Math.max(2, Math.min(98, Math.round((Number(inhg) - 28.6) / 1.8 * 100))); };
      const rk = [];
      rk.push(n.jsx('div', { style: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, borderRadius: '999px', background: 'linear-gradient(90deg,rgba(56,189,248,.5),rgba(148,163,184,.3) 45%,rgba(248,113,113,.5))' } }));
      rk.push(n.jsx('div', { style: { position: 'absolute', left: prPct(inHg(pr.low24)) + '%', top: '-35%', width: '0.4cqw', height: '170%', borderRadius: '2px', background: '#e2e8f0' } }));
      rk.push(n.jsx('div', { style: { position: 'absolute', left: prPct(inHg(pr.high24)) + '%', top: '-35%', width: '0.4cqw', height: '170%', borderRadius: '2px', background: '#e2e8f0' } }));
      if (hpa != null) rk.push(n.jsx('div', { style: { position: 'absolute', left: 'calc(' + prPct(inHg(hpa)) + '% - 0.5cqw)', top: '-70%', width: '1cqw', height: '240%', borderRadius: '999px', background: '#f8fafc', boxShadow: '0 0 8px rgba(0,0,0,.5)', border: '1px solid rgba(15,23,42,.5)' } }));
      kids.push(n.jsx('div', { key: 'r', style: { position: 'relative', width: '88%', height: '1.2cqh', margin: '0.4cqh 0 0' }, children: rk }));
    }
    kids.push(n.jsx('div', { key: 'tr', style: Object.assign({}, st.med, { fontSize: 'clamp(11px,2.3cqh,22px)', color: trendColor }), children: (d3 == null ? 'trend —' : '3h ' + (d3 > 0 ? '+' : '') + (Math.round(d3 * 0.0295208 * 100) / 100).toFixed(2) + ' inHg') + arrow }));
    kids.push(n.jsx('div', { key: 'c', style: st.chip, children: pr && pr.high24 != null ? '24h ' + inHg(pr.high24).toFixed(2) + '–' + inHg(pr.low24).toFixed(2) : '' }));
  } else if (kind === 'wind') {
    const deg = cur.wind_dir != null ? Number(cur.wind_dir) : null;
    kids.push(n.jsx('style', { key: 'css', children: WS_CSS }));
    kids.push(n.jsx('div', { key: 'l', style: st.lbl, children: 'Wind' }));
    kids.push(n.jsxs('div', {
      key: 'row', style: { display: 'flex', alignItems: 'center', gap: '1.8cqw', zIndex: 2 },
      children: [
        n.jsxs('div', {
          style: { position: 'relative', width: 'clamp(52px,11cqw,120px)', aspectRatio: '1 / 1', flexShrink: 0 },
          children: [
            n.jsxs('svg', {
              viewBox: '0 0 100 100', style: { width: '100%', height: '100%', position: 'absolute', inset: 0 },
              children: [
                n.jsx('circle', { cx: 50, cy: 50, r: 44, fill: 'rgba(2,6,23,.55)', stroke: 'rgba(148,163,184,.35)', strokeWidth: 2 }),
                n.jsx('circle', { cx: 50, cy: 50, r: 36, fill: 'none', stroke: 'rgba(148,163,184,.14)', strokeWidth: 1 }),
                n.jsx('text', { x: 50, y: 15, textAnchor: 'middle', fontSize: 11, fontWeight: 800, fill: '#93c5fd', children: 'N' }),
                n.jsx('text', { x: 50, y: 95, textAnchor: 'middle', fontSize: 10, fontWeight: 700, fill: 'rgba(148,163,184,.8)', children: 'S' }),
                n.jsx('text', { x: 8, y: 54, textAnchor: 'middle', fontSize: 10, fontWeight: 700, fill: 'rgba(148,163,184,.8)', children: 'W' }),
                n.jsx('text', { x: 92, y: 54, textAnchor: 'middle', fontSize: 10, fontWeight: 700, fill: 'rgba(148,163,184,.8)', children: 'E' })
              ]
            }),
            n.jsx('div', { style: { position: 'absolute', left: '50%', bottom: '50%', width: '2.5px', height: '40%', marginLeft: '-1.25px', transformOrigin: '50% 100%', transform: deg != null ? 'rotate(' + deg + 'deg)' : 'none', transition: 'transform 1.4s cubic-bezier(.34,1.3,.4,1)', background: 'linear-gradient(180deg,#f87171,#f8fafc)', borderRadius: '2px', boxShadow: '0 0 6px rgba(0,0,0,.5)' } }),
            n.jsx('div', { style: { position: 'absolute', left: '50%', top: '50%', width: '8px', height: '8px', marginLeft: '-4px', marginTop: '-4px', borderRadius: '50%', background: '#e2e8f0', boxShadow: '0 0 6px rgba(0,0,0,.5)' } })
          ]
        }),
        n.jsxs('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.4cqh' }, children: [
          n.jsx('div', { style: st.big, children: cur.wind != null ? Math.round(cur.wind) : '—' }),
          n.jsx('div', { style: Object.assign({}, st.small, { color: '#93c5fd' }), children: 'mph from ' + (deg != null ? DIRS[Math.round(deg / 22.5) % 16] : '—') })
        ] })
      ]
    }));
    kids.push(n.jsx('div', { key: 'c1', style: st.chip, children: (cur.wind_gusts != null ? 'gusts ' + Math.round(cur.wind_gusts) + ' mph · ' : '') + beaufort(cur.wind) }));
  }
else if (kind === 'solar') {
    const uv = cur.uv_index != null ? Number(cur.uv_index) : null;
    const uvP = uv == null ? 0 : Math.max(0, Math.min(1, uv / 11));
    kids.push(n.jsx('style', { key: 'css', children: WS_CSS }));
    kids.push(n.jsx('div', { key: 'l', style: st.lbl, children: 'Solar & UV' }));
    kids.push(n.jsxs('div', {
      key: 'row', style: { display: 'flex', alignItems: 'center', gap: '1.8cqw', zIndex: 2 },
      children: [
        n.jsxs('svg', { viewBox: '0 0 100 62', style: { width: 'clamp(56px,11cqw,120px)', flexShrink: 0 }, children: [
          n.jsx('path', { d: 'M14 56 A40 40 0 0 1 86 56', fill: 'none', stroke: 'rgba(148,163,184,.25)', strokeWidth: 7, strokeLinecap: 'round' }),
          n.jsx('path', { d: 'M14 56 A40 40 0 0 1 86 56', fill: 'none', stroke: '#fbbf24', strokeWidth: 7, strokeLinecap: 'round', strokeDasharray: (uvP * 125.7) + ' 125.7' }),
          n.jsx('text', { x: 50, y: 50, textAnchor: 'middle', fontSize: 15, fontWeight: 900, fill: '#fde68a', children: uv == null ? '—' : uv.toFixed(1) })
        ] }),
        n.jsxs('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.4cqh' }, children: [
          n.jsx('div', { style: st.big, children: cur.shortwave_radiation != null ? Math.round(cur.shortwave_radiation) : '—' }),
          n.jsx('div', { style: st.small, children: 'W/m² radiation' }),
          n.jsx('div', { style: Object.assign({}, st.chip, { padding: '0.3cqh 0.8cqw' }), children: daily0 && daily0.uvMax != null ? 'UV max today ' + Number(daily0.uvMax).toFixed(1) : 'UV —' })
        ] })
      ]
    }));
  } else if (kind === 'outdoor') {
    const stale = outS && outS.ageSec > 300;
    const iconKey2 = wx ? wxIconKey(cur.code, cur.is_day) : null;
    kids.push(n.jsx('style', { key: 'css', children: WS_CSS }));
    kids.push(n.jsx('div', { key: 'l', style: st.lbl, children: 'Outdoor' }));
    kids.push(n.jsxs('div', { key: 'row', style: { display: 'flex', alignItems: 'center', gap: '1.2cqw', zIndex: 2 }, children: [
      iconKey2 ? wxIco(iconKey2, 'clamp(30px,6cqh,64px)') : null,
      n.jsx('div', { style: Object.assign({}, st.big, { fontSize: 'clamp(28px,10cqh,98px)' }), children: outS && outS.tempC != null ? fOf(outS.tempC) + '°' : '—' })
    ] }));
    kids.push(n.jsx('div', { key: 'h', style: st.med, children: outS && outS.humidity != null ? Math.round(outS.humidity) + '% RH' : (outS ? '—' : 'no ch ' + outCh) }));
    kids.push(rangeBar(outS && outS.minC, outS && outS.maxC, outS && outS.tempC, '#22d3ee'));
    kids.push(n.jsx('div', { key: 'r', style: st.chip, children: outS && outS.minC != null ? '24h ' + fOf(outS.minC) + '° / ' + fOf(outS.maxC) + '°' : '' }));
    kids.push(n.jsx('div', { key: 'f', style: st.foot, children: outS ? senseFoot(outS) : 'no channel ' + outCh + ' yet' }));
    boxOpacity = stale ? 0.6 : 1;
  } else if (kind === 'indoor') {
    kids.push(n.jsx('style', { key: 'css', children: WS_CSS }));
    boxOpacity = (inS && inS.ageSec > 300) ? 0.6 : 1;
    kids.push(n.jsx('div', { key: 'l', style: st.lbl, children: 'Indoor' }));
    kids.push(n.jsxs('div', { key: 'row', style: { display: 'flex', alignItems: 'center', gap: '1.2cqw', zIndex: 2 }, children: [
      wxIco('thermometer', 'clamp(26px,5cqh,54px)'),
      n.jsx('div', { style: Object.assign({}, st.big, { fontSize: 'clamp(28px,10cqh,98px)' }), children: inS && inS.tempC != null ? fOf(inS.tempC) + '°' : '—' })
    ] }));
    kids.push(n.jsx('div', { key: 'h', style: st.med, children: inS && inS.humidity != null ? Math.round(inS.humidity) + '% RH' : (inS ? '—' : 'no ch ' + inCh) }));
    const delta = (inS && outS && inS.tempC != null && outS.tempC != null) ? Math.abs(fOf(inS.tempC) - fOf(outS.tempC)) : null;
    if (delta != null) kids.push(n.jsx('div', { key: 'd', style: st.chip, children: (fOf(inS.tempC) > fOf(outS.tempC) ? 'warmer' : 'cooler') + ' than outside +' + delta + '°' }));
    kids.push(n.jsx('div', { key: 'f', style: st.foot, children: inS ? senseFoot(inS) : 'no channel ' + inCh + ' yet' }));
  }
else if (kind === 'today') {
    kids.push(n.jsx('style', { key: 'css', children: WS_CSS }));
    kids.push(n.jsx('div', { key: 'l', style: st.lbl, children: '24h Range' }));
    kids.push(n.jsxs('div', {
      key: 'out', style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3cqh', width: '92%', zIndex: 2 },
      children: [
        n.jsx('div', { style: Object.assign({}, st.foot, { color: '#67e8f9' }), children: fOf(outS && outS.minC) + '° → ' + fOf(outS && outS.maxC) + '° outdoor' }),
        rangeBar(outS && outS.minC, outS && outS.maxC, outS && outS.tempC, '#22d3ee'),
        n.jsx('div', { style: Object.assign({}, st.foot, { color: '#fda4af' }), children: fOf(inS && inS.minC) + '° → ' + fOf(inS && inS.maxC) + '° indoor' }),
        rangeBar(inS && inS.minC, inS && inS.maxC, inS && inS.tempC, '#fb7185')
      ]
    }));
    kids.push(n.jsx('div', { key: 'c', style: st.chip, children: list.length ? list.length + ' sensor' + (list.length === 1 ? '' : 's') + ' reporting' : 'rtl_433 not feeding yet' }));
  } else if (kind === 'clock') {
    const srM = minsOf(daily0 && daily0.sunrise); const ssM = minsOf(daily0 && daily0.sunset);
    const nowM = tk.getHours() * 60 + tk.getMinutes();
    const dayP = (srM != null && ssM != null && ssM > srM) ? (nowM - srM) / (ssM - srM) : null;
    const arcAng = dayP != null && dayP >= 0 && dayP <= 1 ? Math.PI * (1 - dayP) : null;
    const dotX = arcAng != null ? 50 - 40 * Math.cos(arcAng) : 50;
    const dotY = arcAng != null ? 54 - 44 * Math.sin(arcAng) : 55;
    kids.push(n.jsx('style', { key: 'css', children: WS_CSS }));
    kids.push(n.jsx('div', { key: 't', style: Object.assign({}, st.big, { fontSize: 'clamp(26px,9.5cqh,96px)' }), children: tk.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: cfg.showSeconds === false ? undefined : '2-digit' }) }));
    kids.push(n.jsxs('svg', {
      key: 'arc', viewBox: '0 0 100 60', style: { width: '78%', maxWidth: '240px', zIndex: 2 },
      children: [
        n.jsx('path', { d: 'M10 54 A40 44 0 0 1 90 54', fill: 'none', stroke: 'rgba(148,163,184,.22)', strokeWidth: 2, strokeLinecap: 'round' }),
        n.jsx('circle', { cx: dotX, cy: dotY, r: 4.5, fill: arcAng != null ? '#fbbf24' : 'rgba(148,163,184,.4)', opacity: arcAng != null ? 1 : 0.4 })
      ]
    }));
    kids.push(n.jsx('div', { key: 'd', style: st.med, children: tk.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }) }));
    kids.push(n.jsx('div', { key: 's', style: Object.assign({}, st.chip, { fontSize: 'clamp(8.5px,1.8cqh,16px)' }), children: '↑ ' + fmt12(daily0 && daily0.sunrise) + '  ↓ ' + fmt12(daily0 && daily0.sunset) }));
  } else if (kind === 'alerts') {
    kids.push(n.jsx('style', { key: 'css', children: WS_CSS }));
    if (top) {
      kids.push(n.jsx('span', { key: 'w', style: { fontSize: 'clamp(14px,3.4cqh,32px)', zIndex: 2 }, children: '⚠️' }));
      kids.push(n.jsx('div', {
        key: 'm', className: 'wsClamp2',
        style: { fontSize: 'clamp(9px,1.9cqh,18px)', fontWeight: 800, color: '#fecaca', textTransform: 'uppercase', letterSpacing: '0.04em', zIndex: 2 },
        children: (top.event || 'ALERT') + ' · ' + (top.headline || '')
      }));
    } else {
      kids.push(n.jsx('div', { key: 'ok1', style: { fontSize: 'clamp(11px,2.6cqh,26px)', fontWeight: 800, color: '#86efac', zIndex: 2 }, children: '✓ No active alerts' }));
      kids.push(n.jsx('div', { key: 'ok2', style: st.foot, children: 'checking NWS every 10 min' }));
    }
  } else {
    kids.push(n.jsx('div', { key: 'x', style: st.small, children: 'ws widget: ' + kind }));
  }
  const isAlert = kind === 'alerts' && top;
  const isHero = kind === 'current';
  const boxBase = Object.assign({}, st.box, { opacity: boxOpacity });
  const boxStyle = isAlert ? Object.assign(boxBase, {
    flexDirection: 'row', gap: '1.2cqw',
    background: 'linear-gradient(90deg,rgba(127,29,29,.92),rgba(153,27,27,.88))',
    border: '1px solid rgba(248,113,113,.55)',
    animation: 'wsPulse 2.4s ease-in-out infinite'
  }) : (isHero ? Object.assign(boxBase, {
    background: (wx ? sky[Number(cur.is_day) === 0 ? 'night' : 'day'] : 'linear-gradient(175deg,#0f172a,#1e293b)') || st.box.background,
    justifyContent: 'center',
    padding: '3cqh 2cqw', gap: '0',
    border: '1px solid rgba(255,255,255,0.14)',
    boxShadow: 'inset 0 0 40px rgba(0,0,0,.25), 0 8px 24px rgba(2,6,23,.35)'
  }) : boxBase);
  return n.jsx('div', { style: boxStyle, children: kids });
}


// ===== ported from wave4/fd_weather/ws-component.js =====
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
    const pull = () => { fdFetch('/api/weather?zip=' + encodeURIComponent(zip) + '&units=fahrenheit&days=2').then(function (j) { if (!dead) { setWx(j); fdHealth('weather', true); pull.attempt = 0; } }).catch(function () { if (!dead) fdHealth('weather', false); if (!pull.retry) { pull.retry = true; pull.attempt = (pull.attempt || 0) + 1; window.setTimeout(function () { pull.retry = false; pull(); }, [30000, 60000, 120000, 900000][Math.min(pull.attempt - 1, 3)]); } }); };
    pull();
    const t = setInterval(pull, 900000);
    return function () { dead = true; clearInterval(t); };
  }, [zip]);

  b.useEffect(() => {
    let dead = false;
    const pull = () => { fdFetch('/api/sensors').then(function (j) { if (!dead) setSn(j || { sensors: [] }); }).catch(function () {}); };
    pull();
    const t = setInterval(pull, 60000);
    return function () { dead = true; clearInterval(t); };
  }, []);

  b.useEffect(() => {
    let dead = false;
    const pull = () => { fdFetch('/api/weather/alerts?zip=' + encodeURIComponent(zip)).then(function (j) { if (!dead) setAl(j || { alerts: [] }); }).catch(function () {}); };
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


// ===== ported from wave4/fd_weather/wxgui-component.js =====
// wxGUI — full-screen "Weather GUI" block, replicating out/weathergui.jpg (v1 duplicate build)
// ws7af — adds the 5-day hi/lo forecast strip to the hero mid-spacer (weather fetch now days=6; strip hidden when the daily feed is empty)
// ws7an — sun-arc right column: the +12h moon label is removed; the meteo-source credit is shrunk 35% and pinned into the bottom-right corner (the phase moon icon stays, now unlabeled); ws7ao — the credit now sits half the gap from the bottom edge (corner padding halved); ws7ap — living-weather pass: scene clouds gain a slow bob + opacity breath on top of the drift, and the wxIco icons (condition pill, 5-day strip, meteo credit) float gently — same art, now visibly in motion (the 12-hour strip stays intentionally muted; sizes still deliberately absent); ws7aq — the meteo credit unit nudged 5px right + 5px down (layout-free transform on the credit column; the moon's float rides along).
// Injected into the client bundle right before `function wsWS` — module scope here already has:
// n (jsx), b (react), WX_SVG, wxIco, wxIconKey, wmoBucket, fOf, inHg, fmt12, fmtHour, minsOf, DIRS,
// rwRV (RainViewer animated radar block — injected by fdw-apply-radar-widgets.cjs before this comp)
const WG_CSS = '@keyframes wgDrift{from{transform:translate3d(-6%,0,0)}to{transform:translate3d(6%,-2%,0)}}' +
  '@keyframes wgTw{0%,100%{opacity:.15}50%{opacity:.9}}' +
  '@keyframes wgRainA{from{background-position:0 0}to{background-position:-8px 140px}}' +
  '@keyframes wgFlash{0%,93%,100%{opacity:0}94%{opacity:.32}96%{opacity:.05}97%{opacity:.2}98%{opacity:0}}' +
  '@keyframes wgGlow{0%,100%{box-shadow:0 0 .9cqh .2cqh rgba(232,236,246,.55)}50%{box-shadow:0 0 1.6cqh .5cqh rgba(232,236,246,.75)}}' +
  '@keyframes wgSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}' +
  '.wgCloud{position:absolute;border-radius:50%;background:radial-gradient(ellipse at center,rgba(255,255,255,.5) 0%,rgba(255,255,255,0) 68%);animation:wgDrift 60s ease-in-out infinite alternate;pointer-events:none}' +
  '.wgStar{position:absolute;background:#fff;border-radius:50%;animation:wgTw 3.6s ease-in-out infinite;pointer-events:none}' +
  '.wgRain{position:absolute;left:-8%;top:-15%;width:116%;height:135%;opacity:.26;pointer-events:none;background-image:repeating-linear-gradient(96deg,rgba(255,255,255,.3) 0 1px,transparent 1px 8px);animation:wgRainA .8s linear infinite}' +
  '.wgSnow{position:absolute;left:-8%;top:-15%;width:116%;height:135%;opacity:.5;pointer-events:none;background-image:radial-gradient(rgba(255,255,255,.85) 1.5px,transparent 1.5px);background-size:14px 14px;animation:wgRainA 3.4s linear infinite}' +
  '.wgFlash{position:absolute;inset:0;background:#fff;opacity:0;animation:wgFlash 8s infinite;pointer-events:none}' +
  '.wgMoon{position:absolute;border-radius:50%;background:radial-gradient(circle at 38% 34%,#f4f6f9 0%,#dfe5ee 52%,#c9d2e0 100%);box-shadow:0 0 3cqh 1cqh rgba(226,232,242,.5),0 0 9cqh 3cqh rgba(180,196,220,.16);animation:wgGlow 7s ease-in-out infinite;pointer-events:none}' +
  '.wgMoon::after{content:"";position:absolute;left:22%;top:30%;width:16%;height:16%;border-radius:50%;background:rgba(176,188,206,.5);box-shadow:2.1cqh 1.1cqh 0 -.15ex rgba(176,188,206,.42),-.7cqh 2.4cqh 0 -.35ex rgba(176,188,206,.35)}' +
  '.wgSun{position:absolute;border-radius:50%;background:radial-gradient(circle at 40% 35%,#fff7e0 0%,#ffdf8a 55%,#f7b733 100%);box-shadow:0 0 3.4cqh 1cqh rgba(255,209,110,.55),0 0 10cqh 3.5cqh rgba(255,190,90,.18);pointer-events:none}' +
  '.wgTile{position:absolute;pointer-events:none;font-weight:700;white-space:nowrap;text-shadow:0 1px 3px rgba(0,0,0,.8)}' +
  '@keyframes wgXDrift{from{transform:translate(-6%,2.2%)}to{transform:translate(6%,-2.2%)}}' +
  '@keyframes wgXFall{from{transform:translateY(-20px)}to{transform:translateY(126px)}}' +
  '@keyframes wgXFallS{from{transform:translateY(-12px)}to{transform:translateY(118px)}}' +
  '@keyframes wgXSway{from{transform:translateX(-5px)}to{transform:translateX(5px)}}' +
  '@keyframes wgXPulse{from{opacity:.5}to{opacity:.22}}' +
  '@keyframes wgXBolt{0%,89%{opacity:0}90%{opacity:.9}92%{opacity:.08}94%{opacity:.75}96%{opacity:0}98%{opacity:.25}100%{opacity:0}}' +
  '@keyframes wgXFlash{0%,89%{opacity:0}90%{opacity:.38}92%{opacity:.04}94%{opacity:.3}96%{opacity:0}98%{opacity:.12}100%{opacity:0}}' +
  '@keyframes wgXFog{from{transform:translateX(-16px)}to{transform:translateX(16px)}}' +
  '@keyframes wgXShoot{0%{opacity:0;transform:translate(0,0)}2%{opacity:1;transform:translate(10px,6px)}7%{opacity:0;transform:translate(34px,20px)}100%{opacity:0;transform:translate(34px,20px)}}' +
  '@keyframes wgXBob{from{transform:translateY(0)}to{transform:translateY(-2.4px)}}' +
  '@keyframes wgXBreath{from{opacity:.86}to{opacity:1}}' +
  '@keyframes wgIcoBob{from{transform:translateY(.16cqh)}to{transform:translateY(-.2cqh)}}';
function wxGUI(props) {
  const c = (props && props.config) || {};
  const ff = (props && props.fontFamilyClass) || '';
  const zip = c.zip || '32757';
  const city = String(c.city || 'MOUNT DORA').toUpperCase();
  const outCh = String(c.outdoorChannel || 'A');
  const inCh = String(c.indoorChannel || 'B');
  const wxR = b.useState(null); const wx = wxR[0]; const setWx = wxR[1];
  const snR = b.useState(null); const sn = snR[0]; const setSn = snR[1];
  const alR = b.useState(null); const al = alR[0]; const setAl = alR[1];
  const tkR = b.useState(new Date()); const tk = tkR[0]; const setTk = tkR[1];
  const upR = b.useState(null); const upd = upR[0]; const setUpd = upR[1];
  // ---- data pulls ----
  b.useEffect(function () {
    let dead = false;
    const pull = function () {
      fdFetch('/api/weather?zip=' + encodeURIComponent(zip) + '&units=fahrenheit&days=6').then(function (j) { if (!dead) { setWx(j); setUpd(new Date()); fdHealth('weather', true); pull.attempt = 0; } }).catch(function () { if (!dead) fdHealth('weather', false); if (!pull.retry) { pull.retry = true; pull.attempt = (pull.attempt || 0) + 1; window.setTimeout(function () { pull.retry = false; pull(); }, [30000, 60000, 120000, 300000][Math.min(pull.attempt - 1, 3)]); } });
    };
    pull(); const iv = setInterval(pull, 300000); return function () { dead = true; clearInterval(iv); };
  }, [zip]);
  b.useEffect(function () {
    let dead = false;
    const pull = function () { fdFetch('/api/sensors').then(function (j) { if (!dead) setSn(j || { sensors: [] }); }).catch(function () {}); };
    pull(); const iv = setInterval(pull, 60000); return function () { dead = true; clearInterval(iv); };
  }, []);
  b.useEffect(function () {
    let dead = false;
    const pull = function () { fdFetch('/api/weather/alerts?zip=' + encodeURIComponent(zip)).then(function (j) { if (!dead) setAl(j || { alerts: [] }); }).catch(function () {}); };
    pull(); const iv = setInterval(pull, 600000); return function () { dead = true; clearInterval(iv); };
  }, [zip]);
  b.useEffect(function () {
    let dead = false;
    const t = setInterval(function () { if (!dead) setTk(new Date()); }, 1000);
    return function () { dead = true; clearInterval(t); };
  }, []);
  // ---- derived ----
  // ---- derived ----
  const cur = (wx && wx.current) || null;
  const pr = (wx && wx.pressure) || null;
  const dly = (wx && wx.daily) || [];
  const d0 = dly[0] || null;
  const sens = (sn && sn.sensors) || [];
  const out = sens.filter(function (s) { return String(s.channel) === outCh; })[0] || null;
  const inn = sens.filter(function (s) { return String(s.channel) === inCh; })[0] || null;
  const isDay = !(cur && Number(cur.is_day) === 0);
  const buck = cur && cur.code != null ? wmoBucket(cur.code) : 'pc';
  const stormy = !!(cur && cur.wind != null && Number(cur.wind) >= 39);
  const heroKey = stormy ? 'hurricane' : (cur ? wxIconKey(cur.code, cur.is_day) : (isDay ? 'partly-cloudy-day' : 'partly-cloudy-night'));
  const outT = out && out.tempC != null ? fOf(out.tempC) : (cur ? cur.temp : null);
  const outHr = out && out.humidity != null ? out.humidity : (cur ? cur.humidity : null);
  const inT = inn && inn.tempC != null ? fOf(inn.tempC) : null;
  const inHr = inn ? inn.humidity : null;
  const cond = cur && cur.condition ? (cur.condition.label || '') : '';
  const feels = cur && cur.apparent != null ? cur.apparent : null;
  const wDeg = cur && cur.wind_dir != null ? Number(cur.wind_dir) : null;
  const wDir = wDeg != null ? DIRS[Math.round(wDeg / 22.5) % 16] : null;
  const wMph = cur && cur.wind != null ? Math.round(Number(cur.wind)) : null;
  const gust = cur && cur.wind_gusts != null ? Math.round(Number(cur.wind_gusts)) : null;
  const pIn = pr && pr.hpa != null ? inHg(pr.hpa) : null;
  const pTrend = pr && pr.trend ? String(pr.trend) : null;
  const srM = d0 ? minsOf(d0.sunrise) : null;
  const ssM = d0 ? minsOf(d0.sunset) : null;
  const dayLen = srM != null && ssM != null ? (ssM - srM) : null;
  const nowMins = tk.getHours() * 60 + tk.getMinutes();
  const dayProg = (srM != null && ssM != null && ssM > srM) ? Math.max(0, Math.min(1, (nowMins - srM) / (ssM - srM))) : 0;
  const headerTime = ((tk.getHours() % 12) === 0 ? 12 : tk.getHours() % 12) + ':' + (tk.getMinutes() < 10 ? '0' : '') + tk.getMinutes() + ' ' + (tk.getHours() < 12 ? 'AM' : 'PM');
  const headerDate = tk.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();
  const updTimeStr = upd ? ((upd.getHours() % 12) === 0 ? 12 : upd.getHours() % 12) + ':' + (upd.getMinutes() < 10 ? '0' : '') + upd.getMinutes() + ' ' + (upd.getHours() < 12 ? 'AM' : 'PM') : null;
  // hour-of-day is_day for a given hourly time string
  const hourIsDay = function (t) {
    const dpart = String(t).split('T')[0]; const m = minsOf(t);
    const d = dly.filter(function (x) { return x.date === dpart; })[0] || d0;
    if (!d) return true;
    const a = minsOf(d.sunrise); const z = minsOf(d.sunset);
    if (a == null || z == null || m == null) return true;
    return m >= a && m <= z;
  };
  const hl = [];
  (function () {
    const hy = (wx && wx.hourly) || [];
    let s = hy.findIndex(function (h) { return h.current; });
    if (s < 0) s = 0;
    for (let i = s; i < hy.length && hl.length < 12; i++) {
      const h = hy[i];
      hl.push({ time: h.time, temp: h.temp != null ? Math.round(Number(h.temp)) : null, p: h.precip != null ? Math.round(Number(h.precip)) : 0, key: stormy ? 'hurricane' : wxIconKey(h.code != null ? h.code : 3, hourIsDay(h.time) ? 1 : 0) });
    }
  })();
  const alerts = (al && al.alerts) || [];
  const a0 = alerts[0] || null;
  // ---- moon phase (real synodic cycle, for the animated sky scene) ----
  const phAge = (((tk.getTime() - 947182440000) / 86400000) % 29.53058867 + 29.53058867) % 29.53058867;
  const phP = phAge / 29.53058867;
  const phK = (1 - Math.cos(phP * 2 * Math.PI)) / 2;
  const phWax = phP < .5;
  // ---- animated current-conditions scene (hero card: fills the empty zone under the "Weather updated" chip) ----
  // SVG + CSS/SMIL animation; visuals keyed off the live WMO bucket (d/pc/cl/fg/dr/ra/sn/ts) + day/night.
  const wxScene = (function () {
    const SB = stormy ? 'ts' : buck;
    const night = !isDay;
    const isRn = SB === 'ra', isDz = SB === 'dr', isS = SB === 'sn', isT = SB === 'ts';
    const isC = SB === 'cl', isP = SB === 'pc', isD = SB === 'd', isF = SB === 'fg';
    const clFill = (night || isT) ? 'url(#wgXCN)' : 'url(#wgXCD)';
    const kids = []; let moonD = null; let moonX = 100; let moonY = 36; let moonR = 15;
    const star = function (x, y, r, i) {
      return n.jsx('circle', { cx: x, cy: y, r: r, fill: '#eaf1fb', style: { animation: 'wgTw 3.4s ease-in-out infinite', animationDelay: (i * .41) + 's' } }, 'st' + i);
    };
    const moon = function (x, y, r, key) {
      moonX = x; moonY = y; moonR = r;
      const rx = Math.abs(r * (1 - 2 * phK));
      moonD = 'M' + x + ' ' + (y - r) + ' A' + r + ' ' + r + ' 0 0 ' + (phWax ? 1 : 0) + ' ' + x + ' ' + (y + r) +
        ' A' + rx.toFixed(2) + ' ' + r + ' 0 0 ' + (((phK < .5) === phWax) ? 1 : 0) + ' ' + x + ' ' + (y - r) + ' Z';
      return n.jsxs('g', { children: [
        n.jsx('circle', { cx: x, cy: y, r: r * 2, fill: '#dbe6f4', opacity: .13, filter: 'url(#wgXB3)' }),
        n.jsx('circle', { cx: x, cy: y, r: r, fill: '#101c30', opacity: .9 }),
        n.jsx('path', { d: moonD, fill: 'url(#wgXMoonG)' }),
        n.jsxs('g', { clipPath: 'url(#wgXMC)', children: [
          n.jsx('circle', { cx: x + r * .26, cy: y - r * .2, r: r * .16, fill: 'rgba(150,166,188,.45)' }),
          n.jsx('circle', { cx: x - r * .22, cy: y + r * .3, r: r * .22, fill: 'rgba(150,166,188,.38)' }),
          n.jsx('circle', { cx: x - r * .42, cy: y - r * .36, r: r * .11, fill: 'rgba(150,166,188,.4)' })
        ] })
      ] }, key);
    };
    const sun = function (cx, cy, r, rays, dur, key) {
      const ry = [];
      for (let i = 0; i < rays; i++) {
        ry.push(n.jsx('polygon', { points: (r + 1.5) + ',-4.2 ' + (r + 1.5 + r * .95) + ',0 ' + (r + 1.5) + ',4.2Z', transform: 'rotate(' + Math.round(360 / rays * i) + ')', fill: '#ffdf8a', opacity: .55 }, 'ry' + i));
      }
      return n.jsxs('g', { children: [
        n.jsx('circle', { cx: cx, cy: cy, r: r * 2.1, fill: 'url(#wgXSunH)', style: { animation: 'wgXPulse 4.5s ease-in-out infinite alternate' } }),
        n.jsxs('g', { transform: 'translate(' + cx + ' ' + cy + ')', children: [
          n.jsx('g', { children: [n.jsx('animateTransform', { attributeName: 'transform', type: 'rotate', from: '0', to: '360', dur: dur + 's', repeatCount: 'indefinite' }, 'spin')].concat(ry) }),
          n.jsx('circle', { r: r, fill: 'url(#wgXSunG)' }),
          n.jsx('circle', { r: r * 1.28, fill: 'none', stroke: 'rgba(255,226,140,.55)', strokeWidth: 1.1 })
        ] })
      ] }, key);
    };
    const cloud = function (cx, cy, s, dur, delay, op, key) {
      return n.jsx('g', { style: { animation: 'wgXBob ' + (dur * .52).toFixed(1) + 's ease-in-out infinite alternate, wgXBreath ' + (dur * .8).toFixed(1) + 's ease-in-out infinite alternate', animationDelay: (-cx * .13) + 's' }, children: n.jsx('g', { style: { animation: 'wgXDrift ' + dur + 's ease-in-out infinite alternate', animationDelay: delay + 's' }, children: n.jsxs('g', { transform: 'translate(' + cx + ' ' + cy + ') scale(' + s + ')', opacity: op, filter: 'url(#wgXB2)', children: [
        n.jsx('ellipse', { cx: -17, cy: 4, rx: 14, ry: 9.5, fill: clFill }),
        n.jsx('ellipse', { cx: 1, cy: -5, rx: 17, ry: 11.5, fill: clFill }),
        n.jsx('ellipse', { cx: 17, cy: 2, rx: 15, ry: 10, fill: clFill }),
        n.jsx('ellipse', { cx: 1, cy: 6, rx: 22, ry: 9.5, fill: clFill })
      ] }) }) }, key);
    };
    if (isD) {
      if (!night) {
        kids.push(sun(100, 40, 15, 14, 55, 'sunD'));
      } else {
        [[16, 16, 1.1], [40, 10, 1.5], [68, 22, 1], [94, 12, 1.3], [150, 18, 1.4], [174, 10, 1], [122, 26, 1], [30, 32, 1], [58, 40, 1.2], [138, 44, 1.1]].forEach(function (p, i) { kids.push(star(p[0], p[1], p[2], i)); });
        kids.push(n.jsx('g', { style: { animation: 'wgXShoot 12s linear infinite', animationDelay: '2.5s' }, children: n.jsx('line', { x1: 130, y1: 10, x2: 144, y2: 18, stroke: '#eef4ff', strokeWidth: 1.5, strokeLinecap: 'round', opacity: 0 }) }, 'shoot'));
        kids.push(moon(98, 34, 15.5, 'moonD'));
      }
    } else if (isP) {
      if (!night) {
        kids.push(sun(136, 28, 10.5, 10, 72, 'sunP'));
        kids.push(cloud(86, 62, 1.7, 19, -6, .95, 'c0'));
      } else {
        [[22, 12, 1.2], [64, 10, 1.4], [116, 16, 1.1], [168, 12, 1.2]].forEach(function (p, i) { kids.push(star(p[0], p[1], p[2], i)); });
        kids.push(moon(140, 27, 11.5, 'moonP'));
        kids.push(cloud(76, 58, 1.7, 21, -9, .65, 'c0'));
      }
    } else if (isC) {
      kids.push(cloud(56, 32, 1.9, 23, -5, night ? .6 : .85, 'c0'));
      kids.push(cloud(126, 52, 2.2, 18, -11, night ? .65 : .9, 'c1'));
      kids.push(cloud(90, 78, 1.5, 27, -17, night ? .5 : .75, 'c2'));
    } else if (isRn || isDz || isT) {
      kids.push(cloud(64, 40, 2, 21, -3, isT ? .95 : .92, 'c0'));
      kids.push(cloud(152, 28, 1.5, 17, -8, isT ? .85 : .8, 'c1'));
      if (isT) kids.push(cloud(108, 20, 1.25, 24, -14, .78, 'c2'));
      const rc = isT ? 18 : (isDz ? 12 : 16);
      const sl = isT ? -5.5 : -2.5;
      for (let i = 0; i < rc; i++) {
        const x = 6 + ((i * 47) % 190);
        const L = (isDz ? 7 : 11) + (i % 3) * 5;
        kids.push(n.jsx('line', { x1: x, y1: -22, x2: x + sl, y2: -22 + L, stroke: 'url(#wgXRainG)', strokeWidth: isDz ? 1.6 : 2.2, strokeLinecap: 'round', opacity: isDz ? .55 : (isT ? .9 : .8), style: { animation: 'wgXFall ' + ((isDz ? 1.15 : .78) + (i % 5) * .08) + 's linear infinite', animationDelay: (-(i % 8) * .31) + 's' } }, 'rn' + i));
      }
      if (isT) {
        kids.push(n.jsx('path', { d: 'M104 36 L93 62 L100.5 62 L90 94 L106 60 L98.5 60 L112 36Z', fill: '#fff7d6', filter: 'url(#wgXGlow)', style: { animation: 'wgXBolt 7.5s linear infinite', opacity: 0 } }, 'bolt'));
        kids.push(n.jsx('rect', { x: 0, y: 0, width: 200, height: 110, fill: '#dfe9ff', style: { animation: 'wgXFlash 7.5s linear infinite', opacity: 0 } }, 'flash'));
      }
    } else if (isS) {
      kids.push(cloud(74, 34, 1.5, 21, -4, .9, 'c0'));
      kids.push(cloud(140, 44, 1.9, 18, -10, .85, 'c1'));
      for (let i = 0; i < 12; i++) {
        const x = 10 + ((i * 61) % 180);
        const rf = 1.2 + (i % 3) * .9;
        kids.push(n.jsx('g', { style: { animation: 'wgXFallS ' + (5.4 + (i % 4) * 1.4) + 's linear infinite', animationDelay: (-(i % 9) * .8) + 's' }, children: n.jsx('circle', { cx: x, cy: -6, r: rf, fill: '#eef5fc', opacity: .85, style: { animation: 'wgXSway ' + (2 + (i % 3) * .9) + 's ease-in-out infinite alternate' } }) }, 'fl' + i));
      }
    } else if (isF) {
      kids.push(n.jsx('circle', { cx: 100, cy: 44, r: 34, fill: night ? '#dbe6f4' : '#ffdf8a', opacity: night ? .12 : .18, filter: 'url(#wgXB3)' }, 'fgGlow'));
      kids.push(n.jsx('rect', { x: -34, y: 26, width: 268, height: 22, rx: 11, fill: 'url(#wgXFogG)', opacity: .5, filter: 'url(#wgXB3)', style: { animation: 'wgXFog 13s ease-in-out infinite alternate' } }, 'fg0'));
      kids.push(n.jsx('rect', { x: -34, y: 52, width: 268, height: 20, rx: 10, fill: 'url(#wgXFogG)', opacity: .38, filter: 'url(#wgXB3)', style: { animation: 'wgXFog 17s ease-in-out infinite alternate', animationDelay: '-4s' } }, 'fg1'));
      kids.push(n.jsx('rect', { x: -34, y: 78, width: 268, height: 18, rx: 9, fill: 'url(#wgXFogG)', opacity: .3, filter: 'url(#wgXB3)', style: { animation: 'wgXFog 21s ease-in-out infinite alternate', animationDelay: '-9s' } }, 'fg2'));
    } else {
      kids.push(cloud(96, 66, 1.15, 20, 0, .8, 'c0'));
    }
    // wgXDEFS
    const defs = n.jsxs('defs', { children: [
      n.jsx('radialGradient', { id: 'wgXSunG', children: [
        n.jsx('stop', { offset: '0%', stopColor: '#fff8dc' }),
        n.jsx('stop', { offset: '55%', stopColor: '#ffd76a' }),
        n.jsx('stop', { offset: '100%', stopColor: '#f2a145' })
      ] }),
      n.jsx('radialGradient', { id: 'wgXSunH', children: [
        n.jsx('stop', { offset: '0%', stopColor: 'rgba(255,213,110,.55)' }),
        n.jsx('stop', { offset: '60%', stopColor: 'rgba(255,203,100,.14)' }),
        n.jsx('stop', { offset: '100%', stopColor: 'rgba(255,203,100,0)' })
      ] }),
      n.jsx('linearGradient', { id: 'wgXMoonG', x1: 0, y1: 0, x2: .9, y2: 1, children: [
        n.jsx('stop', { offset: '0%', stopColor: '#fdfeff' }),
        n.jsx('stop', { offset: '55%', stopColor: '#e4ebf4' }),
        n.jsx('stop', { offset: '100%', stopColor: '#b7c5d8' })
      ] }),
      n.jsx('linearGradient', { id: 'wgXCD', x1: 0, y1: 0, x2: 0, y2: 1, children: [
        n.jsx('stop', { offset: '0%', stopColor: '#ffffff' }),
        n.jsx('stop', { offset: '50%', stopColor: '#ccd9e7' }),
        n.jsx('stop', { offset: '100%', stopColor: '#9db1c6' })
      ] }),
      n.jsx('linearGradient', { id: 'wgXCN', x1: 0, y1: 0, x2: 0, y2: 1, children: [
        n.jsx('stop', { offset: '0%', stopColor: '#8494ab' }),
        n.jsx('stop', { offset: '45%', stopColor: '#47536a' }),
        n.jsx('stop', { offset: '100%', stopColor: '#293043' })
      ] }),
      n.jsx('linearGradient', { id: 'wgXRainG', x1: 0, y1: 0, x2: 0, y2: 1, children: [
        n.jsx('stop', { offset: '0%', stopColor: 'rgba(206,227,255,0)' }),
        n.jsx('stop', { offset: '45%', stopColor: 'rgba(206,227,255,1)' }),
        n.jsx('stop', { offset: '100%', stopColor: 'rgba(206,227,255,0)' })
      ] }),
      n.jsx('linearGradient', { id: 'wgXFogG', x1: 0, y1: 0, x2: 0, y2: 1, children: [
        n.jsx('stop', { offset: '0%', stopColor: 'rgba(198,213,231,0)' }),
        n.jsx('stop', { offset: '40%', stopColor: 'rgba(208,222,238,.9)' }),
        n.jsx("stop", { offset: '100%', stopColor: 'rgba(198,213,231,0)' })
      ] }),
      n.jsx('clipPath', { id: 'wgXMC', children: n.jsx('path', { d: moonD || 'M0 0Z' }) }),
      n.jsx('filter', { id: 'wgXB2', x: '-40%', y: '-40%', width: '180%', height: '180%', children: n.jsx('feGaussianBlur', { stdDeviation: 2 }) }),
      n.jsx('filter', { id: 'wgXB3', x: '-60%', y: '-60%', width: '220%', height: '220%', children: n.jsx('feGaussianBlur', { stdDeviation: 4 }) }),
      n.jsxs('filter', { id: 'wgXGlow', children: [
        n.jsx('feGaussianBlur', { stdDeviation: 2.2, result: 'bl' }),
        n.jsxs('feMerge', { children: [n.jsx('feMergeNode', { in: 'bl' }), n.jsx('feMergeNode', { in: 'SourceGraphic' })] })
      ] })
    ] });
    return n.jsxs('svg', { className: 'wgXScene', viewBox: '0 0 200 110', preserveAspectRatio: 'xMidYMid meet', style: { width: '100%', height: '100%', display: 'block' }, children: [defs].concat(kids) });
  })();
  // ---- shared styles ----
  const st = {
    root: { position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '1cqh', padding: '1.2cqh 1.55cqw', background: 'linear-gradient(180deg,#0e1e38 0%,#0a1626 52%,#070f1d 100%)', overflow: 'hidden' },
    card: { position: 'relative', borderRadius: '1.05cqw', background: 'linear-gradient(180deg,#0e1b30 0%,#0a1526 100%)', border: '1px solid rgba(255,255,255,.055)', boxShadow: '0 .5cqh 2.2cqh rgba(0,0,0,.4)' },
    lbl: { fontSize: '1.28cqw', letterSpacing: '.13em', color: '#8fa3bd', fontWeight: 700 },
    lblS: { fontSize: '1.05cqw', letterSpacing: '.12em', color: '#7288a2', fontWeight: 700 },
    head: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' },
    hCity: { fontSize: '3.1cqw', fontWeight: 800, letterSpacing: '.06em', color: '#e8eef7', textTransform: 'uppercase' },
    hTime: { fontSize: '1.55cqw', fontWeight: 600, color: '#c4d2e2', letterSpacing: '.05em' },
    banner: { display: 'flex', alignItems: 'center', gap: '1cqw', minHeight: '5.6cqh', borderRadius: '.75cqw', padding: '0 1cqw 0 1.2cqw', background: 'linear-gradient(90deg,#e05f68 0%,#e98079 60%,#f0a48f 100%)', color: '#fff' },
    big: { fontSize: '8.8cqh', fontWeight: 800, color: '#f2f6fb', lineHeight: .95, letterSpacing: '-.02em' },
    amber: { color: '#f5b969', fontWeight: 700 },
    white: { color: '#eef3fa' },
    mut: { color: '#93a7c0' },
    pill: { display: 'inline-flex', alignItems: 'center', gap: '.45cqw', padding: '.45cqh .85cqw', borderRadius: '999px', background: 'rgba(255,255,255,.10)', border: '1px solid rgba(255,255,255,.22)', fontSize: '1.9cqh', fontWeight: 600, color: '#e6edf5' },
    val: { fontSize: '4.6cqh', fontWeight: 800, color: '#eef3fa' },
    valB: { fontSize: '4.2cqh', fontWeight: 800, color: '#eef3fa', lineHeight: 1 },
    dunit: { fontSize: '1.05cqw', color: '#7288a2', fontWeight: 600 },
    hum: { fontSize: '2.5cqh', fontWeight: 800, color: '#63b3f2' },
    windTxt: { fontSize: '1.85cqw', fontWeight: 800, color: '#eef3fa' },
    windMut: { fontSize: '1.55cqh', fontWeight: 600, color: '#8fa3bd' },
    tl: { fontSize: '1.35cqw', fontWeight: 700, color: '#eef3fa', letterSpacing: '.08em' },
    tls: { fontSize: '1.05cqw', fontWeight: 600, color: '#7288a2', letterSpacing: '.06em' }
  };
  // ---- sky backdrop wash only (the animated conditions scene lives in the hero content column now) ----
  const SKYBG = {
    d: 'linear-gradient(180deg,#3b6ea8 0%,#2c5687 55%,#24466f 100%)',
    n: 'linear-gradient(180deg,#1d2f55 0%,#152238 55%,#0d1728 100%)',
    tsd: 'linear-gradient(180deg,#374a63 0%,#27354a 60%,#1c2739 100%)',
    tsn: 'linear-gradient(180deg,#2a2f4a 0%,#1c2338 60%,#131a2c 100%)'
  };
  const skyKids = [
    n.jsx('div', { key: 'bg', style: { position: 'absolute', inset: 0, background: stormy ? (isDay ? SKYBG.tsd : SKYBG.tsn) : (isDay ? SKYBG.d : SKYBG.n) } })
  ];
  // ---- wind compass (SVG dial, needle points to wind origin) ----
  const needle = n.jsx('g', { transform: 'rotate(' + (wDeg != null ? wDeg : 0) + ' 50 50)', children: n.jsx('polygon', { points: '50 14 54 50 50 46 46 50', fill: '#eef3fa', style: { filter: 'drop-shadow(0 0 2px rgba(0,0,0,.6))' } }) });
  const dial = n.jsx('div', { style: { width: '9.4cqh', height: '9.4cqh' }, children: n.jsxs('svg', { viewBox: '0 0 100 100', width: '100%', height: '100%', children: [
    n.jsx('circle', { cx: 50, cy: 50, r: 47, fill: 'rgba(9,18,34,.55)', stroke: 'rgba(255,255,255,.32)', strokeWidth: 2.4 }),
    n.jsx('circle', { cx: 50, cy: 50, r: 37, fill: 'none', stroke: 'rgba(255,255,255,.14)', strokeWidth: 1 }),
    n.jsx('text', { x: 50, y: 17, textAnchor: 'middle', fontSize: 11, fill: '#dbe6f2', fontWeight: 800, children: 'N' }),
    n.jsx('text', { x: 50, y: 92, textAnchor: 'middle', fontSize: 9, fill: '#93a7c0', fontWeight: 700, children: 'S' }),
    n.jsx('text', { x: 8, y: 54, textAnchor: 'middle', fontSize: 9, fill: '#93a7c0', fontWeight: 700, children: 'W' }),
    n.jsx('text', { x: 92, y: 54, textAnchor: 'middle', fontSize: 9, fill: '#93a7c0', fontWeight: 700, children: 'E' }),
    needle,
    n.jsx('circle', { cx: 50, cy: 50, r: 3.4, fill: '#f5b969' })
  ] }) });
  // ---- hero pieces ----
  const sunT = dayProg > 0 && dayProg < 1;
  const sx = (1 - dayProg) * (1 - dayProg) * 18 + 2 * dayProg * (1 - dayProg) * 110 + dayProg * dayProg * 202;
  const sy = (1 - dayProg) * (1 - dayProg) * 88 + 2 * dayProg * (1 - dayProg) * 4 + dayProg * dayProg * 88;
  const drip = n.jsx('svg', { viewBox: '0 0 10 14', style: { width: '.9cqw' }, children: n.jsx('path', { d: 'M5 .8C5 .8 2 4.6 2 7.2a3 3 0 0 0 6 0C8 4.6 5 .8 5 .8Z', fill: '#63b3f2' }) });
  const heroTop = n.jsxs('div', { style: { display: 'flex', alignItems: 'flex-start', gap: '1.6cqw' }, children: [
    n.jsxs('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1.4cqh' }, children: [
      n.jsx('div', { style: st.big, children: outT != null ? outT + '\u00B0' : '\u2014' }),
      n.jsxs('div', { style: st.pill, children: [
        wxIco(heroKey, '2.5cqh', { height: '2.5cqh', filter: 'brightness(1.2) saturate(1.1)', animation: 'wgIcoBob 4.2s ease-in-out infinite alternate' }),
        n.jsx('span', { children: cond || (isDay ? 'Partly cloudy' : 'Clear') })
      ] })
    ] }),
    n.jsxs('div', { style: { display: 'flex', flexDirection: 'column', gap: '.5cqh', paddingTop: '1.2cqh' }, children: [
      n.jsx('div', { style: Object.assign({ fontSize: '3cqh' }, st.amber), children: feels != null ? 'Feels like ' + feels + '\u00B0' : 'Feels like \u2014' }),
      n.jsx('div', { style: Object.assign({ fontSize: '2.7cqh', fontWeight: 600 }, st.mut), children: cond || '\u2014' })
    ] })
  ] });
  const sensorCols = n.jsxs('div', { style: { display: 'flex', gap: '1.4cqw', flexShrink: 0 }, children: [
    n.jsxs('div', { style: { display: 'flex', flexDirection: 'column', gap: '.4cqh' }, children: [
      n.jsx('div', { style: st.lbl, children: 'OUTDOOR' }),
      n.jsxs('div', { children: [
        n.jsx('div', { style: st.valB, children: outT != null ? outT + '\u00B0' : '\u2014' }),
        n.jsxs('div', { style: { display: 'flex', alignItems: 'center', gap: '.3cqw', marginTop: '.4cqh', whiteSpace: 'nowrap' }, children: [
          drip,
          n.jsx('span', { style: st.hum, children: outHr != null ? outHr + '%' : '\u2014' }),
          n.jsx('span', { style: Object.assign({ fontSize: '.82cqw' }, st.mut), children: 'humidity' })
        ] })
      ] })
    ] }),
    n.jsxs('div', { style: { display: 'flex', flexDirection: 'column', gap: '.4cqh' }, children: [
      n.jsxs('div', { style: Object.assign({}, st.lbl, { borderBottom: '1px solid #d9b06a', alignSelf: 'flex-start', paddingBottom: '2px', whiteSpace: 'nowrap' }), children: 'INDOOR' }),
      n.jsxs('div', { children: [
        n.jsx('div', { style: st.valB, children: inT != null ? inT + '\u00B0' : '\u2014' }),
        n.jsxs('div', { style: { display: 'flex', alignItems: 'center', gap: '.3cqw', marginTop: '.4cqh', whiteSpace: 'nowrap' }, children: [
          drip,
          n.jsx('span', { style: st.hum, children: inHr != null ? inHr + '%' : '\u2014' }),
          n.jsx('span', { style: Object.assign({ fontSize: '.82cqw' }, st.mut), children: 'humidity' })
        ] })
      ] })
    ] })
  ] });
  const windBlock = n.jsx('div', { style: { display: 'flex', gap: '1cqw', alignItems: 'center', whiteSpace: 'nowrap', alignSelf: 'flex-start', flexShrink: 0 }, children: [
    dial,
    n.jsxs('div', { style: { display: 'flex', flexDirection: 'column', gap: '.4cqh', alignItems: 'flex-start' }, children: [
      n.jsx('div', { style: st.lbl, children: 'WIND' }),
      n.jsx('div', { style: st.windTxt, children: (wDir || '\u2014') + ' ' + (wMph != null ? wMph : '\u2014') + ' mph' }),
      n.jsx('div', { style: st.windMut, children: gust != null ? 'Gusts ' + gust + ' mph' : 'Gusts \u2014' })
    ] })
  ] });
  const arcCol = n.jsxs('div', { style: { flex: '1 1 auto', display: 'flex', flexDirection: 'column', gap: '.8cqh', minWidth: 0, minHeight: 0 }, children: [
    n.jsxs('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: '.55cqw', alignItems: 'baseline' }, children: [
      n.jsx('div', { style: st.lbl, children: 'PRESSURE' }),
      n.jsx('span', { style: Object.assign({}, st.white, { fontSize: '2.7cqh', fontWeight: 800 }), children: pIn != null ? pIn.toFixed(2) : '\u2014' }),
      n.jsx('span', { style: Object.assign({}, st.dunit, { color: '#b9c8da' }), children: 'inHg' }),
      n.jsx('span', { style: { fontSize: '2cqh', fontWeight: 800, color: pTrend === 'falling' ? '#f87171' : (pTrend === 'rising' ? '#4ade80' : '#93a7c0') }, children: pTrend === 'falling' ? '\u2198 Falling' : (pTrend === 'rising' ? '\u2197 Rising' : '\u2192 Steady') })
    ] }),
    n.jsxs('div', { style: { display: 'flex', alignItems: 'flex-end', gap: '.5cqw', flex: '1 1 auto', minHeight: 0 }, children: [
      n.jsxs('div', { style: { flex: '1 1 auto', display: 'flex', flexDirection: 'column', alignSelf: 'stretch', justifyContent: 'flex-end', minWidth: 0 }, children: [
        n.jsx('svg', { viewBox: '0 0 220 100', preserveAspectRatio: 'none', style: { width: '100%', height: '9.5cqh', display: 'block' }, children: [
          n.jsx('line', { x1: 8, y1: 88, x2: 212, y2: 88, stroke: 'rgba(255,255,255,.26)', strokeWidth: 1.2 }),
          n.jsx('defs', { children: n.jsx('linearGradient', { id: 'wgArcG', x1: 0, y1: 0, x2: 1, y2: 0, children: [
            n.jsx('stop', { offset: '0%', stopColor: '#f7b733' }),
            n.jsx('stop', { offset: '50%', stopColor: '#ffe9a8' }),
            n.jsx('stop', { offset: '100%', stopColor: '#fb923c' })
          ] }) }),
          n.jsx('path', { d: 'M18 88 Q110 4 202 88', fill: 'none', stroke: 'url(#wgArcG)', strokeWidth: 3.2, strokeLinecap: 'round' }),
          sunT ? n.jsx('circle', { cx: sx, cy: sy, r: 7, fill: '#fff2c7', style: { filter: 'drop-shadow(0 0 6px rgba(255,220,130,.95))' } }) : null,
          n.jsx('circle', { cx: 18, cy: 88, r: 6, fill: '#ffe9a8', style: { filter: 'drop-shadow(0 0 5px rgba(255,220,130,.9))' } }),
          n.jsx('circle', { cx: 202, cy: 88, r: 6, fill: '#fb923c', style: { filter: 'drop-shadow(0 0 5px rgba(251,146,60,.9))' } })
        ] }),
        n.jsxs('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '.2cqh' }, children: [
          n.jsxs('div', { style: { textAlign: 'center', flex: 1, whiteSpace: 'nowrap' }, children: [
            n.jsx('div', { style: Object.assign({}, st.lblS, { fontSize: '.82cqw' }), children: 'SUNRISE' }),
            n.jsx('div', { style: Object.assign({ fontSize: '1.15cqw' }, st.white, { fontWeight: 700, whiteSpace: 'nowrap' }), children: d0 ? fmt12(d0.sunrise) : '\u2014' })
          ] }),
          n.jsxs('div', { style: { textAlign: 'center', flex: 1.4, whiteSpace: 'nowrap' }, children: [
            n.jsx('div', { style: Object.assign({}, st.lblS, { fontSize: '.82cqw' }), children: 'DAYLIGHT' }),
            n.jsx('div', { style: Object.assign({ fontSize: '1.05cqw' }, st.white, { fontWeight: 700, whiteSpace: 'nowrap' }), children: dayLen != null ? (Math.floor(dayLen / 60) + 'h ' + (dayLen % 60) + 'm') : '\u2014' })
          ] }),
          n.jsxs('div', { style: { textAlign: 'center', flex: 1, whiteSpace: 'nowrap' }, children: [
            n.jsx('div', { style: Object.assign({}, st.lblS, { fontSize: '.82cqw' }), children: 'SUNSET' }),
            n.jsx('div', { style: Object.assign({ fontSize: '1.15cqw' }, st.white, { fontWeight: 700, whiteSpace: 'nowrap' }), children: d0 ? fmt12(d0.sunset) : '\u2014' })
          ] })
        ] })
      ] }),
      n.jsxs('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.3cqh', flexShrink: 0, paddingBottom: '.075cqh', whiteSpace: 'nowrap', transform: 'translate(5px, 5px)' }, children: [
        wxIco(isDay ? 'partly-cloudy-night' : 'clear-night', '2.2cqh', { height: '2.2cqh', filter: 'brightness(1.4)', animation: 'wgIcoBob 6.4s ease-in-out infinite alternate' }),
        n.jsx('div', { style: { fontSize: '.49cqw', fontWeight: 700, color: '#eef3fa', whiteSpace: 'nowrap', letterSpacing: '-.02em' }, children: 'OPEN-METEO' })
      ] })
    ] })
  ] });
  const heroBottom = n.jsxs('div', { style: { display: 'flex', alignItems: 'flex-end', gap: '1.6cqw', minHeight: 0, flexShrink: 0 }, children: [
    n.jsxs('div', { style: { display: 'flex', flexDirection: 'column', gap: '1cqh', flexShrink: 0 }, children: [
      sensorCols,
      windBlock
    ] }),
    arcCol
  ] });
  // "Weather updated h:mm" chip — pinned to the hero card's upper-right corner
  // (replaces the old full-width footer row: indoor-sensor text removed per user).
  // NOTE: declared BEFORE heroCard, which mounts it (avoid a TDZ ReferenceError).
  const updChip = n.jsx('div', { style: { position: 'absolute', top: '1.5cqh', right: '1.9cqw', zIndex: 3, fontSize: '1.05cqw', fontWeight: 600, letterSpacing: '.02em', color: 'rgba(226,236,247,.8)', textShadow: '0 1px 3px rgba(9,18,34,.4)', whiteSpace: 'nowrap' }, children: 'Weather updated ' + (updTimeStr || '\u2014') });
  // ---- 5-day hi/lo strip (ws7af): pinned to the bottom edge of the hero mid-spacer —
  // under the condition pill, between the big outdoor reading on top and the
  // OUTDOOR/INDOOR sensor columns in heroBottom. Renders nothing if the daily feed is empty.
  const fx5 = (function () {
    const cols = dly.slice(0, 5);
    if (!cols.length || cols[0].max == null) return null;
    const cells = [];
    cols.forEach(function (d, i) {
      const dn = i === 0 ? 'TODAY' : new Date(String(d.date) + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
      const ic = wxIconKey(d.code != null ? d.code : 2, 1);
      cells.push(n.jsxs('div', { key: 'fx' + i, style: { flex: '1 1 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.45cqh', minWidth: 0 }, children: [
        n.jsx('div', { style: { fontSize: '.78cqw', fontWeight: 700, letterSpacing: '.1em', color: i === 0 ? '#c9d6e6' : '#7288a2' }, children: dn }),
        wxIco(ic, '2.6cqh', { height: '2.6cqh', filter: 'brightness(1.15) saturate(1.05)', animation: 'wgIcoBob ' + (4.4 + (i % 3) * .7) + 's ease-in-out infinite alternate', animationDelay: (-i * .75) + 's' }),
        n.jsx('div', { style: { fontSize: '2.2cqh', fontWeight: 800, color: '#f5b969', lineHeight: 1 }, children: d.max != null ? d.max + '\u00B0' : '\u2014' }),
        n.jsx('div', { style: { fontSize: '1.72cqh', fontWeight: 600, color: '#93a7c0', lineHeight: 1 }, children: d.min != null ? d.min + '\u00B0' : '\u2014' })
      ] }));
    });
    return n.jsxs('div', { style: { flexShrink: 0, borderTop: '1px solid rgba(255,255,255,.13)', paddingTop: '.6cqh' }, children: [
      n.jsx('div', { style: Object.assign({}, st.lblS, { fontSize: '.82cqw' }), children: '5-DAY FORECAST' }),
      n.jsxs('div', { style: { display: 'flex', alignItems: 'flex-start', marginTop: '.55cqh' }, children: cells })
    ] });
  })();
  const heroCard = n.jsxs('div', { style: Object.assign({}, st.card, { flex: '1.02 1 0', overflow: 'hidden', minHeight: 0, display: 'flex', flexDirection: 'column' }), children: [
    n.jsx('div', { style: { position: 'absolute', inset: 0, zIndex: 1 }, children: skyKids }),
    n.jsxs('div', { style: { position: 'absolute', inset: 0, zIndex: 2, display: 'flex', flexDirection: 'column', padding: '1.5cqh 1.9cqw', minHeight: 0 }, children: [
      heroTop,
      n.jsx('div', { style: { flex: '1 1 auto', minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: '.55cqh' }, children: fx5 || undefined }),
      heroBottom
    ] }),
    n.jsx('div', { style: { position: 'absolute', right: '1.9cqw', top: '7cqh', width: '20cqw', height: '14.8cqh', zIndex: 2, pointerEvents: 'none' }, children: wxScene }),
    updChip
  ] });
  // ---- radar card: animated RainViewer radar (rwRV) — base OSM tiles fill the card edge-to-edge,
  // bright HOME beacon dead-center on 2141 Wolf Ridge Ln, Mount Dora 32757 (28.817422,-81.620514),
  // zoom 11, animated past+nowcast frames ----
  const radarCard = n.jsxs('div', { style: { position: 'relative', flex: '0.98 1 0', display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0, borderRadius: '1.05cqw', boxShadow: '0 .5cqh 2.2cqh rgba(0,0,0,.4)' }, children: [
    n.jsx(rwRV, { config: { lat: 28.817422, lon: -81.620514, zoom: 11, label: 'WEATHER RADAR', ctl: !0 } })
  ] });
  // ---- 12-hour chart card ----
  const temps = hl.map(function (h2) { return h2.temp; }).filter(function (x) { return x != null; });
  const lo = temps.length ? Math.min.apply(null, temps) : 0;
  const hi = temps.length ? Math.max.apply(null, temps) : 1;
  const linePts = hl.map(function (h2, i) { if (h2.temp == null) return null; const y = 24 - ((h2.temp - lo) / ((hi - lo) || 1)) * 17; return { x: (i + .5) * 100, y: y, t: h2.temp }; }).filter(Boolean);
  const lineD = linePts.map(function (p, i) { return (i === 0 ? 'M' : 'L') + p.x.toFixed(1) + ' ' + p.y.toFixed(1); }).join(' ');
  const hourLbl = function (t) {
    const hh = Number((String(t).split('T')[1] || '').split(':')[0]);
    if (isNaN(hh)) return '\u2014';
    const h12 = hh % 12 === 0 ? 12 : hh % 12;
    return h12 + ' ' + (hh < 12 ? 'AM' : 'PM');
  };
  const row = function (kids2, style) { return n.jsx('div', { style: Object.assign({ display: 'flex', flex: '1 1 auto', minHeight: 0 }, style || {}), children: kids2 }); };
  const col12 = function (kids2, k2) {
    return n.jsx('div', { key: k2, style: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', minWidth: 0 }, children: kids2 });
  };
  const chartCard = n.jsxs('div', { style: Object.assign({}, st.card, { padding: '1.2cqh 1.5cqw .8cqh', flexShrink: 0 }), children: [
    n.jsxs('div', { style: { display: 'flex', alignItems: 'baseline', gap: '1cqw', marginBottom: '.8cqh' }, children: [
      n.jsx('div', { style: { fontSize: '2.7cqh', fontWeight: 800, color: '#eef3fa', letterSpacing: '.01em' }, children: 'NEXT 12 HOURS' }),
      n.jsx('div', { style: Object.assign({}, st.lblS, { fontSize: '1.15cqw' }), children: 'Temperature & rain' })
    ] }),
    row(hl.map(function (h2, i) { return col12([n.jsx('div', { key: 't', style: { fontSize: '2.3cqh', fontWeight: 800, color: '#f5b969' }, children: h2.temp != null ? h2.temp + '\u00B0' : '\u2014' })], 'tt' + i); })),
    row(n.jsx('svg', { viewBox: '0 0 1200 30', preserveAspectRatio: 'none', style: { width: '100%', height: '2.2cqh', display: 'block', padding: '0 .4cqw' }, children: [
      n.jsx('path', { d: lineD, fill: 'none', stroke: '#e8a44c', strokeWidth: 2.6, strokeLinejoin: 'round', strokeLinecap: 'round' }),
      linePts.map(function (p, i) { return n.jsx('circle', { cx: p.x, cy: p.y, r: 3, fill: '#e8a44c' }, 'dp' + i); })
    ] }), { height: '2.2cqh', flex: '0 0 auto' }),
    row(hl.map(function (h2, i) { return col12([wxIco(h2.key, '2.4cqh', { height: '2.4cqh', filter: 'grayscale(1) brightness(2.2)', opacity: .85 })], 'wi' + i); })),
    row(hl.map(function (h2, i) { return col12([n.jsx('div', { key: 'p', style: { fontSize: '1.8cqh', fontWeight: 700, color: '#4fc3c9' }, children: h2.p > 0 ? h2.p + '%' : '' })], 'pp' + i); })),
    n.jsx('div', { style: { display: 'flex', height: '3.8cqh', alignItems: 'flex-end', padding: '0 .4cqw' }, children: hl.map(function (h2, i) {
      return col12([n.jsx('div', { key: 'b', style: { width: '62%', height: Math.max(.35, h2.p / 100 * 3.4) + 'cqh', borderRadius: '.25cqh .25cqh .15cqh .15cqh', background: 'linear-gradient(180deg,#43b6b6,#2c8f96)' } }, 'bar'+i)], 'hb' + i);
    }) }),
    row(hl.map(function (h2, i) { return col12([n.jsx('div', { key: 'h', style: { fontSize: '2cqh', fontWeight: 800, color: '#dfe8f2', marginTop: '.5cqh', whiteSpace: 'nowrap' }, children: hourLbl(h2.time) })], 'hh' + i); }), { flex: '0 0 auto' }),
    n.jsxs('div', { style: { display: 'flex', gap: '1.6cqw', alignItems: 'center', marginTop: '.8cqh', flex: '0 0 auto' }, children: [
      n.jsx('div', { style: { width: '.9cqw', height: '.9cqw', borderRadius: '.2cqw', background: '#e8a44c' } }),
      n.jsx('span', { style: { fontSize: '1.05cqw', fontFamily: 'inherit', fontWeight: 600, color: '#93a7c0' }, children: 'Temperature \u00B0F' }),
      n.jsx('div', { style: { width: '.9cqw', height: '.9cqw', borderRadius: '.2cqw', background: '#43b6b6' } }),
      n.jsx('span', { style: { fontSize: '1.05cqw', fontWeight: 600, color: '#93a7c0' }, children: 'Rain chance %' })
    ] })
  ] });
  const alertBanner = a0 ? n.jsxs('div', { style: st.banner, children: [
    n.jsx('svg', { viewBox: '0 0 24 24', style: { width: '2.1cqw', height: '2.1cqw', flexShrink: 0 }, children: n.jsxs('g', { children: [
      n.jsx('path', { d: 'M12 2.6 23 21H1L12 2.6Z', fill: '#ffffff' }),
      n.jsx('rect', { x: 11, y: 9, width: 2, height: 6.4, rx: 1, fill: '#e05f68' }),
      n.jsx('rect', { x: 11, y: 16.8, width: 2, height: 2, rx: 1, fill: '#e05f68' })
    ] }) }),
    n.jsx('div', { style: { fontSize: '1.9cqw', fontWeight: 800, letterSpacing: '.06em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }, children: String(a0.event || 'WEATHER ALERT').toUpperCase() + (alerts.length > 1 ? ' +' + (alerts.length - 1) : '') }),
    n.jsx('div', { style: { flex: '1 1 auto' } }),
    n.jsx('div', { style: { fontSize: '1.35cqw', fontWeight: 600, whiteSpace: 'nowrap', opacity: .92 }, children: 'View details \u203A' })
  ] }) : null;
  // ---- root ----
  return n.jsxs('div', { className: ff, style: st.root, children: [
    n.jsx('style', { children: WG_CSS }),
    n.jsxs('div', { style: st.head, children: [
      n.jsx('div', { style: st.hCity, children: city }),
      n.jsx('div', { style: st.hTime, children: headerDate + ' \u00B7 ' + headerTime })
    ] }),
    alertBanner,
    n.jsxs('div', { style: { display: 'flex', gap: '1.1cqw', flex: '1 1 auto', minHeight: 0 }, children: [heroCard, radarCard] }),
    chartCard
  ] });
}


// ===== ported from wave4/fd_weather/rw-rainview-comp.js =====
// rwRV — standalone radar deck (ws7aj): Rainbow Weather nowcast is PRIMARY (its Tiles API is the
// guaranteed future radar), served through the local express proxy /radar/api so the subscription
// key never leaves the server; the original RainViewer public-API deck stays untouched as an
// AUTOMATIC fallback the moment the proxy health says otherwise (offline / quota-broken).
// Timeline (ws7aj): Rainbow publishes its global frames at a fixed 10-min cadence but the
// snapshot id IS NOT wall-clock (their published edge lags real time), so the deck takes the
// snapshot from the proxy (/radar/api/snapshot — 1 upstream call, 2-min proxy cache, last-good
// kept). Frame math at that snap is fully deterministic. Deck = the 7 past
// frames at that cadence (the last hour) + ONE Rainbow nowcast frame at +2 h (ws7am: offset 7200
// — the old tail was +30 m; Rainbow guarantees nowcasts to +4 h in 10-min steps, offsets
// 600..14400, so any offset is available — and the free-tier proxy quota charges per (snap,
// offset) family minted on every publish roll (~12 tiles), so ONE further-out frame costs the
// same as the old +30 m while reaching four times further). Playback (ws7ah)
// engine kept: 620 ms beats, 1.24 s full-dwell crossfades, HUD clock in interpolated 5-min
// stamps, 2-beat hold on the newest frame, forward-only loop (oldest -> now -> forecast, wraps).
// Fallback (health = 0): RainViewer's last 7 past frames (1 h sweep at its 10-min publish
// cadence, re-pulled every 5 min) + the free nowcast tail when upstream serves it
// ("nowcast":[] is upstream-intermittent; the tail reappears by itself).
// Palette: Rainbow tiles use color=0..9 (4 "Nexrad", 5 "Rainviewer", 8 = "RainViewer Universal
// Blue"); the stored RainViewer palette id maps to the closest Rainbow one (RV2RBK below).
// config keys: lat, lon, zoom (3-13, default 7), color (palette id), label, pause (1 = freeze
// frame), ctl (1 = +/- zoom buttons + two-finger pinch on the map; zoom persists per label in
// localStorage). Zoom ceiling ws7al: max rvZoom is 13 (ws7ak took it 11 -> 12; Rainbow's nowcast
// grid is native to z10 — live-probed: real structure at z8/z9/z10 over a wet z7 cell, z11/12
// blank — so rbk frames render to z10 and only upscale beyond; RainViewer's tilecache still caps
// at z7). 13 is the last useful level: the OSM base keeps real detail while the rain overlay
// upscales 8x from real z10 tiles.
function rwRV(props) {
  const a = (props && props.config) || {};
  const lat = isFinite(Number(a.lat)) ? Number(a.lat) : 28.817422;
  const lon = isFinite(Number(a.lon)) ? Number(a.lon) : -81.620514;
  const NZ = Math.min(Math.max(Math.round(Number(a.zoom)) || 7, 3), 13);
  // color semantics (ws7aj): config.rainbowP = 1 => a.color is ALREADY a Rainbow palette id
  // (blocks edited after the fork); otherwise a.color is a legacy RainViewer id mapped through
  // RV2RBK (the wall's stored 6 = RV "Dark Sky" -> Rainbow 8 "Universal Blue").
  const RV2RBK = { 0: 0, 1: 1, 2: 8, 3: 2, 4: 6, 5: 5, 6: 8, 7: 7, 8: 9, 9: 4 };
  const cc0 = (a.color !== '' && a.color != null && isFinite(Number(a.color))) ? Math.max(0, Math.min(9, Number(a.color))) : null;
  const COLRV = (cc0 != null) ? cc0 : 6;
  const COLRB = ((cc0 != null) && (a.rainbowP === 1)) ? cc0 : ((RV2RBK[(cc0 != null) ? cc0 : 6] != null) ? RV2RBK[(cc0 != null) ? cc0 : 6] : 8);
  const rvLabel = a.label || 'RAINBOW NOWCAST';
  const PAUSE = (a.pause === true || Number(a.pause) === 1);
  const CTL = (a.ctl === true || Number(a.ctl) === 1);
  let rvZ0 = NZ;
  if (CTL) { try { const lz = Math.round(Number(localStorage.getItem('rwRVz:' + rvLabel))); if (lz >= 3 && lz <= 13) rvZ0 = lz; } catch (e) {} }
  const rvZ = b.useState(rvZ0); const rvZoom = rvZ[0];
  const rvSet = function (z) { z = Math.min(Math.max(Math.round(Number(z)), 3), 13); if (CTL) { try { localStorage.setItem('rwRVz:' + rvLabel, String(z)); } catch (e) {} } rvZ[1](z); };
  const rvPinch = b.useRef(null);
  const pvStart = function (e) { if (!CTL || !e.touches || e.touches.length !== 2) return; const dx = e.touches[0].clientX - e.touches[1].clientX, dy = e.touches[0].clientY - e.touches[1].clientY; rvPinch.current = Math.sqrt(dx * dx + dy * dy); };
  const pvMove = function (e) { if (!CTL || rvPinch.current == null || !e.touches || e.touches.length !== 2) return; const dx = e.touches[0].clientX - e.touches[1].clientX, dy = e.touches[0].clientY - e.touches[1].clientY; const d = Math.sqrt(dx * dx + dy * dy); const r = d / rvPinch.current; if (r > 1.35) { rvSet(rvZoom + 1); rvPinch.current = d; } else if (r < 0.74) { rvSet(rvZoom - 1); rvPinch.current = d; } };
  const pvEnd = function () { rvPinch.current = null; };
  const rvD = b.useState(null); const rvData = rvD[0]; const setRvData = rvD[1];
  // ws7aj state: rbkOK = proxy health (null unknown / 1 ok / 0 down), rbkSnap = { s, tier, f }
  // with the AUTHORED edge snapshot (proxy-served from Rainbow's snapshot endpoint; the published
  // edge is NOT wall-clock — it lags real time — so the deck never derives it locally; the proxy
  // caches it for 2 min and keeps the last good) and its ladder deck (7 real frames + the
  // tier-scaled future tail of ws7ar); refreshed every 2 min. rbkLeft = the proxy's monthly-quota
  // meter (health usage.left) that picks the tier; the tier ladder itself lives in rbkTier below.
  const rbkH = b.useState(null); const rbkOK = rbkH[0]; const setRbkOK = rbkH[1];
  const rbkM = b.useState(null); const rbkSnap = rbkM[0]; const setRbkSnap = rbkM[1];
  const rbkLeft = b.useRef(null);
  b.useEffect(function () {
    let dead = false;
    const hp = function () { fetch('/radar/api/health', { cache: 'no-store' }).then(function (r) { if (!dead) setRbkOK(r.ok ? 1 : 0); }).catch(function () { if (!dead) setRbkOK(0); }); };
    hp(); const iv = setInterval(hp, 120000); return function () { dead = true; clearInterval(iv); };
  }, []);
  b.useEffect(function () {
    let dead = false;
    // ws7ar ladder — the proxy quota charges ~9-12 upstream tiles per (snap, offset) family minted
    // on each publish roll, and only FRESH future offsets are new mints every roll (past frames
    // recycle disk cache from earlier rolls), so the future tail COUNT is the quota lever (offset
    // reach is free). The ws7am pre-flight measured a 6-step first-hour sweep at ~900-1100
    // upstream calls/day vs the 9300/month brake — it would trip in ~8 days and kill the future
    // tail until the month reset. This ladder instead scales the tail to usage.left (read fresh
    // from /radar/api/health on every tick, ordered before the snapshot fetch): tier 2 = six real
    // steps +10..+60 (13-frame deck); tier 1 = every other step +20/+40/+60 (10 frames); tier 0 =
    // the single +2 h frame (8 frames). Thresholds 7800/7000 are budget-balanced against the
    // measured per-tier burn (~970 / ~610 / ~250 calls/day), so a rich meter sweeps, a draining
    // meter trims gracefully, and the deck never collapses (unknown left stays starve-safe on
    // tier 0; the monthly reset restores the sweep automatically). Real anchors stay on Rainbow's
    // 10-min grid — a literal 5-min offset would be rejected (snap/offset lattice is 600 s).
    const rbkTier = function (l) { return (l == null) ? 0 : (l >= 7800 ? 2 : (l >= 7000 ? 1 : 0)); };
    const rbkBuild = function (s, tier) {
      const fr = [];
      for (let K2 = 6; K2 >= 1; K2--) fr.push({ time: s - K2 * 600, s: s - K2 * 600, o: 0, rbk: 1, path: 'rbk' + K2 });
      fr.push({ time: s, s: s, o: 0, rbk: 1, path: 'rbk0' });
      if (tier === 2) { for (let F3 = 600; F3 <= 3600; F3 += 600) fr.push({ time: s + F3, s: s, o: F3, rbk: 1, path: 'rbkFw' + F3 }); }
      else if (tier === 1) { for (let F4 = 1200; F4 <= 3600; F4 += 1200) fr.push({ time: s + F4, s: s, o: F4, rbk: 1, path: 'rbkFw' + F4 }); }
      else { fr.push({ time: s + 7200, s: s, o: 7200, rbk: 1, path: 'rbkF' }); }
      return { s: s, tier: tier, f: fr };
    };
    const tk = function () {
      if (dead) return;
      fetch('/radar/api/health', { cache: 'no-store' }).then(function (r3) { return (r3 && r3.ok) ? r3.json() : null; }).then(function (j3) {
        if (j3 && j3.usage && Number.isFinite(j3.usage.left)) rbkLeft.current = j3.usage.left;
        return fetch('/radar/api/snapshot', { cache: 'no-store' });
      }).then(function (r2) { return r2.ok ? r2.json() : Promise.reject(new Error('http ' + r2.status)); }).then(function (j2) {
        if (dead || !j2 || !j2.snapshot) return;
        const t3 = rbkTier(rbkLeft.current);
        setRbkSnap(function (old) { return (old && old.s === j2.snapshot && old.tier === t3) ? old : rbkBuild(j2.snapshot, t3); });
      }).catch(function () {});
    };
    tk(); const iv2 = setInterval(tk, 120000); return function () { dead = true; clearInterval(iv2); };
  }, []);
  // rvBuffer: n = frame index painted on the front layer, o = on the back layer, k = which layer is front
  const rvB = b.useState({ n: -1, o: -1, k: 0 }); const rvBuf = rvB[0]; const setBuf = rvB[1];
  const rvP = b.useState(!PAUSE); const rvPlay = rvP[0]; const setRvPlay = rvP[1];
  const rvM = b.useState({ w: 0, h: 0 }); const rvBox = rvM[0]; const setRvBox = rvM[1];
  const rvRef = b.useRef(null);
  // rvClock (ws7ah): HUD timestamp = the time the visible blend represents. Flip beats keep the
  // outgoing real frame's time; mid beats show the interpolated 5-min stamp (0 falls back to
  // rvFrame.time, so the initial render and PAUSE always show a real frame).
  const rvS = b.useState(0); const rvStT = rvS[0]; const rvsT = rvS[1];
  b.useEffect(function () {
    let dead = false;
    const pull = function () { fetch('https://api.rainviewer.com/public/weather-maps.json').then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('http ' + r.status)); }).then(function (j) { if (!dead) setRvData(j); }).catch(function () { if (!dead) setRvData(null); }); };
    pull(); const iv = setInterval(pull, 300000); return function () { dead = true; clearInterval(iv); };
  }, []);
  // ws7ar timeline: Rainbow mode (proxy healthy) = the ladder deck — 7 real frames of the past
  // hour at the fixed 10-min cadence + a tier tail chosen by the quota ladder above: tier 2 =
  // six future steps +10..+60, tier 1 = +20/+40/+60, tier 0 = the single +2 h frame (offset
  // 7200; measured on the live proxy 2026-11-20: every publish roll mints its (snap, offset)
  // family at ~12 tiles and only FRESH future families are new mints each roll — past frames
  // recycle earlier rolls' disk cache — so the tail COUNT is the quota lever and offset reach
  // is free; the blind 6-step sweep measured ~900+ upstream calls/day vs the 9300/month brake,
  // hence the ladder instead of a fixed ramp).
  // Fallback mode (rbkOK 0/ null, or no data yet): the original RainViewer deck — the last 7
  // past frames (1 h sweep at RainViewer's 10-min publish cadence; the timeline refetch below
  // runs every 5 min so new frames land within ≤5 min) + the free +30 min nowcast tail when
  // upstream serves it (probed 2026-11-20 weather-maps.json even served "nowcast":[] — the tail
  // appears by itself when frames return). Wall: 1 h + FCST in both modes.
  // Playback (ws7ah) halves the perceived step: each crossfade spans TWO 620 ms beats and the
  // HUD clock ticks in interpolated 5-min stamps between adjacent real anchors (10 min apart),
  // so an anchor sweep reads in ~5-minute increments — motion stays continuous; the loop runs
  // ~9.9 s without FCST, ~11.2-16.1 s with the tier tail, and the prefetch covers the whole deck.
  const rvNC = (rvData && rvData.radar && rvData.radar.nowcast) ? rvData.radar.nowcast : [];
  const rvRBK = (rbkOK === 1 && rbkSnap);
  const rvFrames = (rvRBK && rbkSnap) ? rbkSnap.f : (rvData && rvData.radar) ? (rvData.radar.past || []).slice(-7).concat(rvNC) : [];
  rvFrames.np = (rvRBK && rbkSnap) ? 7 : Math.min((rvData && rvData.radar && rvData.radar.past || []).length, 7);
  // rvXF v4 (ws7ah) — full-dwell continuous blend + forward-only radar loop. Two stacked overlay
  // layers swap roles every second 620 ms beat: the outgoing frame fades out while the incoming
  // fades in ('opacity 1.24s linear' = the whole 2-beat crossfade), so the loop morphs
  // continuously with no hold-snap between frames (fade-in + fade-out weights always sum to 1).
  // Every frame's tiles are prefetched (rvPL), and the playhead (rvPP) always steps forward —
  // through now, into the nowcast — wrapping back to the oldest after a beat on the newest.
  const rvPos = b.useRef(-1); const rvHold = b.useRef(0);
  const rvN = b.useRef(-1); const rvK = b.useRef(0); const rvPre = b.useRef([]);
  const rvBeat = b.useRef(0); const rvPrev = b.useRef(-1);
  // start on the NOW frame (latest past frame in the current deck); rebuild when the source
  // flips (proxy health) or a new Rainbow snapshot rolls — same-snapshot recomputes are no-ops
  b.useEffect(function () {
    const L = rvFrames.length;
    if (!L) return;
    const nPast = Math.min(rvFrames.np || 7, L - 1);
    const cur = nPast > 0 ? nPast - 1 : Math.max(0, L - 1);
    rvPos.current = cur; rvN.current = cur; rvK.current = 0; rvHold.current = 0; rvBeat.current = 0;
    setBuf({ n: cur, o: cur, k: 0 });
    rvsT(0);
  }, [rvData, rbkSnap, rbkOK]);
  // rvPP (ws7ah) — forward-only playback with the interpolated clock: every second 620 ms beat
  // flips the layers and starts the next 1.24 s crossfade (HUD = outgoing frame's time); the
  // alternate mid beat only advances the HUD to the midpoint stamp between the two blending real
  // frames (the on-screen blend genuinely IS that midpoint; skipped when the pair steps
  // backwards on the wrap). 2-beat hold on the newest (forecast) frame, then wrap to the oldest.
  b.useEffect(function () {
    if (!rvPlay || rvFrames.length < 2) return;
    const stampOf = function (i) { const f = rvFrames[i]; return f && f.time ? f.time : 0; };
    const t = setInterval(function () {
      const L = rvFrames.length;
      if (rvBeat.current === 1) {
        rvBeat.current = 0;
        const fA = rvFrames[rvPrev.current], fB = rvFrames[rvN.current];
        const gp = (fA && fB && fA.time && fB.time) ? (fB.time - fA.time) : 0;
        rvsT((gp > 0 && gp <= 620000) ? Math.round((fA.time + fB.time) / 2) : stampOf(rvN.current));
        return;
      }
      if (rvHold.current > 0) { rvHold.current--; rvsT(stampOf(rvN.current)); return; }
      const p = (rvPos.current + 1) % L;
      if (p === rvPos.current) return;
      rvPrev.current = rvN.current;
      rvPos.current = p; rvN.current = p; rvK.current = 1 - rvK.current;
      rvBeat.current = 1;
      if (p === L - 1) rvHold.current = 2;
      rvsT(stampOf(rvPrev.current));
      setBuf({ n: p, o: rvPrev.current, k: rvK.current });
    }, 620);
    return function () { clearInterval(t); };
  }, [rvPlay, rbkSnap, rbkOK, rvData]);
  b.useEffect(function () {
    const el = rvRef.current; if (!el) return;
    const upd = function () { setRvBox({ w: el.clientWidth || 0, h: el.clientHeight || 0 }); };
    upd();
    let ro = null;
    try { ro = new ResizeObserver(upd); ro.observe(el); } catch (e) { window.addEventListener('resize', upd); }
    return function () { if (ro) ro.disconnect(); else window.removeEventListener('resize', upd); };
  }, []);
  const rvFrame = (rvFrames.length > 0 && rvBuf.n >= 0) ? rvFrames[Math.min(rvBuf.n, rvFrames.length - 1)] : null;
  const nT = Math.pow(2, rvZoom); const TS = 256;
  const rfx = (lon + 180) / 360 * nT;
  const rra = lat * Math.PI / 180;
  const rfy = (1 - Math.log(Math.tan(rra) + 1 / Math.cos(rra)) / Math.PI) / 2 * nT;
  const cpx = rfx * TS; const cpy = rfy * TS;
  const halfW = rvBox.w / 2; const halfH = rvBox.h / 2;
  // Per-source overlay caps (ws7ak): RainViewer's public tilecache caps radar tiles at zoom 7,
  // Rainbow's nowcast grid is native to z10 (probed: real structure per level z8-10, z11+ blank)
  // -> overlay renders at OZ<=10 for Rainbow frames / <=7 for RV frames, scaled up to match NZ
  // (the existing OV scale wrapper handles rvZoom > OZ, so deep zooms never blank — they upscale
  // the deepest REAL data instead of the old z7 mush).
  const OZ = Math.min(rvZoom, rvRBK ? 10 : 7);
  const OV = Math.pow(2, rvZoom - OZ);
  const nTo = Math.pow(2, OZ);
  const fxO = (lon + 180) / 360 * nTo;
  const rraO = lat * Math.PI / 180;
  const fyO = (1 - Math.log(Math.tan(rraO) + 1 / Math.cos(rraO)) / Math.PI) / 2 * nTo;
  const cpxO = fxO * TS; const cpyO = fyO * TS;
  // rvBS — supersampled base below zoom 10: draw OSM from BZ = rvZoom + SS (SS<=2, BZ capped at 10),
  // each tile downscaled to btS = 256/2^SS screen px, so zooming out keeps street/lake/label detail
  // density instead of flipping to sparse low-zoom rasters. sc = nT/nB maps base px -> screen px.
  const SS = Math.min(2, Math.max(0, 10 - rvZoom));
  const BZ = rvZoom + SS;
  const nB = Math.pow(2, BZ);
  const btS = TS * nT / nB;
  const fxB = (lon + 180) / 360 * nB;
  const fyB = (1 - Math.log(Math.tan(rra) + 1 / Math.cos(rra)) / Math.PI) / 2 * nB;
  const cpxB = fxB * TS; const cpyB = fyB * TS;
  const sc = nT / nB;
  const b0x = rvBox.w ? Math.floor((cpxB - halfW / sc) / TS) : Math.floor(fxB) - 1;
  const b0y = rvBox.h ? Math.floor((cpyB - halfH / sc) / TS) : Math.floor(fyB) - 1;
  const bcX = rvBox.w ? Math.ceil(rvBox.w / btS) + 1 : 3;
  const bcY = rvBox.h ? Math.ceil(rvBox.h / btS) + 1 : 3;
  const baseTiles = [];
  for (let X = 0; X < bcX; X++) { for (let Y = 0; Y < bcY; Y++) {
    const tx = b0x + X, ty = b0y + Y;
    if (ty < 0 || ty >= nB) continue;
    baseTiles.push({ wx: ((tx % nB) + nB) % nB, y: ty, left: (tx * TS - cpxB) * sc + halfW, top: (ty * TS - cpyB) * sc + halfH, key: 'rvb' + BZ + '_' + tx + '_' + ty });
  } }
  const o0x2 = rvBox.w ? Math.floor((cpxO - halfW / OV) / TS) : Math.floor(fxO) - 1;
  const o0y = rvBox.h ? Math.floor((cpyO - halfH / OV) / TS) : Math.floor(fyO) - 1;
  const ocntX = rvBox.w ? Math.ceil(rvBox.w / TS / OV) + 1 : 3;
  const ocntY = rvBox.h ? Math.ceil(rvBox.h / TS / OV) + 1 : 3;
  const rvTiles = [];
  for (let X = 0; X < ocntX; X++) { for (let Y = 0; Y < ocntY; Y++) {
    const tx = o0x2 + X, ty = o0y + Y;
    if (ty < 0 || ty >= nTo) continue;
    rvTiles.push({ wx: ((tx % nTo) + nTo) % nTo, y: ty, tx: tx, key: 'rvt' + tx + '_' + ty });
  } }
  // frUrl (ws7aj): one URL builder for both sources — Rainbow frames go through the local express
  // proxy (/radar/api/tiles/v1/precip-global/{snap}/{off}/{z}/{x}/{y}?color=N; key injected by
  // the server, tiles disk-cached) while RainViewer fallback frames keep the public tilecache
  // scheme (host + path + size/zoom/tile/palette/1_1.png).
  const frUrl = function (f, x, y) {
    if (!f) return '';
    if (f.rbk) return '/radar/api/tiles/v1/precip-global/' + f.s + '/' + f.o + '/' + OZ + '/' + x + '/' + y + '?color=' + COLRB;
    return (rvData && rvData.host) ? rvData.host + f.path + '/' + TS + '/' + OZ + '/' + x + '/' + y + '/' + COLRV + '/1_1.png' : '';
  };
  // rvPL — prefetch every overlay tile of every frame once, so crossfades never wait on the network
  b.useEffect(function () {
    if (rvBox.w < 2 || rvTiles.length === 0 || rvFrames.length === 0) return;
    const ims = [];
    for (let F = 0; F < rvFrames.length; F++) {
      const f = rvFrames[F]; if (!f) continue;
      for (let T = 0; T < rvTiles.length; T++) { const t = rvTiles[T]; try { const u2 = frUrl(f, t.wx, t.y); if (u2) { const im = new Image(); im.src = u2; ims.push(im); } } catch (e) {} }
    }
    rvPre.current = ims;
  }, [rvData, rbkSnap, rbkOK, rvZoom, rvBox.w, rvBox.h]);
  const rvShowT = rvStT || (rvFrame && rvFrame.time ? rvFrame.time : 0);
  const rvTime = rvShowT ? new Date(rvShowT * 1000) : null;
  const rvTimeStr = rvTime ? (((rvTime.getHours() % 12) === 0 ? 12 : rvTime.getHours() % 12) + ':' + (rvTime.getMinutes() < 10 ? '0' : '') + rvTime.getMinutes() + (rvTime.getHours() < 12 ? ' AM' : ' PM')) : '';
  // rvFC — forecast badge: nowcast frames sit in the future, so show an "FCST +Nm" pill by the
  // clock (past 90 min the badge reads "+Nh" so the +2 h tail frame stays compact)
  const rvNow = Date.now() / 1000;
  const rvFcst = rvFrame && rvFrame.time && rvFrame.time > rvNow + 60;
  const rvFcMin = rvFcst ? Math.round((rvFrame.time - rvNow) / 60) : 0;
  return n.jsxs('div', { className: 'h-full w-full flex flex-col overflow-hidden relative', style: { background: 'linear-gradient(180deg,#101c30 0%,#0a1526 100%)', borderRadius: 14, border: '1px solid rgba(255,255,255,.06)' }, children: [
    n.jsxs('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px 4px', flexShrink: 0 }, children: [
      n.jsx('div', { style: { fontSize: '11pt', fontWeight: 800, letterSpacing: '.08em', color: '#dbe4f0', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }, children: rvLabel }),
      n.jsxs('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }, children: [
        CTL ? n.jsx('button', { type: 'button', onClick: function () { rvSet(rvZoom - 1); }, style: { width: 24, height: 24, borderRadius: '999px', border: '1px solid rgba(255,255,255,.25)', background: 'rgba(255,255,255,.08)', color: '#e2e9f2', fontSize: 13, lineHeight: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, opacity: rvZoom <= 3 ? 0.35 : 1 }, children: '\u2212' }) : null,
        CTL ? n.jsx('button', { type: 'button', onClick: function () { rvSet(rvZoom + 1); }, style: { width: 24, height: 24, borderRadius: '999px', border: '1px solid rgba(255,255,255,.25)', background: 'rgba(255,255,255,.08)', color: '#e2e9f2', fontSize: 12, lineHeight: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, opacity: rvZoom >= 10 ? 0.35 : 1 }, children: '+' }) : null,
        n.jsx('button', { type: 'button', onClick: function () { setRvPlay(!rvPlay); }, style: { width: 22, height: 22, borderRadius: '999px', border: '1px solid rgba(255,255,255,.25)', background: 'rgba(255,255,255,.08)', color: '#e2e9f2', fontSize: 10, lineHeight: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }, children: rvPlay ? '\u23F8' : '\u25B6' }),
        n.jsx('span', { style: { fontSize: '9pt', color: '#93a7c0', fontWeight: 600 }, children: rvTimeStr || 'Loading\u2026' }),
        rvFcst ? n.jsx('span', { style: { fontSize: '8pt', fontWeight: 800, letterSpacing: '.08em', color: '#7ff3ff', background: 'rgba(0,140,160,.28)', border: '1px solid rgba(127,243,255,.55)', borderRadius: 6, padding: '1px 6px', whiteSpace: 'nowrap' }, children: 'FCST +' + (rvFcMin < 90 ? rvFcMin + 'm' : (Math.round(rvFcMin / 30) / 2) + 'h') }) : null
      ] })
    ] }),
    n.jsx('div', { ref: rvRef, onTouchStart: pvStart, onTouchMove: pvMove, onTouchEnd: pvEnd, onTouchCancel: pvEnd, style: { position: 'relative', flex: '1 1 auto', minHeight: 0, overflow: 'hidden', touchAction: CTL ? 'none' : undefined }, children: rvBox.w ? n.jsxs('div', { style: { position: 'absolute', left: 0, top: 0 }, children: [
      baseTiles.map(function (t) {
        return n.jsx('div', { style: { position: 'absolute', left: t.left + 'px', top: t.top + 'px', width: btS + 'px', height: btS + 'px', backgroundImage: 'url(https://tile.openstreetmap.org/' + BZ + '/' + t.wx + '/' + t.y + '.png)', backgroundSize: btS + 'px ' + btS + 'px', display: 'block', filter: 'invert(.88) hue-rotate(175deg) brightness(.85) saturate(.35)' } }, t.key);
      }),
      // rvXF — two stacked radar layers: the incoming frame stays blended over the outgoing one.
      // GEOMETRY (rvXF wrapper): rain tiles live at the overlay's native zoom (OZ<=10 for
      // Rainbow frames, <=7 for RainViewer ones — server API caps) but the panel shows NZ,
      // so each layer wraps its tile grid in a scale(OV) wrapper pinned at (halfW - cpxO*OV,
      // halfH - cpyO*OV) with transformOrigin '0 0' — without it tiles land at raw zoom-7 px
      // coords (~9000px) far outside the panel and only the map shows.
      [0, 1].map(function (K) {
        const fi = rvBuf.k === K ? rvBuf.n : rvBuf.o;
        const f = (fi >= 0 && rvFrames.length > 0) ? rvFrames[Math.min(fi, rvFrames.length - 1)] : null;
        return n.jsxs('div', { style: { position: 'absolute', left: 0, top: 0, opacity: rvBuf.k === K ? 1 : 0, transition: 'opacity 1.24s linear', pointerEvents: 'none' }, children: [n.jsxs('div', { style: { position: 'absolute', left: (halfW - cpxO * OV) + 'px', top: (halfH - cpyO * OV) + 'px', transform: 'scale(' + OV + ')', transformOrigin: '0 0', width: '1px', height: '1px' }, children: [rvTiles.map(function (t) {
          return n.jsxs('div', { style: { position: 'absolute', left: t.tx * TS + 'px', top: t.y * TS + 'px', width: TS + 'px', height: TS + 'px' }, children: [
            (f && frUrl(f, t.wx, t.y)) ? n.jsx('div', { style: { position: 'absolute', left: 0, top: 0, width: TS + 'px', height: TS + 'px', backgroundImage: 'url(' + frUrl(f, t.wx, t.y) + ')', backgroundSize: '256px 256px', pointerEvents: 'none' } }, 'fr' + fi + 'L' + K) : null
          ] }, t.key + 'L' + K);
        })] })] }, 'rvLy' + K);
      }),
      // rwHome — bright beacon at the map center = 2141 Wolf Ridge Ln, Mount Dora (home address).
      // Magenta pops against NEXRAD green/yellow radar colors AND the dark base; white core pins
      // the exact point; pulsing halo makes it unmissable on the dim kiosk at glance distance.
      // IMPORTANT: anchor uses halfW/halfH px — % offsets resolve against the 0x0 offset container
      // (base tiles are centered the same way), so '50%' here would land at the panel's top-left.
      n.jsxs('div', { style: { position: 'absolute', left: halfW + 'px', top: halfH + 'px', width: 0, height: 0, pointerEvents: 'none' }, children: [
        n.jsx('style', { children: '@keyframes rwPulse{0%{transform:scale(.5);opacity:.9}75%{opacity:.18}100%{transform:scale(2.3);opacity:0}}' }),
        n.jsx('span', { style: { position: 'absolute', left: -27, top: -27, width: 54, height: 54, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,43,214,.5) 0%, rgba(255,43,214,.16) 48%, rgba(255,43,214,0) 72%)', animation: 'rwPulse 1.7s ease-out infinite' } }),
        n.jsx('span', { style: { position: 'absolute', left: -11, top: -11, width: 22, height: 22, borderRadius: '50%', border: '2px solid #ff2bd6', background: 'rgba(255,43,214,.22)', boxShadow: '0 0 8px 2px rgba(255,43,214,.65), 0 0 18px 6px rgba(255,43,214,.3)', boxSizing: 'border-box' } }),
        n.jsx('span', { style: { position: 'absolute', left: -4, top: -4, width: 8, height: 8, borderRadius: '50%', background: '#fff', boxShadow: '0 0 6px 2px rgba(255,255,255,.9), 0 0 14px 4px rgba(255,43,214,.55), 0 1px 2px rgba(0,0,0,.9)' } }),
        n.jsx('span', { style: { position: 'absolute', left: 14, top: 10, fontSize: 8, fontWeight: 800, letterSpacing: '.12em', color: '#fff', background: 'rgba(10,8,18,.72)', border: '1px solid rgba(255,43,214,.65)', borderRadius: 6, padding: '1px 5px', boxShadow: '0 1px 3px rgba(0,0,0,.8)', whiteSpace: 'nowrap' }, children: 'HOME' })
      ] })
    ] }) : null }),
    n.jsx('div', { style: { padding: '3px 12px 6px', fontSize: '7.5pt', color: 'rgba(147,167,192,.65)', textAlign: 'right', flexShrink: 0 }, children: '\u00A9 OpenStreetMap \u00B7 Rainbow Weather (fallback: RainViewer)' })
  ] });
}



// ===== ported from wave4/fd_weather/rw-windy-comp.js =====
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


export { WX_SVG, WS_CSS, SKY, wmoBucket, wxIconKey, wxIco, fOf, inHg, fmt12, fmtHour, minsOf, DIRS, beaufort, tempPct, rangeBar, cloudLayer, starLayer, snowLayer, senseFoot, wsTile, wsWS, WG_CSS, wxGUI, rwRV, rwWindy };
