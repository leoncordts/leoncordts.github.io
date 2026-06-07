"use client";
import { useState } from "react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
  .card { background: linear-gradient(135deg,#071422 0%,#050d1a 100%); border: 1px solid rgba(14,165,233,0.2); border-radius: 1rem; }
  .scheme-btn { border-radius: 0.45rem; padding: 0.4rem 0.85rem; font-family: 'JetBrains Mono',monospace; font-size: 0.72rem; cursor: pointer; border: 1px solid rgba(14,165,233,0.22); background: transparent; color: #64748b; transition: all 0.2s; }
  .scheme-btn.active { border-color: rgba(0,212,255,0.6); background: rgba(14,165,233,0.1); color: #38bdf8; }
  .swatch { border-radius: 0.75rem; height: 80px; cursor: pointer; transition: transform 0.15s; display: flex; align-items: flex-end; padding: 0.5rem; position: relative; }
  .swatch:hover { transform: translateY(-3px); }
  .swatch-hex { font-family: 'JetBrains Mono',monospace; font-size: 0.7rem; font-weight: 600; background: rgba(0,0,0,0.4); border-radius: 0.25rem; padding: 2px 6px; backdrop-filter: blur(4px); }
  .copied-badge { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); background: rgba(0,0,0,0.65); border-radius: 0.35rem; padding: 2px 8px; font-family: 'JetBrains Mono',monospace; font-size: 0.65rem; color: #4ade80; pointer-events: none; }
`;

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [h * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.min(100, Math.max(0, s));
  l = Math.min(100, Math.max(0, l));
  const _s = s / 100, _l = l / 100;
  const a = _s * Math.min(_l, 1 - _l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = _l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * c).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

type Scheme = "analog" | "komplement" | "triadisch" | "split" | "tetra" | "monochr";

function generatePalette(hex: string, scheme: Scheme): string[] {
  const [h, s, l] = hexToHsl(hex);
  switch (scheme) {
    case "analog":
      return [-30, -15, 0, 15, 30].map(d => hslToHex(h + d, s, l));
    case "komplement":
      return [0, 30, 180, 210, 240].map(d => hslToHex(h + d, s, l));
    case "triadisch":
      return [0, 30, 120, 150, 240].map(d => hslToHex(h + d, s, l));
    case "split":
      return [0, 150, 165, 195, 210].map(d => hslToHex(h + d, s, l));
    case "tetra":
      return [0, 90, 180, 270, 45].map(d => hslToHex(h + d, s, l));
    case "monochr":
      return [0, 15, 30, 45, 60].map(d => hslToHex(h, s, l + d - 30));
  }
}

function luminance(hex: string) {
  const r = parseInt(hex.slice(1,3),16)/255, g = parseInt(hex.slice(3,5),16)/255, b = parseInt(hex.slice(5,7),16)/255;
  return 0.2126*r + 0.7152*g + 0.0722*b;
}

const SCHEMES: { id: Scheme; label: string }[] = [
  { id: "analog",      label: "Analog" },
  { id: "komplement",  label: "Komplementär" },
  { id: "triadisch",   label: "Triadisch" },
  { id: "split",       label: "Split-Kompl." },
  { id: "tetra",       label: "Tetriadisch" },
  { id: "monochr",     label: "Monochrom" },
];

export default function ColorPalettePage() {
  const [base, setBase]   = useState("#0ea5e9");
  const [scheme, setScheme] = useState<Scheme>("komplement");
  const [copied, setCopied] = useState<string | null>(null);

  const palette = generatePalette(base, scheme);

  function copy(hex: string) {
    navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 1200);
  }

  return (
    <div style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans',sans-serif", minHeight: "100vh" }}>
      <style>{S}</style>

      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>color-palette</span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-7">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Design</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.6rem)", color: "#fff", marginBottom: "0.3rem" }}>Farbpaletten Generator</h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Klicke auf eine Farbe um den HEX-Code zu kopieren.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Controls */}
          <div className="card p-5">
            <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-end", flexWrap: "wrap" }}>
              <div>
                <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.4rem" }}>Grundfarbe</label>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <input type="color" value={base} onChange={e => setBase(e.target.value)}
                    style={{ width: "48px", height: "48px", border: "1px solid rgba(14,165,233,0.3)", borderRadius: "0.45rem", background: "transparent", cursor: "pointer", padding: "2px" }} />
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.85rem", color: "#38bdf8" }}>{base.toUpperCase()}</span>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.4rem" }}>Schema</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {SCHEMES.map(sc => (
                    <button key={sc.id} className={`scheme-btn ${scheme === sc.id ? "active" : ""}`} onClick={() => setScheme(sc.id)}>{sc.label}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Swatches */}
          <div className="card p-5">
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${palette.length}, 1fr)`, gap: "0.5rem" }}>
              {palette.map((hex, i) => {
                const light = luminance(hex) > 0.4;
                return (
                  <div key={i} className="swatch" style={{ background: hex }} onClick={() => copy(hex)} title={`${hex} — klicken zum Kopieren`}>
                    {copied === hex && <span className="copied-badge">✓</span>}
                    <span className="swatch-hex" style={{ color: light ? "#000" : "#fff" }}>{hex.toUpperCase()}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* HEX list */}
          <div className="card p-5">
            <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>Alle HEX-Codes</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {palette.map((hex, i) => (
                <span key={i} onClick={() => copy(hex)}
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem", color: "#38bdf8", background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.2)", borderRadius: "0.35rem", padding: "0.3rem 0.6rem" }}>
                  <span style={{ width: "12px", height: "12px", borderRadius: "2px", background: hex, display: "inline-block", flexShrink: 0 }} />
                  {hex.toUpperCase()}
                  {copied === hex && <span style={{ color: "#4ade80", fontSize: "0.65rem" }}>✓</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
