import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "MP4 zu MP3 — Audio aus Video extrahieren | Leon Cordts",
  description: "Tonspur aus Video-Dateien extrahieren — lokal im Browser mit FFmpeg.wasm, kein Upload.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
