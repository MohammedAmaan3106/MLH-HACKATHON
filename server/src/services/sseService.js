/**
 * Server-Sent Events (SSE) Manager with Heartbeat
 * Ensures persistent, zero-latency streaming between Extension, Server, and Dashboard.
 */

let sseClients = [];
let heartbeatTimer = null;

function initHeartbeat() {
  if (heartbeatTimer) return;
  // Send a lightweight comment ping every 15 seconds to prevent browser/shield socket timeouts
  heartbeatTimer = setInterval(() => {
    if (sseClients.length === 0) return;
    sseClients.forEach((client) => {
      try {
        client.write(': keepalive\n\n');
      } catch (e) {
        // handled in close handler
      }
    });
  }, 15000);
}

function registerClient(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  sseClients.push(res);
  initHeartbeat();

  // Send initial connection acknowledgement
  res.write(`event: connected\ndata: ${JSON.stringify({ time: new Date().toISOString() })}\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter((c) => c !== res);
  });
}

function broadcast(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.write(payload);
    } catch (e) {
      // client dropped
    }
  });
}

function getConnectedClientsCount() {
  return sseClients.length;
}

module.exports = {
  registerClient,
  broadcast,
  getConnectedClientsCount
};
