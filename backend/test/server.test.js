import test from 'node:test';
import assert from 'node:assert/strict';
import { server } from '../src/server.js';

test('health endpoint returns ok', async () => {
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const response = await fetch(`http://localhost:${port}/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
  await new Promise((resolve) => server.close(resolve));
});

test('narrative validates role before calling provider', async () => {
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const response = await fetch(`http://localhost:${port}/narrative`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ role: '' }) });
  assert.equal(response.status, 400);
  await new Promise((resolve) => server.close(resolve));
});
