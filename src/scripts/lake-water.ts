/**
 * Brings the drawn lakes to life. For every [data-lake] picture with a
 * [data-water] canvas, a WebGL layer sits exactly over the artwork's <img>
 * and redraws it through a live water surface: drops fall now and then, the
 * pointer leaves a soft wake and a tap sends out a ring. Only the water moves
 * (the `mask` outline); the shore, the jetty and the book stay put.
 *
 * It starts when the picture first comes into view (after the page settles),
 * stops off screen and while "Pause motion" is on, and never starts for
 * reduced motion or without WebGL, leaving the still artwork. Plain script,
 * no framework: it is on the first screen of the home page. Decorative.
 */
import { Water, inside } from '@/components/motion/water';

type Pt = [number, number];
interface Options {
  /** The water's outline in the artwork's own coordinates (0–1). */
  mask: Pt[];
  /** How much wider a cell is than tall: above 1 flattens rings into wide ellipses. */
  squash?: number;
  /** CSS pixels per simulation cell, vertically. */
  cell?: number;
  /** Average seconds between drops. */
  rain?: number;
  /** The artwork's object-position (0–1), used when the image's CSS doesn't say. */
  focus?: [number, number];
  /** How far the water bends the picture. */
  strength?: number;
  interactive?: boolean;
}

const STEP = 1000 / 40;
/** Renderers that draw WebGL on the CPU: the effect would cost more than it gives. */
const SOFTWARE = /swiftshader|llvmpipe|softpipe|software|basic render/i;
/** `?water` in the address forces the water on, to preview it on such machines. */
const FORCE = new URLSearchParams(location.search).has('water');
/** Frames timed after the water appears; if the median is slower than this, it steps aside. */
const WATCH = 90;
const TOO_SLOW = 40;

const VERT = `attribute vec2 p;
varying vec2 v;
void main() {
  v = vec2(p.x * 0.5 + 0.5, 0.5 - p.y * 0.5);
  gl_Position = vec4(p, 0.0, 1.0);
}`;

const FRAG = `precision mediump float;
varying vec2 v;
uniform sampler2D img;
uniform sampler2D rip;
uniform vec2 scale;
uniform vec2 offset;
uniform vec2 bend;
void main() {
  vec4 r = texture2D(rip, v);
  vec2 d = (r.rg - 0.5) * 2.0;
  vec3 c = texture2D(img, (v + d * bend) * scale + offset).rgb;
  float s = (r.b - 0.5) * 2.0;
  c = c * (1.0 + s * 0.3) + vec3(0.96, 0.98, 1.0) * max(s, 0.0) * max(s, 0.0) * 1.6;
  gl_FragColor = vec4(c, 1.0);
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type);
  if (!s) throw new Error('shader');
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader');
  return s;
}

function texture(gl: WebGLRenderingContext, unit: number) {
  const t = gl.createTexture();
  if (!t) throw new Error('texture');
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return t;
}

function blur(a: Float32Array, w: number, h: number) {
  const b = new Float32Array(a.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      let n = 0;
      for (let j = -1; j <= 1; j++) {
        for (let i = -1; i <= 1; i++) {
          const px = x + i;
          const py = y + j;
          if (px < 0 || py < 0 || px >= w || py >= h) continue;
          sum += a[py * w + px];
          n++;
        }
      }
      b[y * w + x] = sum / n;
    }
  }
  a.set(b);
}

class Lake {
  private gl: WebGLRenderingContext | null = null;
  private uScale: WebGLUniformLocation | null = null;
  private uOffset: WebGLUniformLocation | null = null;
  private uBend: WebGLUniformLocation | null = null;
  private water: Water | null = null;
  private data: Uint8Array | null = null;
  private wet: Int32Array | null = null;
  private wetness: Float32Array | null = null;
  private dirty = true;
  private ready = false;
  private token = 0;
  private failed = false;
  private shown = false;
  private visible = false;
  private raf = 0;
  private last = 0;
  private acc = 0;
  private nextDrop = 0;
  private lastMove = 0;
  private iw = 0;
  private ih = 0;
  private times: number[] = [];
  private readonly o: Required<Options>;

  constructor(
    private root: HTMLElement,
    private img: HTMLImageElement,
    private cv: HTMLCanvasElement,
    options: Options,
  ) {
    this.o = { squash: 2.4, cell: 2.2, rain: 1.7, focus: [0.5, 0.5], strength: 1, interactive: true, ...options };
    new ResizeObserver(() => (this.dirty = true)).observe(root);
    new IntersectionObserver(
      ([e]) => {
        this.visible = e.isIntersecting;
        this.update();
      },
      { rootMargin: '120px 0px' },
    ).observe(root);
    window.addEventListener('kilf:motion', () => this.update());
    matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => this.update());
    img.addEventListener('load', () => {
      this.iw = img.naturalWidth;
      this.ih = img.naturalHeight;
      this.dirty = true;
    });
    cv.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      this.giveUp();
    });
    if (this.o.interactive) {
      root.addEventListener('pointermove', (e) => this.onMove(e), { passive: true });
      root.addEventListener('pointerdown', (e) => this.touch(e, 4, 12), { passive: true });
    }
  }

  private get allowed() {
    return !this.failed && this.root.isConnected && this.visible && document.documentElement.dataset.motion !== 'paused' && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  private update() {
    if (this.allowed) this.start();
    else this.stop();
    if (matchMedia('(prefers-reduced-motion: reduce)').matches && this.shown) {
      this.cv.style.opacity = '0';
      this.shown = false;
    }
  }

  private setup() {
    const gl = this.cv.getContext('webgl', { antialias: false, depth: false, stencil: false, powerPreference: 'low-power' });
    if (!gl) return false;
    // No real graphics chip (a virtual machine, a blocked driver): keep the still picture.
    let renderer = String(gl.getParameter(gl.RENDERER) ?? '');
    if (/webkit webgl/i.test(renderer)) {
      const info = gl.getExtension('WEBGL_debug_renderer_info');
      if (info) renderer = String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL) ?? '');
    }
    if (SOFTWARE.test(renderer) && !FORCE) return false;
    try {
      const prog = gl.createProgram();
      if (!prog) return false;
      gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const at = gl.getAttribLocation(prog, 'p');
      gl.enableVertexAttribArray(at);
      gl.vertexAttribPointer(at, 2, gl.FLOAT, false, 0, 0);
      texture(gl, 0);
      texture(gl, 1);
      gl.uniform1i(gl.getUniformLocation(prog, 'img'), 0);
      gl.uniform1i(gl.getUniformLocation(prog, 'rip'), 1);
      this.uScale = gl.getUniformLocation(prog, 'scale');
      this.uOffset = gl.getUniformLocation(prog, 'offset');
      this.uBend = gl.getUniformLocation(prog, 'bend');
      this.iw = this.img.naturalWidth;
      this.ih = this.img.naturalHeight;
      this.gl = gl;
      return true;
    } catch {
      return false;
    }
  }

  /** Fit the canvas, the picture and the simulation to the frame. */
  private layout() {
    const gl = this.gl!;
    const { cv, img, o } = this;
    const { width: fw, height: fh } = this.root.getBoundingClientRect();
    if (!fw || !fh || !this.iw || !this.ih) return false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(fw * dpr);
    cv.height = Math.round(fh * dpr);
    gl.viewport(0, 0, cv.width, cv.height);

    // Same crop as object-fit: cover, at the image's own object-position.
    const pos = getComputedStyle(img).objectPosition.split(' ').map((v) => (v.endsWith('%') ? parseFloat(v) / 100 : NaN));
    const fx = Number.isFinite(pos[0]) ? pos[0] : o.focus[0];
    const fy = Number.isFinite(pos[1]) ? pos[1] : o.focus[1];
    const k = Math.max(fw / this.iw, fh / this.ih);
    const sx = fw / (this.iw * k);
    const sy = fh / (this.ih * k);
    const ox = (1 - sx) * fx;
    const oy = (1 - sy) * fy;

    // The picture, decoded off the main thread and sized so its visible part
    // matches the canvas (a full-size upload is costly on phones). The whole
    // picture is resized rather than cropped: with srcset, naturalWidth is in
    // CSS pixels, not the source's own, so crop coordinates would be ambiguous.
    this.ready = false;
    const token = ++this.token;
    const upload = (src: TexImageSource) => {
      if (token !== this.token || !this.gl) return;
      gl.activeTexture(gl.TEXTURE0);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, src);
      gl.uniform2f(this.uScale, sx, sy);
      gl.uniform2f(this.uOffset, ox, oy);
      this.ready = true;
    };
    if (typeof createImageBitmap === 'function') {
      const max = Math.min(3072, gl.getParameter(gl.MAX_TEXTURE_SIZE) as number);
      const rw = Math.min(max, Math.round(cv.width / sx));
      const rh = Math.min(max, Math.round((rw * this.ih) / this.iw));
      createImageBitmap(img, { resizeWidth: rw, resizeHeight: rh, resizeQuality: 'high' })
        .then((bitmap) => {
          upload(bitmap);
          bitmap.close();
        })
        .catch(() => upload(img));
    } else {
      upload(img);
    }
    const amount = 0.0085 * o.strength;
    gl.uniform2f(this.uBend, amount, (amount * fw) / fh);

    // Simulation grid, and where the water is on it.
    const w = Math.max(24, Math.min(240, Math.round(fw / (o.cell * o.squash))));
    const h = Math.max(40, Math.min(360, Math.round(fh / o.cell)));
    const wetness = new Float32Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        wetness[y * w + x] = inside(((x + 0.5) / w) * sx + ox, ((y + 0.5) / h) * sy + oy, o.mask) ? 1 : 0;
      }
    }
    blur(wetness, w, h);
    blur(wetness, w, h);
    const water = new Water(w, h, wetness);
    const wet: number[] = [];
    wetness.forEach((v, i) => v > 0.9 && wet.push(i));
    // A few settled rings, so the first frame already looks like water.
    for (let n = 0; n < 3 && wet.length; n++) {
      const i = wet[Math.floor(Math.random() * wet.length)];
      water.drop((i % w) / (w - 1), Math.floor(i / w) / (h - 1), 3, 7);
    }
    for (let n = 0; n < 30; n++) water.step();
    const data = new Uint8Array(w * h * 4);
    water.encode(data);
    gl.activeTexture(gl.TEXTURE1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    Object.assign(this, { water, data, wet: Int32Array.from(wet), wetness, dirty: false });
    return true;
  }

  private draw() {
    const { gl, water, data } = this;
    if (!gl || !water || !data || !this.ready) return false;
    water.encode(data);
    gl.activeTexture(gl.TEXTURE1);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, water.w, water.h, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    return true;
  }

  private start() {
    if (this.raf) return;
    if (!this.img.complete || !this.img.naturalWidth) {
      this.img.addEventListener('load', () => this.update(), { once: true });
      return;
    }
    if (!this.gl && !this.setup()) {
      this.failed = true;
      return;
    }
    this.last = performance.now();
    this.acc = 0;
    this.nextDrop = this.last + 500;
    const loop = (now: number) => {
      this.raf = requestAnimationFrame(loop);
      if (this.dirty && !this.layout()) return;
      // If this device can't keep the water smooth, it steps aside for the still picture.
      if (this.shown && this.times.length < WATCH) {
        this.times.push(now - this.last);
        if (this.times.length === WATCH && !FORCE) {
          const t = this.times.slice(20).sort((a, b) => a - b);
          if (t[t.length >> 1] > TOO_SLOW) return this.giveUp();
        }
      }
      this.acc += Math.min(now - this.last, 100);
      this.last = now;
      const { water, wet } = this;
      if (water && wet?.length && now > this.nextDrop) {
        const i = wet[Math.floor(Math.random() * wet.length)];
        const big = Math.random() < 0.2;
        water.drop((i % water.w) / (water.w - 1), Math.floor(i / water.w) / (water.h - 1), big ? 4 : 2, big ? 9 : 3 + Math.random() * 3);
        this.nextDrop = now + this.o.rain * 1000 * (0.5 + Math.random());
      }
      let n = 0;
      while (water && this.acc >= STEP && n < 3) {
        water.step();
        this.acc -= STEP;
        n++;
      }
      // The canvas fades in (a CSS transition on it) once it has a frame.
      if (n && this.draw() && !this.shown) {
        this.shown = true;
        this.cv.style.opacity = '1';
      }
    };
    this.raf = requestAnimationFrame(loop);
  }

  private stop() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  private giveUp() {
    this.failed = true;
    this.stop();
    this.cv.style.opacity = '0';
  }

  /** A soft wake while the pointer moves over the water, a ring on tap. */
  private onMove(e: PointerEvent) {
    const now = performance.now();
    if (e.pointerType === 'touch' || now - this.lastMove < 40) return;
    this.lastMove = now;
    this.touch(e, 2, 2.6);
  }

  private touch(e: PointerEvent, radius: number, strength: number) {
    const { water, wetness } = this;
    if (!this.raf || !water || !wetness) return;
    const r = this.root.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const cx = Math.min(water.w - 1, Math.max(0, Math.round(x * (water.w - 1))));
    const cy = Math.min(water.h - 1, Math.max(0, Math.round(y * (water.h - 1))));
    if (wetness[cy * water.w + cx] < 0.5) return;
    water.drop(x, y, radius, strength);
  }
}

export function boot() {
  document.querySelectorAll<HTMLElement>('[data-lake]').forEach((root) => {
    const img = root.querySelector('img');
    const cv = root.querySelector<HTMLCanvasElement>('canvas[data-water]');
    if (!img || !cv || root.dataset.lakeReady) return;
    root.dataset.lakeReady = '';
    new Lake(root, img, cv, JSON.parse(cv.dataset.water || '{}'));
  });
}
