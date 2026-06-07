import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Passwort-Stärke Tester | Leon Cordts",
  description: "Passwortstärke analysieren – Entropie, Muster, Empfehlungen – lokal im Browser.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
