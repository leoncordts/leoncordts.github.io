import type { Metadata } from "next";
import ToolsCatalog from "./ToolsCatalog";

export const metadata: Metadata = {
  title: "Kostenlose Online Tools | leoncordts.de",
  description:
    "85+ kostenlose Browser-Tools für Developer und Designer — kein Account, kein Tracking. SEO, Bilder, PDFs, Code, Farben und mehr.",
};

export default function ToolsPage() {
  return <ToolsCatalog />;
}
