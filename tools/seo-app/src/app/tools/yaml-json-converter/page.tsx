"use client";
import { useState, useCallback } from "react";
import yaml from "js-yaml";

const SHARED_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
  .card { background: linear-gradient(135deg,#071422 0%,#050d1a 100%); border: 1px solid rgba(14,165,233,0.2); border-radius: 1rem; }
  textarea { background: rgba(7,20,34,0.8); border: 1px solid rgba(14,165,233,0.2); border-radius: 0.5rem; color: #e2e8f0; padding: 1rem; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; width: 100%; outline: none; resize: vertical; transition: border-color 0.2s; line-height: 1.7; }
  textarea:focus { border-color: rgba(0,212,255,0.4); }
  textarea.error { border-color: rgba(239,68,68,0.5) !important; }
  .copy-btn { background: rgba(14,165,233,0.15); border: 1px solid rgba(14,165,233,0.3); color: #38bdf8; border-radius: 0.4rem; padding: 0.4rem 0.9rem; font-size: 0.75rem; font-family: 'JetBrains Mono',monospace; cursor: pointer; transition: all 0.2s; }
  .copy-btn:hover { background: rgba(14,165,233,0.3); }
  .copy-btn.success { background: rgba(34,197,94,0.2); border-color: rgba(34,197,94,0.4); color: #4ade80; }
  .error-box { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.35); border-radius: 0.5rem; padding: 0.75rem 1rem; font-family: 'JetBrains Mono',monospace; font-size: 0.78rem; color: #f87171; margin-top: 0.5rem; }
`;

export default function YamlJsonPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"yaml2json" | "json2yaml">("yaml2json");
  const [copied, setCopied] = useState(false);

  const convert = useCallback((val: string, m: "yaml2json" | "json2yaml") => {
    setError("");
    if (!val.trim()) { setOutput(""); return; }
    try {
      if (m === "yaml2json") {
        const parsed = yaml.load(val);
        setOutput(JSON.stringify(parsed, null, 2));
      } else {
        const parsed = JSON.parse(val);
        setOutput(yaml.dump(parsed, { indent: 2 }));
      }
    } catch (e: unknown) {
      setError((e as Error).message);
      setOutput("");
    }
  }, []);

  function onInput(val: string) {
    setInput(val);
    convert(val, mode);
  }

  function toggleMode() {
    const next = mode === "yaml2json" ? "json2yaml" : "yaml2json";
    setMode(next);
    convert(input, next);
  }

  function copy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{SHARED_STYLE}</style>
      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>yaml-json-converter</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Web & Developer Tools</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.8rem)", color: "#fff", marginBottom: "0.5rem" }}>YAML ↔ JSON Konverter</h1>
          <p style={{ color: "#94a3b8" }}>Echtzeit-Konvertierung in beide Richtungen — lokal, kein Upload.</p>
        </div>

        {/* Toggle */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
          <button
            onClick={toggleMode}
            style={{ background: "linear-gradient(135deg,rgba(14,165,233,0.25),rgba(0,212,255,0.1))", border: "1px solid rgba(14,165,233,0.4)", color: "#38bdf8", borderRadius: "0.6rem", padding: "0.6rem 1.5rem", fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", transition: "all 0.2s" }}
          >
            {mode === "yaml2json" ? "YAML → JSON" : "JSON → YAML"} &nbsp;⇄&nbsp; Richtung wechseln
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          {/* Input */}
          <div className="card p-6">
            <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>
              {mode === "yaml2json" ? "YAML Eingabe" : "JSON Eingabe"}
            </label>
            <textarea
              rows={18}
              className={error ? "error" : ""}
              value={input}
              onChange={(e) => onInput(e.target.value)}
              placeholder={mode === "yaml2json" ? "name: Max\nage: 30\nroles:\n  - admin\n  - user" : '{\n  "name": "Max",\n  "age": 30\n}'}
            />
            {error && <div className="error-box">⚠ {error}</div>}
          </div>

          {/* Output */}
          <div className="card p-6">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {mode === "yaml2json" ? "JSON Ausgabe" : "YAML Ausgabe"}
              </label>
              {output && <button className={`copy-btn ${copied ? "success" : ""}`} onClick={copy}>{copied ? "✓ Kopiert" : "Kopieren"}</button>}
            </div>
            <textarea rows={18} readOnly value={output} placeholder="Ausgabe erscheint hier…" style={{ cursor: "default" }} />
          </div>
        </div>
      </main>
    </div>
  );
}
