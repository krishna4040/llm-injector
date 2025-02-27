/**
 * Background script for the LLM Proxy Extension
 */

// Constants and shared utilities imported directly in the extension
// since browser extensions can't use Node.js require
const MessageTypes = {
  CONNECTION_ESTABLISHED: "connection_established",
  INJECT_PROMPT: "inject_prompt",
  LLM_RESPONSE: "llm_response",
  LLM_PROXY_RESPONSE: "LLM_PROXY_RESPONSE",
  UPDATE_SERVER_URL: "UPDATE_SERVER_URL",
  GET_SERVER_STATUS: "GET_SERVER_STATUS",
};

// WebSocket connection and state
let ws = null;
let serverUrl = "ws://localhost:3000/ws";
let sessionId = null;
let currentJobClientId = null;
let reconnectTimer = null;

// Connect to the server
function connectWebSocket() {
  // Clear any existing reconnect timer
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  // Close existing connection if any
  if (ws) {
    try {
      ws.close();
    } catch (e) {
      console.error("Error closing existing connection:", e);
    }
  }

  // Create new WebSocket connection
  ws = new WebSocket(serverUrl);

  ws.onopen = () => {
    console.log("Connected to LLM Proxy server");
    chrome.storage.local.set({ serverStatus: "connected" });
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      if (data.type === MessageTypes.CONNECTION_ESTABLISHED) {
        sessionId = data.sessionId;
        console.log(`Session established: ${sessionId}`);
      }

      if (data.type === MessageTypes.INJECT_PROMPT) {
        currentJobClientId = data.clientId;

        // Inject the prompt into the active tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs.length === 0) {
            console.error("No active tab found");
            return;
          }

          const tabId = tabs[0].id;
          chrome.scripting.executeScript({
            target: { tabId },
            function: injectPrompt,
            args: [data],
          });
        });
      }
    } catch (err) {
      console.error("Error processing message:", err);
    }
  };

  ws.onclose = () => {
    console.log("Disconnected from server");
    chrome.storage.local.set({ serverStatus: "disconnected" });

    // Attempt to reconnect after a delay
    reconnectTimer = setTimeout(connectWebSocket, 5000);
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
    chrome.storage.local.set({ serverStatus: "error" });
  };
}

// Function to be injected into the page
function injectPrompt(data) {
  // This function will be stringified and injected into the page context
  const { userPrompt, systemPrompt, targetService, clientId } = data;

  // Helper function to send response chunks back to the extension
  function sendResponseToServer(text, done = false) {
    window.postMessage(
      {
        type: "LLM_PROXY_RESPONSE",
        text,
        done,
        clientId,
      },
      "*",
    );
  }

  // Different handling based on target service
  let currentURL = window.location.href;

  if (currentURL.includes("chat.openai.com")) {
    // ChatGPT handling
    injectChatGPT(userPrompt, systemPrompt, sendResponseToServer);
  } else if (currentURL.includes("claude.ai")) {
    // Claude handling
    injectClaude(userPrompt, systemPrompt, sendResponseToServer);
  } else if (currentURL.includes("bard.google.com")) {
    // Bard handling
    injectBard(userPrompt, systemPrompt, sendResponseToServer);
  } else {
    sendResponseToServer("Unsupported service", true);
  }
}

// Initialize connection on startup
chrome.runtime.onInstalled.addListener(() => {
  // Load saved server URL if available
  chrome.storage.local.get("serverUrl", (data) => {
    if (data.serverUrl) {
      serverUrl = data.serverUrl;
    }
    connectWebSocket();
  });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (
    request.type === MessageTypes.LLM_RESPONSE &&
    ws &&
    ws.readyState === WebSocket.OPEN
  ) {
    ws.send(
      JSON.stringify({
        type: MessageTypes.LLM_RESPONSE,
        text: request.text,
        done: request.done,
        clientId: currentJobClientId,
      }),
    );
  }

  if (request.type === MessageTypes.UPDATE_SERVER_URL) {
    serverUrl = request.url;
    chrome.storage.local.set({ serverUrl });
    connectWebSocket();
    sendResponse({ success: true });
  }

  if (request.type === MessageTypes.GET_SERVER_STATUS) {
    chrome.storage.local.get("serverStatus", (data) => {
      sendResponse({ status: data.serverStatus || "unknown" });
    });
    return true; // Required for async sendResponse
  }
});
