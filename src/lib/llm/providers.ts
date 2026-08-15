/**
 * 根据 ModelConfig 构造 AI SDK model 实例。
 * - anthropic: createAnthropic({apiKey, baseURL?})(model)
 * - openai:    createOpenAI({apiKey, baseURL?}).chat(model)
 *
 * OpenAI 分支统一走 .chat()（经典 chat/completions 端点），而不是 provider() 默认的
 * 新版 Responses API（/responses）。原因：火山方舟 Coding Plan 等 OpenAI 兼容端点只支持
 * chat/completions；标准 OpenAI 本身也支持 .chat()，所以统一走这条最稳。
 */
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";
import type { ModelConfig } from "@/lib/types";

/**
 * 规范化 OpenAI 兼容端点：若用户填的 baseURL 没带 /v1（也没有 /v1/...），自动补上。
 * 例如 https://ark.cn-beijing.volces.com/api/coding → .../coding/v1。
 */
export function normalizeOpenAIBaseURL(baseURL: string | undefined): string | undefined {
  if (!baseURL) return baseURL;
  const trimmed = baseURL.trim().replace(/\/+$/, "");
  if (/\/v1(\/|$)/.test(trimmed)) return trimmed;
  return `${trimmed}/v1`;
}

export function createModel(cfg: ModelConfig): LanguageModel {
  if (!cfg.apiKey) {
    throw new Error(`模型 (${cfg.provider}/${cfg.model}) 未配置 API Key，请在设置中填写或配置环境变量。`);
  }
  if (!cfg.model) {
    throw new Error("模型名称为空，请在设置中填写 model。");
  }

  if (cfg.provider === "anthropic") {
    const anthropic = createAnthropic({
      apiKey: cfg.apiKey,
      ...(cfg.baseURL ? { baseURL: cfg.baseURL } : {}),
    });
    return anthropic(cfg.model);
  }

  if (cfg.provider === "openai") {
    const baseURL = normalizeOpenAIBaseURL(cfg.baseURL);
    const openai = createOpenAI({
      apiKey: cfg.apiKey,
      ...(baseURL ? { baseURL } : {}),
    });
    // 经典 chat/completions 端点，兼容所有 OpenAI 兼容服务
    return openai.chat(cfg.model);
  }

  throw new Error(`不支持的 provider: ${String((cfg as { provider?: string }).provider)}`);
}

/** 返回实际生效的 baseURL（用于测试连接等回显）。 */
export function effectiveBaseURL(cfg: ModelConfig): string | undefined {
  return cfg.provider === "openai" ? normalizeOpenAIBaseURL(cfg.baseURL) : cfg.baseURL;
}
