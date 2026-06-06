import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Markdown → HTML Renderer | Leon Cordts",
  description: "Echtzeit Markdown-zu-HTML Konvertierung im Browser — live Vorschau und HTML-Code-Ansicht, 100% lokal.",
};

export default function MarkdownHtmlLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
