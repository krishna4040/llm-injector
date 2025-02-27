/**
 * Content script for the LLM Proxy Extension
 * Runs in the context of the web page
 */

// Listen for messages from the injected script
window.addEventListener("message", (event) => {
  // Only accept messages from the same frame
  if (event.source !== window) return;

  if (event.data.type === "LLM_PROXY_RESPONSE") {
    chrome.runtime.sendMessage({
      type: "LLM_RESPONSE",
      text: event.data.text,
      done: event.data.done,
      clientId: event.data.clientId,
    });
  }
});

// Helper functions for different LLM interfaces
function injectChatGPT(userPrompt, systemPrompt, sendResponseCallback) {
  try {
    // Find the textarea input
    const textarea = document.querySelector('textarea[data-id="root"]');
    if (!textarea) throw new Error("ChatGPT input not found");

    // Set the value and dispatch input event
    textarea.value = userPrompt;
    textarea.dispatchEvent(new Event("input", { bubbles: true }));

    // Find and click the send button
    setTimeout(() => {
      const sendButton = textarea.parentElement.querySelector("button");
      if (sendButton) {
        sendButton.click();

        // Set up observer to capture the response
        setupChatGPTObserver(sendResponseCallback);
      } else {
        sendResponseCallback("Send button not found", true);
      }
    }, 500);
  } catch (error) {
    sendResponseCallback(
      `Error injecting into ChatGPT: ${error.message}`,
      true,
    );
  }
}

function injectClaude(userPrompt, systemPrompt, sendResponseCallback) {
  try {
    // Find the textarea input
    const textarea = document.querySelector('div[contenteditable="true"]');
    if (!textarea) throw new Error("Claude input not found");

    // Set the value
    textarea.textContent = userPrompt;

    // Trigger input event
    textarea.dispatchEvent(new Event("input", { bubbles: true }));

    // Find and click the send button
    setTimeout(() => {
      const sendButton = document.querySelector(
        'button[aria-label="Send message"]',
      );
      if (sendButton) {
        sendButton.click();

        // Set up observer to capture the response
        setupClaudeObserver(sendResponseCallback);
      } else {
        sendResponseCallback("Send button not found", true);
      }
    }, 500);
  } catch (error) {
    sendResponseCallback(`Error injecting into Claude: ${error.message}`, true);
  }
}

function injectBard(userPrompt, systemPrompt, sendResponseCallback) {
  try {
    // Find the textarea input
    const textarea = document.querySelector('textarea[placeholder*="Ask"]');
    if (!textarea) throw new Error("Bard input not found");

    // Set the value
    textarea.value = userPrompt;

    // Trigger input event
    textarea.dispatchEvent(new Event("input", { bubbles: true }));

    // Find and click the send button
    setTimeout(() => {
      const sendButton = document.querySelector('button[aria-label*="Send"]');
      if (sendButton) {
        sendButton.click();

        // Set up observer to capture the response
        setupBardObserver(sendResponseCallback);
      } else {
        sendResponseCallback("Send button not found", true);
      }
    }, 500);
  } catch (error) {
    sendResponseCallback(`Error injecting into Bard: ${error.message}`, true);
  }
}

// Observers for different LLM interfaces
function setupChatGPTObserver(callback) {
  // Wait for response container to be available
  const checkForResponse = setInterval(() => {
    // Find the response container
    const responseContainer = document.querySelector("div.markdown");
    if (responseContainer) {
      clearInterval(checkForResponse);

      let lastContent = "";

      // Create a MutationObserver to watch for changes
      const observer = new MutationObserver(() => {
        // Get current content
        const currentContent = responseContainer.innerText;

        // If new content was added
        if (currentContent !== lastContent) {
          // Send only the new part
          const newContent = currentContent.substring(lastContent.length);
          if (newContent) {
            callback(newContent, false);
          }
          lastContent = currentContent;
        }

        // Check if response is complete
        const stopGeneratingBtn = document.querySelector(
          'button:contains("Stop generating")',
        );
        if (!stopGeneratingBtn || stopGeneratingBtn.style.display === "none") {
          // No stop button means generation is complete
          setTimeout(() => {
            observer.disconnect();
            callback("", true); // Signal completion
          }, 1000); // Wait a bit to ensure we got everything
        }
      });

      // Start observing
      observer.observe(responseContainer, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }
  }, 100);

  // Stop checking after timeout to prevent infinite loop
  setTimeout(() => {
    clearInterval(checkForResponse);
    callback("Response container not found after timeout", true);
  }, 15000);
}

function setupClaudeObserver(callback) {
  // Wait for Claude's response container to appear
  const checkForResponse = setInterval(() => {
    // Look for the latest response container
    const responseContainers = document.querySelectorAll(".prose");
    const responseContainer = responseContainers[responseContainers.length - 1];

    if (responseContainer) {
      clearInterval(checkForResponse);

      let lastContent = "";

      // Create observer
      const observer = new MutationObserver(() => {
        // Get current content
        const currentContent = responseContainer.innerText;

        // If new content was added
        if (currentContent !== lastContent) {
          // Send only the new part
          const newContent = currentContent.substring(lastContent.length);
          if (newContent) {
            callback(newContent, false);
          }
          lastContent = currentContent;
        }

        // Check if response is complete
        if (!document.querySelector(".animate-pulse")) {
          // No loading indicator means generation is complete
          setTimeout(() => {
            observer.disconnect();
            callback("", true); // Signal completion
          }, 1000);
        }
      });

      // Start observing
      observer.observe(responseContainer, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }
  }, 100);

  // Stop checking after timeout to prevent infinite loop
  setTimeout(() => {
    clearInterval(checkForResponse);
    callback("Response timeout or not found", true);
  }, 15000);
}

function setupBardObserver(callback) {
  // Wait for Bard's response container to appear
  const checkForResponse = setInterval(() => {
    // Look for the latest response container
    const responseContainers = document.querySelectorAll('div[role="region"]');
    const responseContainer = responseContainers[responseContainers.length - 1];

    if (responseContainer) {
      clearInterval(checkForResponse);

      let lastContent = "";

      // Create observer
      const observer = new MutationObserver(() => {
        // Get current content
        const currentContent = responseContainer.innerText;

        // If new content was added
        if (currentContent !== lastContent) {
          // Send only the new part
          const newContent = currentContent.substring(lastContent.length);
          if (newContent) {
            callback(newContent, false);
          }
          lastContent = currentContent;
        }

        // Check if response is complete
        const loadingIndicator = document.querySelector('div[role="status"]');
        if (!loadingIndicator || loadingIndicator.style.display === "none") {
          // No loading indicator means generation is complete
          setTimeout(() => {
            observer.disconnect();
            callback("", true); // Signal completion
          }, 1000);
        }
      });

      // Start observing
      observer.observe(responseContainer, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }
  }, 100);

  // Stop checking after timeout to prevent infinite loop
  setTimeout(() => {
    clearInterval(checkForResponse);
    callback("Response timeout or not found", true);
  }, 15000);
}
