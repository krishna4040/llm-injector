const axios = require("axios");
const { Services, Config } = require("@llm-proxy/shared");

async function sendPrompt(userPrompt, systemPrompt, targetService) {
  try {
    const response = await axios.post(Config.API_URL, {
      userPrompt,
      systemPrompt,
      targetService,
    });
    console.log("Prompt sent successfully:", response.data);
  } catch (error) {
    console.error("Error sending prompt:", error.message);
  }
}

// Example usage
const userPrompt = "What is the capital of France?";
const systemPrompt = "You are a helpful assistant.";

sendPrompt(userPrompt, systemPrompt, Services.CHATGPT);
