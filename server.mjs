import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
const port = Number(process.env.PORT || 4173);
const files = { '/': ['index.html', 'text/html'], '/index.html': ['index.html', 'text/html'], '/style.css': ['style.css', 'text/css'], '/site.js': ['site.js', 'text/javascript'] };
files['/robots.txt'] = ['robots.txt', 'text/plain'];
files['/sitemap.xml'] = ['sitemap.xml', 'application/xml'];
for (const name of ['og-cover.jpg', 'crafter.webp', 'book.webp', 'witch.webp', 'witch-thumb.webp', 'friends.webp', 'friends-thumb.webp', 'space.webp', 'workshop.png', 'workshop.webp', 'tome.webp', 'cosmic.webp']) {
  files[`/assets/${name}`] = [`assets/${name}`, name.endsWith('.webp') ? 'image/webp' : name.endsWith('.png') ? 'image/png' : 'image/jpeg'];
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
}).listen(port, '127.0.0.1', () => console.log(`Preview: http://127.0.0.1:${port}`));
