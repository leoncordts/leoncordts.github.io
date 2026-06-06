import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "List Randomizer & Shuffler | Leon Cordts",
  description: "Mische Namen, Gewinnspiel-Teilnehmer oder Datenlisten kryptografisch zufällig — mit Fisher-Yates Algorithmus. 100% lokal.",
};

export default function ListShufflerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
