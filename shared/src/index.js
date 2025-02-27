/**
 * Shared constants, types, and utilities for the LLM Proxy system
 */

// Message types for the WebSocket communication
const MessageTypes = {
  // Extension <-> Server messages
  CONNECTION_ESTABLISHED: "connection_established",
  INJECT_PROMPT: "inject_prompt",
  LLM_RESPONSE: "llm_response",

  // Client <-> Server messages
  RESPONSE_CHUNK: "response_chunk",

  // Internal extension messages
  LLM_PROXY_RESPONSE: "LLM_PROXY_RESPONSE",
  UPDATE_SERVER_URL: "UPDATE_SERVER_URL",
  GET_SERVER_STATUS: "GET_SERVER_STATUS",
};

// Supported LLM services
const Services = {
  CHATGPT: "chatgpt",
  CLAUDE: "claude",
  BARD: "bard",
};

// Configuration
const Config = {
  DEFAULT_PORT: 3000,
  DEFAULT_SERVER_URL: "ws://localhost:3000/ws",
  DEFAULT_CLIENT_WS_URL: "ws://localhost:3000/ws/client",
  EXTENSION_RECONNECT_DELAY: 5000,
  RESPONSE_TIMEOUT: 15000,
  API_URL: "http://localhost:3000/api/send-prompt",
};

// Utility functions
const Utils = {
  /**
   * Creates a unique session ID
   * @returns {string} A unique identifier
   */
  createSessionId: () => Date.now().toString(),

  /**
   * Get supported service from URL
   * @param {string} url - Current browser URL
   * @returns {string|null} Service identifier or null if not supported
   */
  getServiceFromUrl: (url) => {
    if (url.includes("chat.openai.com")) return Services.CHATGPT;
    if (url.includes("claude.ai")) return Services.CLAUDE;
    if (url.includes("bard.google.com")) return Services.BARD;
    return null;
  },
};

module.exports = {
  MessageTypes,
  Services,
  Config,
  Utils,
};
