import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || undefined });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(path.resolve('dist/tw/index.html')).href);
  // Reuse the actual hero markup, including its original photo and SVG cutout.
  await page.evaluate(() => {
    const hero = document.querySelector('.hero').cloneNode(true);
    document.body.replaceChildren(hero);
    document.querySelector('.hero-button').remove();
    document.querySelector('.photo-note').remove();
    document.querySelector('.hero-description').innerHTML = 'WORKSHOP · TOME · COSMIC';
    const label = document.createElement('div');
    label.className = 'share-domain';
    label.textContent = 'frozenrabbit.com';
    document.body.append(label);
    const credit = document.createElement('div');
    credit.className = 'share-credit';
    credit.textContent = 'FFXIV · Game imagery © SQUARE ENIX';
    document.body.append(credit);
    // Resolve site-root assets for reproducible file-based rendering.
    const base = new URL('../../', location.href);
    for (const element of document.querySelectorAll('[src], image')) {
      const attribute = element.hasAttribute('src') ? 'src' : 'href';
      const value = element.getAttribute(attribute);
      if (value?.startsWith('/')) element.setAttribute(attribute, new URL(value.slice(1), base).href);
    }
    for (const link of document.querySelectorAll('link[rel="stylesheet"]')) {
      if (link.getAttribute('href').startsWith('/')) link.href = new URL('style.css', base).href;
    }
  });
  await page.addStyleTag({ content: `
    body { width:1200px; height:630px; overflow:hidden; border:16px solid #fffdf4; }
    .hero.wrap { width:1080px; min-height:540px; height:540px; padding:18px 0 0; grid-template-columns:49% 51%; }
    h1 {font-size:58px;line-height:1.4;}
    .hero-aside {font-size:20px; margin-top:26px;}
    .hero-description {font-size:17px; font-weight:800;letter-spacing:2px;margin-top:22px;}
    .collage {transform:translateY(12px);}
    .share-domain {position:absolute;left:60px;bottom:34px;font-size:20px;font-weight:700;letter-spacing:1px;}
    .share-credit {position:absolute;right:48px;bottom:35px;font-size:12px;color:#435646;}
  ` });
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(img => img.decode().catch(() => {}))); });
  await page.screenshot({ path: 'assets/og-base-v2.jpg', type: 'jpeg', quality: 90 });
} finally { await browser.close(); }
