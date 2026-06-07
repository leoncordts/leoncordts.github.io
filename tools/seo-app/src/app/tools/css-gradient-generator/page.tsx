"use client";
import { useState } from "react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
  .card { background: linear-gradient(135deg,#071422 0%,#050d1a 100%); border: 1px solid rgba(14,165,233,0.2); border-radius: 1rem; }
  .seg-btn { border-radius: 0.4rem; padding: 0.32rem 0.7rem; font-family: 'JetBrains Mono',monospace; font-size: 0.7rem; cursor: pointer; border: 1px solid rgba(14,165,233,0.22); background: transparent; color: #64748b; transition: all 0.2s; }
  .seg-btn.active { border-color: rgba(0,212,255,0.6); background: rgba(14,165,233,0.1); color: #38bdf8; }
  .gg-label { font-family: 'JetBrains Mono',monospace; font-size: 0.65rem; color: #38bdf8; letter-spacing: 0.08em; text-transform: uppercase; display: block; margin-bottom: 0.35rem; }
  .gg-range { width: 100%; accent-color: #38bdf8; cursor: pointer; }
  .stop-row { display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0; }
  .stop-color { width: 36px; height: 36px; border-radius: 0.4rem; border: 1px solid rgba(14,165,233,0.3); cursor: pointer; padding: 2px; background: transparent; flex-shrink: 0; }
  .stop-pos { background: rgba(7,20,34,0.8); border: 1px solid rgba(14,165,233,0.2); border-radius: 0.4rem; color: #e2e8f0; padding: 0.4rem 0.55rem; font-family: 'JetBrains Mono',monospace; font-size: 0.8rem; width: 72px; outline: none; }
  .stop-pos:focus { border-color: rgba(0,212,255,0.45); }
  .icon-btn { background: transparent; border: 1px solid rgba(14,165,233,0.2); border-radius: 0.35rem; color: #475569; cursor: pointer; padding: 0.3rem 0.5rem; font-size: 0.75rem; transition: all 0.15s; }
  .icon-btn:hover { color: #38bdf8; border-color: rgba(0,212,255,0.4); }
  .icon-btn.danger:hover { color: #f87171; border-color: rgba(239,68,68,0.4); }
  .css-output { background: rgba(7,20,34,0.9); border: 1px solid rgba(14,165,233,0.18); border-radius: 0.6rem; padding: 0.9rem 1rem; font-family: 'JetBrains Mono',monospace; font-size: 0.78rem; color: #38bdf8; word-break: break-all; line-height: 1.6; }
  .copy-btn { background: rgba(14,165,233,0.1); border: 1px solid rgba(14,165,233,0.3); border-radius: 0.45rem; color: #38bdf8; cursor: pointer; padding: 0.45rem 1rem; font-family: 'JetBrains Mono',monospace; font-size: 0.75rem; transition: all 0.2s; }
  .copy-btn:hover { background: rgba(14,165,233,0.2); }
  .copy-btn.ok { color: #4ade80; border-color: rgba(74,222,128,0.4); }
`;

type GradType = "linear" | "radial" | "conic";

interface Stop { color: string; pos: number; }

const PRESETS: { label: string; type: GradType; angle: number; stops: Stop[] }[] = [
  { label: "Ocean",   type: "linear", angle: 135, stops: [{ color: "#020b18", pos: 0 }, { color: "#0ea5e9", pos: 100 }] },
  { label: "Sunset",  type: "linear", angle: 90,  stops: [{ color: "#f97316", pos: 0 }, { color: "#ec4899", pos: 50 }, { color: "#8b5cf6", pos: 100 }] },
  { label: "Mint",    type: "linear", angle: 135, stops: [{ color: "#059669", pos: 0 }, { color: "#06b6d4", pos: 100 }] },
  { label: "Fire",    type: "linear", angle: 180, stops: [{ color: "#fbbf24", pos: 0 }, { color: "#ef4444", pos: 100 }] },
  { label: "Night",   type: "radial", angle: 0,   stops: [{ color: "#312e81", pos: 0 }, { color: "#020b18", pos: 100 }] },
  { label: "Aurora",  type: "linear", angle: 45,  stops: [{ color: "#10b981", pos: 0 }, { color: "#6366f1", pos: 50 }, { color: "#ec4899", pos: 100 }] },
];

function buildCSS(type: GradType, angle: number, stops: Stop[]): string {
  const s = stops.map(st => `${st.color} ${st.pos}%`).join(", ");
  if (type === "linear")  return `linear-gradient(${angle}deg, ${s})`;
  if (type === "radial")  return `radial-gradient(circle, ${s})`;
  return `conic-gradient(from ${angle}deg, ${s})`;
}

export default function CssGradientPage() {
  const [type, setType]   = useState<GradType>("linear");
  const [angle, setAngle] = useState(135);
  const [stops, setStops] = useState<Stop[]>([
    { color: "#020b18", pos: 0 },
    { color: "#38bdf8", pos: 100 },
  ]);
  const [copied, setCopied] = useState(false);

  const gradStr = buildCSS(type, angle, stops);
  const fullCSS = `background: ${gradStr};`;

  function updateStop(i: number, patch: Partial<Stop>) {
    setStops(prev => prev.map((s, idx) => idx === i ? { ...s, ...patch } : s));
  }

  function addStop() {
    const mid = Math.round((stops[0].pos + stops[stops.length - 1].pos) / 2);
    setStops(prev => [...prev, { color: "#7c3aed", pos: mid }].sort((a, b) => a.pos - b.pos));
  }

  function removeStop(i: number) {
    if (stops.length <= 2) return;
    setStops(prev => prev.filter((_, idx) => idx !== i));
  }

  function applyPreset(p: typeof PRESETS[0]) {
    setType(p.type);
    setAngle(p.angle);
    setStops(p.stops.map(s => ({ ...s })));
  }

  function copy() {
    navigator.clipboard.writeText(fullCSS);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans',sans-serif", minHeight: "100vh" }}>
      <style>{S}</style>

      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>css-gradient-generator</span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-6">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Design</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.6rem)", color: "#fff", marginBottom: "0.3rem" }}>CSS Gradient Generator</h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Verläufe visuell erstellen und CSS-Code kopieren — lokal.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
          {/* Left: controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>

            {/* Preview */}
            <div style={{ borderRadius: "0.75rem", height: "120px", background: gradStr, border: "1px solid rgba(14,165,233,0.15)" }} />

            {/* Type */}
            <div className="card p-4">
              <span className="gg-label">Typ</span>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                {(["linear","radial","conic"] as GradType[]).map(t => (
                  <button key={t} className={`seg-btn ${type === t ? "active" : ""}`} onClick={() => setType(t)}>{t}</button>
                ))}
              </div>
            </div>

            {/* Angle */}
            {type !== "radial" && (
              <div className="card p-4">
                <span className="gg-label">Winkel — {angle}°</span>
                <input type="range" className="gg-range" min={0} max={360} value={angle} onChange={e => setAngle(Number(e.target.value))} />
              </div>
            )}

            {/* Presets */}
            <div className="card p-4">
              <span className="gg-label">Presets</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {PRESETS.map(p => (
                  <button key={p.label} className="seg-btn" onClick={() => applyPreset(p)}>{p.label}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: stops + output */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>

            {/* Color stops */}
            <div className="card p-4" style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                <span className="gg-label" style={{ marginBottom: 0 }}>Farbstopps</span>
                <button className="icon-btn" onClick={addStop} title="Stopp hinzufügen">+ add</button>
              </div>
              {stops.map((st, i) => (
                <div key={i} className="stop-row">
                  <input type="color" className="stop-color" value={st.color} onChange={e => updateStop(i, { color: e.target.value })} />
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: "#475569", width: "60px" }}>{st.color}</span>
                  <input type="number" className="stop-pos" min={0} max={100} value={st.pos}
                    onChange={e => updateStop(i, { pos: Math.min(100, Math.max(0, Number(e.target.value))) })} />
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#334155" }}>%</span>
                  <button className="icon-btn danger" onClick={() => removeStop(i)} disabled={stops.length <= 2} title="Entfernen">✕</button>
                </div>
              ))}
            </div>

            {/* CSS output */}
            <div className="card p-4">
              <span className="gg-label">CSS</span>
              <div className="css-output">{fullCSS}</div>
              <button className={`copy-btn ${copied ? "ok" : ""}`} onClick={copy} style={{ marginTop: "0.6rem", width: "100%" }}>
                {copied ? "✓ Kopiert!" : "CSS kopieren"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
