/**
 * Route handler 公共工具：JSON 错误、body 解析、query 读取。
 * 所有 /api 路由运行在 nodejs runtime（在各 route 中 export const runtime = 'nodejs'）。
 */
import { NextResponse } from "next/server";

export function json<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(data, init);
}

export function errorJson(message: string, status = 400, extra?: Record<string, unknown>): NextResponse {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export function handleError(err: unknown, context = "请求处理失败"): NextResponse {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[api] ${context}:`, err);
  return errorMessage(message, 500);
}

export function errorMessage(message: string, status = 500): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/** 从 request URL 读取 query 参数 */
export function getQueryParam(req: Request, key: string): string | null {
  const url = new URL(req.url);
  return url.searchParams.get(key);
}

export async function readJson<T>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new ApiError("请求体不是合法 JSON", 400);
  }
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

/**
 * 包装 Route Handler：统一捕获 ApiError 与未知错误。
 */
export function wrapRoute<T extends Request>(
  handler: (req: T, ctx: { params: Record<string, string> }) => Promise<Response>
) {
  return async (req: T, ctx: { params: Promise<Record<string, string>> }): Promise<Response> => {
    try {
      const params = ctx?.params ? await ctx.params : {};
      return await handler(req, { params });
    } catch (err) {
      if (err instanceof ApiError) return errorMessage(err.message, err.status);
      return handleError(err);
    }
  };
}
