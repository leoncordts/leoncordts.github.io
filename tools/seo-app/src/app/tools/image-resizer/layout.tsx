import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Bild Verkleinern | Leon Cordts",
  description: "Bilder auf exakte Maße skalieren — lokal im Browser, kein Upload.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
