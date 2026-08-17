/**
 * A4 简历模板样式（预览与 PDF 共用）。
 * ResumeDocument（服务端渲染/Puppeteer）与 EditableResumeDocument（客户端原地编辑）
 * 都注入这一份字符串，保证只读与编辑态视觉一致。
 *
 * 末尾的 .rd-edit* / .rd-array-* / .rd-block-toolbar / .rd-skills-* 是编辑器样式，
 * 只在编辑态 DOM 中出现，不影响只读 PDF 渲染。
 */
export const RESUME_CSS = `
@page { size: A4 portrait; margin: 0; }
.rd-page, .rd-page * { box-sizing: border-box; }
.rd-page {
  width: 210mm;
  min-height: 297mm;
  padding: 14mm 16mm 16mm 16mm;
  margin: 0 auto;
  background: #ffffff;
  color: #3B3B3F;
  font-family: "Microsoft YaHei","微软雅黑",sans-serif;
  font-size: 9pt;
  line-height: 1.7;
  position: relative;
  overflow: hidden;
}
.rd-page p { margin: 0; }
.rd-page ul, .rd-page ol { margin: 0; padding: 0; list-style: none; }

/* 右上角装饰 */
.rd-deco-circle {
  position: absolute;
  top: -28mm;
  right: -28mm;
  width: 70mm;
  height: 70mm;
  border-radius: 50%;
  background: #4E67C8;
  z-index: 0;
}
.rd-deco-dot {
  position: absolute;
  right: 10mm;
  top: 88mm;
  width: 9mm;
  height: 9mm;
  border-radius: 50%;
  background: #4E67C8;
  z-index: 0;
}
.rd-deco-dot-2 {
  position: absolute;
  right: 12mm;
  top: 196mm;
  width: 7mm;
  height: 7mm;
  border-radius: 50%;
  background: #4E67C8;
  z-index: 0;
  opacity: .9;
}

.rd-content { position: relative; z-index: 1; }

/* 基本信息 */
.rd-basic-title {
  font-size: 16pt;
  color: #4E67C8;
  font-weight: 700;
  margin: 2mm 0 5mm 0;
  letter-spacing: 1pt;
}
.rd-basic-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  row-gap: 2mm;
  column-gap: 10mm;
  font-size: 10pt;
  color: #595959;
}
.rd-basic-grid .rd-key { color: #3B3B3F; }
.rd-basic-row { display: flex; align-items: center; }
.rd-basic-row .rd-key { display: inline-block; min-width: 20mm; }
.rd-photo {
  position: absolute;
  top: 0;
  right: 0;
  width: 38mm;
  height: 48mm;
  object-fit: cover;
  z-index: 2;
}
.rd-online {
  margin-top: 4mm;
  font-family: Consolas, "Courier New", monospace;
  font-size: 10pt;
  color: #222;
  word-break: break-all;
}

/* 板块标题 */
.rd-section-title {
  display: flex;
  align-items: center;
  margin: 7mm 0 3mm 0;
  gap: 3mm;
  page-break-after: avoid;
}
.rd-section-icon-circle {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #4E67C8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.rd-section-zh {
  font-size: 15pt;
  color: #4E67C8;
  font-weight: 700;
  letter-spacing: 4pt;
  margin-left: 2mm;
}
.rd-section-en {
  font-size: 11pt;
  color: #8c8c8c;
  margin-left: 4mm;
  letter-spacing: 1pt;
}
.rd-section-line {
  flex: 1;
  display: flex;
  height: 2px;
  margin-left: 4mm;
}
.rd-section-line-blue { width: 35%; background: #4E67C8; }
.rd-section-line-gray { flex: 1; background: #c7c7c7; }

/* 自我介绍 */
.rd-intro .rd-label { font-weight: 700; color: #2f2f2f; }
.rd-intro p { margin-bottom: 1.5mm; }
.rd-highlights { margin: 1mm 0 2mm 0; }
.rd-highlights li {
  position: relative;
  padding-left: 5mm;
  margin-bottom: 1mm;
}
.rd-highlights li::before {
  content: "";
  position: absolute;
  left: 1mm;
  top: 3mm;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4E67C8;
}

/* 专业技能 */
.rd-skills { margin: 1mm 0 2mm 0; }
.rd-skills-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 1.5mm;
  line-height: 1.9;
}
.rd-skills-cat {
  font-weight: 700;
  color: #2f2f2f;
  min-width: 24mm;
  flex: 0 0 24mm;
}
.rd-skills-tags { flex: 1; display: flex; flex-wrap: wrap; gap: 1mm 2mm; }
.rd-skills-tag { color: #3B3B3F; }

/* 工作/项目通用 */
.rd-work-block, .rd-project-block {
  margin-bottom: 4mm;
  page-break-inside: avoid;
  position: relative;
}
.rd-work-head, .rd-project-head {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  margin: 2mm 0 2mm 0;
  font-size: 9.5pt;
}
.rd-work-period { color: #4E67C8; font-weight: 700; }
.rd-work-company { text-align: center; color: #2f2f2f; font-weight: 600; }
.rd-work-role { text-align: right; font-weight: 700; color: #2f2f2f; }

.rd-duties { margin: 1mm 0 1mm 0; }
.rd-duties li {
  position: relative;
  padding-left: 6mm;
  margin-bottom: 1mm;
}
.rd-duties li::before {
  content: counter(duty) "、";
  counter-increment: duty;
  position: absolute;
  left: 0;
  color: #2f2f2f;
}
.rd-duties { counter-reset: duty; }

.rd-achieve-label { font-weight: 700; margin-top: 1mm; }
.rd-achievements { margin: 1mm 0 0 0; }
.rd-achievements li {
  position: relative;
  padding-left: 6mm;
  margin-bottom: 1mm;
}
.rd-achievements li::before {
  content: "●";
  position: absolute;
  left: 1mm;
  color: #4E67C8;
  font-size: 8pt;
  top: 0.5mm;
}

/* 项目 */
.rd-project-name { font-weight: 700; color: #595959; font-size: 9.5pt; }
.rd-project-role { text-align: center; font-weight: 700; color: #2f2f2f; }
.rd-project-period { text-align: right; color: #4E67C8; font-weight: 700; }

.rd-line { margin: 1mm 0; }
.rd-label { font-weight: 700; color: #2f2f2f; }

.rd-details { margin: 0 0 1mm 0; }
.rd-details li {
  position: relative;
  padding-left: 6mm;
  margin-bottom: 1mm;
}
.rd-details li::before {
  content: "➤";
  position: absolute;
  left: 0;
  top: 0;
  color: #4E67C8;
  font-size: 8pt;
}

.rd-results { counter-reset: result; margin: 0 0 1mm 6mm; list-style: decimal; }
.rd-results li {
  margin-bottom: 1mm;
  padding-left: 2mm;
  list-style: decimal;
}

/* 教育 */
.rd-edu-head {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  font-size: 10pt;
  margin-top: 2mm;
}
.rd-edu-period { color: #2f2f2f; }
.rd-edu-major { text-align: center; font-weight: 700; }
.rd-edu-school { text-align: right; font-weight: 700; }

/* ===================== 编辑器样式（仅编辑态） ===================== */
.rd-edit {
  width: 100%;
  padding: 1px 4px !important;
  background: transparent !important;
  border: 1px solid transparent !important;
  border-radius: 3px;
  font: inherit !important;
  color: inherit !important;
  line-height: inherit !important;
  transition: background .15s, border-color .15s;
  resize: none;
  box-shadow: none !important;
}
.rd-edit:hover { background: rgba(0,0,0,.04) !important; }
.rd-edit:focus,
.rd-edit-focused {
  background: #fff !important;
  border-color: #4E67C8 !important;
  outline: none;
}
.rd-edit.ant-input-affix-wrapper,
.rd-edit.ant-input-number,
.rd-edit.ant-select-selector {
  box-shadow: none !important;
}
/* antd Select tags 模式下的选择器 */
.rd-edit.ant-select .ant-select-selector {
  background: transparent !important;
  border: 1px solid transparent !important;
  box-shadow: none !important;
  padding: 0 4px !important;
  height: auto !important;
}
.rd-edit.ant-select:hover .ant-select-selector { background: rgba(0,0,0,.04) !important; }
.rd-edit.ant-select-focused .ant-select-selector,
.rd-edit.ant-select.rd-edit-focused .ant-select-selector {
  background: #fff !important;
  border-color: #4E67C8 !important;
}

/* 数组行：hover 浮现操作按钮。作为 li 时不显示列表标记 */
.rd-array-row {
  display: flex;
  align-items: flex-start;
  position: relative;
  list-style: none !important;
  padding-left: 0 !important;
}
.rd-array-row::before { display: none !important; }
.rd-array-row > .rd-array-main { flex: 1; min-width: 0; }
.rd-array-ctrl {
  flex: 0 0 auto;
  display: inline-flex;
  gap: 2px;
  margin-left: 4px;
  opacity: 0;
  transition: opacity .15s;
  align-items: center;
}
.rd-array-row:hover > .rd-array-ctrl,
.rd-block:hover .rd-block-toolbar { opacity: 1; }
.rd-array-ctrl .ant-btn,
.rd-block-toolbar .ant-btn {
  padding: 0 6px !important;
  height: 22px !important;
  font-size: 12px !important;
}
.rd-array-add {
  list-style: none !important;
  padding-left: 0 !important;
  margin-top: 2px;
  font-size: 12px;
  color: #4E67C8;
}
.rd-array-add::before { display: none !important; }

/* 项目块/工作块右上角工具条 */
.rd-block-toolbar {
  position: absolute;
  top: 0;
  right: 0;
  display: inline-flex;
  gap: 4px;
  opacity: 0;
  transition: opacity .15s;
  z-index: 5;
}
`;
