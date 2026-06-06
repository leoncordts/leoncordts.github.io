import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Text-zu-Sprache Konverter | Leon Cordts",
  description: "Text vorlesen lassen mit nativen Browser-Stimmen — Geschwindigkeit, Tonhöhe und Stimme wählbar, 100% lokal.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
