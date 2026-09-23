import test from 'node:test';
import assert from 'node:assert/strict';
import { server } from '../src/server.js';

test('health endpoint returns architecture status', async () => {
  await new Promise((resolve) => server.listen(0, resolve));
  const response = await fetch(`http://localhost:${server.address().port}/health`);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).status, 'ok');
  await new Promise((resolve) => server.close(resolve));
});

test('assistant endpoint refuses missing backend configuration', async () => {
  delete process.env.GWDG_API_KEY;
  delete process.env.GWDG_ARCANA_ID;
  await new Promise((resolve) => server.listen(0, resolve));
  const response = await fetch(`http://localhost:${server.address().port}/api/assistant`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message: 'hello' }) });
  assert.equal(response.status, 503);
  await new Promise((resolve) => server.close(resolve));
});
