"use client";
import React from "react";
import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

export default function DownloadPdfButton({ id }: { id: string }) {
  return (
    <Button
      type="primary"
      icon={<DownloadOutlined />}
      size="large"
      href={`/api/generated/${id}/pdf`}
      target="_blank"
    >
      下载 PDF
    </Button>
  );
}
