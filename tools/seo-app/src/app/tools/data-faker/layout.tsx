import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Data Faker | Leon Cordts",
  description: "Strukturierte Fake-Daten für Tests generieren – JSON, CSV, SQL — lokal im Browser.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
