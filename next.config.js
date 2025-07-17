/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Disable static generation completely
  trailingSlash: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'qemafehpoknkbejlbksa.supabase.co',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig