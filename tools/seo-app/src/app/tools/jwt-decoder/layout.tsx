import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "JWT Decoder | Leon Cordts",
  description: "JSON Web Tokens dekodieren und prüfen — lokal im Browser, kein Upload.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
