import { pathToFileURL } from 'node:url';

const defaultOrigin = 'https://affiliateflow-abzfy.web.app';

async function readJson(response, label) {
  try {
    return await response.json();
  } catch {
    throw new Error(`${label} did not return JSON; Hosting may still be serving the old site.`);
  }
}

/** Verify both the deployed static build and its live studio Function. */
export async function verifyFlowRelease({
  origin = defaultOrigin,
  sha,
  fetcher = fetch,
} = {}) {
  if (!/^[a-f0-9]{40}$/.test(sha || ''))
    throw new Error('Set RELEASE_SHA to the full commit SHA being deployed.');

  const base = new URL(origin);
  if (base.protocol !== 'https:' || base.pathname !== '/' || base.search || base.hash)
    throw new Error('Release origin must be an HTTPS site root.');

  const releaseResponse = await fetcher(new URL('/flow-release.json', base), {
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  });
  if (!releaseResponse.ok) throw new Error(`Hosting release marker returned HTTP ${releaseResponse.status}.`);
  const release = await readJson(releaseResponse, 'Hosting release marker');
  if (release.commit !== sha)
    throw new Error('Hosting is not serving the commit that this deployment built.');

  const statusResponse = await fetcher(new URL('/api/studio/status', base), {
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  });
  if (!statusResponse.ok) throw new Error(`Studio Function returned HTTP ${statusResponse.status}.`);
  const status = await readJson(statusResponse, 'Studio Function');
  if (status?.capabilities?.creative !== 'ai')
    throw new Error('Studio Function did not return its expected capability response.');
  if (status.configured !== true)
    throw new Error('Studio Function is reachable but AI creation is not configured.');

  return { commit: sha, studioConfigured: true };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  verifyFlowRelease({ origin: process.env.FLOW_RELEASE_ORIGIN || defaultOrigin, sha: process.env.RELEASE_SHA })
    .then(({ commit }) => console.log(`Verified Hosting commit ${commit} and configured studio Function.`))
    .catch((error) => {
      console.error(`Flow release verification failed: ${error.message}`);
      process.exitCode = 1;
    });
}
