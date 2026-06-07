import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Morsecode Konverter | Leon Cordts",
  description: "Text in Morsecode umwandeln und zurück — mit Audio-Wiedergabe. 100% lokal im Browser.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
