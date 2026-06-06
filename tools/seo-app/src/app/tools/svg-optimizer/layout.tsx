import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "SVG Optimizer | Leon Cordts",
  description: "SVG-Dateien lokal optimieren und verkleinern — überflüssige Attribute und Kommentare entfernen, kein Upload.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
