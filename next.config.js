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
    staticPageGenerationTimeout: 0,
  },
  // Ensure all pages are rendered dynamically
  trailingSlash: false,
  // Disable static optimization
  staticPageGenerationTimeout: 0,
}

module.exports = nextConfig