"use client";
import { useState } from "react";

function minifyCss(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*{\s*/g, "{")
    .replace(/\s*}\s*/g, "}")
    .replace(/\s*:\s*/g, ":")
    .replace(/\s*;\s*/g, ";")
    .replace(/;}/g, "}")
    .trim();
}

function beautifyCss(css: string): string {
  const minified = minifyCss(css);
  let result = "";
  let indent = 0;
  for (let i = 0; i < minified.length; i++) {
    const c = minified[i];
    if (c === "{") {
      result += " {\n" + "  ".repeat(indent + 1);
      indent++;
    } else if (c === "}") {
      indent = Math.max(0, indent - 1);
      result = result.trimEnd() + "\n" + "  ".repeat(indent) + "}\n\n";
    } else if (c === ";") {
      result += ";\n" + "  ".repeat(indent);
    } else {
      result += c;
    }
  }
  return result.trim();
}

function formatBytes(n: number) {
  if (n < 1024) return n + " B";
  return (n / 1024).toFixed(2) + " KB";
}

export default function CssFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [stats, setStats] = useState<{ orig: number; next: number; saved: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<"minify" | "beautify" | null>(null);

  function run(type: "minify" | "beautify") {
    setMode(type);
    const result = type === "minify" ? minifyCss(input) : beautifyCss(input);
    setOutput(result);
    const orig = new Blob([input]).size;
    const next = new Blob([result]).size;
    setStats({ orig, next, saved: Math.round((1 - next / orig) * 100) });
  }

  function copy() {
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
        textarea { background: rgba(7,20,34,0.8); border: 1px solid rgba(14,165,233,0.2); border-radius: 0.5rem; color: #e2e8f0; padding: 1rem; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; width: 100%; outline: none; resize: vertical; transition: border-color 0.2s; line-height: 1.6; }
        textarea:focus { border-color: rgba(0,212,255,0.4); }
        .action-btn { border-radius: 0.6rem; padding: 0.8rem 1.5rem; font-family: 'Syne',sans-serif; font-weight: 700; font-size: 0.95rem; cursor: pointer; transition: all 0.2s; flex: 1; border: 1px solid; }
        .btn-minify { background: linear-gradient(135deg,rgba(239,68,68,0.2),rgba(239,68,68,0.08)); border-color: rgba(239,68,68,0.35); color: #f87171; }
        .btn-minify:hover:not(:disabled) { background: linear-gradient(135deg,rgba(239,68,68,0.35),rgba(239,68,68,0.15)); box-shadow: 0 0 24px rgba(239,68,68,0.25); }
        .btn-beautify { background: linear-gradient(135deg,rgba(34,197,94,0.2),rgba(34,197,94,0.08)); border-color: rgba(34,197,94,0.35); color: #4ade80; }
        .btn-beautify:hover:not(:disabled) { background: linear-gradient(135deg,rgba(34,197,94,0.35),rgba(34,197,94,0.15)); box-shadow: 0 0 24px rgba(34,197,94,0.25); }
        .action-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .copy-btn { background: rgba(14,165,233,0.15); border: 1px solid rgba(14,165,233,0.3); color: #38bdf8; border-radius: 0.4rem; padding: 0.4rem 0.9rem; font-size: 0.75rem; font-family: 'JetBrains Mono',monospace; cursor: pointer; transition: all 0.2s; }
        .copy-btn:hover { background: rgba(14,165,233,0.3); }
        .copy-btn.success { background: rgba(34,197,94,0.2); border-color: rgba(34,197,94,0.4); color: #4ade80; }
        .stat-pill { background: rgba(14,165,233,0.08); border: 1px solid rgba(14,165,233,0.2); border-radius: 0.5rem; padding: 0.5rem 1rem; font-family: 'JetBrains Mono',monospace; font-size: 0.78rem; color: #94a3b8; }
        .stat-pill span { color: #38bdf8; font-weight: 700; }
      `}</style>

      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>css-formatter</span>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
            Web & Developer Tools
          </div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.8rem)", color: "#fff", marginBottom: "0.5rem" }}>
            CSS Minifier & Formatter
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1rem" }}>CSS komprimieren oder lesbar machen — rein lokal, kein Upload.</p>
        </div>

        {/* Input */}
        <div className="card p-6 mb-5">
          <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>
            CSS Eingabe
          </label>
          <textarea
            rows={12}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder=".container { display: flex; flex-direction: column; /* comment */ background: #fff; padding: 1rem; }"
          />
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
          <button className="action-btn btn-minify" onClick={() => run("minify")} disabled={!input.trim()}>
            ⚡ CSS Minify (Komprimieren)
          </button>
          <button className="action-btn btn-beautify" onClick={() => run("beautify")} disabled={!input.trim()}>
            ✨ CSS Formatieren (Lesbar machen)
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
            <div className="stat-pill">Original: <span>{formatBytes(stats.orig)}</span></div>
            <div className="stat-pill">Neu: <span>{formatBytes(stats.next)}</span></div>
            {mode === "minify" && stats.saved > 0 && (
              <div className="stat-pill" style={{ borderColor: "rgba(34,197,94,0.3)" }}>
                Gespart: <span style={{ color: "#4ade80" }}>{stats.saved}%</span>
              </div>
            )}
          </div>
        )}

        {/* Output */}
        {output && (
          <div className="card p-6">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {mode === "minify" ? "Minifiziertes CSS" : "Formatiertes CSS"}
              </label>
              <button className={`copy-btn ${copied ? "success" : ""}`} onClick={copy}>
                {copied ? "✓ Kopiert" : "Kopieren"}
              </button>
            </div>
            <textarea rows={12} readOnly value={output} style={{ cursor: "default" }} />
          </div>
        )}
      </main>
    </div>
  );
}
