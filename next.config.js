/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@prisma/client')
    }
    return config
  },
  // Disable strict mode to prevent double rendering in development
  reactStrictMode: false,
  // Optimize for Vercel deployment
  swcMinify: true,
  // Handle environment variables
  env: {
    SKIP_ENV_VALIDATION: process.env.SKIP_ENV_VALIDATION || 'false',
  },
  // Ignore build errors for missing environment variables during build
  typescript: {
    ignoreBuildErrors: process.env.SKIP_ENV_VALIDATION === 'true',
  },
  eslint: {
    ignoreDuringBuilds: process.env.SKIP_ENV_VALIDATION === 'true',
  },
}

module.exports = nextConfig
