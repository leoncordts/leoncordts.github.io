import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Zahlensystem Konverter | Leon Cordts",
  description: "Dezimal, Hexadezimal, Binär und Oktal umrechnen — lokal im Browser.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
