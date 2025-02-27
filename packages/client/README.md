# LLM Proxy Client

The LLM Proxy Client is a Node.js application that interacts with the LLM Proxy Server to send user prompts and system prompts to various LLM services. It provides a simple interface for communicating with the server and handling responses.

## Features

- Sends user and system prompts to the LLM Proxy Server.
- Supports customizable prompt handling for different LLM services.
- Easy to integrate with other applications or workflows.

## Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/your-username/llm-proxy-monorepo.git
   cd llm-proxy-monorepo/packages/client
   ```

2. **Install Dependencies**:
   ```bash
   yarn install
   ```

## Usage

1. **Start the Server**:
   Ensure the LLM Proxy Server is running. You can start it using:

   ```bash
   yarn workspace @llm-proxy/server start
   ```

2. **Run the Client**:

   ```bash
   yarn start
   ```

3. **Send Prompts**:
   Modify the `index.js` file to send your desired user and system prompts. Example:

   ```javascript
   const userPrompt = "What is the capital of France?";
   const systemPrompt = "You are a helpful assistant.";
   const targetService = "chatgpt";

   sendPrompt(userPrompt, systemPrompt, targetService);
   ```

## Configuration

- **API URL**: The default API URL is `http://localhost:3000/api/send-prompt`. You can modify it in the `index.js` file if needed.
- **Target Service**: Specify the target LLM service (e.g., `chatgpt`, `claude`, `bard`) when sending a prompt.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request with your proposed changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
