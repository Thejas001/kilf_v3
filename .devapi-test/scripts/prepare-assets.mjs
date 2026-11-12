// Runs before `next dev` and `next build`.
// 1. Rasterises the stand-in illustrations in src/placeholders/*.svg, so
//    there's always something to show before the real artwork lands in
//    public/kilf-assets/. Real files in public/kilf-assets/ always win.
// 2. Makes a blue duotone initials placeholder for any speaker whose photo
//    is missing from public/kilf-assets/speakers/.
// 3. Builds the 1200×630 Open Graph share image from the cover illustration.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const out = path.join(root, 'public/generated');
const assetsDir = path.join(root, 'public/kilf-assets');
const exists = (p) => fs.access(p).then(() => true, () => false);

async function findReal(dir, stem) {
  for (const ext of ['jpg', 'jpeg', 'png', 'webp', 'avif']) {
    const p = path.join(assetsDir, dir, `${stem}.${ext}`);
    if (await exists(p)) return p;
  }
  return null;
}

await fs.mkdir(path.join(out, 'illustrations'), { recursive: true });
await fs.mkdir(path.join(out, 'speakers'), { recursive: true });

// 1. Illustrations
const phDir = path.join(root, 'src/placeholders');
for (const file of await fs.readdir(phDir)) {
  if (!file.endsWith('.svg')) continue;
  const stem = file.replace(/\.svg$/, '');
  const target = path.join(out, 'illustrations', `${stem}.jpg`);
  const srcStat = await fs.stat(path.join(phDir, file));
  const outStat = await fs.stat(target).catch(() => null);
  if (outStat && outStat.mtimeMs >= srcStat.mtimeMs) continue;
  await sharp(path.join(phDir, file), { density: 144 })
    .resize({ width: 1600 })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(target);
}

// 2. Speaker placeholders
const speakersDir = path.join(root, 'src/content/speakers');
for (const file of await fs.readdir(speakersDir)) {
  if (!file.endsWith('.md')) continue;
  const src = await fs.readFile(path.join(speakersDir, file), 'utf8');
  const name = src.match(/^name:\s*"?(.+?)"?\s*$/m)?.[1] ?? file;
  const photo = src.match(/^photo:\s*"?(.+?)"?\s*$/m)?.[1] ?? `${file}.jpg`;
  const stem = photo.replace(/\.[a-z]+$/i, '');
  const target = path.join(out, 'speakers', `${stem}.jpg`);
  const mdStat = await fs.stat(path.join(speakersDir, file));
  const tStat = await fs.stat(target).catch(() => null);
  if (tStat && tStat.mtimeMs >= Math.max(mdStat.mtimeMs, (await fs.stat(new URL(import.meta.url))).mtimeMs)) continue;
  const initials = name
    .replace(/\./g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 || /[A-Z]/.test(w))
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0].toUpperCase())
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2448ED"/><stop offset="1" stop-color="#0F1C74"/></linearGradient></defs>
    <rect width="600" height="600" fill="url(#g)"/>
    <circle cx="300" cy="300" r="210" fill="none" stroke="#B8C3F0" stroke-opacity=".25" stroke-width="2"/>
    <path d="M60 470c40-14 80-14 120 0s80 14 120 0 80-14 120 0 80 14 120 0" fill="none" stroke="#F47A5E" stroke-width="6" stroke-linecap="round" opacity=".9"/>
    <text x="300" y="345" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="150" fill="#E4ECF9" letter-spacing="-4">${initials}</text>
  </svg>`;
  await sharp(Buffer.from(svg)).jpeg({ quality: 85 }).toFile(target);
}

// 3. Open Graph image (1200×630): the hero in miniature, a blue panel with
//    the title beside the lake illustration (or the real cover, if supplied).
const cover = (await findReal('illustrations', 'cover')) ?? path.join(root, 'src/assets/art/lake-hero.jpg');
const art = await sharp(cover).resize(640, 630, { fit: 'cover', position: 'right' }).toBuffer();
const panel = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="560" height="630">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FF9A82"/><stop offset=".45" stop-color="#FFC3A0"/><stop offset="1" stop-color="#E7EF92"/></linearGradient></defs>
  <rect width="560" height="630" fill="#2447ED"/>
  <text font-family="sans-serif" font-weight="700" font-size="16" letter-spacing="3" fill="#FFFFFF"><tspan x="56" y="92">KOLLAM INTERNATIONAL</tspan><tspan x="56" y="116">LITERATURE FESTIVAL</tspan></text>
  <text x="56" y="178" font-family="sans-serif" font-weight="600" font-size="22" fill="#FFFFFF" fill-opacity=".85">The first chapter · 2027</text>
  <text font-family="sans-serif" font-weight="700" font-size="62" letter-spacing="-2" fill="#FFFFFF">
    <tspan x="52" y="262">Where words</tspan><tspan x="52" y="330">meet the</tspan><tspan x="52" y="398" fill="url(#g)">world.</tspan>
  </text>
  <line x1="56" y1="458" x2="504" y2="458" stroke="#FFFFFF" stroke-opacity=".25"/>
  <text x="56" y="500" font-family="sans-serif" font-weight="700" font-size="17" letter-spacing="2.4" fill="#FFFFFF">31 DEC 2026 – 4 JAN 2027</text>
  <text x="56" y="534" font-family="sans-serif" font-weight="500" font-size="21" fill="#FFFFFF" fill-opacity=".85">Ashtamudi Lake · Kollam, Kerala</text>
</svg>`);
await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#2447ED' } })
  .composite([
    { input: art, left: 560, top: 0 },
    { input: panel, left: 0, top: 0 },
  ])
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(path.join(root, 'public/og-image.jpg'));

console.log('[prepare-assets] placeholders and og-image ready');

// 4. Apple touch icon from the favicon
const touch = path.join(root, 'public/apple-touch-icon.png');
if (!(await exists(touch))) {
  await sharp(path.join(root, 'public/favicon.svg'), { density: 300 }).resize(180, 180).png().toFile(touch);
}
