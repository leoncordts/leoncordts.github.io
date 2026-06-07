"use client";

import { useState } from "react";

type CaseType = "upper" | "lower" | "title" | "camel" | "snake" | "kebab";

function convert(text: string, mode: CaseType): string {
  const words = text.trim().split(/[\s_-]+/).filter(Boolean);
  switch (mode) {
    case "upper": return text.toUpperCase();
    case "lower": return text.toLowerCase();
    case "title": return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    case "camel": return words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
    case "snake": return words.map((w) => w.toLowerCase()).join("_");
    case "kebab": return words.map((w) => w.toLowerCase()).join("-");
    default: return text;
  }
}

const MODES: { id: CaseType; label: string; example: string }[] = [
  { id: "upper", label: "UPPER CASE", example: "HELLO WORLD" },
  { id: "lower", label: "lower case", example: "hello world" },
  { id: "title", label: "Title Case", example: "Hello World" },
  { id: "camel", label: "camelCase", example: "helloWorld" },
  { id: "snake", label: "snake_case", example: "hello_world" },
  { id: "kebab", label: "kebab-case", example: "hello-world" },
];

export default function CaseConverterPage() {
  const [input, setInput] = useState("");
  const [active, setActive] = useState<CaseType>("upper");
  const [copied, setCopied] = useState(false);

  const output = input ? convert(input, active) : "";

  const copy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
        .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
        .card { background: linear-gradient(135deg,#071422 0%,#050d1a 100%); border: 1px solid rgba(14,165,233,0.2); border-radius: 1rem; }
        .input-field { background: rgba(7,20,34,0.8); border: 1px solid rgba(14,165,233,0.25); border-radius: 0.5rem; color: #e2e8f0; padding: 0.75rem 1rem; font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; width: 100%; outline: none; transition: border-color 0.2s; resize: none; }
        .input-field:focus { border-color: rgba(0,212,255,0.5); box-shadow: 0 0 0 2px rgba(0,212,255,0.1); }
        .mode-btn { font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; padding: 0.45rem 0.9rem; border-radius: 0.4rem; border: 1px solid rgba(14,165,233,0.2); cursor: pointer; transition: all 0.2s; color: #64748b; background: transparent; white-space: nowrap; }
        .mode-btn:hover { color: #38bdf8; border-color: rgba(0,212,255,0.4); }
        .mode-btn.active { border-color: rgba(0,212,255,0.6); color: #38bdf8; background: rgba(14,165,233,0.12); }
        .copy-btn { background: rgba(14,165,233,0.15); border: 1px solid rgba(14,165,233,0.3); color: #38bdf8; border-radius: 0.4rem; padding: 0.4rem 1rem; font-size: 0.8rem; font-family: 'JetBrains Mono', monospace; cursor: pointer; transition: all 0.2s; }
        .copy-btn:hover { background: rgba(14,165,233,0.3); }
        .copy-btn.success { background: rgba(34,197,94,0.2); border-color: rgba(34,197,94,0.4); color: #4ade80; }
      `}</style>

      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>case-converter</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
            Text &amp; Produktivität
          </div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.5rem)", color: "#fff", marginBottom: "0.4rem" }}>
            Case Converter
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
            Text sofort in UPPER, lower, Title, camelCase, snake_case oder kebab-case umwandeln.
          </p>
        </div>

        {/* Mode buttons */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.25rem" }}>
          {MODES.map((m) => (
            <button key={m.id} className={`mode-btn${active === m.id ? " active" : ""}`} onClick={() => setActive(m.id)}>
              {m.label}
            </button>
          ))}
        </div>

        <div className="card p-6 mb-4">
          <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>
            Eingabe
          </label>
          <textarea
            className="input-field"
            rows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Text hier eingeben..."
            spellCheck={false}
          />
        </div>

        <div className="card p-6">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Ausgabe — {MODES.find((m) => m.id === active)?.label}
            </label>
            <button className={`copy-btn${copied ? " success" : ""}`} onClick={copy} disabled={!output}>
              {copied ? "Kopiert!" : "Kopieren"}
            </button>
          </div>
          <textarea
            className="input-field"
            rows={4}
            value={output}
            readOnly
            placeholder="Ausgabe erscheint hier..."
            spellCheck={false}
          />
        </div>
      </main>
    </div>
  );
}
