# vscode-extra

**AI workspace assistant for vibe coders**

An extension that brings AI-powered assistance directly into your VS Code sidebar using Google's Gemini API.

## Features

- **Sidebar AI Chat** — Ask questions and get instant AI responses without leaving your editor.
- **Gemini Integration** — Powered by Google's `gemini-2.5-flash` model for fast, intelligent responses.
- **Settings Panel** — Easy one-click access to configure your Gemini API key.
- **Clean UI** — Simple, distraction-free chat interface that respects VS Code's theme.
- **API Key Management** — Secure configuration via VS Code settings.

## Requirements

- **VS Code** 1.118.0 or later
- **Google Gemini API Key** (free or paid tier) — [Get one here](https://makersuite.google.com/app/apikey)

## Installation

1. Install the extension from the VS Code Marketplace (or build locally).
2. Open VS Code settings (`Cmd+,` on macOS or `Ctrl+,` on Windows/Linux).
3. Search for `vscode-extra.geminiApiKey`.
4. Paste your Gemini API key into the field.
5. Open the "VS Extra" sidebar (activity bar on the left) and start chatting!

## Extension Settings

This extension contributes the following setting:

* `vscode-extra.geminiApiKey` — Your Google Gemini API key (string, default: empty). Required for the AI assistant to function.

## Usage

1. Click the "VS Extra" icon in the activity bar (left sidebar).
2. Type your question or prompt in the input field.
3. Click "Send" or press Enter.
4. Wait for the AI response to appear below.
5. Click the "⚙️ Settings" button at the top-right to manage your API key.

### Example Prompts

- "Explain async/await in JavaScript"
- "Write a React component for a todo list"
- "Debug this error: [paste error message]"
- "Best practices for TypeScript"

## Known Issues

- **No API key error** — If you see "Gemini API key not configured", add your key in Settings.
- **Network errors** — If requests fail, check your internet connection and API key validity.
- **Rate limiting** — Google Gemini API has usage limits; see [their documentation](https://ai.google.dev/docs) for details.

## Architecture

- **Extension Host** — Handles API key retrieval and Gemini API calls.
- **Webview** — Sidebar UI (no frameworks, vanilla HTML/CSS/JS).
- **Message Passing** — Secure communication between webview and extension host via `postMessage`.

## Development

### Build

```bash
npm install
npm run compile
```

### Watch Mode

```bash
npm run watch
```

### Run in Extension Development Host

Press `F5` in VS Code to launch the development environment, or run:

```bash
npm run watch
# Then F5
```

### Test

```bash
npm run compile-tests
npm test
```

## Release Notes

### 0.0.1

Initial release with:
- Sidebar AI chat powered by Gemini 2.5 Flash
- API key configuration via VS Code settings
- Settings panel button for quick access
- Error handling for missing/invalid API keys

## Contributing

Contributions welcome! Feel free to open issues or submit PRs.

## License

MIT (or your preferred license)

---

**Enjoy coding with AI assistance!**
