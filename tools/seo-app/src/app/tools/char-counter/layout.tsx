import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zeichen & Wörter Zähler | Leon Cordts",
  description: "Zeichen, Wörter, Sätze und Lesezeit zählen — mit Zeichenfrequenz-Analyse, lokal und sofort.",
};

export default function CharCounterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
