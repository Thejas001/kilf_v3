/** Guest auth API client. Calls go through the /backend rewrite (next.config.mjs). */
const base = '/backend/api/auth';
const KEY = 'kilf-auth';

export interface Guest {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}
interface Tokens {
  token: string;
  refreshToken: string;
}

export class AuthError extends Error {
  constructor(message: string, public status: number) {
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
  return j.guest;
}

export async function login(email: string, password: string): Promise<Guest> {
  const j = await call('/login', { body: { email, password } });
  setTokens({ token: j.token, refreshToken: j.refreshToken });
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
export async function me(): Promise<Guest | null> {
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
}

export async function changePassword(currentPassword: string, newPassword: string, confirmPassword: string) {
  await call('/change-password', { auth: true, body: { currentPassword, newPassword, confirmPassword } });
  setTokens(null); // refresh token is revoked server-side; session is stale
}

/** Returns the reset token outside production (no email sender yet), otherwise null. */
export async function forgotPassword(email: string): Promise<string | null> {
  const j = await call('/forgot-password', { body: { email } });
  return j.data?.resetToken ?? null;
}

export async function resetPassword(token: string, newPassword: string, confirmPassword: string) {
  await call('/reset-password', { body: { token, newPassword, confirmPassword } });
}

/** Mirrors the server rules so errors show before the round trip. */
export const validPassword = (p: string) => p.length >= 8 && p.length <= 72 && /[a-z]/.test(p) && /[A-Z]/.test(p) && /\d/.test(p);
export const PASSWORD_HINT = '8–72 characters with a lowercase letter, an uppercase letter and a digit.';
