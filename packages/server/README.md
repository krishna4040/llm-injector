# LLM Proxy Server

The server component of the LLM Proxy system. It acts as a bridge between client applications and the browser extension.

## Features

- WebSocket server for real-time communication with the extension and clients
- HTTP API for sending prompts and receiving status
- Message routing between clients and extensions

## API Reference

### WebSocket Endpoints

- **`/ws`** - For extension connections
- **`/ws/client`** - For client connections

### HTTP Endpoints

#### `POST /api/send-prompt`

Send a prompt to be injected into a web LLM interface.

**Request Body:**

```json
{
  "userPrompt": "Your question or prompt",
  "systemPrompt": "Optional system instructions",
  "targetService": "chatgpt|claude|bard",
  "clientId": "unique-client-id"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Prompt sent to extension",
  "clientId": "unique-client-id"
}
```

#### `GET /api/status`

Get the server status.

**Response:**

```json
{
  "status": "ok",
  "extensionConnections": 1,
  "clientConnections": 2
}
```

## Development

```bash
# Run in development mode with auto-restart
yarn dev

# Run in production mode
yarn start
```

## Environment Variables

- `PORT` - Server port (default: 3000)
