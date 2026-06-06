import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Windows God-Mode & Bloatware-Killer | Leon Cordts",
  description: "PowerShell-Skript-Generator für Windows 10/11: Bloatware entfernen, Telemetrie deaktivieren, PC optimieren.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
