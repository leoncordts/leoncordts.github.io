import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Prozentrechner | Leon Cordts",
  description: "Alle Prozent-Formeln auf einen Blick — schnell, lokal, kein Server.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
