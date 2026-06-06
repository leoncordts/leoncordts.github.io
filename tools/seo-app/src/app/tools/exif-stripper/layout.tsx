import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "EXIF-Metadaten-Radierer | Leon Cordts",
  description: "GPS- und Kameradaten sicher aus Fotos löschen — 100% lokal im Browser, kein Upload.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
