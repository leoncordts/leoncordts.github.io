import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MAC Vendor Lookup | Leon Cordts",
  description: "Identifiziere den Hardware-Hersteller anhand einer MAC-Adresse. 100% offline, lokale OUI-Datenbank.",
};

export default function MacVendorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
