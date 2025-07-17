/** @type {import('next').NextConfig} */
const nextConfig = {
  // Completely disable static generation
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'qemafehpoknkbejlbksa.supabase.co',
        pathname: '/**',
      },
    ],
  },
  // Disable static generation completely
  trailingSlash: false,
}

module.exports = nextConfig