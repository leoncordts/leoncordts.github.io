import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "XML → JSON Konverter | Leon Cordts",
  description: "Konvertiere XML-Code lokal in formatiertes JSON — kein Backend, kein Upload.",
};

export default function XmlJsonLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
