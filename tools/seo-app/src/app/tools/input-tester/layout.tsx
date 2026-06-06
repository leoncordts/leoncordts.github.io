import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Tastatur & Gamepad Diagnostiker | Leon Cordts",
  description: "Teste jede Taste deiner Tastatur oder deinen Controller — live im Browser, kein Software-Download.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
