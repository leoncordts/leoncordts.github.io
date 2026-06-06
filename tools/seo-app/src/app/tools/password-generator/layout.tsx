import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Passwort-Generator | Leon Cordts",
  description: "Kryptografisch sichere Passwörter lokal im Browser generieren — mit crypto.getRandomValues(), kein Server.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
