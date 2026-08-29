import { WebSocketServer } from 'ws';

let wss = null;

export function initWebSocketServer(server) {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    // Send immediate ping/status
    ws.send(JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() }));

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        if (data.type === 'PING') {
          ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
        }
      } catch (e) {
        // ignore malformed
      }
    });
  });

  return wss;
}

export function broadcast(event, payload = {}) {
  if (!wss) return;
  const message = JSON.stringify({
    type: event,
    payload,
    timestamp: new Date().toISOString()
  });

  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(message);
    }
  });
}
