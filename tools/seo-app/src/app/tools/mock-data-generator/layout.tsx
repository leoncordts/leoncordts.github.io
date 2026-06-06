import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mock Data Generator | Leon Cordts",
  description: "Generiere tausende realistische Testdaten (Namen, E-Mails, UUIDs) als JSON oder CSV. Lokal, kein API-Request.",
};

export default function MockDataLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
