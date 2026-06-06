"use client";
import { useState, useCallback } from "react";

function syntaxHighlight(json: string): string {
  return json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = "json-num";
        if (/^"/.test(match)) {
          cls = /:$/.test(match) ? "json-key" : "json-str";
        } else if (/true|false/.test(match)) {
          cls = "json-bool";
        } else if (/null/.test(match)) {
          cls = "json-null";
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
}

export default function CodeFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<"format" | "minify">("format");

  const process = useCallback((text: string, m: "format" | "minify") => {
    if (!text.trim()) { setOutput(""); setError(null); return; }
    try {
      const parsed = JSON.parse(text);
      const result = m === "format"
        ? JSON.stringify(parsed, null, 2)
        : JSON.stringify(parsed);
      setOutput(result);
      setError(null);
    } catch (e) {
      setOutput("");
      setError((e as Error).message);
    }
  }, []);

  function onInput(val: string) {
    setInput(val);
    process(val, mode);
    setCopied(false);
  }

  function switchMode(m: "format" | "minify") {
    setMode(m);
    process(input, m);
  }

  function copy() {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function clear() { setInput(""); setOutput(""); setError(null); }

  const S = {
    page: { minHeight: "100vh", backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans', sans-serif" } as React.CSSProperties,
    nav: { borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)", padding: "1rem 1.5rem" } as React.CSSProperties,
    card: { background: "linear-gradient(135deg,#071422 0%,#050d1a 100%)", border: "1px solid rgba(14,165,233,0.2)", borderRadius: "1rem" } as React.CSSProperties,
    mono: { fontFamily: "'JetBrains Mono',monospace" } as React.CSSProperties,
    label: { fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase" as const, display: "block", marginBottom: "0.5rem" },
  };

  const stats = output
    ? `${new Blob([input]).size} B → ${new Blob([output]).size} B`
    : null;

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
        .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
        .code-area { background: rgba(7,20,34,0.9); border: 1px solid rgba(14,165,233,0.2); color: #e2e8f0; padding: 1rem; font-family: 'JetBrains Mono',monospace; font-size: 0.8rem; line-height: 1.6; width: 100%; min-height: 320px; resize: vertical; outline: none; transition: border-color 0.2s; border-radius: 0; }
        .code-area:focus { border-color: rgba(0,212,255,0.4); }
        .error-box { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.3); border-radius: 0.5rem; padding: 0.75rem 1rem; color: #f87171; font-family: 'JetBrains Mono',monospace; font-size: 0.78rem; margin: 0.5rem 1.5rem; }
        .tab-btn { padding: 0.5rem 1.25rem; font-family: 'JetBrains Mono',monospace; font-size: 0.78rem; cursor: pointer; border: none; transition: all 0.2s; }
        .tab-btn.active { background: rgba(0,212,255,0.15); color: #00d4ff; border-bottom: 2px solid #00d4ff; }
        .tab-btn.inactive { background: transparent; color: #475569; border-bottom: 2px solid transparent; }
        .tab-btn:hover:not(.active) { color: #94a3b8; }
        .copy-btn { background: rgba(14,165,233,0.12); border: 1px solid rgba(14,165,233,0.3); color: #38bdf8; border-radius: 0.4rem; padding: 0.35rem 0.75rem; font-family: 'JetBrains Mono',monospace; font-size: 0.75rem; cursor: pointer; transition: all 0.2s; }
        .copy-btn:hover { background: rgba(14,165,233,0.2); }
        .copy-btn.ok { background: rgba(34,197,94,0.15); border-color: rgba(34,197,94,0.3); color: #4ade80; }
        .clear-btn { background: transparent; border: 1px solid rgba(100,116,139,0.2); color: #475569; border-radius: 0.4rem; padding: 0.35rem 0.75rem; font-family: 'JetBrains Mono',monospace; font-size: 0.75rem; cursor: pointer; transition: all 0.2s; }
        .clear-btn:hover { border-color: rgba(239,68,68,0.3); color: #f87171; }
        .json-key { color: #38bdf8; }
        .json-str { color: #4ade80; }
        .json-num { color: #fb923c; }
        .json-bool { color: #a78bfa; }
        .json-null { color: #64748b; }
        .output-pre { margin: 0; padding: 1rem; font-family: 'JetBrains Mono',monospace; font-size: 0.8rem; line-height: 1.6; color: #e2e8f0; white-space: pre-wrap; word-break: break-all; min-height: 320px; }
      `}</style>

      <nav style={S.nav}>
        <div style={{ maxWidth: "80rem", margin: "0 auto", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <a href="/tools" style={{ color: "#38bdf8", ...S.mono, fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", ...S.mono, fontSize: "0.8rem" }}>code-formatter</span>
        </div>
      </nav>

      <main style={{ maxWidth: "80rem", margin: "0 auto", padding: "2rem 1.5rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <div style={S.label}>Web & Developer Tools</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.8rem)", color: "#fff", marginBottom: "0.25rem" }}>
            JSON Formatter & Validator
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1rem" }}>JSON sofort formatieren, validieren und minifizieren. Echtzeit-Highlighting, kein Upload.</p>
        </div>

        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
          <div style={{ display: "flex" }}>
            <button className={`tab-btn ${mode === "format" ? "active" : "inactive"}`} onClick={() => switchMode("format")}>
              ✦ Formatieren
            </button>
            <button className={`tab-btn ${mode === "minify" ? "active" : "inactive"}`} onClick={() => switchMode("minify")}>
              ⚡ Minify
            </button>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            {stats && <span style={{ color: "#334155", ...S.mono, fontSize: "0.72rem" }}>{stats}</span>}
            {output && <button className={`copy-btn ${copied ? "ok" : ""}`} onClick={copy}>{copied ? "✓ Kopiert" : "Kopieren"}</button>}
            <button className="clear-btn" onClick={clear}>Löschen</button>
          </div>
        </div>

        {/* Split view */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {/* Input */}
          <div style={S.card}>
            <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid rgba(14,165,233,0.12)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ ...S.mono, fontSize: "0.72rem", color: "#475569" }}>INPUT</span>
              <span style={{ ...S.mono, fontSize: "0.7rem", color: "#334155" }}>{input.length} Zeichen</span>
            </div>
            <textarea
              className="code-area"
              value={input}
              onChange={(e) => onInput(e.target.value)}
              placeholder={'{\n  "name": "Leon Cordts",\n  "role": "developer",\n  "tools": ["json-formatter", "css-minifier"]\n}'}
              spellCheck={false}
            />
          </div>

          {/* Output */}
          <div style={S.card}>
            <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid rgba(14,165,233,0.12)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ ...S.mono, fontSize: "0.72rem", color: error ? "#f87171" : output ? "#4ade80" : "#475569" }}>
                {error ? "✗ FEHLER" : output ? "✓ VALID JSON" : "OUTPUT"}
              </span>
              {output && <span style={{ ...S.mono, fontSize: "0.7rem", color: "#334155" }}>{output.length} Zeichen</span>}
            </div>

            {error ? (
              <div style={{ padding: "1rem" }}>
                <div className="error-box" style={{ margin: 0 }}>
                  <div style={{ color: "#ef4444", fontWeight: 600, marginBottom: "0.25rem" }}>Syntax Error</div>
                  {error}
                </div>
                <p style={{ color: "#475569", fontSize: "0.75rem", marginTop: "0.75rem", padding: "0 0.25rem", ...S.mono }}>
                  Tipp: Häufige Fehler sind fehlende Anführungszeichen bei Keys, ein Komma am Ende oder ungültige Werte.
                </p>
              </div>
            ) : output ? (
              <pre
                className="output-pre"
                dangerouslySetInnerHTML={{ __html: syntaxHighlight(output) }}
              />
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "320px", flexDirection: "column", gap: "1rem" }}>
                <div style={{ fontSize: "2.5rem", opacity: 0.2 }}>{ }</div>
                <p style={{ color: "#334155", fontSize: "0.85rem", ...S.mono }}>JSON links eingeben…</p>
              </div>
            )}
          </div>
        </div>

        {/* Tips */}
        <div style={{ ...S.card, padding: "1.25rem 1.5rem", marginTop: "1rem" }}>
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
            {[
              ["Echtzeit-Validierung", "Fehler werden sofort markiert"],
              ["Syntax-Highlighting", "Keys, Strings, Zahlen farbig"],
              ["Minify-Modus", "Whitespace entfernen für Produktion"],
              ["100% Offline", "Kein Upload, kein Server"],
            ].map(([title, desc]) => (
              <div key={title}>
                <div style={{ color: "#38bdf8", fontSize: "0.75rem", ...S.mono, marginBottom: "0.15rem" }}>{title}</div>
                <div style={{ color: "#475569", fontSize: "0.75rem" }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
