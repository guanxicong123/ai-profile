"use client";
import React, { useEffect, useState } from "react";
import { Card, Form, Input, Button, message, Spin } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import type { Profile } from "@/lib/types";

const { TextArea } = Input;

export default function ProfilePage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data: Profile = await res.json();
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
      const res = await fetch("/api/profile", {
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
    <Card title="基本信息" extra={<Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={onSave}>保存</Button>}>
      <Form form={form} layout="vertical" style={{ maxWidth: 720 }}>
        <Form.Item name="name" label="姓名" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name="title" label="职位"><Input /></Form.Item>
        <Form.Item name="birth" label="出生年月"><Input placeholder="1998.02" /></Form.Item>
        <Form.Item name="phone" label="电话"><Input /></Form.Item>
        <Form.Item name="email" label="邮箱"><Input /></Form.Item>
        <Form.Item name="location" label="现居"><Input /></Form.Item>
        <Form.Item name="years" label="经验"><Input /></Form.Item>
        <Form.Item name="photoPath" label="头像路径（可选）"><Input /></Form.Item>
        <Form.Item name="onlineResume" label="线上简历链接"><Input /></Form.Item>
        <Form.Item name="tagline" label="一句话标签"><Input /></Form.Item>
        <Form.Item name="industry" label="行业经验" rules={[{ required: true }]}>
          <TextArea rows={3} />
        </Form.Item>
        <Form.Item name="summary" label="自我描述" rules={[{ required: true }]}>
          <TextArea rows={4} />
        </Form.Item>
      </Form>
    </Card>
  );
}
