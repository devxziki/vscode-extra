import * as vscode from 'vscode';

export class SidebarProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = 'vscode-extra-sidebar';

	constructor(private readonly extensionUri: vscode.Uri) {}

	resolveWebviewView(webviewView: vscode.WebviewView): void {
		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [this.extensionUri]
		};

		webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);
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
				</style>
			</head>
			<body>
				<h1>VS Code Extra</h1>
				<form id="prompt-form">
					<input id="prompt-input" type="text" placeholder="Ask something..." aria-label="Prompt input" />
					<button type="submit">Send</button>
				</form>
				<div id="status">Ready.</div>
				<script nonce="${nonce}">
					const form = document.getElementById('prompt-form');
					const input = document.getElementById('prompt-input');
					const status = document.getElementById('status');

					form.addEventListener('submit', (event) => {
						event.preventDefault();
						const value = input.value.trim();
						status.textContent = value ? 'Sent: ' + value : 'Type a message first.';
						if (value) {
							input.value = '';
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