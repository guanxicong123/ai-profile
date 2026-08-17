"use client";
import React, { useEffect, useState } from "react";
import {
  Card, Table, Button, Space, Modal, Form, Input, message, Popconfirm,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { WorkExperience, WorkInput } from "@/lib/types";
import { apiUrl } from "@/lib/client-base";

const { TextArea } = Input;

function emptyWork(): WorkInput {
  return {
    company: "",
    role: "",
    period: "",
    duties: [""],
    achievements: [""],
    sort: 0,
  };
}

export default function WorkPage() {
  const [data, setData] = useState<WorkExperience[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<WorkExperience | null>(null);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/work"));
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onCreate = () => {
    setEditing(null);
    form.setFieldsValue(emptyWork());
    setOpen(true);
  };

  const onEdit = (r: WorkExperience) => {
    setEditing(r);
    form.setFieldsValue({
      ...r,
      duties: r.duties.length ? r.duties : [""],
      achievements: r.achievements.length ? r.achievements : [""],
    });
    setOpen(true);
  };

  const onDelete = async (id: number) => {
    const res = await fetch(apiUrl(`/api/work/${id}`), { method: "DELETE" });
    if (res.ok) { message.success("已删除"); load(); }
  };

  const onSubmit = async () => {
    const values = await form.validateFields();
    const payload: WorkInput = {
      ...values,
      duties: (values.duties || []).filter(Boolean),
      achievements: (values.achievements || []).filter(Boolean),
    };
    const url = editing ? `/api/work/${editing.id}` : "/api/work";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(apiUrl(url), {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      message.success(editing ? "已更新" : "已创建");
      setOpen(false);
      load();
    }
  };

  const columns = [
    { title: "时间", dataIndex: "period", key: "period", width: 180 },
    { title: "公司", dataIndex: "company", key: "company" },
    { title: "职位", dataIndex: "role", key: "role", width: 200 },
    {
      title: "操作", key: "action", width: 160,
      render: (_: any, r: WorkExperience) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(r)}>编辑</Button>
          <Popconfirm title="确认删除？" onConfirm={() => onDelete(r.id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="工作经历"
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>新增</Button>}
    >
      <Table rowKey="id" loading={loading} columns={columns} dataSource={data} pagination={false} />

      <Modal
        title={editing ? "编辑工作经历" : "新增工作经历"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
        width={760}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Space style={{ display: "flex" }}>
            <Form.Item name="company" label="公司" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Input />
            </Form.Item>
            <Form.Item name="role" label="职位" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Input />
            </Form.Item>
            <Form.Item name="period" label="时间" rules={[{ required: true }]} style={{ width: 200 }}>
              <Input placeholder="2023.03-2025.10" />
            </Form.Item>
          </Space>
          <Form.List name="duties">
            {(fields, { add, remove }) => (
              <Form.Item label="职责">
                {fields.map((f) => (
                  <Space key={f.key} style={{ display: "flex", marginBottom: 8 }} align="baseline">
                    <Form.Item {...f} noStyle><TextArea rows={2} style={{ width: 640 }} /></Form.Item>
                    <Button danger onClick={() => remove(f.name)}>删除</Button>
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} block>添加职责</Button>
              </Form.Item>
            )}
          </Form.List>
          <Form.List name="achievements">
            {(fields, { add, remove }) => (
              <Form.Item label="工作业绩">
                {fields.map((f) => (
                  <Space key={f.key} style={{ display: "flex", marginBottom: 8 }} align="baseline">
                    <Form.Item {...f} noStyle><Input style={{ width: 640 }} /></Form.Item>
                    <Button danger onClick={() => remove(f.name)}>删除</Button>
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} block>添加业绩</Button>
              </Form.Item>
            )}
          </Form.List>
        </Form>
      </Modal>
    </Card>
  );
}
