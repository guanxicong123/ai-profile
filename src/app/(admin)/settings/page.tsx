"use client";
import React, { useEffect, useState } from "react";
import {
  Card, Form, Input, InputNumber, Button, Select, Space, message, Spin, Alert,
} from "antd";
import { SaveOutlined, ApiOutlined } from "@ant-design/icons";
import type { Settings } from "@/lib/types";
import { apiUrl } from "@/lib/client-base";

export default function SettingsPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/settings"));
      if (res.ok) {
        const data: Settings = await res.json();
        form.setFieldsValue({
          ...data.model,
          projectCount: data.projectCount,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onSave = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload: Settings = {
        model: {
          provider: values.provider,
          model: values.model,
          apiKey: values.apiKey,
          baseURL: values.baseURL || undefined,
          temperature: values.temperature,
        },
        projectCount: values.projectCount,
      };
      const res = await fetch(apiUrl("/api/settings"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) message.success("已保存");
      else message.error("保存失败");
    } finally {
      setSaving(false);
    }
  };

  const onTest = async () => {
    const values = await form.validateFields();
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(apiUrl("/api/settings/test"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: values.provider,
          model: values.model,
          apiKey: values.apiKey,
          baseURL: values.baseURL || undefined,
          temperature: values.temperature,
        }),
      });
      const data = await res.json();
      setTestResult(data);
    } finally {
      setTesting(false);
    }
  };

  if (loading) return <Card><Spin /></Card>;

  return (
    <Card title="模型与生成设置" style={{ maxWidth: 760 }}>
      <Form form={form} layout="vertical" initialValues={{ provider: "anthropic", projectCount: 5, temperature: 0.3 }}>
        <Form.Item name="provider" label="Provider" rules={[{ required: true }]}>
          <Select
            options={[
              { value: "anthropic", label: "Anthropic (Claude)" },
              { value: "openai", label: "OpenAI / 兼容端点（豆包等）" },
            ]}
          />
        </Form.Item>
        <Form.Item name="model" label="模型 ID" rules={[{ required: true }]}>
          <Input placeholder="claude-sonnet-5 / doubao-seed-1-6 / gpt-4o" />
        </Form.Item>
        <Form.Item name="apiKey" label="API Key" rules={[{ required: true }]}>
          <Input.Password placeholder="sk-..." />
        </Form.Item>
        <Form.Item name="baseURL" label="Base URL（OpenAI 兼容端点可填）">
          <Input placeholder="https://api.anthropic.com 或 https://ark.cn-beijing.volces.com/api/v3" />
        </Form.Item>
        <Form.Item name="temperature" label="Temperature">
          <InputNumber min={0} max={1} step={0.1} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="projectCount" label="默认入选项目数" rules={[{ required: true }]}>
          <InputNumber min={1} max={10} style={{ width: "100%" }} />
        </Form.Item>

        <Space>
          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={onSave}>保存</Button>
          <Button icon={<ApiOutlined />} loading={testing} onClick={onTest}>测试连接</Button>
        </Space>

        {testResult && (
          <Alert
            style={{ marginTop: 16 }}
            type={testResult.ok ? "success" : "error"}
            showIcon
            message={testResult.ok ? "连接成功" : "连接失败"}
            description={testResult.message}
          />
        )}
      </Form>
    </Card>
  );
}
