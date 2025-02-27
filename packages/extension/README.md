# LLM Proxy Extension

The LLM Proxy Extension is a browser extension designed to inject prompts into web-based Large Language Model (LLM) interfaces and stream responses back to a connected server. This extension supports popular LLM services like ChatGPT, Claude, and Bard.

## Features

- Injects user prompts into supported LLM web interfaces.
- Captures and streams LLM responses in real-time.
- Supports multiple LLM services with customizable prompt handling.
- Provides a simple popup UI for checking server status and updating server URLs.

## Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/your-username/llm-proxy-monorepo.git
   cd llm-proxy-monorepo/packages/extension
   ```

2. **Install Dependencies**:

   ```bash
   yarn install
   ```

3. **Load the Extension**:
   - Open your browser and navigate to the extensions management page.
   - Enable "Developer mode" and load the unpacked extension from the `packages/extension` directory.

## Usage

1. **Start the Server**:
   Ensure the LLM Proxy Server is running. You can start it using:

   ```bash
   yarn workspace @llm-proxy/server start
   ```

2. **Update Server URL**:

   - Click on the extension icon in your browser toolbar.
   - Use the popup UI to update the server URL if needed.

3. **Inject Prompts**:
   - The extension will automatically inject prompts into supported LLM web interfaces when triggered by the server.

## Configuration

- **Server URL**: The default server URL is `ws://localhost:3000/ws`. You can update it via the popup UI.
- **Supported Services**: The extension currently supports ChatGPT, Claude, and Bard. You can extend it to support additional services by modifying the content script.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request with your proposed changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
