import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parseHTML } from 'linkedom';
const directory = path.resolve(process.argv[2] || 'dist');
const origin = 'https://frozenrabbit.com/';
const locales = { tw: 'zh-Hant', cn: 'zh-Hans', en: 'en', ja: 'ja' };
assert.equal((await readFile(path.join(directory, 'CNAME'), 'utf8')).trim(), new URL(origin).hostname);
for (const route of ['', ...Object.keys(locales)]) {
  const html = await readFile(path.join(directory, route, 'index.html'), 'utf8');
  const { document } = parseHTML(html);
  const locale = route || 'tw';
  const canonical = `${origin}${locale}/`;
  const meta = name => {
    const nodes = document.querySelectorAll(`meta[name="${name}"],meta[property="${name}"]`);
    assert.equal(nodes.length, 1, `${route}: one ${name}`);
    return nodes[0].content;
  };
  assert.equal(document.documentElement.lang, locales[locale]);
  assert.equal(document.querySelector('[rel="canonical"]').href, canonical);
  assert.equal(meta('og:url'), canonical);
  assert.equal(meta('robots'), 'index, follow, max-image-preview:large');
  for (const key of ['og:title', 'twitter:title']) assert.equal(meta(key), document.title);
  for (const key of ['og:description', 'twitter:description']) assert.equal(meta(key), meta('description'));
  for (const key of ['og:image','og:image:secure_url','twitter:image']) assert.equal(meta(key), origin + `assets/og-${locale}-v3.jpg`);
  assert.equal(meta('twitter:card'), 'summary_large_image');
  assert.equal(meta('og:image:type'), 'image/jpeg');
  assert.equal(meta('og:image:alt'), meta('twitter:image:alt'));
  assert.equal(meta('og:image:width'),'1200');
  assert.equal(meta('og:image:height'),'630');
  assert.equal(document.querySelectorAll('link[hreflang]').length,5);
  for (const [key, language] of [...Object.entries(locales), ['', 'x-default']]) {
    assert.equal(document.querySelector(`link[hreflang="${language}"]`).href, origin + (key ? key + '/' : ''));
  }
  assert.equal(document.querySelector('#language option[selected]').getAttribute('value'), locale);
  assert.equal(document.querySelectorAll('footer a, .locale-links').length,0);
  const graph = JSON.parse(document.querySelector('#structured-data').textContent)['@graph'];
  const page = graph.find(entity => entity['@type'] === 'CollectionPage');
  assert.equal(page.name,document.title);
  assert.equal(page.description,meta('description'));
  assert.equal(page.url,canonical);
  assert.equal(page.inLanguage,locales[locale]);
  const list = graph.find(entity => entity['@type'] === 'ItemList');
  assert.equal(page.mainEntity['@id'],list['@id']);
  const projects = document.querySelectorAll('.destination');
  assert.equal(list.numberOfItems,projects.length);
  list.itemListElement.forEach(({item},index) => {
    assert.equal(item.name,projects[index].querySelector('h3').textContent);
    assert.equal(item.description,projects[index].querySelector('.project-description').textContent);
    assert.equal(item.url,projects[index].href);
  });
  assert.equal(document.querySelectorAll('h1').length,1);
  if (locale !== 'tw') assert.ok(!document.body.textContent.includes('歡迎光臨'));
  for (const element of document.querySelectorAll('[src], [href]')) {
    const value = element.getAttribute('src') || element.getAttribute('href');
    if (value.startsWith('/') && !value.endsWith('/')) await readFile(path.join(directory,value));
  }
}
const robots = await readFile(path.join(directory,'robots.txt'),'utf8');
assert.ok(robots.includes(`Sitemap: ${origin}sitemap.xml`));
const sitemap = await readFile(path.join(directory,'sitemap.xml'),'utf8');
assert.deepEqual([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]), Object.keys(locales).map(key => `${origin}${key}/`));
for (const locale of Object.keys(locales)) {
const jpeg = await readFile(path.join(directory,`assets/og-${locale}-v3.jpg`));
assert.equal(jpeg.readUInt16BE(0),0xffd8);
let dimensions;
for (let offset = 2; offset < jpeg.length;) {
  assert.equal(jpeg[offset],0xff);
  const marker = jpeg[offset+1];
  const length = jpeg.readUInt16BE(offset+2);
  if ([0xc0,0xc1,0xc2].includes(marker)) { dimensions = [jpeg.readUInt16BE(offset+7),jpeg.readUInt16BE(offset+5)]; break; }
  offset += length+2;
}
assert.deepEqual(dimensions,[1200,630]);
assert.ok(jpeg.length < 1024*1024);
}
console.log('SEO verified: all five initial HTML pages, four locales, canonical/hreflang, localized structured data, assets, sitemap and 1200 × 630 JPEG.');
