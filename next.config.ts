import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Only add production optimizations when building for production
  ...(process.env.NODE_ENV === 'production' && {
    serverExternalPackages: ['@prisma/client', 'prisma'],
    output: 'standalone',
  }),
};

export default nextConfig;
