import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
const files = { '/': ['index.html', 'text/html'], '/index.html': ['index.html', 'text/html'], '/style.css': ['style.css', 'text/css'], '/site.js': ['site.js', 'text/javascript'] };
for (const name of ['crafter.jpg', 'book.jpg', 'witch.jpg', 'friends.png', 'space.png', 'workshop.png', 'tome.png', 'cosmic.png']) {
  files[`/assets/${name}`] = [`assets/${name}`, name.endsWith('.png') ? 'image/png' : 'image/jpeg'];
}
createServer(async (req, res) => {
  const file = files[new URL(req.url, 'http://localhost').pathname];
  if (!file) { res.writeHead(404); res.end('Not found'); return; }
  try {
    const content = await readFile(new URL(file[0], import.meta.url));
    res.writeHead(200, { 'Content-Type': file[1], 'Cache-Control': 'no-store' });
    res.end(content);
  }
  catch { res.writeHead(500); res.end('Unable to load file'); }
}).listen(4173, '127.0.0.1', () => console.log('Preview: http://127.0.0.1:4173'));
