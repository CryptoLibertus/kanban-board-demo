import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip static generation to avoid _global-error prerender issue in Next.js 16
  experimental: {
    staticGenerationRetryCount: 0,
  },
};

export default nextConfig;
