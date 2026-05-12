import * as vscode from 'vscode';

async function tryImportGenerativeAi(): Promise<any> {
  try {
    // dynamic import so extension still loads if package missing during development
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod: any = await import('@google/generative-ai');
    return mod;
  } catch (err) {
    return null;
  }
}

export async function sendPrompt(prompt: string): Promise<string> {
  const config = vscode.workspace.getConfiguration('vscode-extra');
  const apiKey = config.get<string>('geminiApiKey', '');

  if (!apiKey) {
    throw new Error('MISSING_API_KEY');
  }

  // Try using the official SDK if available
  const genai: any = await tryImportGenerativeAi();
  if (!genai) {
    throw new Error('GEMINI_SDK_MISSING');
  }

  try {
    const TextServiceClient = (genai as any).TextServiceClient || (genai as any).default?.TextServiceClient;
    if (!TextServiceClient) {
      throw new Error('GEMINI_SDK_MISSING_CLIENT');
    }
    const client: any = new TextServiceClient({ apiKey });
    const request: any = {
      model: 'gemini-2.5-flash',
      prompt: { text: prompt }
    };

    const resp: any = await client.generateText(request);
    const response = Array.isArray(resp) ? resp[0] : resp;

    if (response && response.candidates && response.candidates[0] && response.candidates[0].content) {
      return String(response.candidates[0].content);
    }
    if (response && response.output && response.output[0] && response.output[0].content) {
      return String(response.output[0].content);
    }
    if (response && typeof response === 'object') {
      return JSON.stringify(response);
    }
    return String(response || '');
  } catch (err: any) {
    throw new Error('GEMINI_SDK_ERROR: ' + (err?.message || String(err)));
  }
}

export default { sendPrompt };
