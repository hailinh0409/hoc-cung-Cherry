/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  async rewrites() { return [{ source: '/', destination: '/app.html' }]; },
  async headers() {
    return [
      { source: '/app.html', headers: [{ key: 'Cache-Control', value: 'no-cache' }] },
      { source: '/:path*', headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'same-origin' },
        { key: 'X-Frame-Options', value: 'DENY' },
      ] },
    ];
  },
};
