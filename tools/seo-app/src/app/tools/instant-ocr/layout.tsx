import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Sofort OCR — Bild zu Text | Leon Cordts",
  description: "Screenshot einfügen und sofort den Text extrahieren — 100% lokal, kein Upload, Tesseract.js.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
