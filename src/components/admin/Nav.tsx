"use client";
import React, { useState } from "react";
import { Layout, Menu } from "antd";
import {
  RobotOutlined,
  FolderOpenOutlined,
  SolutionOutlined,
  IdcardOutlined,
  ToolOutlined,
  ReadOutlined,
  ImportOutlined,
  HistoryOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";

const { Sider, Header, Content } = Layout;

const ITEMS = [
  { key: "/", icon: <RobotOutlined />, label: "生成工作台" },
  { key: "/projects", icon: <FolderOpenOutlined />, label: "项目经验" },
  { key: "/work", icon: <SolutionOutlined />, label: "工作经历" },
  { key: "/profile", icon: <IdcardOutlined />, label: "基本信息" },
  { key: "/skills", icon: <ToolOutlined />, label: "技能" },
  { key: "/education", icon: <ReadOutlined />, label: "教育" },
  { key: "/import", icon: <ImportOutlined />, label: "AI 导入" },
  { key: "/history", icon: <HistoryOutlined />, label: "历史" },
  { key: "/settings", icon: <SettingOutlined />, label: "设置" },
];

export default function Nav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const selected =
    ITEMS.find((i) => i.key !== "/" && pathname.startsWith(i.key))?.key ||
    (pathname === "/" ? "/" : "/");

  return (
    <Layout className="admin-layout">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className="admin-sider"
        width={220}
      >
        <div className="admin-logo">{collapsed ? "AI" : "AI Profile"}</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selected]}
          items={ITEMS}
          onClick={({ key }) => router.push(key)}
        />
      </Sider>
      <Layout>
        <Header className="admin-header">
          <div style={{ fontWeight: 600 }}>
            {ITEMS.find((i) => i.key === selected)?.label}
          </div>
          <div style={{ color: "#999", fontSize: 12 }}>
            AI 驱动的个性化简历生成
          </div>
        </Header>
        <Content className="admin-content">{children}</Content>
      </Layout>
    </Layout>
  );
}
