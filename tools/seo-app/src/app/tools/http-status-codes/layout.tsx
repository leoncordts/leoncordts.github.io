import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HTTP Status Codes Referenz | Leon Cordts",
  description: "Alle HTTP-Statuscodes mit Erklärung, Verwendungszweck und Beispielen — durchsuchbar und offline.",
};

export default function HttpStatusCodesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
