import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Offline QR-Code Scanner | Leon Cordts",
  description: "QR-Codes aus Bildern lokal im Browser auslesen — kein Upload, kein Server, 100% Offline.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
