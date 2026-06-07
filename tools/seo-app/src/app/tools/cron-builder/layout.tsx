import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cron Expression Builder | Leon Cordts",
  description: "Cron-Ausdrücke visuell erstellen und erklären — mit Vorschau der nächsten Ausführungszeiten.",
};

export default function CronBuilderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
