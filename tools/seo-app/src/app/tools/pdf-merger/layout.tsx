import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "PDF Merger | Leon Cordts",
  description: "Mehrere PDFs lokal zusammenfügen — 100% im Browser, kein Upload, kein Server.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
