import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
await mkdir('performance-results', { recursive: true });
const browser = await chromium.launch({headless:true, executablePath:process.env.CHROMIUM_PATH || undefined});
try {
 for (const [locale, expected, saved] of [['en-US','en'],['ja-JP','ja'],['zh-CN','cn'],['zh-TW','tw'],['de-DE','tw'],['en-US','ja','ja']]) {
  const context = await browser.newContext({locale});
  if(saved) await context.addInitScript(value => localStorage.setItem('frozen-rabbit-language',value),saved);
  const check = await context.newPage();
  await check.goto('http://127.0.0.1:4186/?ref=test#projects');
  await check.waitForURL('**/'+expected+'/?ref=test#projects');
  await check.goto('http://127.0.0.1:4186/cn/');
  assert.equal(await check.locator('html').getAttribute('lang'),'zh-Hans');
  await context.close();
 }
 const page = await browser.newPage();
 const errors = [];
 const external = [];
 page.on('request', request => { if (!request.url().startsWith('http://127.0.0.1:4186/')) external.push(request.url()); });
 page.on('pageerror', e => errors.push(e.message));
 for (const [key,lang] of Object.entries({tw:'zh-Hant',cn:'zh-Hans',en:'en',ja:'ja'})) {
  await page.goto(`http://127.0.0.1:4186/${key}/`);
  assert.equal(await page.locator('html').getAttribute('lang'),lang);
  assert.equal(await page.locator('#language').inputValue(),key);
  await page.reload();
  await page.evaluate(() => document.fonts.ready);
  assert.ok(await page.evaluate(() => [...document.fonts].every(font => font.status !== 'error')), `${key}: fonts loaded`);
  assert.equal(await page.locator('#language').inputValue(),key);
  for (const width of [390,1280]) {
   await page.setViewportSize({width,height:900});
   assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),`${key}: overflow at ${width}`);
   await page.screenshot({path:`performance-results/verified-${key}-${width}.png`,fullPage:true});
  }
 }
 await page.goto('http://127.0.0.1:4186/en/#projects');
 await page.selectOption('#language','ja');
 await page.waitForURL('**/ja/#projects');
 await page.goBack();
 assert.equal(await page.locator('html').getAttribute('lang'),'en');
 await page.goto('http://127.0.0.1:4186/?lang=cn#projects');
 await page.waitForURL('**/cn/#projects');
 await page.goto('http://127.0.0.1:4186/en/?lang=ja&ref=test#projects');
 await page.waitForURL('**/ja/?ref=test#projects');
 await page.goto('http://127.0.0.1:4186/en/');
 await page.locator('.photo-open').first().click();
 assert.ok(await page.locator('.photo-dialog').evaluate(el => el.open));
 assert.ok((await page.locator('.photo-dialog p').textContent()).includes('Taking in'));
 await page.locator('.close-photo').click();
 await page.screenshot({path:'performance-results/english-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'performance-results/english-mobile.png',fullPage:true});
 assert.equal(await page.locator('footer a, .locale-links').count(),0);
 assert.equal((await page.request.get('http://127.0.0.1:4186/unknown/')).status(),404);
 assert.deepEqual(errors,[]);
 assert.deepEqual(external,[]);
 const noScript = await browser.newContext({javaScriptEnabled:false});
 const fallback = await noScript.newPage();
 for (const route of ['', 'tw/', 'cn/', 'en/', 'ja/']) {
  await fallback.goto('http://127.0.0.1:4186/' + route);
  assert.equal(await fallback.locator('h1').count(),1);
  assert.equal(await fallback.locator('a.destination[href^="https://"]').count(),3);
  assert.equal(await fallback.locator('.photo-open[href$=".webp"]').count(),2);
 }
 await noScript.close();
 const blockedStorage = await browser.newContext({locale:'ja-JP'});
 await blockedStorage.addInitScript(() => Object.defineProperty(window, 'localStorage', {get() { throw new Error('Storage blocked'); }}));
 const storagePage = await blockedStorage.newPage();
 await storagePage.goto('http://127.0.0.1:4186/');
 await storagePage.waitForURL('**/ja/');
 await blockedStorage.close();
 console.log('Browser verified: locale/reload/history/query/hash, mobile/desktop widths, translated photo dialog, clean footer and 404.');
} finally {await browser.close();}
