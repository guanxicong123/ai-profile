"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Switch,
  Select,
  message,
  Popconfirm,
  Tag,
  Row,
  Col,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import type { Project, ProjectInput } from "@/lib/types";

const { TextArea } = Input;

function emptyProject(): ProjectInput {
  return {
    name: "",
    role: "",
    period: "",
    stack: [],
    overview: "",
    details: [""],
    results: [""],
    tags: [],
    domain: "",
    archived: false,
  };
}

export default function ProjectsPage() {
  const [data, setData] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [domain, setDomain] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (domain) params.set("domain", domain);
      params.set("archived", "false");
      const res = await fetch(`/api/projects?${params.toString()}`);
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCreate = () => {
    setEditing(null);
    form.setFieldsValue(emptyProject());
    setOpen(true);
  };

  const onEdit = (record: Project) => {
    setEditing(record);
    form.setFieldsValue({
      name: record.name,
      role: record.role,
      period: record.period || "",
      stack: record.stack,
      overview: record.overview,
      details: record.details.length ? record.details : [""],
      results: record.results.length ? record.results : [""],
      tags: record.tags,
      domain: record.domain || "",
      archived: record.archived,
    });
    setOpen(true);
  };

  const onDelete = async (id: number) => {
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (res.ok) {
      message.success("已删除");
      load();
    } else {
      message.error("删除失败");
    }
  };

  const onSubmit = async () => {
    const values = await form.validateFields();
    const payload: ProjectInput = {
      ...values,
      period: values.period || null,
      details: (values.details || []).filter(Boolean),
      results: (values.results || []).filter(Boolean),
    };
    const url = editing ? `/api/projects/${editing.id}` : "/api/projects";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      message.success(editing ? "已更新" : "已创建");
      setOpen(false);
      load();
    } else {
      message.error("保存失败");
    }
  };

  const columns = [
    { title: "项目名", dataIndex: "name", key: "name", render: (t: string) => <strong>{t}</strong> },
    { title: "角色", dataIndex: "role", key: "role", width: 180 },
    { title: "时间", dataIndex: "period", key: "period", width: 140 },
    { title: "领域", dataIndex: "domain", key: "domain", width: 160 },
    {
      title: "标签",
      dataIndex: "tags",
      key: "tags",
      render: (tags: string[]) => (
        <Space wrap size={[4, 4]}>{tags?.slice(0, 6).map((t) => <Tag key={t}>{t}</Tag>)}</Space>
      ),
    },
    {
      title: "操作",
      key: "action",
      width: 160,
      render: (_: any, r: Project) => (
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
      title="项目经验"
      extra={
        <Space>
          <Input
            placeholder="搜索项目名 / 标签"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onPressEnter={load}
            style={{ width: 220 }}
            prefix={<SearchOutlined />}
          />
          <Input
            placeholder="业务领域"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onPressEnter={load}
            style={{ width: 180 }}
          />
          <Button onClick={load}>筛选</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>新增项目</Button>
        </Space>
      }
    >
      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editing ? "编辑项目" : "新增项目"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
        width={820}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}><Form.Item name="name" label="项目名" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={6}><Form.Item name="role" label="角色"><Input /></Form.Item></Col>
            <Col span={6}><Form.Item name="period" label="时间"><Input placeholder="2025.03-2025.09" /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="domain" label="业务领域"><Input /></Form.Item></Col>
            <Col span={12}>
              <Form.Item name="archived" label="归档" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="stack" label="技术栈（回车添加）">
            <Select mode="tags" placeholder="输入后回车" />
          </Form.Item>
          <Form.Item name="tags" label="标签（用于 JD 匹配）">
            <Select mode="tags" placeholder="输入后回车" />
          </Form.Item>
          <Form.Item name="overview" label="项目概要" rules={[{ required: true }]}>
            <TextArea rows={2} />
          </Form.Item>
          <Form.List name="details">
            {(fields, { add, remove }) => (
              <Form.Item label="项目描述">
                {fields.map((f) => (
                  <Space key={f.key} style={{ display: "flex", marginBottom: 8 }} align="baseline">
                    <Form.Item {...f} noStyle><TextArea rows={2} style={{ width: 680 }} /></Form.Item>
                    <Button danger onClick={() => remove(f.name)}>删除</Button>
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} block>添加一条描述</Button>
              </Form.Item>
            )}
          </Form.List>
          <Form.List name="results">
            {(fields, { add, remove }) => (
              <Form.Item label="项目成绩">
                {fields.map((f) => (
                  <Space key={f.key} style={{ display: "flex", marginBottom: 8 }} align="baseline">
                    <Form.Item {...f} noStyle><Input style={{ width: 680 }} /></Form.Item>
                    <Button danger onClick={() => remove(f.name)}>删除</Button>
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} block>添加一条成绩</Button>
              </Form.Item>
            )}
          </Form.List>
        </Form>
      </Modal>
    </Card>
  );
}
