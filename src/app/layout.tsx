import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 出书 SaaS",
  description: "AI-assisted book planning, writing, analysis, and export workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full bg-zinc-100 text-zinc-950">{children}</body>
    </html>
  );
}
