import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "PDF Wasserzeichen | Leon Cordts",
  description: "Text-Wasserzeichen auf jede PDF-Seite setzen — lokal im Browser, kein Upload.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
