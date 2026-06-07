import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Lorem Ipsum Generator | Leon Cordts",
  description: "Placeholder-Text sofort generieren — Wörter, Sätze oder Absätze, lokal im Browser.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
