import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const hostingDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(hostingDir, '..', '..');
const outputDir = join(hostingDir, '.dist');
const earlyDir = join(repoRoot, 'flow-early-adopters');
const investorDir = join(repoRoot, 'flowinvestorglance-temp');
const clientDir = join(repoRoot, 'client');
const npmCli = process.env.npm_execpath;

if (!npmCli) {
  throw new Error('Run this builder through `npm run build` so npm_execpath is available.');
}

function run(command, args, cwd, env = {}) {
  execFileSync(command, args, {
    cwd,
    env: { ...process.env, ...env },
    stdio: 'inherit',
  });
}

function copyDirectory(source, destination) {
  if (!existsSync(source)) {
    throw new Error(`Missing build input: ${relative(repoRoot, source)}`);
  }
  mkdirSync(destination, { recursive: true });
  cpSync(source, destination, { recursive: true, force: true });
}

function copyMissingPublicAssets(source, destination) {
  for (const entry of readdirSync(source)) {
    const sourcePath = join(source, entry);
    if (!statSync(sourcePath).isFile()) continue;
    const destinationPath = join(destination, entry);
    if (!existsSync(destinationPath)) {
      cpSync(sourcePath, destinationPath);
    }
  }
}

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

run(process.execPath, [npmCli, 'run', 'build'], earlyDir);
run(process.execPath, [npmCli, 'run', 'build'], clientDir, {
  NEXT_PUBLIC_BASE_PATH: '/app',
  NEXT_PUBLIC_API_MODE: 'mock',
  NEXT_PUBLIC_APP_URL: 'https://flowearlyadopters.web.app/app/',
});

copyDirectory(join(earlyDir, 'public'), outputDir);
copyDirectory(join(investorDir, 'public'), join(outputDir, 'investors'));
copyDirectory(join(clientDir, 'out'), join(outputDir, 'app'));
copyMissingPublicAssets(join(clientDir, 'public'), outputDir);

// Never publish legacy administration or configuration templates.
rmSync(join(outputDir, 'get-signups.html'), { force: true });
rmSync(join(outputDir, 'config.example.js'), { force: true });

const buildInfo = {
  generatedAt: new Date().toISOString(),
  project: 'flowearlyadopters',
  routes: {
    earlyAdopters: '/',
    investors: '/investors/',
    application: '/app/',
  },
  apiMode: 'mock',
};

writeFileSync(
  join(outputDir, 'build-info.json'),
  `${JSON.stringify(buildInfo, null, 2)}\n`,
  'utf8',
);

console.log(`Unified Hosting output: ${relative(repoRoot, outputDir)}`);
