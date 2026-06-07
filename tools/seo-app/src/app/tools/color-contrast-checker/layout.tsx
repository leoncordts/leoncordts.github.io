import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Kontrast Checker (WCAG) | Leon Cordts",
  description: "Farbkontraste nach WCAG 2.1 prüfen — AA und AAA Compliance sofort berechnen. 100% lokal im Browser.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
