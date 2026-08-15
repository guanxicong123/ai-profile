import React from "react";
import ResumeDocument from "@/components/resume/ResumeDocument";
import DownloadPdfButton from "@/components/resume/DownloadPdfButton";
import { mockResumeDocument } from "@/components/resume/mock";
import type { GeneratedResume } from "@/lib/types";

export const dynamic = "force-dynamic";

async function fetchDocument(id: string): Promise<GeneratedResume | null> {
  if (id === "demo") return null;
  try {
    const base =
      process.env.NEXTAUTH_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      "http://localhost:3000";
    const res = await fetch(`${base}/api/generated/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as GeneratedResume;
  } catch {
    return null;
  }
}

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const generated = await fetchDocument(id);
  const document = generated?.document ?? mockResumeDocument;
  const isMock = !generated;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#e9ecf3",
        padding: "32px 0",
      }}
    >
      <div
        style={{
          maxWidth: "960px",
          margin: "0 auto 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 24px",
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 600, color: "#2f2f2f" }}>
          简历预览
          {isMock ? (
            <span style={{ marginLeft: 12, color: "#999", fontSize: 13 }}>
              （演示数据，后端未返回该 ID）
            </span>
          ) : null}
        </div>
        {!isMock ? <DownloadPdfButton id={id} /> : null}
      </div>
      <div
        style={{
          width: "210mm",
          margin: "0 auto",
          boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
          background: "#fff",
        }}
      >
        <ResumeDocument {...document} />
      </div>
    </div>
  );
}
