import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Video zu GIF Konverter | Leon Cordts",
  description: "Videoclips lokal in GIF-Animationen umwandeln — FFmpeg.wasm, kein Upload, kein Server.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
