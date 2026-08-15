import React from "react";
import type { ResumeDocument as ResumeDocumentType } from "@/lib/types";
import SectionTitle from "./SectionTitle";
import WorkBlock from "./WorkBlock";
import ProjectBlock from "./ProjectBlock";

const CSS = `
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

/* 工作/项目通用 */
.rd-work-block, .rd-project-block {
  margin-bottom: 4mm;
  page-break-inside: avoid;
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
`;

export function ResumeDocument(props: ResumeDocumentType) {
  const { profile, highlights, workExperiences, projects, education } = props;
  return (
    <div className="rd-page">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="rd-deco-circle" />

      <div className="rd-content">
        {/* 基本信息 */}
        <h1 className="rd-basic-title">基本信息</h1>
        {profile.photoPath ? (
          <img className="rd-photo" src={profile.photoPath} alt={profile.name} />
        ) : null}
        <div className="rd-basic-grid">
          <div className="rd-basic-row"><span className="rd-key">姓　名：</span><span>{profile.name}</span></div>
          <div className="rd-basic-row"><span className="rd-key">出生年月：</span><span>{profile.birth}</span></div>
          <div className="rd-basic-row"><span className="rd-key">电　话：</span><span>{profile.phone}</span></div>
          <div className="rd-basic-row"><span className="rd-key">邮　箱：</span><span>{profile.email}</span></div>
          <div className="rd-basic-row"><span className="rd-key">现　居：</span><span>{profile.location}</span></div>
          <div className="rd-basic-row"><span className="rd-key">经　验：</span><span>{profile.years}</span></div>
        </div>
        {profile.onlineResume ? (
          <div className="rd-online">线上简历：{profile.onlineResume}</div>
        ) : null}

        {/* 自我介绍 */}
        <SectionTitle kind="intro" />
        <div className="rd-intro">
          <p><span className="rd-label">行业经验：</span>{profile.industry}</p>
          <div className="rd-label">专业能力：</div>
          <ul className="rd-highlights">
            {highlights.map((h, i) => <li key={i}>{h}</li>)}
          </ul>
          <p><span className="rd-label">自我描述：</span>{profile.summary}</p>
        </div>

        {/* 工作经历 */}
        <SectionTitle kind="work" />
        {workExperiences.map((w, i) => <WorkBlock key={w.id ?? i} work={w} />)}

        {/* 项目经历 */}
        <SectionTitle kind="project" />
        {projects.map((p, i) => <ProjectBlock key={p.projectId ?? i} project={p} />)}

        {/* 教育 */}
        <SectionTitle kind="education" />
        <div className="rd-edu-head">
          <span className="rd-edu-period">{education.period}</span>
          <span className="rd-edu-major">{education.major}</span>
          <span className="rd-edu-school">{education.school}</span>
        </div>
      </div>
    </div>
  );
}

export default ResumeDocument;
