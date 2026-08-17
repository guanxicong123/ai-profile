/**
 * 客户端 basePath 工具（单一事实源，与 next.config.ts 的 basePath 同源）。
 *
 * Next.js 的 <Link> / useRouter 会自动拼接 basePath，但**原生 fetch、window.open、
 * 裸 <a href> 不会**。在开启 basePath（如 /ai-profile）后，这些 URL 必须手动加前缀，
 * 否则浏览器会请求 /api/... 而非 /ai-profile/api/...，导致 404。
 *
 * 用法：
 *   import { apiUrl, withBase } from "@/lib/client-base";
 *   fetch(apiUrl("/api/projects"));
 *   <a href={apiUrl(`/api/generated/${id}/pdf`)} />
 *   window.open(withBase(`/preview/${id}`), "_blank");
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "/ai-profile";

/** 给任意站内路径加上 basePath 前缀；已带前缀或为锚点/外链时原样返回。 */
export function withBase(path: string): string {
  if (!path) return path;
  if (/^https?:\/\//i.test(path) || path.startsWith("data:") || path.startsWith("#")) {
    return path;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (BASE_PATH === "/" || BASE_PATH === "") return normalized;
  if (normalized === BASE_PATH || normalized.startsWith(`${BASE_PATH}/`)) {
    return normalized;
  }
  return `${BASE_PATH}${normalized}`;
}

/** API 请求地址便捷别名（语义化）。 */
export function apiUrl(path: string): string {
  return withBase(path);
}
