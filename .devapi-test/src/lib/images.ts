import fs from 'node:fs';
import path from 'node:path';

// Real artwork dropped into public/kilf-assets/ always wins…
const realDir = path.join(process.cwd(), 'public/kilf-assets');
// …otherwise we fall back to the generated stand-ins (scripts/prepare-assets.mjs).
const generatedDir = path.join(process.cwd(), 'public/generated');

const stem = (p: string) => p.replace(/\.[a-z0-9]+$/i, '');

function findInDir(dir: string, rel: string): string | undefined {
  const wanted = stem(rel).toLowerCase();
  const sub = path.dirname(rel);
  const searchDir = sub === '.' ? dir : path.join(dir, sub);
  let files: string[];
  try {
    files = fs.readdirSync(searchDir);
  } catch {
    return undefined;
  }
  const match = files.find((f) => stem(f).toLowerCase() === stem(path.basename(wanted)));
  return match ? path.join(sub === '.' ? '' : sub, match) : undefined;
}

/**
 * Resolve an asset by its path inside kilf-assets/, e.g.
 * `asset('illustrations/cover.jpg')` or `asset('speakers/blessy.jpg')`.
 * Returns a public URL (for a plain <img src>), not optimized image metadata.
 */
export function asset(rel: string): { src: string; placeholder: boolean } {
  const r = findInDir(realDir, rel);
  if (r) return { src: `/kilf-assets/${r.split(path.sep).join('/')}`, placeholder: false };
  const g = findInDir(generatedDir, rel);
  if (g) return { src: `/generated/${g.split(path.sep).join('/')}`, placeholder: true };
  const fallback = findInDir(generatedDir, 'illustrations/lake-band.jpg');
  if (!fallback) throw new Error(`Missing asset ${rel}. Run npm run assets.`);
  return { src: `/generated/${fallback.split(path.sep).join('/')}`, placeholder: true };
}

/** Optional logo file (kilf-assets/logos/kilf-logo.svg|png). */
export function logoUrl(name: string): string | undefined {
  const dir = path.join(realDir, 'logos');
  let files: string[];
  try {
    files = fs.readdirSync(dir);
  } catch {
    return undefined;
  }
  const match = files.find((f) => stem(f) === name);
  return match ? `/kilf-assets/logos/${match}` : undefined;
}
