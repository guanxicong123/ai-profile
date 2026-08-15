/**
 * 设置读写：settings 表 key/value；默认值从 env 读。
 *
 * 存储的 key：
 *   model.provider / model.model / model.apiKey / model.baseURL / model.temperature
 *   projectCount
 */
import { getSetting, setSetting } from "./db/repos";
import type { ModelConfig, ProviderKind, Settings } from "./types";

const DEFAULT_PROJECT_COUNT = Number(process.env.DEFAULT_PROJECT_COUNT || 5);

function getDefaultModel(): ModelConfig {
  const provider = (process.env.MODEL_PROVIDER as ProviderKind) || "anthropic";
  const model = process.env.MODEL_NAME || (provider === "anthropic" ? "claude-sonnet-5" : "gpt-4o");
  const apiKey =
    provider === "anthropic"
      ? process.env.ANTHROPIC_API_KEY || ""
      : process.env.OPENAI_API_KEY || "";
  const baseURL =
    provider === "openai" ? process.env.OPENAI_BASE_URL || "" : process.env.ANTHROPIC_BASE_URL || "";
  return {
    provider,
    model,
    apiKey,
    baseURL: baseURL || undefined,
  };
}

/** 获取持久化设置；未持久化的字段回落到 env 默认。 */
export function getSettings(): Settings {
  const def = getDefaultModel();
  const model: ModelConfig = {
    provider: (getSetting("model.provider") as ProviderKind) || def.provider,
    model: getSetting("model.model") || def.model,
    apiKey: getSetting("model.apiKey") ?? def.apiKey,
    baseURL: getSetting("model.baseURL") ?? def.baseURL,
    temperature: (() => {
      const v = getSetting("model.temperature");
      if (v == null || v === "") return def.temperature;
      const n = Number(v);
      return Number.isFinite(n) ? n : def.temperature;
    })(),
  };
  const countRaw = getSetting("projectCount");
  const projectCount = countRaw ? Number(countRaw) : DEFAULT_PROJECT_COUNT;
  return { model, projectCount: Number.isFinite(projectCount) ? projectCount : DEFAULT_PROJECT_COUNT };
}

/** GET /api/settings 使用：apiKey 不落回显，仅用布尔 hasApiKey 标记；baseURL 保留。 */
export function getPublicSettings(): Settings & { hasApiKey: boolean } {
  const s = getSettings();
  return {
    projectCount: s.projectCount,
    model: { ...s.model, apiKey: s.model.apiKey ? "***" : "" },
    hasApiKey: Boolean(s.model.apiKey),
  };
}

export function saveSettings(next: Partial<Settings>): Settings {
  if (next.projectCount != null) {
    setSetting("projectCount", String(next.projectCount));
  }
  if (next.model) {
    const m = next.model;
    if (m.provider) setSetting("model.provider", m.provider);
    if (m.model) setSetting("model.model", m.model);
    // apiKey 传 "***" 或空串表示保留原值；只有传了新的非脱敏值才覆盖
    if (m.apiKey && m.apiKey !== "***") setSetting("model.apiKey", m.apiKey);
    if (m.baseURL !== undefined) setSetting("model.baseURL", m.baseURL);
    if (m.temperature !== undefined) setSetting("model.temperature", String(m.temperature));
  }
  return getSettings();
}

/** 选择本次请求要用的模型：body.modelOverride > settings。 */
export function resolveModel(override?: ModelConfig): ModelConfig {
  if (override && override.apiKey && override.model) return override;
  return getSettings().model;
}
