// Single source of truth for the backend API base URL, decided at BUILD time.
//
// - Branch `develop` -> https://dev.api.kilf.in (dev site: https://dev.kilf.in)
// - Branch `main`    -> https://api.kilf.in     (prod site: https://www.kilf.in)
// - Any other branch, or local dev -> NEXT_PUBLIC_API_URL from .env, else https://api.kilf.in
//
// For `develop`/`main` the branch wins over NEXT_PUBLIC_API_URL, so a wrong
// Vercel env var can never point the dev site at the prod API (or vice versa).
// The branch comes from VERCEL_GIT_COMMIT_REF (Vercel) or GITHUB_REF_NAME (GitHub Actions).

export const BRANCH_API_URLS = {
  develop: 'https://dev.api.kilf.in',
  main: 'https://api.kilf.in',
};

export const DEFAULT_API_URL = 'https://api.kilf.in';

export function resolveApiUrl(env = process.env) {
  const branch = env.VERCEL_GIT_COMMIT_REF || env.GITHUB_REF_NAME || '';
  const url = BRANCH_API_URLS[branch] || env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
  return url.replace(/\/+$/, '');
}
