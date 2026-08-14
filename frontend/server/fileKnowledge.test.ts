import assert from 'node:assert/strict';
import test from 'node:test';
import { extractUploads, validateUploads } from './fileKnowledge.ts';

function upload(name: string, content: string, type = 'text/plain') {
  const buffer = Buffer.from(content);
  return { name, type, size: buffer.length, contentBase64: buffer.toString('base64') };
}

test('extracts a CSV into knowledge text and a BI-ready table preview', async () => {
  const result = await extractUploads([upload('sales.csv', 'Month,Region,Revenue\n2026-01,North,1200\n2026-02,South,1450', 'text/csv')]);
  assert.equal(result.sources[0].extractionStatus, 'analyzed');
  assert.deepEqual(result.dataContext[0].headers, ['Month', 'Region', 'Revenue']);
  assert.equal(result.dataContext[0].rowCount, 2);
  assert.deepEqual(result.dataContext[0].sampleRows[0], ['2026-01', 'North', '1200']);
});

test('rejects unsupported file formats before decoding their content', () => {
  assert.throws(() => validateUploads([upload('macro.exe', 'not-an-executable')]), /not a supported file format/);
});

test('rejects a payload whose decoded bytes do not match the declared upload size', async () => {
  const file = upload('brief.txt', 'brief');
  await assert.rejects(() => extractUploads([{ ...file, size: file.size + 1 }]), /did not match its declared size/);
});
