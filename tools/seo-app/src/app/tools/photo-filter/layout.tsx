import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Foto Filter | Leon Cordts",
  description: "Fotos mit Filtern bearbeiten — Helligkeit, Kontrast, Sättigung, Unschärfe — lokal im Browser.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
