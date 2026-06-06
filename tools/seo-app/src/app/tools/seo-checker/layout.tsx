import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kostenloser SEO-Checker | 25+ Prüfpunkte | leoncordts.de",
  description:
    "Analysiere deine Website mit über 25 SEO-Prüfpunkten kostenlos. Sofortiger PDF-Report — kein Account, kein Abo. Ein kostenloses Tool von Leon Cordts IT Solutions.",
};

export default function SeoCheckerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
