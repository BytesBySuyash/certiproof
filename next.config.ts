import type { NextConfig } from 'next';
const config: NextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ['@prisma/client', '@pdf-lib/fontkit'],
  outputFileTracingIncludes: {'/api/**/*': ['./public/fonts/**/*']},
  async headers() { return [{source: '/:path*', headers: [
    {key:'X-Content-Type-Options',value:'nosniff'}, {key:'Referrer-Policy',value:'no-referrer'},
    {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'},
    {key:'Content-Security-Policy',value:"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self'; worker-src 'self' blob:; connect-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"},
    ...(process.env.VERCEL ? [{key:'Strict-Transport-Security',value:'max-age=31536000'}] : [])
  ]}]; }
};
export default config;
