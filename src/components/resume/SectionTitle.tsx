import React from "react";

export type SectionKind = "intro" | "work" | "project" | "education";

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
};

const LABELS: Record<SectionKind, { zh: string; en: string }> = {
  intro: { zh: "自我介绍", en: "Introduce" },
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
