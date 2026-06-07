"use client";
import { useState } from "react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
  .card { background: linear-gradient(135deg,#071422 0%,#050d1a 100%); border: 1px solid rgba(14,165,233,0.2); border-radius: 1rem; }
  .enc-textarea { background: rgba(7,20,34,0.8); border: 1px solid rgba(14,165,233,0.2); border-radius: 0.5rem; color: #e2e8f0; padding: 0.65rem 0.9rem; font-family: 'JetBrains Mono',monospace; font-size: 0.85rem; width: 100%; outline: none; resize: vertical; min-height: 90px; transition: border-color 0.2s; line-height: 1.5; }
  .enc-textarea:focus { border-color: rgba(0,212,255,0.4); }
  .tab-btn { border-radius: 0.45rem; padding: 0.4rem 0.9rem; font-family: 'JetBrains Mono',monospace; font-size: 0.75rem; font-weight: 600; cursor: pointer; border: 1px solid rgba(14,165,233,0.25); background: transparent; color: #64748b; transition: all 0.2s; }
  .tab-btn.active { border-color: rgba(0,212,255,0.6); background: rgba(14,165,233,0.1); color: #38bdf8; }
  .copy-btn { background: rgba(14,165,233,0.12); border: 1px solid rgba(14,165,233,0.3); color: #38bdf8; border-radius: 0.45rem; padding: 0.45rem 1rem; font-family: 'JetBrains Mono',monospace; font-size: 0.8rem; cursor: pointer; transition: all 0.2s; }
  .copy-btn:hover { background: rgba(14,165,233,0.22); }
  .copy-btn.ok { background: rgba(34,197,94,0.15); border-color: rgba(34,197,94,0.35); color: #4ade80; }
  .swap-btn { background: transparent; border: 1px solid rgba(14,165,233,0.2); color: #38bdf8; border-radius: 0.45rem; padding: 0.4rem 0.75rem; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; }
  .swap-btn:hover { background: rgba(14,165,233,0.1); }
`;

type Mode = "url-encode" | "url-decode" | "html-encode" | "html-decode";

function process(input: string, mode: Mode): string {
  try {
    switch (mode) {
      case "url-encode":  return encodeURIComponent(input);
      case "url-decode":  return decodeURIComponent(input);
      case "html-encode": return input.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
      case "html-decode": {
        const el = typeof document !== "undefined" ? document.createElement("textarea") : null;
        if (!el) return input;
        el.innerHTML = input;
        return el.value;
      }
    }
  } catch { return "⚠ Ungültige Eingabe"; }
}

const MODES: { id: Mode; label: string }[] = [
  { id: "url-encode",  label: "URL encode"  },
  { id: "url-decode",  label: "URL decode"  },
  { id: "html-encode", label: "HTML encode" },
  { id: "html-decode", label: "HTML decode" },
];

export default function UrlEncoderPage() {
  const [input, setInput]   = useState("");
  const [mode, setMode]     = useState<Mode>("url-encode");
  const [copied, setCopied] = useState(false);

  const output = input ? process(input, mode) : "";

  function copy() {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function swap() {
    setInput(output);
  }

  return (
    <div style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans',sans-serif", minHeight: "100vh" }}>
      <style>{S}</style>

      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>url-encoder</span>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-6 py-10">
        <div className="mb-7">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Text & Produktivität</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.6rem)", color: "#fff", marginBottom: "0.3rem" }}>URL & HTML Encoder</h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>URL und HTML kodieren oder dekodieren — direkt im Browser.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Mode tabs */}
          <div className="card p-5">
            <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.6rem" }}>Modus</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {MODES.map(m => (
                <button key={m.id} className={`tab-btn ${mode === m.id ? "active" : ""}`} onClick={() => setMode(m.id)}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="card p-5">
            <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.6rem" }}>Eingabe</label>
            <textarea
              className="enc-textarea"
              placeholder="Text hier eingeben…"
              value={input}
              onChange={e => setInput(e.target.value)}
            />
          </div>

          {/* Output */}
          <div className="card p-5">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
              <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase" }}>Ergebnis</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button className="swap-btn" onClick={swap} disabled={!output} title="Ausgabe als Eingabe">⇅</button>
                <button className={`copy-btn ${copied ? "ok" : ""}`} onClick={copy} disabled={!output}>
                  {copied ? "✓ Kopiert" : "Kopieren"}
                </button>
              </div>
            </div>
            <textarea
              className="enc-textarea"
              readOnly
              value={output}
              placeholder="Ergebnis erscheint hier…"
              style={{ color: output.startsWith("⚠") ? "#f87171" : "#38bdf8" }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
