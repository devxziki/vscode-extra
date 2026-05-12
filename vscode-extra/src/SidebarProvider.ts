import * as vscode from 'vscode';
import { sendPrompt } from './services/geminiService';

export class SidebarProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = 'vscode-extra-sidebar';

	constructor(private readonly extensionUri: vscode.Uri) {}

	resolveWebviewView(webviewView: vscode.WebviewView): void {
		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [this.extensionUri]
		};

		webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

		webviewView.webview.onDidReceiveMessage(async (message) => {
			if (message?.type === 'sendPrompt') {
				const prompt = String(message.prompt || '');
				// notify loading
				webviewView.webview.postMessage({ type: 'loading', value: true });
				try {
					const result = await sendPrompt(prompt);
					webviewView.webview.postMessage({ type: 'response', text: result });
				} catch (err: any) {
					const code = err?.message || String(err);
					if (String(code).includes('MISSING_API_KEY')) {
						webviewView.webview.postMessage({ type: 'noApiKey' });
					} else {
						webviewView.webview.postMessage({ type: 'error', message: code });
					}
				} finally {
					webviewView.webview.postMessage({ type: 'loading', value: false });
				}
			} else if (message?.type === 'openSettings') {
				vscode.commands.executeCommand('workbench.action.openSettings', '@ext:vscode-extra gemini');
			}
		});
	}

	private getHtmlForWebview(webview: vscode.Webview): string {
		const nonce = this.getNonce();

		return /* html */ `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
				<title>VS Code Extra</title>
				<style>
					body {
						font-family: sans-serif;
						padding: 16px;
						color: var(--vscode-foreground);
						background: var(--vscode-editor-background);
					}

					h1 {
						font-size: 20px;
						margin: 0 0 12px;
					}

					form {
						display: flex;
						gap: 8px;
					}

					input {
						flex: 1;
						padding: 8px 10px;
						border: 1px solid var(--vscode-input-border, transparent);
						border-radius: 4px;
						background: var(--vscode-input-background);
						color: var(--vscode-input-foreground);
					}

					button {
						padding: 8px 12px;
						border: none;
						border-radius: 4px;
						background: #0078d4;
						color: white;
						cursor: pointer;
					}

					button:hover {
						background: #005a9e;
					}

					#status {
						margin-top: 12px;
						font-size: 12px;
						opacity: 0.85;
						word-break: break-word;
					}

					#response {
						margin-top: 12px;
						padding: 8px;
						border-radius: 4px;
						background: var(--vscode-input-background);
						color: var(--vscode-input-foreground);
						white-space: pre-wrap;
					}
				</style>
			</head>
			<body>
				<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
					<h1 style="margin:0;">VS Code Extra</h1>
					<button id="settings-btn" aria-label="Settings" title="Settings">⚙️ Settings</button>
				</div>
				<form id="prompt-form">
					<input id="prompt-input" type="text" placeholder="Ask something..." aria-label="Prompt input" />
					<button type="submit">Send</button>
				</form>
				<div id="status">Ready.</div>
				<div id="response" aria-live="polite"></div>
				<script nonce="${nonce}">
					const vscode = acquireVsCodeApi();
					const form = document.getElementById('prompt-form');
					const input = document.getElementById('prompt-input');
					const status = document.getElementById('status');
					const responseEl = document.getElementById('response');

					const settingsBtn = document.getElementById('settings-btn');
					if (settingsBtn) {
						settingsBtn.addEventListener('click', () => {
							vscode.postMessage({ type: 'openSettings' });
						});
					}

					form.addEventListener('submit', (event) => {
						event.preventDefault();
						const value = input.value.trim();
						if (!value) {
							status.textContent = 'Type a message first.';
							return;
						}
						status.textContent = 'Sending...';
						responseEl.textContent = '';
						vscode.postMessage({ type: 'sendPrompt', prompt: value });
						input.value = '';
					});

					window.addEventListener('message', (event) => {
						const msg = event.data;
						if (msg?.type === 'loading') {
							status.textContent = msg.value ? 'Thinking...' : 'Ready.';
						} else if (msg?.type === 'response') {
							responseEl.textContent = msg.text || '(no response)';
							status.textContent = 'Done.';
						} else if (msg?.type === 'noApiKey') {
							responseEl.innerHTML = 'Gemini API key not configured. <button id="open-settings">Open Settings</button>';
							status.textContent = 'Missing API key';
							const openBtn = document.getElementById('open-settings');
							if (openBtn) {
								openBtn.addEventListener('click', () => vscode.postMessage({ type: 'openSettings' }));
							}
						} else if (msg?.type === 'error') {
							responseEl.textContent = 'Error: ' + (msg.message || 'Unknown error');
							status.textContent = 'Error';
						}
					});
				</script>
			</body>
			</html>
		`;
	}

	private getNonce(): string {
		let text = '';
		const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

		for (let index = 0; index < 32; index++) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}

		return text;
	}
}