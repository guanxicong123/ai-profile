import React from "react";
import { mockResumeDocument } from "@/components/resume/mock";
import type { GeneratedResume } from "@/lib/types";
import PreviewClient from "./PreviewClient";

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

  return <PreviewClient id={id} initial={document} isMock={isMock} />;
}
