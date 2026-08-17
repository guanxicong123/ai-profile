"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, Space, Tag, message, Modal } from "antd";
import {
  EditOutlined,
  DownloadOutlined,
  RollbackOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import type { ResumeDocument as ResumeDocumentType } from "@/lib/types";
import { apiUrl } from "@/lib/client-base";
import ResumeDocument from "@/components/resume/ResumeDocument";
import EditableResumeDocument from "@/components/resume/EditableResumeDocument";

interface Props {
  id: string;
  initial: ResumeDocumentType;
  isMock: boolean;
}

function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

export default function PreviewClient({ id, initial, isMock }: Props) {
  const router = useRouter();
  const [doc, setDoc] = useState<ResumeDocumentType>(() => deepClone(initial));
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pdfVersion, setPdfVersion] = useState<number>(() => Date.now());
  const initialRef = useRef<ResumeDocumentType>(deepClone(initial));

  // 服务端 initial 变化时同步（如刷新页面）
  useEffect(() => {
    initialRef.current = deepClone(initial);
    setDoc(deepClone(initial));
  }, [initial]);

  const dirty = editing && JSON.stringify(doc) !== JSON.stringify(initialRef.current);

  // 未保存时拦截刷新/关闭
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const enterEdit = () => {
    setEditing(true);
  };

  const cancelEdit = () => {
    if (dirty) {
      Modal.confirm({
        title: "放弃未保存的改动？",
        content: "当前编辑内容将被丢弃，恢复到上次保存的版本。",
        okText: "放弃改动",
        okButtonProps: { danger: true },
        cancelText: "继续编辑",
        onOk: () => {
          setDoc(deepClone(initialRef.current));
          setEditing(false);
        },
      });
    } else {
      setEditing(false);
    }
  };

  const save = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch(apiUrl(`/api/generated/${id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document: doc }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `HTTP ${res.status}`);
      }
      message.success("已保存");
      initialRef.current = deepClone(doc);
      setEditing(false);
      setPdfVersion(Date.now());
    } catch (e: any) {
      message.error("保存失败：" + (e?.message || "请确认后端服务"));
    } finally {
      setSaving(false);
    }
  }, [doc, id]);

  return (
    <div style={{ minHeight: "100vh", background: "#e9ecf3", padding: "0 0 40px" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "#fff",
          borderBottom: "1px solid #eee",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            maxWidth: "210mm",
            margin: "0 auto",
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 600, color: "#2f2f2f" }}>
            简历预览
            {isMock ? (
              <span style={{ marginLeft: 10, color: "#999", fontSize: 13, fontWeight: 400 }}>
                （演示数据，不可编辑）
              </span>
            ) : null}
            {dirty ? (
              <Tag color="orange" style={{ marginLeft: 10 }}>未保存</Tag>
            ) : null}
          </div>
          <Space>
            {editing ? (
              <>
                <Button
                  icon={<SaveOutlined />}
                  type="primary"
                  loading={saving}
                  onClick={save}
                >
                  保存
                </Button>
                <Button icon={<CloseOutlined />} onClick={cancelEdit} disabled={saving}>
                  取消
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={enterEdit}
                  disabled={isMock}
                  title={isMock ? "演示数据不可编辑" : ""}
                >
                  编辑简历
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={() =>
                    window.open(apiUrl(`/api/generated/${id}/pdf?t=${pdfVersion}`))
                  }
                  disabled={isMock}
                >
                  下载 PDF
                </Button>
                <Button icon={<RollbackOutlined />} onClick={() => router.push("/")}>
                  返回工作台
                </Button>
              </>
            )}
          </Space>
        </div>
      </div>

      <div style={{ paddingTop: 24 }}>
        <div
          style={{
            width: "210mm",
            margin: "0 auto",
            boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
            background: "#fff",
          }}
        >
          {editing ? (
            <EditableResumeDocument value={doc} onChange={setDoc} />
          ) : (
            <ResumeDocument {...doc} />
          )}
        </div>
      </div>
    </div>
  );
}
