import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Ensure proper output tracing
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
