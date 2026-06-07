import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hash Generator | Leon Cordts",
  description: "SHA-256 / SHA-1 Hash von Text oder Datei generieren — lokal, kein Upload.",
};

export default function HashGeneratorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
