"use client";
import { useState, useRef } from "react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
  .card { background: linear-gradient(135deg,#071422 0%,#050d1a 100%); border: 1px solid rgba(14,165,233,0.2); border-radius: 1rem; }
  .btn-record { border-radius: 50%; width: 96px; height: 96px; border: 3px solid rgba(239,68,68,0.5); background: rgba(239,68,68,0.15); color: #ef4444; font-size: 2.5rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
  .btn-record:hover { background: rgba(239,68,68,0.25); border-color: rgba(239,68,68,0.8); }
  .btn-record.recording { background: rgba(239,68,68,0.35); border-color: #ef4444; animation: pulse-ring 1.2s infinite; }
  .btn-stop { border-radius: 50%; width: 96px; height: 96px; border: 3px solid rgba(239,68,68,0.7); background: rgba(239,68,68,0.25); color: #ef4444; font-size: 2rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
  .btn-stop:hover { background: rgba(239,68,68,0.4); }
  .btn-dl { background: linear-gradient(135deg,rgba(14,165,233,0.3),rgba(0,212,255,0.15)); border: 1px solid rgba(14,165,233,0.5); color: #38bdf8; border-radius: 0.6rem; padding: 0.7rem 2rem; font-family: 'Syne',sans-serif; font-weight: 700; font-size: 0.95rem; cursor: pointer; transition: all 0.2s; }
  .btn-dl:hover { background: linear-gradient(135deg,rgba(14,165,233,0.45),rgba(0,212,255,0.25)); }
  .btn-discard { background: transparent; border: 1px solid rgba(239,68,68,0.3); color: #ef4444; border-radius: 0.6rem; padding: 0.7rem 1.5rem; font-family: 'Syne',sans-serif; font-weight: 700; font-size: 0.95rem; cursor: pointer; transition: all 0.2s; }
  .btn-discard:hover { background: rgba(239,68,68,0.1); }
  @keyframes pulse-ring { 0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); } 50% { box-shadow: 0 0 0 12px rgba(239,68,68,0); } }
  .timer { font-family: 'JetBrains Mono',monospace; font-size: 2.5rem; font-weight: 700; color: #e2e8f0; letter-spacing: 0.08em; }
  .wave { display: flex; align-items: flex-end; gap: 3px; height: 32px; }
  .wave span { width: 4px; border-radius: 2px; background: #ef4444; animation: wave-bar 0.8s ease-in-out infinite; }
  .wave span:nth-child(2) { animation-delay: 0.1s; }
  .wave span:nth-child(3) { animation-delay: 0.2s; }
  .wave span:nth-child(4) { animation-delay: 0.3s; }
  .wave span:nth-child(5) { animation-delay: 0.4s; }
  @keyframes wave-bar { 0%,100% { height: 6px; } 50% { height: 28px; } }
`;

function formatTime(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

export default function VoiceRecorderPage() {
  const [state, setState]       = useState<"idle" | "recording" | "done">("idle");
  const [seconds, setSeconds]   = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef   = useRef<Blob[]>([]);
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      recorderRef.current = rec;
      chunksRef.current   = [];
      setSeconds(0);

      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
        setState("done");
        stream.getTracks().forEach(t => t.stop());
      };

      rec.start(100);
      setState("recording");
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } catch {
      alert("Mikrofon-Zugriff verweigert. Bitte im Browser erlauben.");
    }
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current);
    recorderRef.current?.stop();
  }

  function discard() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setSeconds(0);
    setState("idle");
  }

  function download() {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href     = audioUrl;
    a.download = `aufnahme-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.webm`;
    a.click();
  }

  return (
    <div style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans',sans-serif", minHeight: "100vh" }}>
      <style>{S}</style>
      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>voice-recorder</span>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-6 py-12">
        <div className="mb-8 text-center">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Medien</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.6rem)", color: "#fff", marginBottom: "0.4rem" }}>Voice Recorder</h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Aufnahmen direkt im Browser — nichts verlässt dein Gerät.</p>
        </div>

        <div className="card p-8" style={{ textAlign: "center" }}>
          {/* Timer */}
          <div className="timer" style={{ marginBottom: "1.5rem" }}>
            {formatTime(seconds)}
          </div>

          {/* Wave animation while recording */}
          {state === "recording" && (
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
              <div className="wave">
                <span /><span /><span /><span /><span />
              </div>
            </div>
          )}

          {/* Main button */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
            {state === "idle" && (
              <button className="btn-record" onClick={startRecording} title="Aufnahme starten">
                🎙
              </button>
            )}
            {state === "recording" && (
              <button className="btn-stop" onClick={stopRecording} title="Aufnahme stoppen">
                ⏹
              </button>
            )}
            {state === "done" && (
              <div style={{ fontSize: "3rem", color: "#22c55e" }}>✓</div>
            )}
          </div>

          <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.75rem", color: "#475569", marginBottom: state === "done" ? "1.5rem" : 0 }}>
            {state === "idle"      && "Klicke auf das Mikrofon"}
            {state === "recording" && "Läuft… Klicke ⏹ zum Stoppen"}
            {state === "done"      && "Aufnahme abgeschlossen"}
          </p>

          {/* Done state: player + buttons */}
          {state === "done" && audioUrl && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <audio controls src={audioUrl} style={{ width: "100%", borderRadius: "0.5rem" }} />
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button className="btn-dl" style={{ flex: 1 }} onClick={download}>⬇ Herunterladen</button>
                <button className="btn-discard" onClick={discard}>✕ Löschen</button>
              </div>
            </div>
          )}
        </div>

        {/* Format info */}
        <p style={{ textAlign: "center", marginTop: "1.25rem", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#1e3a5f" }}>
          Format: WebM · Lokal · Kein Upload
        </p>
      </main>
    </div>
  );
}
