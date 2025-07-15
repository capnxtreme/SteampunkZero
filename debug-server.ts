import { WebSocketServer } from 'ws';
import { createServer } from 'http';

const PORT = 8889;

// Create HTTP server
const server = createServer();

// Create WebSocket server
const wss = new WebSocketServer({ server });

console.log(`🔧 Debug Bridge Server starting on port ${PORT}...`);

// Store connected clients
const clients = new Set<any>();

wss.on('connection', (ws) => {
  console.log('✅ Browser connected to debug bridge');
  clients.add(ws);

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      const timestamp = new Date().toLocaleTimeString();

      // Format and display the console output
      switch (message.type) {
        case 'log':
          console.log(`[${timestamp}] 📝`, ...message.args);
          break;
        case 'error':
          console.error(`[${timestamp}] ❌`, ...message.args);
          break;
        case 'warn':
          console.warn(`[${timestamp}] ⚠️`, ...message.args);
          break;
        case 'info':
          console.info(`[${timestamp}] ℹ️`, ...message.args);
          break;
        case 'debug':
          console.debug(`[${timestamp}] 🐛`, ...message.args);
          break;
        default:
          console.log(`[${timestamp}] [${message.type}]`, ...message.args);
      }
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
  });

  ws.on('close', () => {
    console.log('❌ Browser disconnected from debug bridge');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  // Send acknowledgment
  ws.send(
    JSON.stringify({ type: 'connected', message: 'Debug bridge connected' })
  );
});

server.listen(PORT, () => {
  console.log(`🚀 Debug Bridge Server running on ws://localhost:${PORT}`);
  console.log(
    '📋 Add the debug client to your HTML to start capturing console output'
  );
});
