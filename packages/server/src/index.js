/**
 * LLM Proxy Server
 * Handles communication between client applications and the browser extension
 */

const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const bodyParser = require("body-parser");
const { MessageTypes, Config, Utils } = require("@llm-proxy/shared");

// Initialize Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Create HTTP server
const server = http.createServer(app);

// Extension WebSocket server
const wss = new WebSocket.Server({ noServer: true });

// Client WebSocket server
const clientWss = new WebSocket.Server({ noServer: true });

// Store active connections
const connections = new Map();
const clientConnections = new Map();

// Handle extension WebSocket connections
wss.on("connection", (ws) => {
  const sessionId = Utils.createSessionId();
  connections.set(sessionId, ws);

  console.log(`New extension connection: ${sessionId}`);

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      console.log(`Received message from extension: ${data.type}`);

      // If this is a response from the LLM, forward to the appropriate client
      if (data.type === MessageTypes.LLM_RESPONSE && data.clientId) {
        const clientWs = clientConnections.get(data.clientId);
        if (clientWs && clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(
            JSON.stringify({
              type: MessageTypes.RESPONSE_CHUNK,
              text: data.text,
              done: data.done,
            }),
          );
        }
      }
    } catch (err) {
      console.error("Error processing message:", err);
    }
  });

  ws.on("close", () => {
    console.log(`Extension connection closed: ${sessionId}`);
    connections.delete(sessionId);
  });

  // Send session ID to the extension
  ws.send(
    JSON.stringify({
      type: MessageTypes.CONNECTION_ESTABLISHED,
      sessionId,
    }),
  );
});

// Handle client WebSocket connections
clientWss.on("connection", (ws) => {
  const clientId = Utils.createSessionId();
  clientConnections.set(clientId, ws);

  console.log(`New client connection: ${clientId}`);

  ws.on("close", () => {
    console.log(`Client connection closed: ${clientId}`);
    clientConnections.delete(clientId);
  });

  // Send client ID
  ws.send(
    JSON.stringify({
      type: MessageTypes.CONNECTION_ESTABLISHED,
      clientId,
    }),
  );
});

// HTTP route for sending prompts
app.post("/api/send-prompt", async (req, res) => {
  const { userPrompt, systemPrompt, targetService, clientId } = req.body;

  if (!userPrompt || !targetService) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  let extensionFound = false;

  // Send the prompt to all connected extensions
  connections.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: MessageTypes.INJECT_PROMPT,
          userPrompt,
          systemPrompt,
          targetService,
          clientId,
        }),
      );
      extensionFound = true;
    }
  });

  if (!extensionFound) {
    return res.status(503).json({ error: "No active extensions connected" });
  }

  res.status(200).json({
    success: true,
    message: "Prompt sent to extension",
    clientId,
  });
});

// Basic status endpoint
app.get("/api/status", (req, res) => {
  res.json({
    status: "ok",
    extensionConnections: connections.size,
    clientConnections: clientConnections.size,
  });
});

// Handle upgrade for WebSocket connections
server.on("upgrade", (request, socket, head) => {
  const pathname = new URL(request.url, `http://${request.headers.host}`)
    .pathname;

  if (pathname === "/ws/client") {
    clientWss.handleUpgrade(request, socket, head, (ws) => {
      clientWss.emit("connection", ws, request);
    });
  } else if (pathname === "/ws") {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});

// Start the server
const PORT = process.env.PORT || Config.DEFAULT_PORT;
server.listen(PORT, () => {
  console.log(`LLM Proxy Server running on port ${PORT}`);
  console.log(`Extension WebSocket URL: ws://localhost:${PORT}/ws`);
  console.log(`Client WebSocket URL: ws://localhost:${PORT}/ws/client`);
  console.log(`HTTP API endpoint: http://localhost:${PORT}/api/send-prompt`);
});
