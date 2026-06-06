import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Base64 ↔ Bild Decoder | Leon Cordts",
  description: "Dekodiere Base64-Strings zu Bildern und enkodiere Bilder zu Base64 — lokal im Browser.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
