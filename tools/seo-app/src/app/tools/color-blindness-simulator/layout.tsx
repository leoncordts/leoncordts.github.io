import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Farbenblindheit Simulator | Leon Cordts",
  description: "Bilder durch die Augen farbenblinder Menschen sehen — Protanopie, Deuteranopie, Tritanopie und mehr. 100% lokal.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
