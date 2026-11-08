/**
 * Backend API base URL (no trailing slash). Set at build time from the git
 * branch by next.config.mjs (see api-url.mjs); do not hardcode it elsewhere.
 *
 * Browser code should call the same-origin `/backend/...` proxy (BACKEND_PROXY),
 * which next.config.mjs rewrites to this URL. Server code can use API_URL directly.
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

/** Same-origin path that next.config.mjs rewrites to API_URL. */
export const BACKEND_PROXY = '/backend';
