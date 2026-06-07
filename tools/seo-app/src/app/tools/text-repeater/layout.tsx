import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Text Repeater | Leon Cordts",
  description: "Text beliebig oft wiederholen mit wählbarem Trennzeichen — lokal im Browser.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
