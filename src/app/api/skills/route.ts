import { listSkills, createSkill } from "@/lib/db/repos";
import { wrapRoute, readJson } from "@/lib/api/helpers";
import type { SkillCategory } from "@/lib/types";

export const runtime = "nodejs";

export const GET = wrapRoute(async () => {
  return Response.json(listSkills());
});

export const POST = wrapRoute(async (req) => {
  const body = await readJson<{ category: SkillCategory; content: string; sort?: number }>(req);
  if (!body?.category || !body?.content?.trim())
    return Response.json({ error: "category/content 必填" }, { status: 400 });
  return Response.json(createSkill(body.category, body.content, body.sort ?? 0), { status: 201 });
});
