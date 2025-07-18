// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   output: 'standalone',
//   // Disable static generation completely
//   trailingSlash: false,
//   images: {
//     unoptimized: true,
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'qemafehpoknkbejlbksa.supabase.co',
//         pathname: '/**',
//       },
//     ],
//   },
// }

// module.exports = nextConfig

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
        hostname: 'qemafehpoknkbejlbksa.supabase.co',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig