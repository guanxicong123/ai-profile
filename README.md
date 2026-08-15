# AI 简历生成系统

本地运行的简历生成工具：持续积累项目经验素材到 SQLite，粘贴岗位 JD 后由 AI 挑选/裁剪/改写，输出与 `关锡琮-前端开发工程师_202608.pdf` 同版式的 PDF 简历。

## 技术栈

Next.js 16 (App Router) + React 19 + TypeScript + Ant Design v6 + better-sqlite3 + Puppeteer + Vercel AI SDK（Claude / OpenAI 兼容，含豆包）。

## 快速开始

```bash
npm install
npm run seed     # 从 scripts/seed-data.json 导入初始素材（8 个项目、4 段工作经历等）
npm run dev      # http://localhost:3000
```

1. 打开 `/settings` 配置模型（provider、model、apiKey；OpenAI 兼容端点可填豆包 baseURL），点「测试连接」。
   也可复制 `.env.example` 为 `.env` 设置环境变量默认值。
2. 打开 `/projects`（或 `/work`、`/profile` 等）持续补充素材。
3. 在首页 `/` 粘贴岗位 JD → 生成 → 查看匹配评分与项目取舍 → 预览 → 下载 PDF。
4. `/import` 可上传一份简历 PDF，AI 抽取项目经验后勾选入库。
5. `/history` 查看历史生成记录。

## 工作原理

- **模板还原**：`src/components/resume/ResumeDocument.tsx` 是自包含内联样式的 A4 组件，屏幕预览（`/preview/[id]`）和 PDF 共用同一组件；后端用 `renderToStaticMarkup` + Puppeteer（Chrome）打印为 A4 PDF。
- **JD 匹配**（`src/lib/resume/`）：JD 解析 → 关键词预筛 + LLM 对候选项目打分（0–100、命中技能、理由）→ 取 Top N → LLM 成稿。
- **真实性护栏**：成稿阶段只允许对已有素材取舍/重排/同义改写，禁止虚构技术、项目或量化数据；每条项目保留 `projectId` 可溯源。
- **数据**：SQLite 文件位于 `data/app.db`，PDF 输出到 `data/pdf/`（均已 gitignore）。

## 目录约定

- 后端：`src/lib/{db,llm,resume,pdf}`、`src/app/api/**`、`scripts/`
- 前端：`src/components/**`、`src/app/(admin)/**`、`src/app/preview/**`
- 共享类型（唯一事实源）：`src/lib/types.ts`
- 协作契约：`CONTRACT.md`

Puppeteer 默认使用自带 Chrome；若自带下载不完整，可设置环境变量 `PUPPETEER_EXECUTABLE_PATH` 指向系统 Chrome，或 `CHROME_PATH`。系统会自动探测缓存中已解压的 Chrome。
