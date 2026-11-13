import { createReadStream, existsSync, readFileSync } from 'node:fs';
import { access } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));
const webRoot = resolve(projectRoot, 'Prototype frontend/dist');
const port = Number(process.env.PORT || 8080);
const host = process.env.HOST || '0.0.0.0';

// Keep local development convenient while allowing hosting providers to inject secrets.
const localEnvPath = join(projectRoot, '.env');
if (existsSync(localEnvPath)) {
  for (const line of readFileSync(localEnvPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!match || process.env[match[1]] !== undefined) continue;
    process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
};

function sendJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(body));
}

async function proxyCardTrader(request, response, url) {
  if (request.method !== 'GET') {
    response.writeHead(405, { Allow: 'GET' });
    response.end('Method not allowed');
    return;
  }

  const token = process.env.CARDTRADER_TOKEN;
  if (!token) {
    sendJson(response, 503, { error: 'CardTrader integration is not configured for this demo.' });
    return;
  }

  let upstream;
  try {
    if (url.pathname === '/api/cardtrader/request') {
      upstream = new URL(url.searchParams.get('url'));
      if (upstream.origin !== 'https://api.cardtrader.com' || !upstream.pathname.startsWith('/api/v2/')) throw new Error('Invalid URL');
    } else {
      const suffix = url.pathname.replace('/api/cardtrader', '') || '/info';
      if (!suffix.startsWith('/')) throw new Error('Invalid path');
      upstream = new URL(`https://api.cardtrader.com/api/v2${suffix}`);
      url.searchParams.forEach((value, key) => upstream.searchParams.set(key, value));
    }
  } catch {
    sendJson(response, 400, { error: 'Only CardTrader API v2 URLs are supported.' });
    return;
  }

  try {
    const result = await fetch(upstream, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
    response.writeHead(result.status, {
      'Content-Type': result.headers.get('content-type') || 'application/json',
      'Cache-Control': 'private, max-age=300',
    });
    response.end(await result.text());
  } catch {
    sendJson(response, 502, { error: 'CardTrader could not be reached.' });
  }
}

createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  if (url.pathname === '/healthz') return sendJson(response, 200, { status: 'ok' });
  if (url.pathname.startsWith('/api/cardtrader/')) return proxyCardTrader(request, response, url);
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end('Method not allowed');
    return;
  }

  let pathname;
  try { pathname = decodeURIComponent(url.pathname); } catch { response.writeHead(400).end('Bad request'); return; }
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const target = resolve(webRoot, relativePath);
  if (target !== webRoot && !target.startsWith(`${webRoot}${sep}`)) {
    response.writeHead(404).end('Not found');
    return;
  }
  try { await access(target); } catch { response.writeHead(404).end('Not found'); return; }

  response.writeHead(200, {
    'Content-Type': types[extname(target)] || 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Cache-Control': extname(target) === '.html' ? 'no-cache' : 'public, max-age=3600',
  });
  if (request.method === 'HEAD') return response.end();
  createReadStream(target).pipe(response);
}).listen(port, host, () => console.log(`TCG Market demo listening on ${host}:${port}`));
