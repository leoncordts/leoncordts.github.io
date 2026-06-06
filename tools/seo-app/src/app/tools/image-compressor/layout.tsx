import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Bild-Kompressor | Leon Cordts",
  description: "JPG und PNG lokal komprimieren — TinyPNG-Klon ohne Upload, kein Server, 100% im Browser.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
