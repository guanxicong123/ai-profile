"use client";
import React, { useState } from "react";
import {
  Card,
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  Row,
  Col,
  Tag,
  Table,
  Progress,
  message,
  Space,
  Divider,
  Empty,
  Spin,
} from "antd";
import { EyeOutlined, DownloadOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import type { GenerateResponse, ProjectScore } from "@/lib/types";
import { apiUrl } from "@/lib/client-base";

const { TextArea } = Input;

export default function WorkbenchPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const onGenerate = async () => {
    const values = await form.validateFields();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(apiUrl("/api/generate"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jdText: values.jdText,
          targetRole: values.targetRole || undefined,
          projectCount: values.projectCount ?? 5,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data: GenerateResponse = await res.json();
      setResult(data);
      setSelectedRowKeys(data.scores.slice(0, values.projectCount ?? 5).map((s) => s.projectId));
      message.success("简历已生成");
    } catch (e: any) {
      message.error("生成失败：" + (e?.message || "请确认后端服务已启动"));
    } finally {
      setLoading(false);
    }
  };

  const scoreColumns = [
    {
      title: "项目",
      dataIndex: "name",
      key: "name",
      render: (t: string, r: ProjectScore) => (
        <Space>
          <strong>{t}</strong>
          {r.matchedSkills.slice(0, 4).map((s) => (
            <Tag key={s} color="blue">{s}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: "评分",
      dataIndex: "score",
      key: "score",
      width: 200,
      render: (v: number) => (
        <Progress percent={v} size="small" strokeColor={v >= 70 ? "#4E67C8" : "#faad14"} />
      ),
    },
    { title: "匹配理由", dataIndex: "reason", key: "reason" },
  ];

  return (
    <div>
      <Card title={<Space><ThunderboltOutlined /> 生成工作台</Space>} style={{ marginBottom: 24 }}>
        <Form form={form} layout="vertical" initialValues={{ projectCount: 5 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="目标职位" name="targetRole">
                <Input placeholder="例如：高级前端 / 全栈工程师" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="项目数量" name="projectCount">
                <InputNumber min={1} max={10} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="模型（留空用设置默认）" name="model">
                <Select
                  allowClear
                  placeholder="默认"
                  options={[
                    { value: "claude-sonnet-5", label: "Claude Sonnet 5" },
                    { value: "claude-opus-5", label: "Claude Opus 5" },
                    { value: "gpt-4o", label: "GPT-4o" },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="粘贴 JD（职位描述）"
            name="jdText"
            rules={[{ required: true, message: "请输入 JD 文本" }]}
          >
            <TextArea rows={8} placeholder="把职位描述粘贴到这里..." />
          </Form.Item>
          <Button type="primary" size="large" loading={loading} onClick={onGenerate} icon={<ThunderboltOutlined />}>
            生成简历
          </Button>
        </Form>
      </Card>

      {loading ? (
        <Card><Spin description="AI 正在匹配并生成简历..." /></Card>
      ) : result ? (
        <>
          <Card title="JD 解析" style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col span={8}>
                <div style={{ color: "#888", marginBottom: 8 }}>必备技能</div>
                <Space wrap>{result.parsedJD.mustHaveSkills.map((s) => <Tag color="blue" key={s}>{s}</Tag>)}</Space>
              </Col>
              <Col span={8}>
                <div style={{ color: "#888", marginBottom: 8 }}>加分技能</div>
                <Space wrap>{result.parsedJD.niceToHaveSkills.map((s) => <Tag color="green" key={s}>{s}</Tag>)}</Space>
              </Col>
              <Col span={8}>
                <div style={{ color: "#888", marginBottom: 8 }}>职责关键词</div>
                <Space wrap>{result.parsedJD.responsibilities.map((s) => <Tag key={s}>{s}</Tag>)}</Space>
              </Col>
            </Row>
          </Card>

          <Card
            title="项目评分"
            style={{ marginBottom: 24 }}
            extra={
              <Space>
                <span style={{ color: "#888" }}>已选 {selectedRowKeys.length} 个项目</span>
                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  onClick={() => router.push(`/preview/${result.sessionId}`)}
                >
                  预览
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={() => window.open(apiUrl(`/api/generated/${result.sessionId}/pdf`))}
                >
                  下载 PDF
                </Button>
              </Space>
            }
          >
            <Table
              rowKey="projectId"
              columns={scoreColumns}
              dataSource={result.scores}
              pagination={false}
              rowSelection={{
                selectedRowKeys,
                onChange: setSelectedRowKeys,
              }}
            />
          </Card>

          <Card title="最终简历 · 项目列表">
            {result.document.projects.map((p, idx) => (
              <Card
                key={p.projectId}
                type="inner"
                title={
                  <Space>
                    <Tag color="blue">#{idx + 1}</Tag>
                    <strong>{p.name}</strong>
                    <span style={{ color: "#888", fontWeight: 400 }}>{p.role}</span>
                  </Space>
                }
                style={{ marginBottom: 12 }}
              >
                <p style={{ color: "#555" }}>{p.overview}</p>
                <Space wrap style={{ marginTop: 8 }}>
                  {p.stack.map((s) => <Tag key={s}>{s}</Tag>)}
                </Space>
                <Divider style={{ margin: "12px 0" }} />
                <div style={{ color: "#666" }}>
                  <div style={{ marginBottom: 6 }}><b>项目描述：</b></div>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {p.details.map((d, i) => <li key={i} style={{ marginBottom: 4 }}>{d}</li>)}
                  </ul>
                  <div style={{ margin: "8px 0 6px" }}><b>项目成绩：</b></div>
                  <ol style={{ margin: 0, paddingLeft: 20 }}>
                    {p.results.map((r, i) => <li key={i} style={{ marginBottom: 4 }}>{r}</li>)}
                  </ol>
                </div>
              </Card>
            ))}
          </Card>
        </>
      ) : (
        <Card><Empty description="粘贴 JD 后点击「生成简历」开始" /></Card>
      )}
    </div>
  );
}
