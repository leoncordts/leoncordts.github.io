"use client";
import { useState, useEffect, useRef } from "react";

function fisherYates(arr: string[]): string[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export default function ListShufflerPage() {
  const [input, setInput] = useState("Alice\nBob\nCharlie\nDiana\nEvan\nFiona");
  const [output, setOutput] = useState("");
  const [animating, setAnimating] = useState(false);
  const [copied, setCopied] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const items = input.split("\n").filter((l) => l.trim() !== "");

  function shuffle() {
    if (animating) return;
    setAnimating(true);
    const shuffled = fisherYates(items);
    let frame = 0;
    const totalFrames = 8;

    intervalRef.current = setInterval(() => {
      frame++;
      const noise = shuffled.map((item) => {
        if (frame >= totalFrames) return item;
        const ratio = frame / totalFrames;
        return item
          .split("")
          .map((c, i) => (Math.random() > ratio || i > item.length * ratio ? CHARS[Math.floor(Math.random() * CHARS.length)] : c))
          .join("");
      });
      setOutput(noise.join("\n"));

      if (frame >= totalFrames) {
        clearInterval(intervalRef.current!);
        setOutput(shuffled.join("\n"));
        setAnimating(false);
      }
    }, 60);
  }

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  function copyResult() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
        .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
        .card { background: linear-gradient(135deg,#071422 0%,#050d1a 100%); border: 1px solid rgba(14,165,233,0.2); border-radius: 1rem; }
        textarea { background: rgba(7,20,34,0.8); border: 1px solid rgba(14,165,233,0.2); border-radius: 0.5rem; color: #e2e8f0; padding: 1rem; font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; width: 100%; outline: none; resize: vertical; transition: border-color 0.2s; line-height: 1.7; }
        textarea:focus { border-color: rgba(0,212,255,0.4); }
        .shuffle-btn { background: linear-gradient(135deg,rgba(14,165,233,0.3),rgba(0,212,255,0.15)); border: 1px solid rgba(14,165,233,0.4); color: #38bdf8; border-radius: 0.6rem; padding: 0.8rem 1.5rem; font-family: 'Syne',sans-serif; font-weight: 700; font-size: 1rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem; }
        .shuffle-btn:hover:not(:disabled) { background: linear-gradient(135deg,rgba(14,165,233,0.5),rgba(0,212,255,0.25)); box-shadow: 0 0 30px rgba(0,212,255,0.3); }
        .shuffle-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .copy-btn { background: rgba(14,165,233,0.15); border: 1px solid rgba(14,165,233,0.3); color: #38bdf8; border-radius: 0.4rem; padding: 0.4rem 0.9rem; font-size: 0.75rem; font-family: 'JetBrains Mono',monospace; cursor: pointer; transition: all 0.2s; }
        .copy-btn:hover { background: rgba(14,165,233,0.3); }
        .copy-btn.success { background: rgba(34,197,94,0.2); border-color: rgba(34,197,94,0.4); color: #4ade80; }
        .matrix-text { color: #00d4ff; font-family: 'JetBrains Mono',monospace; }
      `}</style>

      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>list-shuffler</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
            Text & Produktivität
          </div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.8rem)", color: "#fff", marginBottom: "0.5rem" }}>
            List Randomizer & Shuffler
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1rem" }}>Mische Listen kryptografisch zufällig — Fisher-Yates Algorithmus, kein Server.</p>
        </div>

        {/* Status */}
        <div className="mb-4" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem", color: "#64748b" }}>
            {items.length} {items.length === 1 ? "Element" : "Elemente"} erkannt
          </span>
        </div>

        {/* Main grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "1.5rem", alignItems: "start" }}>
          {/* Input */}
          <div className="card p-6">
            <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>
              Eingabe — ein Eintrag pro Zeile
            </label>
            <textarea
              rows={14}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={"Alice\nBob\nCharlie\n..."}
            />
          </div>

          {/* Shuffle button */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: "2.5rem", gap: "0.5rem" }}>
            <button className="shuffle-btn" onClick={shuffle} disabled={animating || items.length < 2}>
              <span style={{ fontSize: "1.2rem" }}>🎲</span>
              {animating ? "Mische…" : "Mischen"}
            </button>
          </div>

          {/* Output */}
          <div className="card p-6">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Ergebnis
              </label>
              {output && (
                <button className={`copy-btn ${copied ? "success" : ""}`} onClick={copyResult}>
                  {copied ? "✓ Kopiert" : "Kopieren"}
                </button>
              )}
            </div>
            <textarea
              rows={14}
              readOnly
              value={output}
              placeholder="Klicke auf 'Mischen'…"
              className={animating ? "matrix-text" : ""}
              style={{ cursor: "default" }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
