import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "./globals.css";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "AI Profile · 智能简历生成",
  description: "基于 JD 智能匹配项目并生成 A4 简历 PDF",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <AntdRegistry>
          <AdminShell>{children}</AdminShell>
        </AntdRegistry>
      </body>
    </html>
  );
}
