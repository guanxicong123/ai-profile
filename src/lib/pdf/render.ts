/**
 * 把 ResumeDocument 渲染为 PDF Buffer。
 * 流程：renderToStaticMarkup → 内联 template.css + 组件自身样式 → Puppeteer setContent → page.pdf。
 *
 * ResumeDocument 由 frontend 提供（@/components/resume/ResumeDocument），默认导出 React 组件。
 * 这里用动态 import + try/catch，组件缺失时给出可诊断错误。
 */
import React from "react";
import puppeteer from "puppeteer";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { ResumeDocument } from "@/lib/types";

const TEMPLATE_CSS_PATH = path.join(process.cwd(), "src", "lib", "pdf", "template.css");

/**
 * 解析可用的 Chrome 可执行文件：
 * 1) 环境变量 PUPPETEER_EXECUTABLE_PATH / CHROME_PATH
 * 2) Puppeteer 缓存目录里已下载并解压好的 chrome（避免损坏/未完成的下载导致启动失败）
 * 3) 都没有则返回 undefined，交由 puppeteer 用其默认逻辑
 */
function resolveExecutablePath(): string | undefined {
  const envPath =
    process.env.PUPPETEER_EXECUTABLE_PATH || process.env.CHROME_PATH;
  if (envPath && fs.existsSync(envPath)) return envPath;

  const cacheRoot =
    process.env.PUPPETEER_CACHE_DIR || path.join(os.homedir(), ".cache", "puppeteer");
  const chromeRoot = path.join(cacheRoot, "chrome");
  if (fs.existsSync(chromeRoot)) {
    const found = findChromeExe(chromeRoot);
    if (found) return found;
  }
  return undefined;
}

function findChromeExe(dir: string): string | null {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.toLowerCase().startsWith("win64-")) {
        const exe = path.join(full, "chrome-win64", "chrome.exe");
        if (fs.existsSync(exe)) return exe;
      }
      const nested = findChromeExe(full);
      if (nested) return nested;
    }
  }
  return null;
}

function loadTemplateCss(): string {
  try {
    return fs.readFileSync(TEMPLATE_CSS_PATH, "utf-8");
  } catch {
    return `@page { size: A4; margin: 0; } html,body{margin:0;padding:0;} *{box-sizing:border-box;}`;
  }
}

export async function renderPDF(doc: ResumeDocument): Promise<Buffer> {
  let Component: React.ComponentType<ResumeDocument>;
  try {
    const mod = await import("@/components/resume/ResumeDocument");
    Component = (mod.default ?? mod.ResumeDocument) as React.ComponentType<ResumeDocument>;
  } catch (err) {
    throw new Error(
      `无法加载 ResumeDocument 组件（@/components/resume/ResumeDocument）：${
        (err as Error)?.message ?? String(err)
      }。请确认 frontend 已提供该组件。`
    );
  }
  if (!Component) {
    throw new Error("ResumeDocument 组件没有默认导出，请 frontend 检查 export default。");
  }

  const { renderToStaticMarkup } = await import("react-dom/server");
  const innerHtml = renderToStaticMarkup(React.createElement(Component, doc));
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<title>resume</title>
<style>
${loadTemplateCss()}
</style>
</head>
<body>
${innerHtml}
</body>
</html>`;

  const executablePath = resolveExecutablePath();
  const browser = await puppeteer.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
