import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Regex Tester | Leon Cordts",
  description: "Reguläre Ausdrücke live testen mit Treffern, Gruppen und Replace — lokal im Browser.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
