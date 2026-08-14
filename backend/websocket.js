const { WebSocketServer } = require('ws');

let wss = null;

// Initialize the real-time websocket broadcast server hub
function initWebSocket(server) {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    console.log('⚡ Real-time Connection Established with Client Device Node.');
    
    ws.on('close', () => {
      console.log('🔌 Client node severed real-time connection stream.');
    });
  });
}

// Global broadcast method to notify all active client windows simultaneously
function broadcastUpdate(type, data = {}) {
  if (!wss) return;
  
  const payload = JSON.stringify({ type, data, timestamp: new Date() });
  
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // 1 = OPEN status lane
      client.send(payload);
    }
  });
}

module.exports = { initWebSocket, broadcastUpdate };
