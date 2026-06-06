import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Speichergrößen-Konverter | Leon Cordts",
  description: "Konvertiere zwischen KB, MB, GB, TB und KiB, MiB, GiB, TiB in Echtzeit — reines JavaScript, kein Server.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
