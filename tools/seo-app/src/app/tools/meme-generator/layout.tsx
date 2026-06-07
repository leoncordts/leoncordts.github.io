import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Meme Generator | Leon Cordts",
  description: "Erstelle Memes mit eigenem Bild und Text — lokal im Browser, kein Upload.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
