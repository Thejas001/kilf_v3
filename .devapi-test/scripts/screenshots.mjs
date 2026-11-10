// Screenshots of key pages at mobile and desktop widths.
// Usage: npm run build && npm run screenshots   (serves dist/ on :4399)
// Set CHROMIUM_PATH if Chromium is not at the default Playwright location.
import { chromium } from 'playwright-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const dist = path.join(root, 'dist');
const outDir = process.env.OUT_DIR || path.join(root, 'screenshots');
fs.mkdirSync(outDir, { recursive: true });

const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = path.join(dist, p);
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) file = path.join(dist, '404.html');
  res.writeHead(fs.existsSync(file) && !file.endsWith('404.html') ? 200 : 404, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(4399, r));

const pages = (process.env.PAGES || '/,/speakers,/programme,/partners').split(',');
const widths = (process.env.WIDTHS || '390,1440').split(',').map(Number);
const executablePath =
  process.env.CHROMIUM_PATH ||
  ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium'].find((p) => fs.existsSync(p) && fs.statSync(p).isFile());
const browser = await chromium.launch({ executablePath });
for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w < 768 ? 844 : 900 }, deviceScaleFactor: 1, reducedMotion: process.env.MOTION ? 'no-preference' : 'reduce' });
  const page = await ctx.newPage();
  for (const p of pages) {
    await page.goto(`http://localhost:4399${p}`, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      document.querySelectorAll('[data-reveal]').forEach((e) => e.classList.add('is-in'));
      document.querySelectorAll('img[loading=lazy]').forEach((i) => (i.loading = 'eager'));
      // Scroll at reading pace so scroll-triggered reveals have time to play.
      const slow = document.documentElement.classList.contains('js');
      for (let y = 0; y < document.body.scrollHeight; y += slow ? 260 : 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, slow ? 110 : 40)); }
      if (slow) await new Promise((r) => setTimeout(r, 1400));
      window.scrollTo(0, 0);
      await Promise.all([...document.images].map((i) => i.complete || new Promise((r) => { i.onload = i.onerror = r; })));
    });
    await page.waitForTimeout(300);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 0) console.warn(`⚠ horizontal overflow ${overflow}px on ${p} @${w}`);
    const name = (p === '/' ? 'home' : p.replace(/^\/|\/$/g, '').replace(/\//g, '-')) + `-${w < 768 ? 'mobile' : w < 1280 ? 'tablet' : 'desktop'}-${w}.png`;
    await page.screenshot({ path: path.join(outDir, name), fullPage: true });
    console.log('✓', name);
  }
  await ctx.close();
}
await browser.close();
server.close();
