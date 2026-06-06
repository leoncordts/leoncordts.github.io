import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HEX ↔ RGB Color Converter | Leon Cordts",
  description: "Wandle HEX-Farbcodes sofort in RGB(A) um und umgekehrt. Mit Live-Vorschau und Color-Picker. 100% lokal, kein Server.",
};

export default function ColorConverterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
