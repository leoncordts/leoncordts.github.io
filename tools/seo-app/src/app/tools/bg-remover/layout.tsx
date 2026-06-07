import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "KI Hintergrund entfernen | Leon Cordts",
  description: "Hintergrund aus Fotos lokal per KI entfernen — kein Upload, kein API-Key, 100% im Browser.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
