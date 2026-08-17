import React from "react";

export type SectionKind = "intro" | "skill" | "work" | "project" | "education";

const ICONS: Record<SectionKind, React.ReactNode> = {
  intro: (
    // 毕业帽 / 用户
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10L12 5 2 10l10 5 10-5z" />
      <path d="M6 12v5c0 1 3 3 6 3s6-2 6-3v-5" />
    </svg>
  ),
  work: (
    // 公文包
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M2 13h20" />
    </svg>
  ),
  project: (
    // 代码 / 文件夹
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  education: (
    // 学士帽
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10L12 5 2 10l10 5 10-5z" />
      <path d="M6 12v5c0 1 3 3 6 3s6-2 6-3v-5" />
      <path d="M22 10v6" />
    </svg>
  ),
  skill: (
    // 齿轮 / 星
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
};

const LABELS: Record<SectionKind, { zh: string; en: string }> = {
  intro: { zh: "自我介绍", en: "Introduce" },
  skill: { zh: "专业技能", en: "Skills" },
  work: { zh: "工作经历", en: "Experience" },
  project: { zh: "项目经历", en: "Experience" },
  education: { zh: "教育背景", en: "Education" },
};

export default function SectionTitle({ kind }: { kind: SectionKind }) {
  const { zh, en } = LABELS[kind];
  return (
    <div className="rd-section-title">
      <span className="rd-section-icon">
        <span className="rd-section-icon-circle">{ICONS[kind]}</span>
      </span>
      <span className="rd-section-zh">{zh}</span>
      <span className="rd-section-en">{en}</span>
      <span className="rd-section-line">
        <span className="rd-section-line-blue" />
        <span className="rd-section-line-gray" />
      </span>
    </div>
  );
}
