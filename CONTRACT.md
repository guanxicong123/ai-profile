# 前后端协作契约（Herdr 双会话）

- **统领会话**：当前 pane（w8:p1），负责脚手架/依赖/契约/集成。
- **backend 会话（w8:p2）**：数据库、LLM、匹配、PDF 渲染、API 路由。
- **frontend 会话（w8:p3）**：A4 简历模板组件 + Antd 管理后台与工作台。

> 双方只能修改「自己拥有」的文件；共享文件有改动先在统领会话同步。`src/lib/types.ts` 为只读契约。

## 一、文件所有权

### backend 拥有
```
src/lib/db/*             # better-sqlite3 连接、schema、repos
src/lib/llm/*            # ai SDK provider、prompts
src/lib/resume/*         # match 打分、assemble 成稿、zod schema
src/lib/pdf/render.ts    # Puppeteer 渲染
scripts/seed.ts          # 初始数据导入
data/                    # SQLite 与上传（gitignore）
src/app/api/**/*         # 所有 route.ts
middleware / 环境变量示例  # .env.example
```

### frontend 拥有
```
src/components/resume/** # ResumeDocument 及子组件（预览/PDF 共用）
src/components/admin/**  # 管理后台组件
src/app/page.tsx         # 生成工作台
src/app/(admin)/**       # projects/work/profile/skills/education/import/history/settings 页面
src/app/preview/[id]/**  # A4 预览页
src/app/globals.css
```

### 统领拥有 / 共享只读
```
package.json / tsconfig / next.config / 依赖版本
src/lib/types.ts         # 数据与 API 类型（只读，改动需统领同步）
```

## 二、视觉模板规范（frontend 必须还原）

A4 竖版，参考原 PDF（已渲染为 `_page_1.png`~`_page_5.png`）：

- 主色 `#4E67C8`；正文 `#3B3B3F` / `#3F3F3F`；辅助灰 `#595959`。
- 字体 `"Microsoft YaHei","微软雅黑",sans-serif`（Windows 自带）。
- 正文 9pt；板块中文标题约 15pt；项目名约 10.5pt。
- 页面边距约 14–18mm；`@page { size:A4; margin:0 }`，内容区自己留白。
- 板块头：蓝色实心圆 + SVG 图标（介绍=毕业帽、经历=公文包、项目=代码/文件夹、教育=学士帽）+ 中文标题 + 英文小字（灰色）+ 蓝灰两段分隔线（蓝段约占 40%）。
- 基本信息：两列网格（姓名/出生、电话/邮箱、现居/经验），右上角蓝色大圆装饰 + 可选头像。
- 项目块：第一行项目名（左）、角色（中，加粗）、时间（右）；「项目概要：」「项目技术栈描述：」「项目描述：」(➤)、「项目成绩：」(编号 1./2.)。
- 工作块：时间（左粗）、公司（中）、角色（右）；职责数字编号 1、2；业绩用 ●。
- 自我介绍：分「行业经验：」「专业能力：」(●)、「自我描述：」。
- 用 `break-inside: avoid` 防条目跨页；内容自然分页。

PDF 由后端用 `renderToStaticMarkup(<ResumeDocument {...document} />)` + 内联 CSS 喂给 Puppeteer。**frontend 必须让 `<ResumeDocument>` 自包含内联样式**（用 `<style>` 标签或内联），不依赖 Next 全局 CSS/Tailwind，这样脱离运行时服务也能渲染。

## 三、REST API（backend 实现，frontend 调用）

所有接口 `/api/*`，JSON 收发（导入除外 multipart）。

### 素材 CRUD
- `GET/PUT /api/profile` → `Profile`
- `GET/POST /api/highlights`，`PUT/DELETE /api/highlights/[id]`
- `GET/POST /api/skills`，`PUT/DELETE /api/skills/[id]`（body: `{category,content}`）
- `GET/POST /api/work`，`PUT/DELETE /api/work/[id]`（body: `WorkInput`）
- `GET/POST /api/projects`（body: `ProjectInput`）
  - `GET` 支持 `?q=&domain=&archived=false`
- `PUT/DELETE /api/projects/[id]`
- `GET/PUT /api/education`

### AI 导入
- `POST /api/import`（multipart field `file`：PDF）→ `{ projects: ProjectInput[] }`（LLM 抽取结果，**未落库**，由前端确认后调 `/api/projects` 批量）

### 生成
- `POST /api/generate`（body: `GenerateRequest`）→ `GenerateResponse`（同步，耗时较长；落库为 generated_resumes）
- `GET /api/generated` → `GeneratedResume[]`（历史列表，摘要）
- `GET /api/generated/[id]` → `GeneratedResume`
- `DELETE /api/generated/[id]`
- `GET /api/generated/[id]/pdf` → `application/pdf`（stream）

### 设置
- `GET/PUT /api/settings` → `Settings`（GET 时 apiKey 脱敏返回 `***` 仅标记是否已配置）
- `POST /api/settings/test`（body: `ModelConfig`）→ `{ ok:boolean; message:string; latencyMs?:number }`

## 四、生成流水线契约（backend 内部）

1. JD 解析 → `ParsedJD`
2. 关键词预筛 + LLM 对候选打分 → `ProjectScore[]`（按分降序）
3. 取 Top N（默认 5），LLM 成稿 → `ResumeDocument`
4. 落库 `generated_resumes`，返回 `GenerateResponse`

**真实性护栏（强制）**：LLM 只能取舍/重排/同义改写已有素材，禁止虚构技术、项目、量化数据；每条 result/detail 必须来自某个 project 的原文。

## 五、并行策略与集成点

1. 统领先完成 package.json/依赖/tsconfig/next.config。
2. 双方并行；frontend 用 `Project`/`ResumeDocument` 类型先以 mock 数据开发模板与页面；backend 先起 API。
3. 完成后由统领会话跑 `npm run dev` 联调：seed → 预览 → PDF → JD 生成 → 下载。
