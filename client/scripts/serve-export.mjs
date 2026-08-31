import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';

const exportRoot = path.resolve(process.cwd(), 'out');
const port = Number.parseInt(process.env.PORT || '3000', 10);
const host = process.env.HOST || '127.0.0.1';

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.m4a', 'audio/mp4'],
  ['.map', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.webp', 'image/webp'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
]);

async function resolveExportedFile(pathname) {
  const relativePath = decodeURIComponent(pathname).replace(/^\/+/, '');
  let candidate = path.resolve(exportRoot, relativePath);
  const exportPrefix = `${exportRoot}${path.sep}`;

  if (candidate !== exportRoot && !candidate.startsWith(exportPrefix)) {
    return null;
  }

  try {
    const candidateStat = await stat(candidate);
    if (candidateStat.isDirectory()) {
      candidate = path.join(candidate, 'index.html');
    }
    if ((await stat(candidate)).isFile()) {
      return candidate;
    }
  } catch {
    // Firebase Hosting falls back to the exported application shell.
  }

  return path.join(exportRoot, 'index.html');
}

const server = createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
    const filePath = await resolveExportedFile(requestUrl.pathname);

    if (!filePath) {
      response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Bad request');
      return;
    }

    await stat(filePath);
    response.writeHead(200, {
      'Cache-Control': 'no-store',
      'Content-Type': contentTypes.get(path.extname(filePath).toLowerCase()) || 'application/octet-stream',
    });
    createReadStream(filePath).pipe(response);
  } catch (error) {
    console.error('Static preview request failed:', error.message);
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Preview server error');
  }
});

server.listen(port, host, () => {
  console.log(`Flow static export available at http://${host}:${port}`);
});
