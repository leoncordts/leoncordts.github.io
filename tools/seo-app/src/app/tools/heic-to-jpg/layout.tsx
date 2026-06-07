import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HEIC zu JPG Konverter | Leon Cordts",
  description: "iPhone HEIC/HEIF Fotos kostenlos zu JPG oder PNG konvertieren. 100% lokal im Browser, kein Server-Upload.",
};

export default function HeicToJpgLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
