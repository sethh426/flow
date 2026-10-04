import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkFlowConfiguration } from './check-flow-config.mjs';

const config = { apiKey: 'public-test-config', authDomain: 'flow-test.firebaseapp.com', projectId: 'flow-test', appId: 'test-app' };
const environment = {
  FIREBASE_PROJECT_ID: 'flow-test', NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'flow-test',
  NEXT_PUBLIC_FIREBASE_API_KEY: config.apiKey, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: config.authDomain,
  NEXT_PUBLIC_FIREBASE_APP_ID: config.appId,
};

test('complete build configuration avoids unnecessary runtime requests', async () => {
  assert.equal(await checkFlowConfiguration(environment, () => { throw new Error('Should not fetch'); }), 'build');
});
test('a deployment can use its valid public Hosting configuration', async () => {
  assert.equal(await checkFlowConfiguration({ FIREBASE_PROJECT_ID: 'flow-test' }, async (url) => {
    assert.equal(url, 'https://flow-test.web.app/__/firebase/init.json');
    return new Response(JSON.stringify(config), { headers: { 'content-type': 'application/json' } });
  }), 'hosting');
});
test('mismatched projects and unavailable runtime configuration stop deployment', async () => {
  await assert.rejects(checkFlowConfiguration({ ...environment, FIREBASE_PROJECT_ID: 'wrong-project' }), /different project/);
  await assert.rejects(checkFlowConfiguration({ FIREBASE_PROJECT_ID: 'flow-test' }, async () => new Response('<html></html>')), /configuration is unavailable/);
  await assert.rejects(checkFlowConfiguration({ FIREBASE_PROJECT_ID: 'flow-test' }, async () => new Response(JSON.stringify({ ...config, projectId: 'wrong-project' }), { headers: { 'content-type': 'application/json' } })), /configuration is unavailable/);
});
