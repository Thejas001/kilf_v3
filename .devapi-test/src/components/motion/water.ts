/**
 * A small height-field water simulation (the classic two-buffer ripple).
 * It runs on a coarse grid; `encode` turns the surface into a tiny texture
 * of slopes and light that a shader uses to bend and brighten the artwork
 * underneath, so the drawn lake moves like water.
 *
 * Cells can be wider than they are tall (`squash` in src/scripts/lake-water.ts), which
 * flattens the rings into ellipses, as water looks when seen from the shore.
 */

export class Water {
  readonly w: number;
  readonly h: number;
  private cur: Float32Array;
  private prev: Float32Array;
  /** Per-cell damping: waves fade near the frame and die out against the shore. */
  private damp: Float32Array;
  damping = 0.988;

  constructor(w: number, h: number, private mask: Float32Array) {
    this.w = w;
    this.h = h;
    this.cur = new Float32Array(w * h);
    this.prev = new Float32Array(w * h);
    this.damp = new Float32Array(w * h);
    const band = Math.max(3, Math.round(Math.min(w, h) * 0.08));
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        const d = Math.min(x, y, w - 1 - x, h - 1 - y);
        const edge = d >= band ? 1 : 0.8 + 0.2 * (d / band);
        this.damp[i] = edge * Math.min(1, 0.35 + mask[i]);
      }
    }
  }

  /** Disturb the surface. x and y are 0–1; radius is in cells. */
  drop(x: number, y: number, radius: number, strength: number) {
    const cx = Math.round(x * (this.w - 1));
    const cy = Math.round(y * (this.h - 1));
    const r = Math.max(1, radius);
    for (let j = -r; j <= r; j++) {
      for (let i = -r; i <= r; i++) {
        const px = cx + i;
        const py = cy + j;
        if (px < 1 || py < 1 || px >= this.w - 1 || py >= this.h - 1) continue;
        const d = Math.sqrt(i * i + j * j) / r;
        if (d <= 1) this.cur[py * this.w + px] += strength * (0.5 + 0.5 * Math.cos(Math.PI * d));
      }
    }
  }

  step() {
    const { w, h, cur, prev, damp, damping } = this;
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        const v = (cur[i - 1] + cur[i + 1] + cur[i - w] + cur[i + w]) * 0.5 - prev[i];
        prev[i] = v * damping * damp[i];
      }
    }
    this.cur = prev;
    this.prev = cur;
  }

  /**
   * RGBA per cell: R and G carry the slope (how far to bend the artwork),
   * B the light on the surface (above 128 brightens, below darkens).
   * Everything is scaled by the water mask, so dry land never moves.
   */
  encode(out: Uint8Array, bend = 34, light = 1) {
    const { w, h, cur, mask } = this;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        const m = mask[i];
        const o = i * 4;
        if (m < 0.004) {
          out[o] = 128;
          out[o + 1] = 128;
          out[o + 2] = 128;
          out[o + 3] = 255;
          continue;
        }
        const l = x > 0 ? cur[i - 1] : cur[i];
        const r = x < w - 1 ? cur[i + 1] : cur[i];
        const u = y > 0 ? cur[i - w] : cur[i];
        const d = y < h - 1 ? cur[i + w] : cur[i];
        const dx = (r - l) * m;
        const dy = (d - u) * m;
        // Light falls from the top right: slopes facing it brighten.
        const s = ((u - d) + (r - l) * 0.55) * 0.07 * light * m;
        out[o] = clamp(128 + dx * bend);
        out[o + 1] = clamp(128 + dy * bend);
        out[o + 2] = clamp(128 + s * 150);
        out[o + 3] = 255;
      }
    }
  }
}

const clamp = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v);

/** Is the point inside the polygon? (even–odd rule, coordinates 0–1) */
export function inside(px: number, py: number, poly: readonly (readonly [number, number])[]) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}
