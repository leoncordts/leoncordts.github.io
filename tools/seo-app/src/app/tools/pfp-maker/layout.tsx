import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "PFP Maker | Leon Cordts",
  description: "Profilbild zuschneiden und als PNG herunterladen — lokal im Browser.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
