"use client";
import { useState, useCallback } from "react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
  .card { background: linear-gradient(135deg,#071422 0%,#050d1a 100%); border: 1px solid rgba(14,165,233,0.2); border-radius: 1rem; }
  textarea,input[type=text] { background: rgba(7,20,34,0.8); border: 1px solid rgba(14,165,233,0.2); border-radius: 0.5rem; color: #e2e8f0; padding: 0.75rem 1rem; font-family: 'JetBrains Mono',monospace; font-size: 0.85rem; width: 100%; outline: none; transition: border-color 0.2s; }
  textarea:focus,input[type=text]:focus { border-color: rgba(0,212,255,0.4); }
  .btn-primary { background: linear-gradient(135deg,rgba(14,165,233,0.3),rgba(0,212,255,0.15)); border: 1px solid rgba(14,165,233,0.5); color: #38bdf8; border-radius: 0.6rem; padding: 0.65rem 1.8rem; font-family: 'Syne',sans-serif; font-weight: 700; font-size: 0.95rem; cursor: pointer; transition: all 0.2s; }
  .btn-primary:hover { background: linear-gradient(135deg,rgba(14,165,233,0.45),rgba(0,212,255,0.25)); }
  .copy-btn { background: rgba(14,165,233,0.15); border: 1px solid rgba(14,165,233,0.3); color: #38bdf8; border-radius: 0.4rem; padding: 0.4rem 0.9rem; font-size: 0.75rem; font-family: 'JetBrains Mono',monospace; cursor: pointer; transition: all 0.2s; }
  .copy-btn:hover { background: rgba(14,165,233,0.3); }
  .copy-btn.success { background: rgba(34,197,94,0.2); border-color: rgba(34,197,94,0.4); color: #4ade80; }
  .hash-out { font-family: 'JetBrains Mono',monospace; font-size: 0.85rem; color: #38bdf8; word-break: break-all; letter-spacing: 0.04em; }
  .algo-btn { font-family: 'JetBrains Mono',monospace; font-size: 0.72rem; padding: 0.4rem 1rem; border-radius: 20px; border: 1px solid rgba(14,165,233,0.25); color: #64748b; background: transparent; cursor: pointer; transition: all 0.2s; letter-spacing: 0.05em; }
  .algo-btn.active, .algo-btn:hover { border-color: rgba(0,212,255,0.6); color: #38bdf8; background: rgba(14,165,233,0.08); }
  .drop-zone { border: 2px dashed rgba(14,165,233,0.25); border-radius: 0.75rem; padding: 1.5rem; text-align: center; cursor: pointer; transition: all 0.2s; color: #475569; font-family: 'JetBrains Mono',monospace; font-size: 0.8rem; }
  .drop-zone:hover, .drop-zone.over { border-color: rgba(0,212,255,0.5); color: #38bdf8; background: rgba(14,165,233,0.05); }
`;

type Algo = "SHA-256" | "SHA-1";

async function hashBuffer(buf: BufferSource, algo: Algo): Promise<string> {
  const digest = await crypto.subtle.digest(algo, buf);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export default function HashGeneratorPage() {
  const [text, setText] = useState("");
  const [algo, setAlgo] = useState<Algo>("SHA-256");
  const [hash, setHash] = useState("");
  const [fileName, setFileName] = useState("");
  const [copied, setCopied] = useState(false);
  const [over, setOver] = useState(false);

  const computeText = useCallback(async (t: string, a: Algo) => {
    if (!t) { setHash(""); setFileName(""); return; }
    const buf = new TextEncoder().encode(t).buffer as ArrayBuffer;
    setHash(await hashBuffer(buf, a));
    setFileName("");
  }, []);

  async function handleFile(file: File) {
    const buf = await file.arrayBuffer();
    setHash(await hashBuffer(buf, algo));
    setFileName(file.name);
    setText("");
  }

  function onText(val: string) {
    setText(val);
    computeText(val, algo);
  }

  async function switchAlgo(a: Algo) {
    setAlgo(a);
    if (text) computeText(text, a);
    else if (fileName) {
      // Re-hash isn't possible without re-reading the file; just clear
      setHash("");
    }
  }

  function copy() {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{S}</style>
      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>hash-generator</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Sicherheit &amp; Privatsphäre</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.8rem)", color: "#fff", marginBottom: "0.5rem" }}>Hash Generator</h1>
          <p style={{ color: "#94a3b8" }}>SHA-256 / SHA-1 — Text oder Datei hashen. Keine Daten verlassen deinen Browser.</p>
        </div>

        {/* Algorithm selector */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
          {(["SHA-256", "SHA-1"] as Algo[]).map(a => (
            <button key={a} className={`algo-btn ${algo === a ? "active" : ""}`} onClick={() => switchAlgo(a)}>{a}</button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Text input */}
          <div className="card p-6">
            <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>Text eingeben</label>
            <textarea
              rows={4}
              placeholder="Beliebigen Text hier eingeben…"
              value={text}
              onChange={e => onText(e.target.value)}
              style={{ resize: "vertical" }}
            />
          </div>

          {/* File drop */}
          <div className="card p-6">
            <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.75rem" }}>Datei hashen</label>
            <div
              className={`drop-zone ${over ? "over" : ""}`}
              onDragOver={e => { e.preventDefault(); setOver(true); }}
              onDragLeave={() => setOver(false)}
              onDrop={e => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
              onClick={() => { const inp = document.createElement("input"); inp.type = "file"; inp.onchange = () => { if (inp.files?.[0]) handleFile(inp.files[0]); }; inp.click(); }}
            >
              {fileName
                ? <span style={{ color: "#38bdf8" }}>📄 {fileName}</span>
                : <span>Datei hierher ziehen oder klicken</span>}
            </div>
          </div>

          {/* Result */}
          {hash && (
            <div className="card p-6">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase" }}>{algo} Hash</label>
                <button className={`copy-btn ${copied ? "success" : ""}`} onClick={copy}>{copied ? "✓ Kopiert" : "Kopieren"}</button>
              </div>
              <div className="hash-out">{hash}</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
