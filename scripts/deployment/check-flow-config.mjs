import { pathToFileURL } from 'node:url';

const fields = ['apiKey', 'authDomain', 'projectId', 'appId'];
function valid(config, project) {
  return config && fields.every((field) => typeof config[field] === 'string' && config[field].trim())
    && config.projectId === project;
}

/** Check public client configuration without logging configuration values or using credentials. */
export async function checkFlowConfiguration(environment = process.env, fetcher = fetch) {
  const project = environment.FIREBASE_PROJECT_ID || environment.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!project || !/^[a-z0-9-]+$/.test(project))
    throw new Error('Set a valid FIREBASE_PROJECT_ID before deployment.');
  const config = {
    apiKey: environment.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: environment.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: environment.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: environment.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  if (fields.every((field) => config[field])) {
    if (!valid(config, project)) throw new Error('Client configuration targets a different project than deployment.');
    return 'build';
  }
  try {
    const response = await fetcher(`https://${project}.web.app/__/firebase/init.json`, {
      signal: AbortSignal.timeout(10_000),
    });
    if (response.ok && response.headers.get('content-type')?.includes('application/json')
      && valid(await response.json(), project)) return 'hosting';
  } catch {
    // Do not log response bodies or configuration values.
  }
  throw new Error('Firebase web configuration is unavailable. Link the Hosting site to its web app, or configure the NEXT_PUBLIC_FIREBASE_* repository variables before deployment.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  checkFlowConfiguration().then((source) => {
    console.log(`Flow public configuration verified via ${source === 'build' ? 'build environment' : 'Hosting runtime endpoint'}.`);
  }).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
