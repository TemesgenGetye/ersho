import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Disable SWC warnings for Vercel deployment
    swcMinify: true,
  },
  // Ensure proper output tracing
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
