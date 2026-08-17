import type { NextConfig } from "next";

// 与前端共享同一个 basePath 事实源：NEXT_PUBLIC_BASE_PATH 会被内联进客户端 bundle，
// src/lib/client-base.ts 读取同一变量给原生 fetch/裸 href 拼前缀（Next 的 Link/useRouter 会自动加，无需拼）。
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "/ai-profile";

const nextConfig: NextConfig = {
  basePath: BASE_PATH,
  serverExternalPackages: ["better-sqlite3", "puppeteer"],
  experimental: {
    serverActions: { bodySizeLimit: "20mb" },
  },
};

export default nextConfig;
