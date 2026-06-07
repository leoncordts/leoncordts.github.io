import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Markdown Editor | Leon Cordts",
  description: "Markdown live schreiben und als HTML-Preview sehen — lokal im Browser.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
