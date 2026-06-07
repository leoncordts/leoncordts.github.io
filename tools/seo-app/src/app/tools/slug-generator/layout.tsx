import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Slug Generator | Leon Cordts",
  description: "Text in URL-freundliche Slugs umwandeln — lokal im Browser.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
