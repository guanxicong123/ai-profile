/**
 * 经典版 pdf-parse@1.1.1 无官方类型；这是它的最小可用声明。
 *
 * 注意：必须从 "pdf-parse/lib/pdf-parse.js" 引入，而不是包根 "pdf-parse"。
 * 根入口在 module.parent 为空时会执行自测代码、读取未随包发布的
 * ./test/data/05-versions-space.pdf，导致 Next/Turbopack 构建期 ENOENT。
 * lib/pdf-parse.js 只是 `module.exports = Pdf`，无副作用。
 *
 * 用法：
 *   import pdfParse from "pdf-parse/lib/pdf-parse.js";
 *   const data = await pdfParse(buffer);
 *   data.text;
 */
declare module "pdf-parse/lib/pdf-parse.js" {
  interface PdfParseResult {
    text: string;
    numpages: number;
    numrender: number;
    info: Record<string, unknown> | null;
    metadata: unknown;
    version: string;
  }

  interface PdfParseOptions {
    pagerender?: (pageData: unknown) => Promise<string>;
    max?: number;
    version?: string;
  }

  function pdfParse(dataBuffer: Buffer, options?: PdfParseOptions): Promise<PdfParseResult>;

  export = pdfParse;
}
