import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "PDF Verschlüsseln | Leon Cordts",
  description: "PDF mit Passwort schützen — lokal im Browser, kein Upload.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
