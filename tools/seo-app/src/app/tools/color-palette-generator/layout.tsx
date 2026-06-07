import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Color Palette Generator | Leon Cordts Tools",
  description: "Harmonische Farbpaletten aus einer Basisfarbe generieren – komplementär, triadisch, analog und mehr. Lokal im Browser.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
