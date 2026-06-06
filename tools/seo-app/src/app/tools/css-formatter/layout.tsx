import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSS Minifier & Formatter | Leon Cordts",
  description: "CSS komprimieren (Minify) oder lesbar machen (Beautify) — rein lokal per Regex, kein Server-Upload.",
};

export default function CssFormatterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
