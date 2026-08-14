import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export type CodexAuthMode = 'chatgpt' | 'api-key' | 'access-token' | 'unknown';

export interface CodexAuthStatus {
  authenticated: boolean;
  mode: CodexAuthMode;
  message: string;
}

export interface DeviceLoginState {
  state: 'idle' | 'starting' | 'waiting' | 'complete' | 'error';
  verificationUrl?: string;
  userCode?: string;
  message: string;
}

function codexProcess(args: string[]) {
  const bundledCodexCli = fileURLToPath(new URL('../node_modules/@openai/codex/bin/codex.js', import.meta.url));
  return spawn(process.execPath, [bundledCodexCli, ...args], {
    shell: false,
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env,
  });
}

function normalizedOutput(stdout: string, stderr: string) {
  return `${stdout}\n${stderr}`.replace(/\u001b\[[0-9;]*m/g, '').trim();
}

export function parseCodexLoginStatus(output: string, exitCode: number | null): CodexAuthStatus {
  const message = output.trim() || 'Codex is not logged in.';
  if (exitCode !== 0 || /not logged in|logged out|no credentials/i.test(message)) {
    return { authenticated: false, mode: 'unknown', message };
  }
  const mode: CodexAuthMode = /chatgpt/i.test(message)
    ? 'chatgpt'
    : /api key/i.test(message)
      ? 'api-key'
      : /access token/i.test(message)
        ? 'access-token'
        : 'unknown';
  return { authenticated: true, mode, message };
}

export function parseDeviceLoginOutput(output: string) {
  const url = output.match(/https:\/\/[^\s<>"']+/i)?.[0]?.replace(/[),.;]+$/, '');
  const labeledCode = output.match(/(?:one[- ]time code|device code|enter(?: this)? code)\s*[:\s]+([A-Z0-9]{4,}(?:-[A-Z0-9]{4,})?)/i)?.[1];
  const fallbackCode = output.match(/\b[A-Z0-9]{4,}-[A-Z0-9]{4,}\b/)?.[0];
  return { verificationUrl: url, userCode: labeledCode || fallbackCode };
}

export function resolveCodexModel(input: {
  authMode: CodexAuthMode;
  configuredModel?: string;
  hasDirectApiKey: boolean;
}) {
  if (!input.hasDirectApiKey || input.authMode === 'chatgpt') return undefined;
  return input.configuredModel?.trim() || undefined;
}

async function collectProcess(child: ReturnType<typeof codexProcess>, timeoutMs: number) {
  let stdout = '';
  let stderr = '';
  child.stdout.on('data', (chunk) => { stdout = `${stdout}${String(chunk)}`.slice(-20_000); });
  child.stderr.on('data', (chunk) => { stderr = `${stderr}${String(chunk)}`.slice(-20_000); });
  return new Promise<{ output: string; exitCode: number | null }>((resolve, reject) => {
    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error('Codex authentication command timed out.'));
    }, timeoutMs);
    child.once('error', (error) => {
      clearTimeout(timeout);
      reject(new Error(`Could not start Codex CLI: ${error.message}`));
    });
    child.once('close', (exitCode) => {
      clearTimeout(timeout);
      resolve({ output: normalizedOutput(stdout, stderr), exitCode });
    });
  });
}

export async function getCodexAuthStatus(): Promise<CodexAuthStatus> {
  const result = await collectProcess(codexProcess(['login', 'status']), 15_000);
  return parseCodexLoginStatus(result.output, result.exitCode);
}

class DeviceLoginController {
  private child: ReturnType<typeof codexProcess> | null = null;
  private output = '';
  private snapshot: DeviceLoginState = { state: 'idle', message: 'Device login has not started.' };

  start() {
    if (this.child && !this.child.killed) return this.snapshot;
    this.output = '';
    this.snapshot = { state: 'starting', message: 'Starting Codex device login…' };
    const child = codexProcess(['login', '--device-auth']);
    this.child = child;

    const append = (chunk: unknown) => {
      this.output = `${this.output}${String(chunk)}`.slice(-20_000);
      const parsed = parseDeviceLoginOutput(this.output);
      this.snapshot = {
        state: parsed.verificationUrl || parsed.userCode ? 'waiting' : 'starting',
        verificationUrl: parsed.verificationUrl,
        userCode: parsed.userCode,
        message: normalizedOutput(this.output, ''),
      };
    };
    child.stdout.on('data', append);
    child.stderr.on('data', append);
    child.once('error', (error) => {
      this.snapshot = { state: 'error', message: `Could not start Codex CLI: ${error.message}` };
      this.child = null;
    });
    child.once('close', (exitCode) => {
      this.snapshot = {
        ...this.snapshot,
        state: exitCode === 0 ? 'complete' : 'error',
        message: normalizedOutput(this.output, '') || (exitCode === 0 ? 'Codex login completed.' : 'Codex login failed.'),
      };
      this.child = null;
    });
    return this.snapshot;
  }

  status() {
    return this.snapshot;
  }
}

export const codexDeviceLogin = new DeviceLoginController();
