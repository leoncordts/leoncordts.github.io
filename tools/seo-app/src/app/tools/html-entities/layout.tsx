import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "HTML Entities Referenz | Leon Cordts",
  description: "HTML-Sonderzeichen und Entities nachschlagen, kodieren und dekodieren — lokal im Browser.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
