import { mkdir, copyFile, cp, rm, readFile, writeFile } from 'node:fs/promises';
import { parseHTML } from 'linkedom';
import { localize } from './localization.mjs';
import path from 'node:path';
const output = path.resolve('dist');
if (output !== path.join(process.cwd(), 'dist')) throw new Error('Unexpected build target');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
const origin = 'https://frozenrabbit.com';
const locales = { tw: 'zh-Hant', cn: 'zh-Hans', en: 'en', ja: 'ja' };
const source = await readFile('index.html', 'utf8');
for (const route of ['', ...Object.keys(locales)]) {
  const language = route || 'tw';
  const { document } = parseHTML(source);
  localize(document, language);
  const imageUrl = `${origin}/assets/og-${language}-v3.jpg`;
  for (const selector of ['[property="og:image"]', '[property="og:image:secure_url"]', '[name="twitter:image"]']) document.querySelector(selector).content = imageUrl;
  const canonical = `${origin}/${language}/`;
  document.querySelector('[rel="canonical"]').href = canonical;
  document.querySelector('[property="og:url"]').content = canonical;
  const siteName = document.querySelector('.brand>span').textContent;
  document.querySelector('[property="og:site_name"]').content = siteName;
  for (const [key, lang] of [...Object.entries(locales), ['', 'x-default']]) {
    const link = document.createElement('link');
    link.setAttribute('rel', 'alternate');
    link.setAttribute('hreflang', lang);
    link.setAttribute('href', `${origin}/${key ? key + '/' : ''}`);
    document.head.append(link);
  }
  for (const option of document.querySelectorAll('#language option')) {
    if (option.getAttribute('value') === language) option.setAttribute('selected', '');
    else option.removeAttribute('selected');
  }
  const structured = document.querySelector('#structured-data');
  const data = JSON.parse(structured.textContent);
  const page = data['@graph'].find(item => item['@type'] === 'CollectionPage');
  page.url = canonical;
  page['@id'] = canonical + '#webpage';
  page.mainEntity['@id'] = canonical + '#tools';
  const list = data['@graph'].find(item => item['@type'] === 'ItemList');
  list['@id'] = canonical + '#tools';
  data['@graph'].find(item => item['@type'] === 'ImageObject').caption = document.querySelector('[property="og:image:alt"]').content;
  data['@graph'].find(item => item['@type'] === 'ImageObject').contentUrl = imageUrl;
  structured.textContent = JSON.stringify(data).replaceAll('<', '\\u003c');
  await mkdir(path.join(output, route), { recursive: true });
  await writeFile(path.join(output, route, 'index.html'), document.toString());
}
for (const file of ['style.css', 'site.js', 'robots.txt', 'CNAME']) await copyFile(file, path.join(output,file));
await cp('assets', path.join(output,'assets'), { recursive: true });
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${Object.keys(locales).map(key => `  <url><loc>${origin}/${key}/</loc></url>`).join('\n')}\n</urlset>\n`;
await writeFile(path.join(output,'sitemap.xml'), sitemap);
console.log('Built root entry and four localized static pages in dist/');
