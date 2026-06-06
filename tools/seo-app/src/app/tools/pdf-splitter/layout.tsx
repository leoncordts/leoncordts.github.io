import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "PDF Splitter | Leon Cordts",
  description: "PDF-Seiten einzeln extrahieren oder in Bereiche aufteilen — 100% lokal, kein Upload.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
