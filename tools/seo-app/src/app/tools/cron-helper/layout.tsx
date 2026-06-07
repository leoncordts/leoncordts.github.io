import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Cron Helper | Leon Cordts",
  description: "Cron-Ausdrücke verstehen, bauen und als Klartext lesen — lokal im Browser.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
