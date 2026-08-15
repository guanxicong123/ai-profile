"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Nav from "./Nav";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  if (pathname.startsWith("/preview")) {
    return <>{children}</>;
  }
  return <Nav>{children}</Nav>;
}
