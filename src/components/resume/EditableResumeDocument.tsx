"use client";
import React from "react";
import { Input, Select, Button, Popconfirm, Tooltip } from "antd";
import {
  PlusOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type {
  ResumeDocument as ResumeDocumentType,
  SkillCategory,
  ResumeProject,
  WorkExperience,
} from "@/lib/types";
import SectionTitle from "./SectionTitle";
import { RESUME_CSS } from "./resumeCss";

const { TextArea } = Input;

const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  frontend: "前端开发",
  backend: "后端",
  platforms: "平台&工具",
  engineering: "工程能力",
};
const SKILL_ORDER: SkillCategory[] = ["frontend", "backend", "platforms", "engineering"];

interface Props {
  value: ResumeDocumentType;
  onChange: (doc: ResumeDocumentType) => void;
}

/* ---------------- 受控输入控件 ---------------- */

function TextInput({
  value,
  onChange,
  style,
}: {
  value: string;
  onChange: (v: string) => void;
  style?: React.CSSProperties;
}) {
  return (
    <Input
      variant="borderless"
      className="rd-edit"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={style}
    />
  );
}

function AreaInput({
  value,
  onChange,
  minRows = 1,
}: {
  value: string;
  onChange: (v: string) => void;
  minRows?: number;
}) {
  return (
    <TextArea
      variant="borderless"
      className="rd-edit"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoSize={{ minRows, maxRows: 20 }}
    />
  );
}

function TagsInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <Select
      mode="tags"
      variant="borderless"
      className="rd-edit"
      style={{ width: "100%" }}
      value={value}
      onChange={(v) => onChange(v as string[])}
      tokenSeparators={[",", "，", "、"]}
      open={false}
      suffixIcon={null}
      removeIcon
    />
  );
}

/* ---------------- 数组编辑器 ---------------- */

type ArrayEditorProps = {
  items: string[];
  onChange: (items: string[]) => void;
  multiline?: boolean;
  addText?: string;
};

function ArrayEditor({ items, onChange, multiline, addText = "添加" }: ArrayEditorProps) {
  const update = (i: number, v: string) => {
    const next = [...items];
    next[i] = v;
    onChange(next);
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    onChange(next);
  };

  return (
    <>
      {items.map((text, i) => (
        <li className="rd-array-row" key={i}>
          <span className="rd-array-main">
            {multiline ? (
              <AreaInput value={text} onChange={(v) => update(i, v)} minRows={1} />
            ) : (
              <TextInput value={text} onChange={(v) => update(i, v)} />
            )}
          </span>
          <span className="rd-array-ctrl">
            <Tooltip title="上移">
              <Button
                size="small"
                type="text"
                icon={<ArrowUpOutlined />}
                disabled={i === 0}
                onClick={() => move(i, i - 1)}
              />
            </Tooltip>
            <Tooltip title="下移">
              <Button
                size="small"
                type="text"
                icon={<ArrowDownOutlined />}
                disabled={i === items.length - 1}
                onClick={() => move(i, i + 1)}
              />
            </Tooltip>
            <Tooltip title="删除">
              <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => remove(i)} />
            </Tooltip>
          </span>
        </li>
      ))}
      <li className="rd-array-add">
        <Button
          type="link"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => onChange([...items, ""])}
        >
          {addText}
        </Button>
      </li>
    </>
  );
}

/* ---------------- 主组件 ---------------- */

export default function EditableResumeDocument({ value, onChange }: Props) {
  const doc = value;

  const patchProfile = (patch: Partial<typeof doc.profile>) =>
    onChange({ ...doc, profile: { ...doc.profile, ...patch } });

  const patchHighlight = (items: string[]) => onChange({ ...doc, highlights: items });

  const patchSkills = (cat: SkillCategory, items: string[]) =>
    onChange({ ...doc, skills: { ...doc.skills, [cat]: items } });

  const patchEducation = (patch: Partial<typeof doc.education>) =>
    onChange({ ...doc, education: { ...doc.education, ...patch } });

  /* 工作经历 */
  const patchWork = (idx: number, patch: Partial<WorkExperience>) => {
    const next = doc.workExperiences.map((w, i) => (i === idx ? { ...w, ...patch } : w));
    onChange({ ...doc, workExperiences: next });
  };
  const patchWorkArray = (
    idx: number,
    field: "duties" | "achievements",
    items: string[]
  ) => patchWork(idx, { [field]: items } as Partial<WorkExperience>);

  /* 项目 */
  const patchProject = (idx: number, patch: Partial<ResumeProject>) => {
    const next = doc.projects.map((p, i) => (i === idx ? { ...p, ...patch } : p));
    onChange({ ...doc, projects: next });
  };
  const moveProject = (from: number, to: number) => {
    if (to < 0 || to >= doc.projects.length) return;
    const next = [...doc.projects];
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    onChange({ ...doc, projects: next });
  };
  const removeProject = (idx: number) => {
    onChange({ ...doc, projects: doc.projects.filter((_, i) => i !== idx) });
  };

  return (
    <div className="rd-page rd-editing">
      <style dangerouslySetInnerHTML={{ __html: RESUME_CSS }} />
      <div className="rd-deco-circle" />

      <div className="rd-content">
        {/* 基本信息 */}
        <h1 className="rd-basic-title">基本信息</h1>
        <div className="rd-basic-grid">
          <div className="rd-basic-row">
            <span className="rd-key">姓　名：</span>
            <TextInput value={doc.profile.name} onChange={(v) => patchProfile({ name: v })} />
          </div>
          <div className="rd-basic-row">
            <span className="rd-key">出生年月：</span>
            <TextInput value={doc.profile.birth} onChange={(v) => patchProfile({ birth: v })} />
          </div>
          <div className="rd-basic-row">
            <span className="rd-key">电　话：</span>
            <TextInput value={doc.profile.phone} onChange={(v) => patchProfile({ phone: v })} />
          </div>
          <div className="rd-basic-row">
            <span className="rd-key">邮　箱：</span>
            <TextInput value={doc.profile.email} onChange={(v) => patchProfile({ email: v })} />
          </div>
          <div className="rd-basic-row">
            <span className="rd-key">现　居：</span>
            <TextInput value={doc.profile.location} onChange={(v) => patchProfile({ location: v })} />
          </div>
          <div className="rd-basic-row">
            <span className="rd-key">经　验：</span>
            <TextInput value={doc.profile.years} onChange={(v) => patchProfile({ years: v })} />
          </div>
        </div>
        <div className="rd-online">
          线上简历：
          <TextInput
            value={doc.profile.onlineResume || ""}
            onChange={(v) => patchProfile({ onlineResume: v })}
          />
        </div>

        {/* 自我介绍 */}
        <SectionTitle kind="intro" />
        <div className="rd-intro">
          <p>
            <span className="rd-label">行业经验：</span>
            <AreaInput
              value={doc.profile.industry}
              onChange={(v) => patchProfile({ industry: v })}
              minRows={2}
            />
          </p>
          <div className="rd-label">专业能力：</div>
          <ul className="rd-highlights">
            <ArrayEditor items={doc.highlights} onChange={patchHighlight} multiline addText="添加亮点" />
          </ul>
          <p>
            <span className="rd-label">自我描述：</span>
            <AreaInput
              value={doc.profile.summary}
              onChange={(v) => patchProfile({ summary: v })}
              minRows={2}
            />
          </p>
        </div>

        {/* 专业技能 */}
        <SectionTitle kind="skill" />
        <div className="rd-skills">
          {SKILL_ORDER.map((cat) => (
            <div className="rd-skills-row" key={cat}>
              <span className="rd-skills-cat">{SKILL_CATEGORY_LABELS[cat]}：</span>
              <span className="rd-skills-tags" style={{ flex: 1 }}>
                <TagsInput
                  value={doc.skills[cat] || []}
                  onChange={(v) => patchSkills(cat, v)}
                />
              </span>
            </div>
          ))}
        </div>

        {/* 工作经历 */}
        <SectionTitle kind="work" />
        {doc.workExperiences.map((w, wi) => (
          <div className="rd-work-block" key={w.id ?? wi}>
            <div className="rd-work-head">
              <span className="rd-work-period">
                <TextInput value={w.period} onChange={(v) => patchWork(wi, { period: v })} />
              </span>
              <span className="rd-work-company">
                <TextInput value={w.company} onChange={(v) => patchWork(wi, { company: v })} />
              </span>
              <span className="rd-work-role">
                <TextInput value={w.role} onChange={(v) => patchWork(wi, { role: v })} />
              </span>
            </div>
            <ol className="rd-duties">
              <ArrayEditor
                items={w.duties}
                onChange={(items) => patchWorkArray(wi, "duties", items)}
                multiline
                addText="添加职责"
              />
            </ol>
            <div className="rd-achieve-label">工作业绩：</div>
            <ul className="rd-achievements">
              <ArrayEditor
                items={w.achievements}
                onChange={(items) => patchWorkArray(wi, "achievements", items)}
                addText="添加业绩"
              />
            </ul>
          </div>
        ))}

        {/* 项目经历 */}
        <SectionTitle kind="project" />
        {doc.projects.map((p, pi) => (
          <div className="rd-project-block" key={p.projectId ?? pi}>
            <div className="rd-block-toolbar">
              <Tooltip title="上移项目">
                <Button
                  size="small"
                  type="text"
                  icon={<ArrowUpOutlined />}
                  disabled={pi === 0}
                  onClick={() => moveProject(pi, pi - 1)}
                />
              </Tooltip>
              <Tooltip title="下移项目">
                <Button
                  size="small"
                  type="text"
                  icon={<ArrowDownOutlined />}
                  disabled={pi === doc.projects.length - 1}
                  onClick={() => moveProject(pi, pi + 1)}
                />
              </Tooltip>
              <Popconfirm
                title="删除该项目？"
                description="删除后不可恢复（保存后生效）"
                onConfirm={() => removeProject(pi)}
                okText="删除"
                cancelText="取消"
                okButtonProps={{ danger: true }}
              >
                <Button size="small" type="text" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </div>

            <div className="rd-project-head">
              <span className="rd-project-name">
                <TextInput value={p.name} onChange={(v) => patchProject(pi, { name: v })} />
              </span>
              <span className="rd-project-role">
                <TextInput value={p.role} onChange={(v) => patchProject(pi, { role: v })} />
              </span>
              <span className="rd-project-period">
                <TextInput
                  value={p.period || ""}
                  onChange={(v) => patchProject(pi, { period: v })}
                />
              </span>
            </div>

            <p className="rd-line">
              <span className="rd-label">项目概要：</span>
              <AreaInput value={p.overview} onChange={(v) => patchProject(pi, { overview: v })} minRows={2} />
            </p>
            <p className="rd-line">
              <span className="rd-label">项目技术栈描述：</span>
              <TagsInput value={p.stack} onChange={(v) => patchProject(pi, { stack: v })} />
            </p>
            <div className="rd-line"><span className="rd-label">项目描述：</span></div>
            <ul className="rd-details">
              <ArrayEditor
                items={p.details}
                onChange={(items) => patchProject(pi, { details: items })}
                multiline
                addText="添加描述"
              />
            </ul>
            <div className="rd-line"><span className="rd-label">项目成绩：</span></div>
            <ol className="rd-results">
              <ArrayEditor
                items={p.results}
                onChange={(items) => patchProject(pi, { results: items })}
                multiline
                addText="添加成绩"
              />
            </ol>
          </div>
        ))}

        {/* 教育 */}
        <SectionTitle kind="education" />
        <div className="rd-edu-head">
          <span className="rd-edu-period">
            <TextInput value={doc.education.period} onChange={(v) => patchEducation({ period: v })} />
          </span>
          <span className="rd-edu-major">
            <TextInput value={doc.education.major} onChange={(v) => patchEducation({ major: v })} />
          </span>
          <span className="rd-edu-school">
            <TextInput value={doc.education.school} onChange={(v) => patchEducation({ school: v })} />
          </span>
        </div>
      </div>
    </div>
  );
}
