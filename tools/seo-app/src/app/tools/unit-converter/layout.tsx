import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Einheitenrechner | Leon Cordts",
  description: "Temperatur, Länge, Gewicht, Volumen und Geschwindigkeit umrechnen — lokal im Browser.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
