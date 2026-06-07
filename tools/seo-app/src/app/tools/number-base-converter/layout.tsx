import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zahlensystem Konverter | Leon Cordts",
  description: "Zahlen zwischen Binär, Oktal, Dezimal und Hexadezimal umrechnen — lokal, sofort.",
};

export default function NumberBaseConverterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
