/**
 * 三个 prompt 模板：JD 解析、项目打分、简历成稿。
 * 全部配合 structuredObject（generateText + 手动 JSON 解析 + zod 校验）使用，
 * 以兼容不支持 response_format=json_schema 的端点（如火山方舟 Coding Plan）。
 * Schema 定义见 src/lib/resume/schema.ts。
 */

export const JD_PARSE_SYSTEM = `你是资深招聘专家与技术面试官，擅长从 JD（职位描述）中提取结构化用人需求。
输出必须严格遵循给定 schema，使用与 JD 相同的语言（中文 JD 用中文）。
要点：
- targetRole 提取岗位标准名称；seniority 取「初级/中级/高级/资深/专家」之一。
- mustHaveSkills 只放硬性必备技能；niceToHaveSkills 放加分项，二者尽量用规范化技术名词（如 React、TypeScript、Node.js）。
- responsibilities 与 domains 要简洁、去重。`;

export function buildJDParsePrompt(jdText: string): string {
  return `请解析以下职位描述（JD）：\n\n"""\n${jdText.trim()}\n"""`;
}

export const SCORE_SYSTEM = `你是资深技术招聘负责人，根据岗位需求为候选人的项目经历逐一打分（0-100）。
评分要点：
1. 技术栈重合度：项目 stack/tags 命中 mustHave/niceToHave 的程度。
2. 业务领域相关性：项目 domain/tags 与 JD 的 domains/responsibilities 的贴近程度。
3. 职责与资历匹配：项目角色、职责、复杂度与目标岗位/seniority 的匹配度。
4. 成果含金量：results 中体现的规模、量化收益、技术难度。

严格规则：
- 只对给定候选项目打分，不要编造不存在的 projectId。
- matchedSkills 必须来自项目自身的 stack/tags/domain 与 JD 关键词的交集。
- reason 用一句话说明关键命中点与减分点，不超过 60 字。
- 输出顺序不限，系统会按分数降序排列。`;

export interface ScoreCandidate {
  projectId: number;
  name: string;
  overview: string;
  stack: string[];
  tags: string[];
  domain?: string | null;
}

export function buildScorePrompt(input: {
  jd: {
    targetRole: string;
    mustHaveSkills: string[];
    niceToHaveSkills: string[];
    responsibilities: string[];
    domains: string[];
    seniority: string;
  };
  candidates: ScoreCandidate[];
}): string {
  const jd = input.jd;
  const candidates = input.candidates.map((c) => ({
    projectId: c.projectId,
    name: c.name,
    overview: c.overview,
    stack: c.stack,
    tags: c.tags,
    domain: c.domain ?? "",
  }));
  return [
    `目标岗位：${jd.targetRole}（${jd.seniority}）`,
    `必备技能：${jd.mustHaveSkills.join("、") || "（无）"}`,
    `加分技能：${jd.niceToHaveSkills.join("、") || "（无）"}`,
    `岗位职责：\n- ${jd.responsibilities.join("\n- ")}`,
    `业务领域：${jd.domains.join("、") || "（无）"}`,
    "",
    `候选项目（JSON）：`,
    "```json",
    JSON.stringify(candidates, null, 2),
    "```",
    "",
    "请为每个候选项目打分，输出 scores 数组。",
  ].join("\n");
}

export const ASSEMBLE_SYSTEM = `你是资深简历顾问，需要根据目标 JD，从候选人的「固定素材」与「已匹配的 Top 项目（含完整细节）」中组装一份针对性强、真实可信的中文简历。

【真实性护栏 —— 强制】
1. 只能对已有素材进行取舍、重排、合并、同义改写与精炼，严禁虚构任何技术、项目、公司、职责、量化数字或成果。
2. 每个输出的 project 必须保留其 projectId，且 name/role/period/stack/overview/details/results 必须来源于该 projectId 对应的原文素材；可删减、可改写措辞，但不得添加原文没有的事实或数据。
3. skills 只能从候选人已有技能中筛选并按与 JD 的相关性排序，禁止新增技能。
4. highlights 只能从给定亮点中筛选/微调顺序，禁止编造。
5. workExperiences 与 profile/education 为固定信息，按原样输出（可对 duties/achievements 做与岗位相关的顺序微调，但不得改写事实）。
6. 如果素材不足以支撑某项 JD 要求，不要编造，直接不体现。

【排版与内容要求】
- 语言：中文；专业、简洁、以结果为导向。
- highlights：挑选 4-6 条最贴近 JD 的，按相关性排序。
- skills：每个分类内按与 JD 的相关性从高到低排序；可去掉完全不相关的技能，但不要整类清空。
- projects：保持给定顺序（已按匹配度排序），保留全部入选项目；overview 用 1-2 句概括；details 用要点体现职责与技术方案；results 突出量化成果。
- 不要输出任何解释性文字，只输出符合 schema 的 JSON。`;

export interface AssembleProjectInput {
  projectId: number;
  name: string;
  role: string;
  period?: string | null;
  stack: string[];
  overview: string;
  details: string[];
  results: string[];
}

export function buildAssemblePrompt(input: {
  jd: {
    targetRole: string;
    mustHaveSkills: string[];
    niceToHaveSkills: string[];
    responsibilities: string[];
    domains: string[];
    seniority: string;
  };
  profile: unknown;
  highlights: string[];
  skills: Record<string, string[]>;
  workExperiences: unknown;
  education: unknown;
  projects: AssembleProjectInput[];
}): string {
  return [
    `# 目标岗位`,
    `岗位：${input.jd.targetRole}（${input.jd.seniority}）`,
    `必备技能：${input.jd.mustHaveSkills.join("、") || "（无）"}`,
    `加分技能：${input.jd.niceToHaveSkills.join("、") || "（无）"}`,
    `职责：${input.jd.responsibilities.join("；")}`,
    `领域：${input.jd.domains.join("、") || "（无）"}`,
    ``,
    `# 固定素材`,
    `## profile`,
    "```json",
    JSON.stringify(input.profile, null, 2),
    "```",
    `## highlights（候选）`,
    "```json",
    JSON.stringify(input.highlights, null, 2),
    "```",
    `## skills（候选，按分类）`,
    "```json",
    JSON.stringify(input.skills, null, 2),
    "```",
    `## workExperiences（固定）`,
    "```json",
    JSON.stringify(input.workExperiences, null, 2),
    "```",
    `## education（固定）`,
    "```json",
    JSON.stringify(input.education, null, 2),
    "```",
    ``,
    `# Top 项目（已按匹配度排序，必须全部保留，projectId 不得改动）`,
    "```json",
    JSON.stringify(input.projects, null, 2),
    "```",
    ``,
    `请严格遵守系统消息中的真实性护栏，输出最终 ResumeDocument。`,
  ].join("\n");
}

export const IMPORT_SYSTEM = `你是简历解析助手。用户会提供一段从简历/文档中抽取的纯文本（可能含乱码、错位、换行，也可能是 Markdown）。
请从中抽取候选人的项目经历列表。严格规则：
1. 只基于文本中真实出现的信息，禁止虚构项目、技术、量化数据。
2. 若某字段缺失，使用空字符串/空数组，period/domain 缺失用 null。
3. stack/tags 使用规范化的技术名词；tags 可包含业务领域、项目类型等关键词用于后续 JD 匹配。
4. details 为项目职责/描述要点；results 为项目成果（尽量保留原文数字）。
5. 输出中文（若原文为英文则用英文）。
6. 一个文件可能包含一个或多个项目：按标题（# / ## 等）边界拆分为多个 ProjectInput；技术栈可能以 Markdown 表格形式出现，请把表格里的技术项归并到对应项目的 stack 数组。`;

export function buildImportPrompt(text: string, sourceHint?: string): string {
  const truncated = text.length > 20000 ? text.slice(0, 20000) + "\n...(截断)" : text;
  const hint = sourceHint ? `${sourceHint}\n\n` : "";
  return `${hint}请从以下文本中抽取项目经历：\n\n"""\n${truncated}\n"""`;
}

export const IMPORT_MARKDOWN_HINT = `注意：以下输入是 Markdown 纯文本。可能用 # / ## 标题划分一个或多个项目，请按标题边界拆分；技术栈可能以表格形式出现，请把表格中的技术项归并到 stack 数组。`;
