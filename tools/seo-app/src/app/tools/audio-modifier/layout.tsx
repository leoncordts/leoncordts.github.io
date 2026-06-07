import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Audio Speed & Pitch Changer | Leon Cordts",
  description: "Audios beschleunigen, verlangsamen oder Tonhöhe ändern — direkt im Browser, kein Upload nötig.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
