import React from "react";
import type { WorkExperience } from "@/lib/types";

export default function WorkBlock({ work }: { work: WorkExperience }) {
  return (
    <div className="rd-work-block">
      <div className="rd-work-head">
        <span className="rd-work-period">{work.period}</span>
        <span className="rd-work-company">{work.company}</span>
        <span className="rd-work-role">{work.role}</span>
      </div>
      <ol className="rd-duties">
        {work.duties.map((d, i) => (
          <li key={i}>{d}</li>
        ))}
      </ol>
      {work.achievements.length > 0 && (
        <>
          <div className="rd-achieve-label">工作业绩：</div>
          <ul className="rd-achievements">
            {work.achievements.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
