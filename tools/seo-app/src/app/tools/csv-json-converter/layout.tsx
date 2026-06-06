import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSV ↔ JSON Konverter | Leon Cordts",
  description: "Konvertiere CSV zu JSON und zurück — lokal im Browser, kein Upload, kein Server.",
};

export default function CsvJsonLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
