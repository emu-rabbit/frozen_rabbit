import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { parseHTML } from 'linkedom';
import { localize } from '../localization.mjs';
import { fontCharacters } from './font-subsets.mjs';

const directory = new URL('../assets/fonts/', import.meta.url);
await mkdir(directory, { recursive: true });
const source = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const manifest = {};
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
async function get(url) {
  const response = await fetch(url, { headers: { 'User-Agent': userAgent } });
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  return response;
}
for (const locale of ['tw', 'cn', 'en', 'ja']) {
  const { document } = parseHTML(source);
  localize(document, locale);
  const characters = fontCharacters(document);
  const families = locale === 'cn'
    ? [['Noto Sans SC', '400..900', characters], ['Noto Serif SC', '600', characters]]
    : [['Noto Sans TC', '400..900', characters], ['Klee One', '600', characters], ['Noto Sans SC', '400', '简体中文']];
  let css = '';
  for (const [family, weight, text] of families) {
    const url = `https://fonts.googleapis.com/css2?family=${family.replaceAll(' ', '+')}:wght@${weight}&display=swap&text=${encodeURIComponent(text)}`;
    let rule = await (await get(url)).text();
    if (!rule.includes("format('woff2')")) throw new Error(`Expected WOFF2 for ${family}`);
    for (const match of [...rule.matchAll(/url\((https:[^)]+)\)/g)]) {
      const data = Buffer.from(await (await get(match[1])).arrayBuffer());
      if (data.toString('ascii', 0, 4) !== 'wOF2') throw new Error('Invalid WOFF2');
      const name = `${family.toLowerCase().replaceAll(' ', '-')}-${createHash('sha256').update(data).digest('hex').slice(0, 12)}.woff2`;
      await writeFile(new URL(name, directory), data);
      rule = rule.replace(match[1], `/assets/fonts/${name}`);
      console.log(`${locale}: ${name} ${data.length} bytes`);
    }
    css += rule;
  }
  manifest[locale] = { characters, css };
}
for (const family of ['notosanstc', 'notosanssc', 'notoserifsc', 'kleeone']) {
  const license = await (await get(`https://raw.githubusercontent.com/google/fonts/main/ofl/${family}/OFL.txt`)).text();
  await writeFile(new URL(`${family}-OFL.txt`, directory), license.replace(/[\t ]+$/gm, ''));
}
await writeFile(new URL('manifest.json', directory), JSON.stringify(manifest, null, 2) + '\n');
console.log('Updated local font subsets and upstream OFL licenses. Commit the generated files together with text changes.');
