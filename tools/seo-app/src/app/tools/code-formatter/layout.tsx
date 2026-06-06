import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON & Code Formatter | Leon Cordts",
  description: "Formatiere und validiere JSON in Echtzeit. Mit Syntax-Highlighting, Fehleranzeige und Kopieren-Button. 100% lokal.",
};

export default function CodeFormatterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
