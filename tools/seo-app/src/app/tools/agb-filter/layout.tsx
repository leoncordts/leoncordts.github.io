import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "AGB & Cookie-Bullshit-Filter | Leon Cordts",
  description: "Nutzungsbedingungen auf Kostenfallen, Datenweitergabe und Rechtsverzicht prüfen — 100% lokal, kein Upload.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
