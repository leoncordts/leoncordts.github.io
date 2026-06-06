import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "CIDR & Subnet-Kalkulator | Leon Cordts",
  description: "Berechne Netzwerkadresse, Broadcast, Host-Range und Anzahl Hosts aus IP + CIDR — 100% lokal.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
