// Loop canary: listen for LOOPS_UPDATED broadcasts from the calendarly server.
const WebSocket = require('/opt/calendarly/server/node_modules/ws');
const ws = new WebSocket('ws://127.0.0.1:3000');
ws.on('open', () => console.log('WS_OPEN'));
ws.on('message', (m) => console.log('WS_EVENT', m.toString()));
ws.on('error', (e) => console.log('WS_ERR', e.message));
setTimeout(() => process.exit(0), 60000);