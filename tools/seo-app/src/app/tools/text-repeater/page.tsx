"use client";
import { useState, useMemo } from "react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
  .card { background: linear-gradient(135deg,#071422 0%,#050d1a 100%); border: 1px solid rgba(14,165,233,0.2); border-radius: 1rem; }
  .tr-textarea { background: rgba(7,20,34,0.85); border: 1px solid rgba(14,165,233,0.2); border-radius: 0.5rem; color: #e2e8f0; padding: 0.75rem 0.9rem; font-family: 'JetBrains Mono',monospace; font-size: 0.9rem; width: 100%; outline: none; transition: border-color 0.2s; box-sizing: border-box; resize: vertical; min-height: 80px; line-height: 1.55; }
  .tr-textarea:focus { border-color: rgba(0,212,255,0.45); }
  .tr-input { background: rgba(7,20,34,0.8); border: 1px solid rgba(14,165,233,0.2); border-radius: 0.45rem; color: #e2e8f0; padding: 0.5rem 0.7rem; font-family: 'JetBrains Mono',monospace; font-size: 0.85rem; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
  .tr-input:focus { border-color: rgba(0,212,255,0.45); }
  .sep-btn { border-radius: 0.4rem; padding: 0.28rem 0.6rem; font-family: 'JetBrains Mono',monospace; font-size: 0.7rem; cursor: pointer; border: 1px solid rgba(14,165,233,0.22); background: transparent; color: #64748b; transition: all 0.15s; white-space: nowrap; }
  .sep-btn.active { border-color: rgba(0,212,255,0.6); background: rgba(14,165,233,0.1); color: #38bdf8; }
  .out-box { background: rgba(7,20,34,0.9); border: 1px solid rgba(14,165,233,0.15); border-radius: 0.5rem; padding: 0.85rem 1rem; font-family: 'JetBrains Mono',monospace; font-size: 0.82rem; color: #94a3b8; max-height: 280px; overflow-y: auto; white-space: pre-wrap; word-break: break-word; line-height: 1.6; }
  .action-btn { background: rgba(14,165,233,0.1); border: 1px solid rgba(14,165,233,0.3); border-radius: 0.45rem; color: #38bdf8; cursor: pointer; padding: 0.42rem 0.95rem; font-family: 'JetBrains Mono',monospace; font-size: 0.75rem; transition: all 0.15s; }
  .action-btn:hover { background: rgba(14,165,233,0.2); }
  .action-btn.ok { color: #4ade80; border-color: rgba(74,222,128,0.4); }
  .tr-label { font-family: 'JetBrains Mono',monospace; font-size: 0.65rem; color: #38bdf8; letter-spacing: 0.08em; text-transform: uppercase; display: block; margin-bottom: 0.35rem; }
`;

type SepPreset = { label: string; value: string; display: string };
const SEP_PRESETS: SepPreset[] = [
  { label: "Neue Zeile",  value: "\n",   display: "\\n" },
  { label: "Leerzeichen", value: " ",    display: "·" },
  { label: "Komma",       value: ", ",   display: ", " },
  { label: "Pipe",        value: " | ",  display: " | " },
  { label: "Semikolon",   value: "; ",   display: "; " },
  { label: "Nichts",      value: "",     display: "(leer)" },
];

const MAX_CHARS = 50_000;

export default function TextRepeaterPage() {
  const [text, setText]       = useState("Hello World");
  const [times, setTimes]     = useState(5);
  const [sepIdx, setSepIdx]   = useState(0);
  const [customSep, setCustomSep] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [prefix, setPrefix]   = useState("");
  const [suffix, setSuffix]   = useState("");
  const [copied, setCopied]   = useState(false);

  const sep = useCustom ? customSep : SEP_PRESETS[sepIdx].value;

  const output = useMemo(() => {
    if (!text || times < 1) return "";
    const entry = prefix + text + suffix;
    const result = Array(Math.min(times, 10000)).fill(entry).join(sep);
    return result.length > MAX_CHARS ? result.slice(0, MAX_CHARS) + "\n…[gekürzt]" : result;
  }, [text, times, sep, prefix, suffix]);

  const charCount = output.replace(/\n…\[gekürzt\]$/, "").length;
  const lineCount = output.split("\n").length;

  function copy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function download() {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "repeated.txt"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans',sans-serif", minHeight: "100vh" }}>
      <style>{S}</style>

      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>text-repeater</span>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-6 py-10">
        <div className="mb-7">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Text Tools</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.6rem)", color: "#fff", marginBottom: "0.3rem" }}>Text Repeater</h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Text beliebig oft wiederholen mit Trennzeichen — lokal.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>

          {/* Input */}
          <div className="card p-5">
            <label className="tr-label">Text</label>
            <textarea className="tr-textarea" value={text} onChange={e => setText(e.target.value)} placeholder="Text eingeben…" spellCheck={false} />
          </div>

          {/* Config */}
          <div className="card p-5">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label className="tr-label">Wiederholungen</label>
                <input className="tr-input" type="number" min={1} max={10000} value={times}
                  onChange={e => setTimes(Math.min(10000, Math.max(1, +e.target.value)))}
                  style={{ width: "100%" }} />
              </div>
              <div>
                <label className="tr-label">Prefix / Suffix</label>
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <input className="tr-input" placeholder="vor" value={prefix} onChange={e => setPrefix(e.target.value)} style={{ flex: 1 }} />
                  <input className="tr-input" placeholder="nach" value={suffix} onChange={e => setSuffix(e.target.value)} style={{ flex: 1 }} />
                </div>
              </div>
            </div>

            <div style={{ marginTop: "0.85rem" }}>
              <label className="tr-label">Trennzeichen</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "0.5rem" }}>
                {SEP_PRESETS.map((p, i) => (
                  <button key={i} className={`sep-btn ${!useCustom && sepIdx === i ? "active" : ""}`}
                    onClick={() => { setSepIdx(i); setUseCustom(false); }}>
                    {p.label}
                  </button>
                ))}
                <button className={`sep-btn ${useCustom ? "active" : ""}`} onClick={() => setUseCustom(true)}>
                  Eigenes
                </button>
              </div>
              {useCustom && (
                <input className="tr-input" placeholder="Eigenes Trennzeichen…" value={customSep}
                  onChange={e => setCustomSep(e.target.value)} style={{ width: "100%" }} />
              )}
            </div>
          </div>

          {/* Output */}
          {output && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem", flexWrap: "wrap", gap: "0.4rem" }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Ausgabe — {charCount.toLocaleString("de-DE")} Zeichen, {lineCount.toLocaleString("de-DE")} Zeilen
                </span>
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <button className={`action-btn ${copied ? "ok" : ""}`} onClick={copy}>{copied ? "✓ Kopiert" : "Kopieren"}</button>
                  <button className="action-btn" onClick={download}>↓ Download</button>
                </div>
              </div>
              <div className="out-box">{output}</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
