import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF zu Bild Konverter | Leon Cordts",
  description: "PDF-Seiten in hochaufloesende JPG/PNG-Bilder umwandeln und als ZIP herunterladen. 100% lokal, kein Upload.",
};

export default function PdfToImageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
