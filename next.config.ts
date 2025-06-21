import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Configure webpack to handle potential file system issues
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable file system caching in development to avoid permission issues
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
