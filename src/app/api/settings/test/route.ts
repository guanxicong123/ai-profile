import { z } from "zod";
import { createModel, effectiveBaseURL } from "@/lib/llm/providers";
import { structuredObject } from "@/lib/llm/structured";
import { wrapRoute, readJson } from "@/lib/api/helpers";
import type { ModelConfig } from "@/lib/types";

export const runtime = "nodejs";

const pingSchema = z.object({ ok: z.literal(true) });

export const POST = wrapRoute(async (req) => {
  const body = await readJson<ModelConfig>(req);
  if (!body?.provider || !body?.model || !body?.apiKey) {
    return Response.json(
      { ok: false, message: "provider/model/apiKey 必填" },
      { status: 400 }
    );
  }

  const model = createModel(body);
  const usedBaseURL = effectiveBaseURL(body);
  const start = Date.now();
  try {
    await structuredObject({
      model,
      schema: pingSchema,
      system: "You are a connectivity probe. Reply with JSON only.",
      prompt: "Respond with {\"ok\":true} and nothing else.",
      maxOutputTokens: 1024,
    });
    const latencyMs = Date.now() - start;
    return Response.json({
      ok: true,
      message: `连接成功（${body.provider}/${body.model}${
        usedBaseURL ? ` @ ${usedBaseURL}` : ""
      }）`,
      latencyMs,
      baseURL: usedBaseURL ?? null,
    });
  } catch (err) {
    const latencyMs = Date.now() - start;
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json(
      {
        ok: false,
        message: `连接失败：${msg}`,
        latencyMs,
        baseURL: usedBaseURL ?? null,
      },
      { status: 200 } // 业务失败但接口返回 200，让前端能拿到 message
    );
  }
});
