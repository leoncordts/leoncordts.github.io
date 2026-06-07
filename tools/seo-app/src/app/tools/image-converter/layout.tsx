import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Bild Format Konverter (WebP/PNG/JPG) | Leon Cordts",
  description: "WebP, PNG, JPG sofort konvertieren — 100% lokal, kein Upload, kein Server.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
