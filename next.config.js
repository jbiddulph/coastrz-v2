/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    outputFileTracingIncludes: {
      '/**/*': ['./public/**/*']
    }
  },
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
}

module.exports = nextConfig