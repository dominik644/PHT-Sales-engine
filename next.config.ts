import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
  // Ensure seeded SQLite ships with every serverless function (demo on Vercel).
  outputFileTracingIncludes: {
    "/**": ["./data/demo.db"],
  },
};

export default nextConfig;
