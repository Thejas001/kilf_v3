const api = (process.env.NEXT_PUBLIC_API_URL || 'https://api.kilf.in').replace(/\/$/, '');

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  images: {
    // Dynamically-resolved assets (kilf-assets/, generated placeholders) are
    // served as plain files from public/ and rendered with <img>, not
    // next/image, so no remote/loader config is needed here.
  },
  // Proxy booking calls to the backend so the browser stays same-origin (no CORS).
  async rewrites() {
    return api ? [{ source: '/backend/:path*', destination: `${api}/:path*` }] : [];
  },
};

export default nextConfig;
