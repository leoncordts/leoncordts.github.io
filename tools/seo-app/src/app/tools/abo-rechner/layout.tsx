import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Abo-Spar-Rechner | Leon Cordts",
  description:
    "Berechne dein Einsparpotenzial bei Netflix, Spotify, YouTube Premium und Adobe CC. Smarte Hacks für bis zu 80% Ersparnis pro Jahr.",
};

export default function AboRechnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
