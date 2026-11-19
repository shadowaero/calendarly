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
    const pull = function () { fetch('/api/weather?zip=' + encodeURIComponent(zip) + '&units=fahrenheit&days=2').then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('http ' + r.status)); }).then(function (j) { if (!dead) setWx(j); }).catch(function () {}); };
    pull();
    const t = setInterval(pull, 900000);
    return function () { dead = true; clearInterval(t); };
  }, [zip]);
  b.useEffect(function () {
    if (!needSn) return;
    let dead = false;
    const pull = function () { fetch('/api/sensors').then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('http ' + r.status)); }).then(function (j) { if (!dead) setSn(j || { sensors: [] }); }).catch(function () {}); };
    pull();
    const t = setInterval(pull, 60000);
    return function () { dead = true; clearInterval(t); };
  }, []);
  b.useEffect(function () {
    if (kind !== 'alerts') return;
    let dead = false;
    const pull = function () { fetch('/api/weather/alerts?zip=' + encodeURIComponent(zip)).then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('http ' + r.status)); }).then(function (j) { if (!dead) setAl(j || { alerts: [] }); }).catch(function () {}); };
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
