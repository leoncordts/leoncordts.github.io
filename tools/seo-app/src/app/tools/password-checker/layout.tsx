import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Enterprise Password Auditor | Leon Cordts",
  description: "Professioneller Passwort-Sicherheits-Check: Entropie, Brute-Force-Zeiten, HaveIBeenPwned-Abgleich und Compliance (BSI/NIST).",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
