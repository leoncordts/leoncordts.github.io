import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audio Trimmer | Leon Cordts",
  description: "Audio-Dateien (MP3, WAV, M4A) direkt im Browser zuschneiden. Mit Wellenform-Vorschau und sofortigem WAV-Download. Kein Upload.",
};

export default function AudioTrimmerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
