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

export default function JsonValidatorPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [highlighted, setHighlighted] = useState("");
  const [error, setError] = useState<{ message: string; position?: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const validate = useCallback((val: string) => {
    if (!val.trim()) { setOutput(""); setHighlighted(""); setError(null); return; }
    try {
      const parsed = JSON.parse(val);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setHighlighted(syntaxHighlight(formatted.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")));
      setError(null);
    } catch (e: unknown) {
      const msg = (e as Error).message;
      const posMatch = msg.match(/position (\d+)/i);
      setError({ message: msg, position: posMatch ? parseInt(posMatch[1]) : undefined });
      setOutput("");
      setHighlighted("");
    }
  }, []);

  function onInput(val: string) {
    setInput(val);
    validate(val);
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
        textarea { background: rgba(7,20,34,0.8); border: 1px solid rgba(14,165,233,0.2); border-radius: 0.5rem; color: #e2e8f0; padding: 1rem; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; width: 100%; outline: none; resize: vertical; transition: border-color 0.2s; line-height: 1.7; }
        textarea:focus { border-color: rgba(0,212,255,0.4); }
        textarea.error-border { border-color: rgba(239,68,68,0.5) !important; box-shadow: 0 0 0 2px rgba(239,68,68,0.1); }
        .error-box { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.35); border-radius: 0.5rem; padding: 0.75rem 1rem; font-family: 'JetBrains Mono',monospace; font-size: 0.78rem; color: #f87171; margin-top: 0.75rem; }
        .success-badge { background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.35); color: #4ade80; border-radius: 0.4rem; padding: 0.25rem 0.75rem; font-family: 'JetBrains Mono',monospace; font-size: 0.72rem; display: inline-flex; align-items: center; gap: 0.35rem; }
        .copy-btn { background: rgba(14,165,233,0.15); border: 1px solid rgba(14,165,233,0.3); color: #38bdf8; border-radius: 0.4rem; padding: 0.4rem 0.9rem; font-size: 0.75rem; font-family: 'JetBrains Mono',monospace; cursor: pointer; transition: all 0.2s; }
        .copy-btn:hover { background: rgba(14,165,233,0.3); }
        .copy-btn.success { background: rgba(34,197,94,0.2); border-color: rgba(34,197,94,0.4); color: #4ade80; }
        .code-output { background: rgba(7,20,34,0.9); border: 1px solid rgba(14,165,233,0.2); border-radius: 0.5rem; padding: 1rem; overflow: auto; font-family: 'JetBrains Mono',monospace; font-size: 0.85rem; line-height: 1.7; min-height: 300px; max-height: 480px; }
        .json-key  { color: #38bdf8; }
        .json-str  { color: #4ade80; }
        .json-num  { color: #fb923c; }
        .json-bool { color: #c084fc; }
        .json-null { color: #94a3b8; }
      `}</style>

      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>json-validator</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Web & Developer Tools</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.8rem)", color: "#fff", marginBottom: "0.5rem" }}>JSON Validator & Linter</h1>
          <p style={{ color: "#94a3b8" }}>Prüfe und formatiere JSON sofort — mit Syntaxfehler-Anzeige. 100% lokal, kein Server.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          {/* Input */}
          <div className="card p-6">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase" }}>JSON Eingabe</label>
              {output && !error && <span className="success-badge">✓ Valides JSON</span>}
            </div>
            <textarea
              rows={18}
              className={error ? "error-border" : ""}
              value={input}
              onChange={(e) => onInput(e.target.value)}
              placeholder={'{\n  "name": "Max",\n  "age": 30,\n  "active": true\n}'}
            />
            {error && (
              <div className="error-box">
                ⚠ Syntax Error{error.position !== undefined ? ` (Position ${error.position})` : ""}<br />
                <span style={{ color: "#fca5a5", marginTop: "0.25rem", display: "block" }}>{error.message}</span>
              </div>
            )}
          </div>

          {/* Output */}
          <div className="card p-6">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase" }}>Formatiertes JSON</label>
              {output && <button className={`copy-btn ${copied ? "success" : ""}`} onClick={copy}>{copied ? "✓ Kopiert" : "Kopieren"}</button>}
            </div>
            {output ? (
              <div className="code-output" dangerouslySetInnerHTML={{ __html: highlighted || output }} />
            ) : (
              <div className="code-output" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#334155", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.85rem" }}>
                  {error ? "Fehler gefunden — bitte JSON korrigieren" : "Ausgabe erscheint hier…"}
                </span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
