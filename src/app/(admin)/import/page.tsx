"use client";
import React, { useState } from "react";
import {
  Card, Upload, Button, Table, message, Space, Alert, Result, Tag,
} from "antd";
import { InboxOutlined, ImportOutlined } from "@ant-design/icons";
import type { ProjectInput } from "@/lib/types";

const { Dragger } = Upload;

type Row = ProjectInput & { _key: string };

export default function ImportPage() {
  const [parsing, setParsing] = useState(false);
  const [projects, setProjects] = useState<Row[]>([]);
  const [selected, setSelected] = useState<React.Key[]>([]);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);

  const props = {
    name: "file",
    multiple: false,
    accept: ".pdf,.docx,.doc,.md,.markdown",
    beforeUpload: async (file: File) => {
      const lower = file.name.toLowerCase();
      if (
        !lower.endsWith(".pdf") &&
        !lower.endsWith(".docx") &&
        !lower.endsWith(".doc") &&
        !lower.endsWith(".md") &&
        !lower.endsWith(".markdown")
      ) {
        message.error("仅支持 PDF、Word（.docx）或 Markdown（.md）文档");
        return false;
      }
      setParsing(true);
      setProjects([]);
      setDone(false);
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/import", { method: "POST", body: fd });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        const list: Row[] = (data.projects || []).map((p: ProjectInput, i: number) => ({
          ...p, _key: `${Date.now()}-${i}`,
        }));
        setProjects(list);
        setSelected(list.map((p) => p._key));
        message.success(`已解析出 ${list.length} 个项目`);
      } catch (e: any) {
        message.error("解析失败：" + (e?.message || "请确认后端服务"));
      } finally {
        setParsing(false);
      }
      return false;
    },
    showUploadList: false,
  };

  const importSelected = async () => {
    setImporting(true);
    try {
      for (const key of selected) {
        const row = projects.find((p) => p._key === key);
        if (!row) continue;
        const { _key, ...payload } = row;
        await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      message.success(`已导入 ${selected.length} 个项目`);
      setDone(true);
    } finally {
      setImporting(false);
    }
  };

  const columns = [
    { title: "项目名", dataIndex: "name", key: "name", render: (t: string) => <strong>{t}</strong> },
    { title: "角色", dataIndex: "role", key: "role", width: 180 },
    { title: "时间", dataIndex: "period", key: "period", width: 140 },
    { title: "技术栈", dataIndex: "stack", key: "stack", width: 240,
      render: (s: string[]) => <Space wrap size={4}>{(s || []).slice(0, 4).map((x) => <Tag key={x}>{x}</Tag>)}</Space> },
    { title: "概要", dataIndex: "overview", key: "overview", ellipsis: true },
  ];

  return (
    <Card title="AI 导入 · 简历项目抽取">
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="上传旧简历或项目经验文档（PDF / Word .docx / Markdown .md），后端通过 LLM 抽取项目经历，预览后勾选入库。旧版 .doc 请先另存为 .docx。"
      />
      <Dragger {...props} disabled={parsing} style={{ marginBottom: 16 }}>
        <p className="ant-upload-drag-icon"><InboxOutlined /></p>
        <p className="ant-upload-text">点击或拖拽 PDF / Word / Markdown 到此区域上传</p>
      </Dragger>

      {projects.length > 0 && (
        <>
          <Table
            rowKey="_key"
            columns={columns}
            dataSource={projects}
            pagination={false}
            rowSelection={{
              selectedRowKeys: selected,
              onChange: setSelected,
            }}
          />
          <Space style={{ marginTop: 16 }}>
            <Button
              type="primary"
              icon={<ImportOutlined />}
              loading={importing}
              onClick={importSelected}
              disabled={selected.length === 0}
            >
              导入选中的 {selected.length} 个项目
            </Button>
          </Space>
        </>
      )}

      {done && (
        <Result
          status="success"
          title="导入完成"
          subTitle="可在「项目经验」中查看或继续编辑。"
          style={{ marginTop: 16 }}
        />
      )}
    </Card>
  );
}
