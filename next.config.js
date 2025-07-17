/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'qemafehpoknkbejlbksa.supabase.co',
        pathname: '/**',
      },
    ],
  },
  trailingSlash: false,
}

module.exports = nextConfig