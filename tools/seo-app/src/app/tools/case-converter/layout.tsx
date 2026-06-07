import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Text Case Converter | Leon Cordts",
  description: "Text zwischen GROSS, klein, Title Case und camelCase umwandeln — sofort, lokal.",
};

export default function CaseConverterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
