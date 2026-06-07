import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pomodoro Timer | Leon Cordts",
  description: "Fokus-Timer mit 25/5/15-Minuten-Pomodoro-Technik — lokal, keine Daten, kein Login.",
};

export default function PomodoroTimerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
