import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UUID Generator | Leon Cordts",
  description: "Generiere kryptografisch sichere UUIDs (v4) lokal im Browser — bulk-fähig, kein Server.",
};

export default function UuidGeneratorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
