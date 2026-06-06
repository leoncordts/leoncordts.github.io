import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "IP & System Scanner | Leon Cordts",
  description: "Deine öffentliche IP-Adresse, Browser-Infos und Systemdaten auf einen Blick — kein Tracking, kein Account.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
