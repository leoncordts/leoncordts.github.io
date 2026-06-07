"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
  .card { background: linear-gradient(135deg,#071422 0%,#050d1a 100%); border: 1px solid rgba(14,165,233,0.2); border-radius: 1rem; }
  .mode-btn { border-radius: 0.5rem; padding: 0.5rem 1.2rem; font-family: 'JetBrains Mono',monospace; font-size: 0.72rem; cursor: pointer; border: 1px solid rgba(14,165,233,0.2); background: transparent; color: #64748b; transition: all 0.2s; white-space: nowrap; }
  .mode-btn.active { background: rgba(14,165,233,0.15); border-color: rgba(0,212,255,0.6); color: #38bdf8; }
  .timer-ring { transition: stroke-dashoffset 1s linear; }
  .ctrl-btn { border-radius: 0.6rem; padding: 0.75rem 2rem; font-family: 'Syne',sans-serif; font-weight: 700; font-size: 1rem; cursor: pointer; transition: all 0.2s; }
  .ctrl-start { background: linear-gradient(135deg,rgba(14,165,233,0.35),rgba(0,212,255,0.2)); border: 1px solid rgba(14,165,233,0.6); color: #38bdf8; }
  .ctrl-start:hover { background: linear-gradient(135deg,rgba(14,165,233,0.5),rgba(0,212,255,0.3)); }
  .ctrl-reset { background: transparent; border: 1px solid rgba(14,165,233,0.2); color: #475569; }
  .ctrl-reset:hover { border-color: rgba(239,68,68,0.35); color: #f87171; }
  .session-dot { width: 10px; height: 10px; border-radius: 50%; border: 1px solid rgba(14,165,233,0.3); transition: all 0.3s; }
  .session-dot.done { background: #38bdf8; border-color: #38bdf8; }
  .session-dot.active { background: rgba(56,189,248,0.4); border-color: #38bdf8; box-shadow: 0 0 6px rgba(56,189,248,0.4); }
`;

type Mode = "focus" | "short" | "long";
const MODES: { id: Mode; label: string; secs: number }[] = [
  { id: "focus", label: "Fokus (25)", secs: 25 * 60 },
  { id: "short", label: "Pause (5)",  secs: 5 * 60 },
  { id: "long",  label: "Lang (15)",  secs: 15 * 60 },
];

function pad(n: number) { return String(n).padStart(2, "0"); }

const RADIUS = 90;
const CIRC = 2 * Math.PI * RADIUS;

export default function PomodoroTimerPage() {
  const [mode, setMode] = useState<Mode>("focus");
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalSecs = MODES.find(m => m.id === mode)!.secs;

  const tick = useCallback(() => {
    setRemaining(prev => {
      if (prev <= 1) {
        setRunning(false);
        if (mode === "focus") setSessions(s => s + 1);
        return 0;
      }
      return prev - 1;
    });
  }, [mode]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, tick]);

  function switchMode(m: Mode) {
    setMode(m);
    setRunning(false);
    setRemaining(MODES.find(x => x.id === m)!.secs);
  }

  function reset() {
    setRunning(false);
    setRemaining(totalSecs);
  }

  const progress = remaining / totalSecs;
  const dashOffset = CIRC * (1 - progress);
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  const modeColor = mode === "focus" ? "#38bdf8" : mode === "short" ? "#4ade80" : "#c084fc";
  const sessionDots = Array.from({ length: Math.max(4, sessions + 1) }, (_, i) => i);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{S}</style>
      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>pomodoro-timer</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Produktivitat</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.8rem)", color: "#fff", marginBottom: "0.5rem" }}>Pomodoro Timer</h1>
          <p style={{ color: "#94a3b8" }}>Fokussiert arbeiten mit der Pomodoro-Technik - 25 Minuten Arbeit, 5 Minuten Pause.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", alignItems: "center" }}>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
            {MODES.map(m => (
              <button key={m.id} className={"mode-btn" + (mode === m.id ? " active" : "")} onClick={() => switchMode(m.id)}>{m.label}</button>
            ))}
          </div>

          <div className="card p-8" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem", width: "100%", maxWidth: "380px" }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="220" height="220" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="110" cy="110" r={RADIUS} fill="none" stroke="rgba(14,165,233,0.1)" strokeWidth="8" />
                <circle
                  className="timer-ring"
                  cx="110" cy="110" r={RADIUS}
                  fill="none"
                  stroke={modeColor}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={CIRC}
                  strokeDashoffset={dashOffset}
                  style={{ filter: "drop-shadow(0 0 8px " + modeColor + "60)" }}
                />
              </svg>
              <div style={{ position: "absolute", textAlign: "center" }}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "2.8rem", fontWeight: 700, color: "#fff", letterSpacing: "0.04em", lineHeight: 1 }}>{pad(mins)}:{pad(secs)}</div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#475569", marginTop: "0.4rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {mode === "focus" ? "Fokus" : mode === "short" ? "Kurze Pause" : "Lange Pause"}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button className="ctrl-btn ctrl-start" onClick={() => setRunning(r => !r)}>
                {running ? "Pause" : remaining === totalSecs ? "Start" : "Weiter"}
              </button>
              <button className="ctrl-btn ctrl-reset" onClick={reset}>Reset</button>
            </div>
          </div>

          <div className="card p-5" style={{ width: "100%", maxWidth: "380px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase" }}>Pomodoros</div>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.82rem", color: "#38bdf8" }}>{sessions} abgeschlossen</span>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {sessionDots.map(i => (
                <div key={i} className={"session-dot" + (i < sessions ? " done" : i === sessions && running && mode === "focus" ? " active" : "")} />
              ))}
            </div>
            {sessions > 0 && (
              <button onClick={() => setSessions(0)} style={{ marginTop: "0.75rem", background: "transparent", border: "none", color: "#475569", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.68rem", cursor: "pointer", padding: 0 }}>
                Zuruecksetzen
              </button>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
