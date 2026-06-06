import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "ASCII Art Generator | Leon Cordts",
  description: "Text in große ASCII-Blockbuchstaben umwandeln — verschiedene Schriftarten, 100% lokal.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
