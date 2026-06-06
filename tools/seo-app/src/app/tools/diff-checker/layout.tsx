import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Text Diff Checker | Leon Cordts",
  description: "Vergleiche zwei Texte und sieh sofort die Unterschiede — lokal im Browser, kein Upload.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
