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
  // Force all pages to be dynamic
  experimental: {
    // Disable static generation completely
    staticGenerationAsyncStorage: false,
  },
  // Disable static generation completely
  trailingSlash: false,
  // Force dynamic rendering for all pages
  generateStaticParams: async () => {
    return [];
  },
}

module.exports = nextConfig