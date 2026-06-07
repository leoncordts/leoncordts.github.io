import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "WebP Konverter | Leon Cordts",
  description: "Bilder in WebP, PNG oder JPEG konvertieren — lokal im Browser, kein Upload.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
