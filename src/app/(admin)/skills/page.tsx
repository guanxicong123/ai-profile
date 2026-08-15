"use client";
import React, { useEffect, useState } from "react";
import { Card, Tabs, Input, Button, Space, message, Popconfirm, Spin } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import type { Skill, SkillCategory } from "@/lib/types";

const CATEGORIES: { key: SkillCategory; label: string }[] = [
  { key: "frontend", label: "前端" },
  { key: "backend", label: "后端" },
  { key: "platforms", label: "平台 / 端" },
  { key: "engineering", label: "工程化" },
];

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState<SkillCategory>("frontend");
  const [newContent, setNewContent] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/skills");
      if (res.ok) setSkills(await res.json());
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!newContent.trim()) return;
    const res = await fetch("/api/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: active, content: newContent.trim() }),
    });
    if (res.ok) {
      message.success("已添加");
      setNewContent("");
      load();
    }
  };

  const remove = async (id: number) => {
    const res = await fetch(`/api/skills/${id}`, { method: "DELETE" });
    if (res.ok) { message.success("已删除"); load(); }
  };

  return (
    <Card title="技能">
      <Spin spinning={loading}>
        <Tabs
          activeKey={active}
          onChange={(k) => setActive(k as SkillCategory)}
          items={CATEGORIES.map((c) => {
            const list = skills.filter((s) => s.category === c.key);
            return {
              key: c.key,
              label: `${c.label} (${list.length})`,
              children: (
                <div>
                  <Space style={{ marginBottom: 12 }}>
                    <Input
                      placeholder="输入技能，回车添加"
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      onPressEnter={add}
                      style={{ width: 360 }}
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={add}>添加</Button>
                  </Space>
                  <div
                    style={{
                      border: "1px solid #f0f0f0",
                      borderRadius: 6,
                      background: "#fff",
                    }}
                  >
                    {list.length === 0 ? (
                      <div style={{ padding: "12px 16px", color: "#bbb" }}>暂无技能</div>
                    ) : (
                      list.map((item, idx) => (
                        <div
                          key={item.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px 16px",
                            borderTop: idx === 0 ? "none" : "1px solid #f0f0f0",
                          }}
                        >
                          <span>{item.content}</span>
                          <Popconfirm title="删除该技能？" onConfirm={() => remove(item.id)}>
                            <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
                          </Popconfirm>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ),
            };
          })}
        />
      </Spin>
    </Card>
  );
}
