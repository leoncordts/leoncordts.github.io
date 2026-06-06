import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "PC Bottleneck Checker | Leon Cordts",
  description: "Prüfe ob deine CPU oder GPU der Flaschenhals ist — kostenlos, ohne Anmeldung, sofort.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
