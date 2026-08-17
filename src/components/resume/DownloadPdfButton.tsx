"use client";
import React from "react";
import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { apiUrl } from "@/lib/client-base";

export default function DownloadPdfButton({ id }: { id: string }) {
  return (
    <Button
      type="primary"
      icon={<DownloadOutlined />}
      size="large"
      href={apiUrl(`/api/generated/${id}/pdf`)}
      target="_blank"
    >
      下载 PDF
    </Button>
  );
}
