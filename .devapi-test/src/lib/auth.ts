/** Guest auth API client. Calls go through the /backend rewrite (next.config.mjs). */
import { BACKEND_PROXY } from './api';

const base = `${BACKEND_PROXY}/api/auth`;
const KEY = 'kilf-auth';

export interface Guest {
  id: string;
  name: string;
  email: string;
  /** Not every backend version returns it. */
  phone?: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}
interface Tokens {
  token: string;
  refreshToken: string;
}

export class AuthError extends Error {
  constructor(message: string, public status: number, public fieldErrors: { path: string; message: string }[] = []) {
    super(message);
  }
}

export const getTokens = (): Tokens | null => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || 'null');
  } catch {
    return null;
  }
};
const setTokens = (t: Tokens | null) => {
  try {
    if (t) localStorage.setItem(KEY, JSON.stringify(t));
    else localStorage.removeItem(KEY);
  } catch {}
};

/* ---------- Shared session state: one source of truth for header, booking and profile ---------- */

let current: Guest | null | undefined; // undefined = not checked yet
const listeners = new Set<(g: Guest | null) => void>();
let pending: Promise<Guest | null> | null = null;

function publish(g: Guest | null) {
  current = g;
  listeners.forEach((l) => l(g));
}
/** Last known guest: undefined until the first check has finished. */
export const currentGuest = () => current;
export function subscribe(fn: (g: Guest | null) => void) {
  listeners.add(fn);
  return () => void listeners.delete(fn);
}
/** Checks the stored session once per page load (deduplicated across callers). */
export function loadSession(force = false): Promise<Guest | null> {
  if (!force && current !== undefined) return Promise.resolve(current);
  if (!pending || force) {
    pending = me()
      .then((g) => {
        publish(g);
        return g;
      })
      .finally(() => {
        pending = null;
      });
  }
  return pending;
}

export type AuthView = 'login' | 'register';
export interface AuthRequest {
  view?: AuthView;
  /** Shown above the form, e.g. why the popup opened. */
  reason?: string;
}

/**
 * Opens the login popup (AuthDialog listens for `kilf:auth`) and resolves with the
 * guest once they sign in or register, or null if they close it. Resolves at once
 * when already signed in, so callers can simply `await requireLogin()`.
 */
export async function requireLogin(reason?: string): Promise<Guest | null> {
  const g = await loadSession();
  if (g) return g;
  return new Promise((resolve) => {
    const done = (e: Event) => {
      window.removeEventListener('kilf:auth-result', done);
      resolve((e as CustomEvent<Guest | null>).detail ?? null);
    };
    window.addEventListener('kilf:auth-result', done);
    window.dispatchEvent(new CustomEvent<AuthRequest>('kilf:auth', { detail: { view: 'login', reason } }));
  });
}
export const openLogin = (view: AuthView = 'login') => window.dispatchEvent(new CustomEvent<AuthRequest>('kilf:auth', { detail: { view } }));

async function call(path: string, opts: { body?: unknown; auth?: boolean } = {}) {
  const headers: Record<string, string> = {};
  if (opts.body) headers['Content-Type'] = 'application/json';
  if (opts.auth) {
    const t = getTokens();
    if (t) headers.Authorization = `Bearer ${t.token}`;
  }
  let res: Response;
  try {
    res = await fetch(`${base}${path}`, { method: path === '/me' ? 'GET' : 'POST', headers, body: opts.body ? JSON.stringify(opts.body) : undefined });
  } catch {
    throw new AuthError('Could not reach the server. Check your connection and try again.', 0);
  }
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) throw new AuthError(json?.message || 'Something went wrong. Please try again.', res.status);
  return json;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export async function register(input: RegisterInput): Promise<Guest> {
  const j = await call('/register', { body: input });
  setTokens({ token: j.token, refreshToken: j.refreshToken });
  publish(j.guest);
  return j.guest;
}

export async function login(email: string, password: string): Promise<Guest> {
  const j = await call('/login', { body: { email, password } });
  setTokens({ token: j.token, refreshToken: j.refreshToken });
  publish(j.guest);
  return j.guest;
}

/** The old refresh token dies on use, so the new pair is stored immediately. */
async function refresh(): Promise<boolean> {
  const t = getTokens();
  if (!t) return false;
  try {
    const j = await call('/refresh', { body: { refreshToken: t.refreshToken } });
    setTokens(j.data);
    return true;
  } catch {
    setTokens(null);
    return false;
  }
}

/** Current guest from a stored session, refreshing once if the access token expired. Null if signed out. */
async function me(): Promise<Guest | null> {
  if (!getTokens()) return null;
  try {
    return (await call('/me', { auth: true })).data;
  } catch (e) {
    if (e instanceof AuthError && e.status === 401 && (await refresh())) {
      try {
        return (await call('/me', { auth: true })).data;
      } catch {}
    }
    return null;
  }
}

export async function logout() {
  try {
    await call('/logout', { auth: true });
  } catch {}
  setTokens(null);
  publish(null);
}

/** The backend revokes the refresh token, so the guest has to sign in again afterwards. */
export async function changePassword(currentPassword: string, newPassword: string, confirmPassword: string) {
  await call('/change-password', { auth: true, body: { currentPassword, newPassword, confirmPassword } });
  setTokens(null);
  publish(null);
}

/** Returns the reset token outside production (no email sender yet), otherwise null. */
export async function forgotPassword(email: string): Promise<string | null> {
  const j = await call('/forgot-password', { body: { email } });
  return j.data?.resetToken ?? null;
}

export async function resetPassword(token: string, newPassword: string, confirmPassword: string) {
  await call('/reset-password', { body: { token, newPassword, confirmPassword } });
}

/**
 * Authenticated request to any backend path (via the /backend proxy). Sends the
 * access token, refreshes it once on a 401, and marks the guest signed out if that fails.
 * The backend identifies the guest from the token, never from anything we send.
 */
export async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const send = () => {
    const t = getTokens();
    const headers = new Headers(init.headers);
    if (t) headers.set('Authorization', `Bearer ${t.token}`);
    if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    return fetch(`${BACKEND_PROXY}${path}`, { ...init, headers });
  };
  let res = await send();
  if (res.status === 401 && getTokens()) {
    if (await refresh()) res = await send();
    else publish(null);
  }
  return res;
}

/** Updates the signed-in guest's own profile (PATCH /api/auth/me). */
export async function updateProfile(input: { name: string; phone?: string | null }): Promise<Guest> {
  let res: Response;
  try {
    res = await authFetch('/api/auth/me', { method: 'PATCH', body: JSON.stringify(input) });
  } catch {
    throw new AuthError('Could not reach the server. Check your connection and try again.', 0);
  }
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    if (res.status === 404) throw new AuthError('Profile editing isn’t available yet. Please try again later.', 404);
    const errs = Array.isArray(json?.errors) ? json.errors.filter((e: { message?: unknown }) => typeof e?.message === 'string') : [];
    throw new AuthError(json?.message || 'Could not save your profile.', res.status, errs.map((e: { path?: unknown; message: string }) => ({ path: String(e.path ?? ''), message: e.message })));
  }
  const g = json.data as Guest;
  publish(g);
  return g;
}

/** Mirrors the server rules so errors show before the round trip. */
export const validPassword = (p: string) => p.length >= 8 && p.length <= 72 && /[a-z]/.test(p) && /[A-Z]/.test(p) && /\d/.test(p);
export const PASSWORD_HINT = '8–72 characters with a lowercase letter, an uppercase letter and a digit.';
