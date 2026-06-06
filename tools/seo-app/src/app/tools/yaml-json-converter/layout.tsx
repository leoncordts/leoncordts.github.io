import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "YAML ↔ JSON Konverter | Leon Cordts",
  description: "Konvertiere YAML zu JSON und umgekehrt — blitzschnell, lokal im Browser, kein Server-Upload.",
};

export default function YamlJsonLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
