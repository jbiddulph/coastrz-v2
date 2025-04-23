/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: undefined,
    outputFileTracingIncludes: {
      '**/*': [
        'node_modules/**/*.{js,json,node}',
        '.next/standalone/**/*',
        '.next/static/**/*',
      ],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tjsnzjiouvtzgheyyiac.supabase.co',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig