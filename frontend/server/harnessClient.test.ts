import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import test from 'node:test';
import { harnessMode, parseHarnessJson, runHarnessJson } from './harnessClient.ts';

test('harness mode is explicit', () => {
  assert.equal(harnessMode({ AI_RUNTIME_MODE: 'harness' }), true);
  assert.equal(harnessMode({ AI_RUNTIME_MODE: 'direct' }), false);
  assert.equal(harnessMode({}), false);
});

test('parseHarnessJson accepts JSON fences', () => {
  assert.deepEqual(parseHarnessJson('```json\n{"ok":true}\n```'), { ok: true });
});

test('runHarnessJson sends a guarded prompt and parses the response', async () => {
  let requestBody = '';
  const server = createServer((req, res) => {
    req.setEncoding('utf8');
    req.on('data', (chunk) => { requestBody += chunk; });
    req.on('end', () => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        session_id: 'test',
        finish_reason: 'completed',
        final_response: '{"answer":42}',
      }));
    });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Test server did not bind.');

  try {
    const result = await runHarnessJson({
      AI_RUNTIME_MODE: 'harness',
      DSH_RUNTIME_URL: `http://127.0.0.1:${address.port}`,
      DSH_RUNTIME_TIMEOUT_MS: '5000',
    }, 'Analyze this evidence.');
    assert.deepEqual(result, { answer: 42 });
    const parsed = JSON.parse(requestBody) as { prompt: string; session_id: string };
    assert.match(parsed.prompt, /untrusted evidence/i);
    assert.match(parsed.session_id, /^pbi-analysis-/);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});
