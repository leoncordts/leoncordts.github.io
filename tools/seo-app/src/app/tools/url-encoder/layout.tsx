import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "URL & HTML Encoder | Leon Cordts",
  description: "Text URL-kodieren, HTML-kodieren oder dekodieren — lokal im Browser.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
