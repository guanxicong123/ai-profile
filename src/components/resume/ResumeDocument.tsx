import React from "react";
import type { ResumeDocument as ResumeDocumentType, SkillCategory } from "@/lib/types";
import SectionTitle from "./SectionTitle";
import WorkBlock from "./WorkBlock";
import ProjectBlock from "./ProjectBlock";
import { RESUME_CSS } from "./resumeCss";

const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  frontend: "前端开发",
  backend: "后端",
  platforms: "平台&工具",
  engineering: "工程能力",
};

const SKILL_ORDER: SkillCategory[] = ["frontend", "backend", "platforms", "engineering"];

export function ResumeDocument(props: ResumeDocumentType) {
  const { profile, highlights, skills, workExperiences, projects, education } = props;
  return (
    <div className="rd-page">
      <style dangerouslySetInnerHTML={{ __html: RESUME_CSS }} />
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

        {/* 专业技能 */}
        <SectionTitle kind="skill" />
        <div className="rd-skills">
          {SKILL_ORDER.map((cat) => (
            <div className="rd-skills-row" key={cat}>
              <span className="rd-skills-cat">{SKILL_CATEGORY_LABELS[cat]}：</span>
              <span className="rd-skills-tags">
                {(skills[cat] || []).map((s, i) => (
                  <span className="rd-skills-tag" key={i}>{s}{i < (skills[cat] || []).length - 1 ? "、" : ""}</span>
                ))}
              </span>
            </div>
          ))}
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
