"use client";
import React, { useEffect, useState } from "react";
import { Card, Form, Input, Button, message, Spin } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import type { Education } from "@/lib/types";
import { apiUrl } from "@/lib/client-base";

export default function EducationPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/education"));
      if (res.ok) {
        const data: Education = await res.json();
        form.setFieldsValue(data);
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
      const res = await fetch(apiUrl("/api/education"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (res.ok) message.success("已保存");
      else message.error("保存失败");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Card><Spin /></Card>;

  return (
    <Card title="教育背景" extra={<Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={onSave}>保存</Button>}>
      <Form form={form} layout="vertical" style={{ maxWidth: 600 }}>
        <Form.Item name="school" label="学校" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name="major" label="专业" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name="period" label="时间" rules={[{ required: true }]}>
          <Input placeholder="2016.09 — 2020.07" />
        </Form.Item>
      </Form>
    </Card>
  );
}
