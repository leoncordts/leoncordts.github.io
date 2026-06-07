import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Rotator | Leon Cordts",
  description: "PDF-Seiten lokal drehen — einzeln oder alle auf einmal, kein Upload, kein Server.",
};

export default function PdfRotatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
