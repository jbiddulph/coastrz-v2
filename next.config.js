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
  // Disable static generation to prevent useContext errors
  experimental: {
    // Force all pages to be dynamic
  },
  // Ensure all pages are rendered dynamically
  trailingSlash: false,
}

module.exports = nextConfig