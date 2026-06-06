import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://leoncordts.github.io";

export const metadata: Metadata = {
  title: {
    default: "leoncordts.de · IT Tools",
    template: "%s | leoncordts.de",
  },
  description: "Kostenlose IT-Tools von Leon Cordts IT Solutions.",
  icons: {
    icon: [
      { url: `${SITE_URL}/favicon-16x16.png`, sizes: "16x16", type: "image/png" },
      { url: `${SITE_URL}/favicon-32x32.png`, sizes: "32x32", type: "image/png" },
      { url: `${SITE_URL}/favicon.ico` },
    ],
    apple: `${SITE_URL}/apple-touch-icon.png`,
    other: [
      { rel: "android-chrome-192x192", url: `${SITE_URL}/android-chrome-192x192.png` },
      { rel: "android-chrome-512x512", url: `${SITE_URL}/android-chrome-512x512.png` },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
