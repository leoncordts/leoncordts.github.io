import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Favicon Generator | Leon Cordts",
  description: "Erstelle Favicons in allen wichtigen Größen (16x16, 32x32, 192x192, 512x512) aus einem PNG. 100% lokal, kein Upload.",
};

export default function FaviconGeneratorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
