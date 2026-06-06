import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "SVG zu PNG Konverter | Leon Cordts",
  description: "SVG-Dateien direkt im Browser in PNG umwandeln — ohne Upload, ohne Server.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
