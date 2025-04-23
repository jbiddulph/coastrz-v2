/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tjsnzjiouvtzgheyyiac.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    outputFileTracingRoot: process.env.NODE_ENV === 'production' ? '/app' : undefined,
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-linux-x64-gnu',
        'node_modules/@swc/core-linux-x64-musl',
        'node_modules/@esbuild/linux-x64',
      ],
    },
  },
}

module.exports = nextConfig