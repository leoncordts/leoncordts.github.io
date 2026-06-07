import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Text Diff | Leon Cordts",
  description: "Zwei Texte vergleichen und Unterschiede farblich hervorheben — lokal im Browser.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
