import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Farbpaletten Generator | Leon Cordts",
  description: "Farbpaletten aus einer Grundfarbe generieren — komplementär, triadisch, analog — lokal.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
