import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/ai-profile",
  serverExternalPackages: ["better-sqlite3", "puppeteer"],
  experimental: {
    serverActions: { bodySizeLimit: "20mb" },
  },
};

export default nextConfig;
