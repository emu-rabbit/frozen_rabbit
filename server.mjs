import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import './build.mjs';
const root = path.resolve('dist');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.txt': 'text/plain', '.xml': 'application/xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg' };
createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (/^\/(tw|cn|en|ja)$/.test(url.pathname)) {
    res.writeHead(301, { Location: url.pathname + '/' + url.search }); res.end(); return;
  }
  const file = path.resolve(root, '.' + url.pathname + (url.pathname.endsWith('/') ? 'index.html' : ''));
  if (!file.startsWith(root + path.sep)) { res.writeHead(404); res.end(); return; }
  try {
    const content = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(content);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(Number(process.env.PORT || 4173), '127.0.0.1', () => console.log('Preview: http://127.0.0.1:' + (process.env.PORT || 4173)));
