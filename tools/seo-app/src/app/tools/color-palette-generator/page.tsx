"use client";
import { useState, useCallback } from "react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
  .card { background: linear-gradient(135deg,#071422 0%,#050d1a 100%); border: 1px solid rgba(14,165,233,0.2); border-radius: 1rem; }
  .mode-btn { border-radius: 0.45rem; padding: 0.4rem 0.9rem; font-family: 'JetBrains Mono',monospace; font-size: 0.72rem; font-weight: 600; cursor: pointer; border: 1px solid rgba(14,165,233,0.2); background: transparent; color: #64748b; transition: all 0.2s; white-space: nowrap; }
  .mode-btn.active { border-color: rgba(0,212,255,0.6); background: rgba(14,165,233,0.1); color: #38bdf8; }
  .swatch { border-radius: 0.6rem; cursor: pointer; position: relative; overflow: hidden; transition: transform 0.15s; }
  .swatch:hover { transform: translateY(-2px); }
  .swatch-copy { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.55); font-family: 'JetBrains Mono',monospace; font-size: 0.65rem; padding: 0.35rem; text-align: center; opacity: 0; transition: opacity 0.15s; }
  .swatch:hover .swatch-copy { opacity: 1; }
  .copy-btn { background: rgba(14,165,233,0.12); border: 1px solid rgba(14,165,233,0.3); color: #38bdf8; border-radius: 0.45rem; padding: 0.45rem 1rem; font-family: 'JetBrains Mono',monospace; font-size: 0.78rem; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
  .copy-btn:hover { background: rgba(14,165,233,0.22); }
  .copy-btn.ok { background: rgba(34,197,94,0.15); border-color: rgba(34,197,94,0.35); color: #4ade80; }
  .color-input { appearance: none; -webkit-appearance: none; width: 48px; height: 48px; border: none; border-radius: 0.5rem; cursor: pointer; background: none; padding: 0; }
  .color-input::-webkit-color-swatch-wrapper { padding: 0; }
  .color-input::-webkit-color-swatch { border: none; border-radius: 0.5rem; }
`;

type Mode = "complementary" | "triadic" | "tetradic" | "analogous" | "split" | "monochromatic";

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, "0");
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

function generatePalette(hex: string, mode: Mode): string[] {
  const [h, s, l] = hexToHsl(hex);
  switch (mode) {
    case "complementary":
      return [hex, hslToHex(h + 180, s, l)];
    case "triadic":
      return [hex, hslToHex(h + 120, s, l), hslToHex(h + 240, s, l)];
    case "tetradic":
      return [hex, hslToHex(h + 90, s, l), hslToHex(h + 180, s, l), hslToHex(h + 270, s, l)];
    case "analogous":
      return [hslToHex(h - 30, s, l), hex, hslToHex(h + 30, s, l), hslToHex(h + 60, s, l)];
    case "split":
      return [hex, hslToHex(h + 150, s, l), hslToHex(h + 210, s, l)];
    case "monochromatic":
      return [
        hslToHex(h, s, Math.max(l - 30, 10)),
        hslToHex(h, s, Math.max(l - 15, 10)),
        hex,
        hslToHex(h, s, Math.min(l + 15, 90)),
        hslToHex(h, s, Math.min(l + 30, 90)),
      ];
  }
}

function luminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const MODES: { id: Mode; label: string }[] = [
  { id: "complementary", label: "Komplementär" },
  { id: "triadic", label: "Triadisch" },
  { id: "tetradic", label: "Tetradisch" },
  { id: "analogous", label: "Analog" },
  { id: "split", label: "Split-Komplementär" },
  { id: "monochromatic", label: "Monochrom" },
];

export default function ColorPaletteGeneratorPage() {
  const [baseColor, setBaseColor] = useState("#38bdf8");
  const [mode, setMode] = useState<Mode>("triadic");
  const [copied, setCopied] = useState<string | null>(null);
  const [allCopied, setAllCopied] = useState(false);

  const palette = generatePalette(baseColor, mode);

  const copyColor = useCallback((hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 1500);
  }, []);

  const copyAll = useCallback(() => {
    navigator.clipboard.writeText(palette.join(", "));
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 1500);
  }, [palette]);

  return (
    <div style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans',sans-serif", minHeight: "100vh" }}>
      <style>{S}</style>

      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>color-palette-generator</span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-7">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Medien & Design</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.6rem,5vw,2.4rem)", color: "#fff", marginBottom: "0.3rem" }}>Farbpaletten Generator</h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Harmonische Farbpaletten aus einer Basisfarbe – komplementär, triadisch, analog und mehr.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Base color picker */}
          <div className="card p-5">
            <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.75rem" }}>Basisfarbe</label>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <input
                type="color"
                className="color-input"
                value={baseColor}
                onChange={e => setBaseColor(e.target.value)}
              />
              <div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "1.2rem", color: "#e2e8f0", fontWeight: 600 }}>{baseColor.toUpperCase()}</div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#475569" }}>
                  {(() => { const [h,s,l] = hexToHsl(baseColor); return `hsl(${h}, ${s}%, ${l}%)`; })()}
                </div>
              </div>
            </div>
          </div>

          {/* Mode selection */}
          <div className="card p-5">
            <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.75rem" }}>Harmonie-Typ</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {MODES.map(m => (
                <button key={m.id} className={`mode-btn ${mode === m.id ? "active" : ""}`} onClick={() => setMode(m.id)}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Palette display */}
          <div className="card p-5">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Palette ({palette.length} Farben)
              </label>
              <button className={`copy-btn ${allCopied ? "ok" : ""}`} onClick={copyAll}>
                {allCopied ? "✓ Kopiert" : "Alle kopieren"}
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: `repeat(${palette.length}, 1fr)`, gap: "0.75rem" }}>
              {palette.map((hex, i) => {
                const lum = luminance(hex);
                const textColor = lum > 0.35 ? "#111827" : "#f9fafb";
                return (
                  <div key={i} className="swatch" style={{ height: "160px", backgroundColor: hex }} onClick={() => copyColor(hex)}>
                    <div className="swatch-copy" style={{ color: textColor }}>
                      {copied === hex ? "✓ Kopiert!" : "Klicken"}
                    </div>
                    <div style={{
                      position: "absolute", bottom: "0.5rem", left: 0, right: 0,
                      textAlign: "center", fontFamily: "'JetBrains Mono',monospace",
                      fontSize: "0.65rem", color: textColor, opacity: 0.8,
                      padding: "0 0.25rem",
                    }}>
                      {hex.toUpperCase()}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {palette.map((hex, i) => {
                const [h, s, l] = hexToHsl(hex);
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.4rem 0.6rem", borderRadius: "0.4rem", background: "rgba(14,165,233,0.04)" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "0.35rem", backgroundColor: hex, flexShrink: 0, border: "1px solid rgba(255,255,255,0.1)" }} />
                    <div style={{ flex: 1, fontFamily: "'JetBrains Mono',monospace", fontSize: "0.75rem", color: "#94a3b8" }}>
                      <span style={{ color: "#e2e8f0" }}>{hex.toUpperCase()}</span>
                      <span style={{ color: "#334155", marginLeft: "0.75rem" }}>hsl({h}, {s}%, {l}%)</span>
                    </div>
                    <button className={`copy-btn ${copied === hex ? "ok" : ""}`} style={{ padding: "0.3rem 0.7rem", fontSize: "0.7rem" }} onClick={() => copyColor(hex)}>
                      {copied === hex ? "✓" : "Kopieren"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
