/**
 * 统一结构化输出辅助。
 *
 * 背景：部分 OpenAI 兼容端点（如火山方舟 Coding Plan / glm 系列）不支持
 * response_format=json_schema，而 AI SDK 的 generateObject 默认就发它；
 * 即便 mode:'json' / structuredOutputs:false 也仍发 json_schema，会被 400 拒绝。
 *
 * 因此统一改用 generateText：要求模型只输出 JSON，再手动 parse + zod 校验。
 * 对标准 OpenAI / Anthropic 同样适用（二者都支持 generateText）。
 */
import { generateText } from "ai";
import type { LanguageModel } from "ai";
import { z } from "zod";

export interface StructuredObjectOptions<T> {
  model: LanguageModel;
  /** zod schema；运行时用它校验。输出类型由泛型 T 决定（调用方负责）。 */
  schema: z.ZodTypeAny;
  system: string;
  prompt: string;
  /** 推理模型需要较大 token 预算；默认 8000，简历项目多时够用 */
  maxOutputTokens?: number;
  temperature?: number;
}

const JSON_RULES = `\n\n【输出格式硬性要求】只输出一个合法 JSON 对象，不要任何解释、前后缀或 markdown 代码围栏（禁止 \`\`\`）。字段名、字符串必须用双引号；不要尾随逗号；不要输出注释。该 JSON 必须能被 JSON.parse 直接解析。`;

/** 清洗模型可能加上的 markdown 代码围栏与前后空白。 */
export function stripCodeFence(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json|JSON)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

/** 从可能含额外文本的输出里提取第一个完整 JSON 对象（花括号配平）。 */
export function extractJsonObject(text: string): string {
  const cleaned = stripCodeFence(text);
  const start = cleaned.indexOf("{");
  if (start < 0) return cleaned;
  let depth = 0;
  let inStr = false;
  let escape = false;
  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (inStr) {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return cleaned.slice(start, i + 1);
    }
  }
  return cleaned.slice(start);
}

/** 把 zod schema 转成简易 JSON Schema（供 prompt 展示，非严格模式）。 */
function zodToSimpleJsonSchema(schema: z.ZodTypeAny): unknown {
  const def = schema._def;
  const typeName: string = def?.typeName ?? "";
  const desc = schema.description ? { description: schema.description } : {};

  switch (typeName) {
    case "ZodString":
      return { type: "string", ...desc };
    case "ZodNumber":
      return { type: "number", ...desc };
    case "ZodBoolean":
      return { type: "boolean", ...desc };
    case "ZodLiteral":
      return { const: def.value, ...desc };
    case "ZodEnum":
      return { type: "string", enum: def.values, ...desc };
    case "ZodArray":
      return { type: "array", items: zodToSimpleJsonSchema(def.type), ...desc };
    case "ZodObject": {
      const shape: Record<string, unknown> = {};
      const required: string[] = [];
      const shapes = def.shape();
      for (const key of Object.keys(shapes)) {
        const field = shapes[key] as z.ZodTypeAny;
        const isOptional = field._def?.typeName === "ZodOptional";
        shape[key] = zodToSimpleJsonSchema(isOptional ? field._def.innerType : field);
        if (!isOptional) required.push(key);
      }
      return { type: "object", properties: shape, required, ...desc };
    }
    case "ZodOptional":
      return zodToSimpleJsonSchema(def.innerType);
    case "ZodNullable":
      return zodToSimpleJsonSchema(def.innerType);
    case "ZodRecord":
      return { type: "object", additionalProperties: zodToSimpleJsonSchema(def.valueType) };
    case "ZodUnion":
    case "ZodDiscriminatedUnion":
      return { oneOf: (def.options as z.ZodTypeAny[]).map(zodToSimpleJsonSchema) };
    default:
      return desc;
  }
}

export async function structuredObject<T>(
  opts: StructuredObjectOptions<T>
): Promise<T> {
  const { model, schema, system, prompt, maxOutputTokens = 8000, temperature } = opts;

  let jsonSchemaText: string;
  try {
    jsonSchemaText = JSON.stringify(zodToSimpleJsonSchema(schema as z.ZodTypeAny), null, 2);
  } catch {
    jsonSchemaText = "(schema 无法序列化，请按上文字段要求输出)";
  }

  const fullPrompt = `${prompt}\n\n【输出 JSON Schema】\n${jsonSchemaText}${JSON_RULES}`;

  const res = await generateText({
    model,
    system: system + JSON_RULES,
    prompt: fullPrompt,
    maxOutputTokens,
    ...(temperature != null ? { temperature } : {}),
  });

  const raw = res.text ?? "";
  const candidate = extractJsonObject(raw);
  let parsed: unknown;
  try {
    parsed = JSON.parse(candidate);
  } catch (err) {
    const snippet = raw.slice(0, 500);
    throw new Error(
      `模型输出无法解析为 JSON：${(err as Error).message}\n原始输出片段：\n${snippet}`
    );
  }

  const validated = schema.safeParse(parsed);
  if (!validated.success) {
    const snippet = raw.slice(0, 500);
    const issues = validated.error.issues
      .map((i) => `- ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(
      `模型输出 JSON 不符合 Schema：\n${issues}\n原始输出片段：\n${snippet}`
    );
  }
  return validated.data;
}
