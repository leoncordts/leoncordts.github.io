import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unix Timestamp Konverter | Leon Cordts",
  description: "Unix-Timestamps in Datum/Zeit umrechnen und zurück — lokal, live, alle Zeitzonen.",
};

export default function TimestampConverterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
