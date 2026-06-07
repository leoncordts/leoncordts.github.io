"use client";
import { useState } from "react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
  .card { background: linear-gradient(135deg,#071422 0%,#050d1a 100%); border: 1px solid rgba(14,165,233,0.2); border-radius: 1rem; }
  .ar-input { background: rgba(7,20,34,0.8); border: 1px solid rgba(14,165,233,0.2); border-radius: 0.5rem; color: #e2e8f0; padding: 0.6rem 0.8rem; font-family: 'JetBrains Mono',monospace; font-size: 0.95rem; width: 100%; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
  .ar-input:focus { border-color: rgba(0,212,255,0.45); }
  .ar-label { font-family: 'JetBrains Mono',monospace; font-size: 0.62rem; color: #38bdf8; letter-spacing: 0.08em; text-transform: uppercase; display: block; margin-bottom: 0.3rem; }
  .preset-btn { background: transparent; border: 1px solid rgba(14,165,233,0.18); border-radius: 0.4rem; color: #64748b; cursor: pointer; font-family: 'JetBrains Mono',monospace; font-size: 0.68rem; padding: 0.28rem 0.6rem; transition: all 0.15s; white-space: nowrap; }
  .preset-btn:hover, .preset-btn.active { color: #38bdf8; border-color: rgba(0,212,255,0.4); background: rgba(14,165,233,0.06); }
  .result-row { display: flex; align-items: center; justify-content: space-between; padding: 0.38rem 0; border-bottom: 1px solid rgba(14,165,233,0.07); }
  .result-row:last-child { border-bottom: none; }
  .copy-mini { background: transparent; border: none; color: #475569; cursor: pointer; font-family: 'JetBrains Mono',monospace; font-size: 0.65rem; padding: 0; transition: color 0.15s; }
  .copy-mini:hover { color: #38bdf8; }
  .copy-mini.ok { color: #4ade80; }
  .preview-box { border: 1px dashed rgba(14,165,233,0.3); border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; }
`;

function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b); }
function simplify(w: number, h: number): string {
  const d = gcd(Math.round(w), Math.round(h));
  return `${Math.round(w)/d}:${Math.round(h)/d}`;
}

const COMMON_RATIOS = [
  { label: "16:9",    w: 16, h: 9,  note: "HD Video, YouTube" },
  { label: "4:3",     w: 4,  h: 3,  note: "Klassisch, SD" },
  { label: "1:1",     w: 1,  h: 1,  note: "Instagram, Avatar" },
  { label: "21:9",    w: 21, h: 9,  note: "Ultrawide" },
  { label: "9:16",    w: 9,  h: 16, note: "Stories, Reels" },
  { label: "3:2",     w: 3,  h: 2,  note: "DSLR, Print" },
  { label: "2:3",     w: 2,  h: 3,  note: "Portrait Print" },
  { label: "4:5",     w: 4,  h: 5,  note: "Instagram Portrait" },
  { label: "1.618:1", w: 1.618, h: 1, note: "Goldener Schnitt" },
];

const WIDTHS = [320, 640, 768, 1024, 1280, 1440, 1920];

export default function AspectRatioPage() {
  const [w, setW]  = useState("1920");
  const [h, setH]  = useState("1080");
  const [lock, setLock] = useState<"w"|"h"|null>(null);
  const [copied, setCopied] = useState<string|null>(null);

  const numW = parseFloat(w);
  const numH = parseFloat(h);
  const valid = !isNaN(numW) && !isNaN(numH) && numW > 0 && numH > 0;
  const ratio = valid ? numW / numH : 0;
  const simplified = valid ? simplify(numW, numH) : "—";
  const decimal = valid ? ratio.toFixed(4) : "—";
  const pct = valid ? ((numH / numW) * 100).toFixed(4) + "%" : "—";

  function applyPreset(pw: number, ph: number) {
    setW(String(pw));
    setH(String(ph));
  }

  function handleW(val: string) {
    setW(val);
    if (lock === "h" && !isNaN(+val) && !isNaN(numH) && +val > 0) {
      setH((+val / ratio).toFixed(0));
    }
  }

  function handleH(val: string) {
    setH(val);
    if (lock === "w" && !isNaN(+val) && !isNaN(numW) && +val > 0) {
      setW((+val * ratio).toFixed(0));
    }
  }

  function copyVal(val: string, key: string) {
    navigator.clipboard.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(null), 1200);
  }

  const previewW = 200;
  const previewH = valid ? Math.round(200 / ratio) : 112;
  const cappedH  = Math.min(previewH, 140);
  const cappedW  = valid ? Math.round(cappedH * ratio) : 200;

  return (
    <div style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans',sans-serif", minHeight: "100vh" }}>
      <style>{S}</style>

      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>aspect-ratio</span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-7">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Design</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.6rem)", color: "#fff", marginBottom: "0.3rem" }}>Seitenverhältnis</h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Auflösungen und Verhältnisse berechnen — lokal.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
          {/* Left */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {/* Input */}
            <div className="card p-5">
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "0.4rem", alignItems: "end" }}>
                <div>
                  <span className="ar-label">Breite (px)</span>
                  <input className="ar-input" type="number" min={1} value={w} onChange={e => handleW(e.target.value)} />
                </div>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "1rem", color: "#334155", paddingBottom: "0.3rem" }}>×</span>
                <div>
                  <span className="ar-label">Höhe (px)</span>
                  <input className="ar-input" type="number" min={1} value={h} onChange={e => handleH(e.target.value)} />
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.7rem" }}>
                <button className={`preset-btn ${lock === "w" ? "active" : ""}`} onClick={() => setLock(l => l === "w" ? null : "w")}>🔒 B fixieren</button>
                <button className={`preset-btn ${lock === "h" ? "active" : ""}`} onClick={() => setLock(l => l === "h" ? null : "h")}>🔒 H fixieren</button>
              </div>
            </div>

            {/* Results */}
            <div className="card p-4">
              <span className="ar-label" style={{ marginBottom: "0.5rem", display: "block" }}>Ergebnis</span>
              {[
                { key: "ratio",  label: "Verhältnis",     val: simplified },
                { key: "dec",    label: "Dezimal",         val: decimal },
                { key: "pct",    label: "Padding-Top %",   val: pct },
                { key: "mp",     label: "Megapixel",       val: valid ? ((numW * numH) / 1e6).toFixed(2) + " MP" : "—" },
              ].map(r => (
                <div key={r.key} className="result-row">
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.75rem", color: "#64748b" }}>{r.label}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.82rem", color: "#38bdf8" }}>{r.val}</span>
                    <button className={`copy-mini ${copied === r.key ? "ok" : ""}`} onClick={() => copyVal(r.val, r.key)}>
                      {copied === r.key ? "✓" : "copy"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Visual preview */}
            <div className="card p-4" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
              <span className="ar-label">Vorschau</span>
              <div className="preview-box" style={{ width: cappedW, height: cappedH }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65rem", color: "#38bdf8" }}>{simplified}</span>
              </div>
            </div>
          </div>

          {/* Right */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {/* Common presets */}
            <div className="card p-4">
              <span className="ar-label" style={{ marginBottom: "0.5rem", display: "block" }}>Gängige Verhältnisse</span>
              {COMMON_RATIOS.map(p => (
                <div key={p.label} className="result-row" style={{ cursor: "pointer" }} onClick={() => applyPreset(p.w * 100, p.h * 100)}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.78rem", color: "#38bdf8" }}>{p.label}</span>
                  <span style={{ fontSize: "0.75rem", color: "#475569" }}>{p.note}</span>
                </div>
              ))}
            </div>

            {/* Scale by width */}
            {valid && (
              <div className="card p-4">
                <span className="ar-label" style={{ marginBottom: "0.5rem", display: "block" }}>Skalierung (Breite → Höhe)</span>
                {WIDTHS.map(bw => {
                  const bh = Math.round(bw / ratio);
                  const key = `${bw}`;
                  return (
                    <div key={bw} className="result-row">
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.75rem", color: "#64748b" }}>{bw}px</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.78rem", color: "#e2e8f0" }}>{bh}px</span>
                        <button className={`copy-mini ${copied === key ? "ok" : ""}`} onClick={() => copyVal(`${bw}x${bh}`, key)}>
                          {copied === key ? "✓" : "copy"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
