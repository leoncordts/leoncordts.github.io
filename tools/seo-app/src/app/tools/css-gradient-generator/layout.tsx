import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "CSS Gradient Generator | Leon Cordts",
  description: "Visuelle CSS-Verläufe erstellen und als CSS-Code kopieren — lokal im Browser.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
