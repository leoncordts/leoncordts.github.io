import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON Validator & Linter | Leon Cordts",
  description: "Prüfe und formatiere JSON lokal im Browser — mit Syntaxfehler-Erkennung. Kein Backend, kein Upload.",
};

export default function JsonValidatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
