import { resolveApiUrl } from './api-url.mjs';

// Decided from the git branch at build time; see api-url.mjs.
const api = resolveApiUrl();

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  // Inlined into server and client bundles; read it via src/lib/api.ts.
  env: { NEXT_PUBLIC_API_URL: api },
  images: {
    // Dynamically-resolved assets (kilf-assets/, generated placeholders) are
    // served as plain files from public/ and rendered with <img>, not
    // next/image, so no remote/loader config is needed here.
  },
  // Proxy booking calls to the backend so the browser stays same-origin (no CORS).
  async rewrites() {
    return [{ source: '/backend/:path*', destination: `${api}/:path*` }];
  },
};

export default nextConfig;
