import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Voice Recorder | Leon Cordts",
  description: "Audioaufnahmen direkt im Browser — kein Upload, kein Account.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
