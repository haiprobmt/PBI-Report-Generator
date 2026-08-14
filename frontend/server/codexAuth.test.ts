import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCodexLoginStatus, parseDeviceLoginOutput, resolveCodexModel } from './codexAuth.ts';

test('detects ChatGPT and API-key Codex authentication modes', () => {
  assert.deepEqual(parseCodexLoginStatus('Logged in using ChatGPT', 0), {
    authenticated: true,
    mode: 'chatgpt',
    message: 'Logged in using ChatGPT',
  });
  assert.equal(parseCodexLoginStatus('Logged in using an API key', 0).mode, 'api-key');
  assert.equal(parseCodexLoginStatus('Not logged in', 1).authenticated, false);
});

test('extracts the official device login URL and one-time code', () => {
  const parsed = parseDeviceLoginOutput(`Open https://auth.openai.com/codex/device\nEnter this one-time code: WDJB-QXCV`);
  assert.equal(parsed.verificationUrl, 'https://auth.openai.com/codex/device');
  assert.equal(parsed.userCode, 'WDJB-QXCV');
});

test('does not force an API model when Codex uses ChatGPT account access', () => {
  assert.equal(resolveCodexModel({ authMode: 'chatgpt', configuredModel: 'gpt-5.3-codex', hasDirectApiKey: false }), undefined);
  assert.equal(resolveCodexModel({ authMode: 'api-key', configuredModel: 'gpt-5.3-codex', hasDirectApiKey: true }), 'gpt-5.3-codex');
  assert.equal(resolveCodexModel({ authMode: 'unknown', configuredModel: '', hasDirectApiKey: false }), undefined);
});
