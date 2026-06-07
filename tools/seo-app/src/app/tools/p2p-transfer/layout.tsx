import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "P2P Datei-Transfer | Leon Cordts",
  description: "Dateien direkt von Browser zu Browser senden — kein Upload, kein Server, WebRTC P2P.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
