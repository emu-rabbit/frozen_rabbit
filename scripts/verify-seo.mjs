import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const directory = path.resolve(process.argv[2] || 'dist');
const html = await readFile(path.join(directory, 'index.html'), 'utf8');
const origin = 'https://frozenrabbit.com/';
assert.equal((await readFile(path.join(directory, 'CNAME'), 'utf8')).trim(), new URL(origin).hostname);
assert.ok(!html.includes('https://emu-rabbit.github.io/frozen_rabbit/'), 'Homepage metadata must use the custom domain');
const meta = (name) => {
  const matches = [...html.matchAll(new RegExp(`<meta (?:name|property)="${name}" content="([^"]*)">`, 'g'))];
  assert.equal(matches.length, 1, `Expected one ${name}`);
  return matches[0][1];
};
assert.ok(html.includes(`rel="canonical" href="${origin}"`));
assert.equal(meta('og:url'), origin);
assert.equal(meta('robots'), 'index, follow, max-image-preview:large');
const title = html.match(/<title>([^<]+)<\/title>/)[1];
for (const name of ['og:title', 'twitter:title']) assert.equal(meta(name), title);
for (const name of ['og:description', 'twitter:description']) assert.equal(meta(name), meta('description'));
for (const name of ['og:image', 'og:image:secure_url', 'twitter:image']) assert.equal(meta(name), `${origin}assets/og-cover.jpg`);
assert.equal(meta('twitter:card'), 'summary_large_image');
assert.equal(meta('og:image:type'), 'image/jpeg');
assert.equal(meta('og:image:alt'), meta('twitter:image:alt'));
const graph = JSON.parse(html.match(/<script id="structured-data" type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
const page = graph.find(entity => entity['@type'] === 'CollectionPage');
assert.equal(page.name, title);
assert.equal(page.description, meta('description'));
assert.equal(page.url, origin);
const projects = [...html.matchAll(/<article class="destination[^>]*>([\s\S]*?)<\/article>/g)].map(match => match[1]);
const list = graph.find(entity => entity['@type'] === 'ItemList');
assert.equal(list.numberOfItems, projects.length);
list.itemListElement.forEach(({ item }, index) => {
  assert.ok(projects[index].includes(`<h3>${item.name}</h3>`));
  assert.ok(projects[index].includes(item.description));
  assert.ok(projects[index].includes(`href="${item.url}"`));
});
assert.equal((html.match(/<h1\b/g) || []).length, 1);
for (const match of html.matchAll(/(?:src|href)="\.\/([^"#?]+)"/g)) {
  await readFile(path.join(directory, match[1]));
}
const robots = await readFile(path.join(directory, 'robots.txt'), 'utf8');
assert.ok(robots.includes(`Sitemap: ${origin}sitemap.xml`));
assert.ok(!robots.includes('Disallow: /'));
const sitemap = await readFile(path.join(directory, 'sitemap.xml'), 'utf8');
assert.deepEqual([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]), [origin]);
const jpeg = await readFile(path.join(directory, 'assets/og-cover.jpg'));
assert.equal(jpeg.readUInt16BE(0), 0xffd8, 'Preview must be JPEG');
let dimensions;
for (let offset = 2; offset < jpeg.length;) {
  assert.equal(jpeg[offset], 0xff);
  const marker = jpeg[offset + 1];
  const length = jpeg.readUInt16BE(offset + 2);
  if ([0xc0, 0xc1, 0xc2].includes(marker)) {
    dimensions = [jpeg.readUInt16BE(offset + 7), jpeg.readUInt16BE(offset + 5)];
    break;
  }
  offset += length + 2;
}
assert.deepEqual(dimensions, [1200, 630]);
assert.equal(meta('og:image:width'), '1200');
assert.equal(meta('og:image:height'), '630');
assert.ok(jpeg.length < 1024 * 1024, 'Preview must stay under 1 MB');
console.log('SEO verified: initial HTML, metadata, structured data, links, sitemap and 1200 × 630 JPEG.');
