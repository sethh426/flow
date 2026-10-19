import assert from 'node:assert/strict';
import { test } from 'node:test';
import { verifyFlowRelease } from './verify-flow-release.mjs';

const sha = 'a'.repeat(40);
const response = (body, status = 200) => ({ ok: status === 200, status, json: async () => body });

test('requires a matching Hosting commit and configured studio Function', async () => {
  const urls = [];
  const result = await verifyFlowRelease({ sha, fetcher: async (url) => {
    urls.push(url.pathname);
    return url.pathname === '/flow-release.json'
      ? response({ commit: sha })
      : response({ configured: true, capabilities: { creative: 'ai' } });
  } });
  assert.deepEqual(urls, ['/flow-release.json', '/api/studio/status']);
  assert.deepEqual(result, { commit: sha, studioConfigured: true });
});

test('rejects stale Hosting, unavailable Function and unconfigured AI', async () => {
  await assert.rejects(verifyFlowRelease({ sha, fetcher: async () => ({ ok: true, json: async () => { throw new SyntaxError('HTML'); } }) }), /did not return JSON/);
  await assert.rejects(verifyFlowRelease({ sha, fetcher: async () => response({ commit: 'b'.repeat(40) }) }), /not serving the commit/);
  await assert.rejects(verifyFlowRelease({ sha, fetcher: async (url) => url.pathname.endsWith('.json')
    ? response({ commit: sha }) : response({}, 503) }), /HTTP 503/);
  await assert.rejects(verifyFlowRelease({ sha, fetcher: async (url) => url.pathname.endsWith('.json')
    ? response({ commit: sha }) : response({ configured: false, capabilities: { creative: 'ai' } }) }), /not configured/);
});
