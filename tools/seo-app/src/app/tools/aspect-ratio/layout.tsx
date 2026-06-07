import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Seitenverhältnis Rechner | Leon Cordts",
  description: "Seitenverhältnisse berechnen und für responsive Design, Videos und Bilder umrechnen — lokal.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
