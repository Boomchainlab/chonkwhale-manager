/import express from "express";
import { WebSocketServer } from "ws";
import http from "http";
import { pool } from "./db";

const app = express();
const httpServer = http.createServer(app);
const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

type ExtWebSocket = WebSocket & { isAlive?: boolean };

const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((client) => {
    const ws = client as ExtWebSocket;
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    try {
      ws.ping();
    } catch {
      try { ws.terminate(); } catch {}
    }
  });
}, 30_000);

wss.on("close", () => clearInterval(heartbeatInterval));

wss.on('connection', (ws) => {
  (ws as ExtWebSocket).isAlive = true;
  ws.on("pong", () => {
    (ws as ExtWebSocket).isAlive = true;
  });

  // /** rest of code here **/
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/ready', async (_req, res) => {
  try {
    await pool.query("select 1");
    res.json({
      status: 'ready',
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    res.status(503).json({ status: 'not-ready' });
  }
});

// /** rest of code here **/

httpServer.listen(3000, () => {
  console.log('Server is running on port 3000');
});
