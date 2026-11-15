import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE_DIR = path.resolve(ROOT_DIR, '..');
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '127.0.0.1';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const SPA_ROUTES = new Set(['/', '/study', '/flashcards', '/questions', '/exam', '/fetest', '/mistakes', '/stats', '/dashboard']);

async function resolveStaticTarget(safeRel) {
  const candidates = [safeRel];
  if (/\.png$/i.test(safeRel)) {
    candidates.push(safeRel.replace(/\.png$/i, '.jpg'));
  } else if (/\.jpe?g$/i.test(safeRel)) {
    candidates.push(safeRel.replace(/\.jpe?g$/i, '.png'));
  }

  for (const baseDir of [ROOT_DIR, WORKSPACE_DIR]) {
    for (const rel of candidates) {
      const candidatePath = path.resolve(baseDir, rel);
      if (candidatePath !== baseDir && !candidatePath.startsWith(baseDir + path.sep)) {
        continue;
      }
      try {
        const stat = await fs.stat(candidatePath);
        if (stat.isDirectory()) return { isDirectory: true, filePath: candidatePath };
        if (stat.isFile()) return { isDirectory: false, filePath: candidatePath };
      } catch {
        // Try next candidate
      }
    }
  }
  return null;
}

const server = http.createServer(async (req, res) => {
  try {
    const reqUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    let pathname = decodeURIComponent(reqUrl.pathname);

    if (SPA_ROUTES.has(pathname)) {
      pathname = '/index.html';
    }

    const cleanPath = pathname.replace(/^\/+/, '');
    const safeRel = path.normalize(cleanPath).replace(/^(\.\.(\/|\\|$))+/, '');
    const primaryResolved = path.resolve(ROOT_DIR, safeRel);
    if (primaryResolved !== ROOT_DIR && !primaryResolved.startsWith(ROOT_DIR + path.sep)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Forbidden');
      return;
    }

    const target = await resolveStaticTarget(safeRel);
    if (!target) {
      if (!path.extname(pathname)) {
        const indexHtml = await fs.readFile(path.join(ROOT_DIR, 'index.html'));
        res.writeHead(200, { 'Content-Type': MIME_TYPES['.html'] });
        res.end(indexHtml);
        return;
      }
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }

    if (target.isDirectory) {
      const indexHtml = await fs.readFile(path.join(ROOT_DIR, 'index.html'));
      res.writeHead(200, { 'Content-Type': MIME_TYPES['.html'] });
      res.end(indexHtml);
      return;
    }

    const ext = path.extname(target.filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const content = await fs.readFile(target.filePath);
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': ext === '.json' ? 'public, max-age=300' : 'no-cache',
    });
    res.end(content);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Internal Server Error: ' + (err?.message || 'unknown'));
  }
});

server.listen(PORT, HOST, () => {
  console.log(`FU-EOS Localhost Server dang chay tai: http://${HOST}:${PORT}`);
  console.log('Nhan Ctrl+C de dung server.');
});

