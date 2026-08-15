import React from "react";
import type { ResumeProject } from "@/lib/types";

export default function ProjectBlock({ project }: { project: ResumeProject }) {
  return (
    <div className="rd-project-block">
      <div className="rd-project-head">
        <span className="rd-project-name">{project.name}</span>
        <span className="rd-project-role">{project.role}</span>
        <span className="rd-project-period">{project.period || ""}</span>
      </div>

      <p className="rd-line">
        <span className="rd-label">项目概要：</span>
        <span>{project.overview}</span>
      </p>

      <p className="rd-line">
        <span className="rd-label">项目技术栈描述：</span>
        <span>{project.stack.join("、")}</span>
      </p>

      <div className="rd-line">
        <span className="rd-label">项目描述：</span>
      </div>
      <ul className="rd-details">
        {project.details.map((d, i) => (
          <li key={i}>{d}</li>
        ))}
      </ul>

      <div className="rd-line">
        <span className="rd-label">项目成绩：</span>
      </div>
      <ol className="rd-results">
        {project.results.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ol>
    </div>
  );
}
