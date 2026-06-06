import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zeichen- & Wortzähler | Leon Cordts",
  description: "Echtzeit-Textanalyse: Wörter, Zeichen, Sätze, Lesezeit und Keyword-Dichte — lokal im Browser, kein Server.",
};

export default function WordCounterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
