import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Smart Home Kompatibilitäts-Checker | Leon Cordts",
  description: "Prüfe ob dein neues Smart-Home-Gerät mit deiner Zentrale kompatibel ist — kostenlos, sofort.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
