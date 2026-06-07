import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "QR-Code Creator Pro | Leon Cordts",
  description: "QR-Code mit eigenen Farben und Logo erstellen — lokal im Browser, kein Upload.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
