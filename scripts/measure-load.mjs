import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Serve an immutable build snapshot; both versions use identical HTTP and CDP settings.
const [directory, label = 'sample', rounds = '3'] = process.argv.slice(2);
if (!directory) throw new Error('Usage: node scripts/measure-load.mjs <build-directory> <label> [rounds]');
const root = path.resolve(directory);
const output = path.resolve('performance-results');
await mkdir(output, { recursive: true });
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.woff2': 'font/woff2', '.png': 'image/png' };
const server = createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const file = path.resolve(root, '.' + pathname + (pathname.endsWith('/') ? 'index.html' : ''));
  if (!file.startsWith(root + path.sep)) { res.writeHead(404).end(); return; }
  try { res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); res.end(await readFile(file)); }
  catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || undefined });
const samples = [];
try {
  for (let round = 1; round <= Number(rounds); round++) {
    for (const scenario of [
      { name: 'mobile-root-tw', route: '/', locale: 'zh-TW', width: 390, height: 844 },
      { name: 'mobile-direct-tw', route: '/tw/', locale: 'zh-TW', width: 390, height: 844 },
      { name: 'desktop-root-en', route: '/', locale: 'en-US', width: 1280, height: 900 },
      { name: 'desktop-direct-en', route: '/en/', locale: 'en-US', width: 1280, height: 900 },
    ]) {
      const context = await browser.newContext({ locale: scenario.locale, viewport: { width: scenario.width, height: scenario.height }, serviceWorkers: 'block' });
      const page = await context.newPage();
      const cdp = await context.newCDPSession(page);
      await cdp.send('Network.enable');
      await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
      await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1_600_000 / 8, uploadThroughput: 750_000 / 8 });
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      let start;
      const requests = [], finished = [], failures = [];
      cdp.on('Network.requestWillBeSent', event => {
        if (start === undefined && event.type === 'Document') start = event.wallTime * 1000;
        requests.push({ id: event.requestId, type: event.type, url: event.request.url });
      });
      cdp.on('Network.loadingFinished', event => finished.push({ id: event.requestId, bytes: event.encodedDataLength }));
      cdp.on('Network.loadingFailed', event => failures.push({ id: event.requestId, error: event.errorText, canceled: event.canceled || false }));
      await page.addInitScript(() => {
        window.loadMetrics = {};
        new PerformanceObserver(list => {
          const last = list.getEntries().at(-1);
          window.loadMetrics.lcp = last.startTime;
          window.loadMetrics.element = last.element?.outerHTML.slice(0, 240);
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      });
      await page.goto(origin + scenario.route, { waitUntil: 'commit' });
      await page.waitForURL(`**/${scenario.locale === 'zh-TW' ? 'tw' : 'en'}/`, { waitUntil: 'load' });
      const metrics = await page.evaluate(async () => {
        await document.fonts.ready;
        return { timeOrigin: performance.timeOrigin, fontReady: performance.now(), fontFaces: [...document.fonts].filter(f => f.status === 'loaded').length };
      });
      await page.waitForTimeout(750);
      Object.assign(metrics, await page.evaluate(() => ({ ...window.loadMetrics, fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime })));
      const offset = metrics.timeOrigin - start;
      const sample = { scenario: scenario.name, round, fcp: Math.round(offset + metrics.fcp), lcp: Math.round(offset + metrics.lcp), fontReady: Math.round(offset + metrics.fontReady), redirectOverhead: Math.round(offset), requests: requests.length, bytes: finished.reduce((sum, r) => sum + r.bytes, 0), element: metrics.element, failures, resources: requests.map(r => ({ ...r, bytes: finished.find(f => f.id === r.id)?.bytes || 0 })) };
      samples.push(sample);
      console.log(JSON.stringify({ ...sample, resources: undefined, element: undefined }));
      if (round === 1) await page.screenshot({ path: path.join(output, `${label}-${scenario.name}.png`), fullPage: true });
      await context.close();
    }
  }
  await writeFile(path.join(output, `${label}.json`), JSON.stringify({ browser: browser.version(), settings: { latencyMs: 150, downloadMbps: 1.6, cpuSlowdown: 4, cache: 'disabled', rounds: Number(rounds) }, samples }, null, 2));
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
