"use client";
import React, { useEffect, useState } from "react";
import { Card, Table, Button, Space, Popconfirm, message, Tag } from "antd";
import { EyeOutlined, DownloadOutlined, DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import type { GeneratedResume } from "@/lib/types";

export default function HistoryPage() {
  const router = useRouter();
  const [data, setData] = useState<GeneratedResume[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/generated");
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const del = async (id: number) => {
    const res = await fetch(`/api/generated/${id}`, { method: "DELETE" });
    if (res.ok) { message.success("已删除"); load(); }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "目标职位", dataIndex: "targetRole", key: "targetRole",
      render: (t: string | null) => t ? <Tag color="blue">{t}</Tag> : <span style={{ color: "#aaa" }}>—</span> },
    {
      title: "项目数",
      key: "count",
      width: 100,
      render: (_: any, r: GeneratedResume) => r.document?.projects?.length ?? 0,
    },
    {
      title: "生成时间", dataIndex: "createdAt", key: "createdAt", width: 200,
      render: (t: string) => new Date(t).toLocaleString("zh-CN"),
    },
    {
      title: "操作", key: "action", width: 260,
      render: (_: any, r: GeneratedResume) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => router.push(`/preview/${r.id}`)}>预览</Button>
          <Button size="small" icon={<DownloadOutlined />} onClick={() => window.open(`/api/generated/${r.id}/pdf`)}>PDF</Button>
          <Popconfirm title="确认删除？" onConfirm={() => del(r.id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="生成历史"
      extra={<Button icon={<ReloadOutlined />} onClick={load}>刷新</Button>}
    >
      <Table rowKey="id" loading={loading} columns={columns} dataSource={data} pagination={{ pageSize: 10 }} />
    </Card>
  );
}
