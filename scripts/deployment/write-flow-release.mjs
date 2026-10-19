import { writeFile } from 'node:fs/promises';

const sha = process.env.GITHUB_SHA;
if (!/^[a-f0-9]{40}$/.test(sha || '')) {
  console.error('GITHUB_SHA must contain the full commit SHA of the release.');
  process.exitCode = 1;
} else {
  await writeFile(new URL('../../client/out/flow-release.json', import.meta.url),
    `${JSON.stringify({ commit: sha })}\n`);
  console.log(`Prepared public release marker for ${sha}.`);
}
