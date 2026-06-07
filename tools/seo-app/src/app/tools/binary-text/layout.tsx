import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Binär Konverter | Leon Cordts",
  description: "Text in Binär, Hex und umgekehrt umwandeln — lokal im Browser, kein Upload.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
