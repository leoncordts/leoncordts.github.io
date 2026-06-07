"use client";
import { useState, useCallback, useEffect } from "react";

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
}

function parseRgb(input: string): { r: number; g: number; b: number } | null {
  const m = input.match(/rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/i);
  if (!m) return null;
  const r = parseInt(m[1]), g = parseInt(m[2]), b = parseInt(m[3]);
  if ([r, g, b].some((v) => v > 255)) return null;
  return { r, g, b };
}

function isValidHex(hex: string) {
  return /^#?[0-9a-fA-F]{6}$/.test(hex.trim());
}

export default function ColorConverterPage() {
  const [hex, setHex] = useState("#3B82F6");
  const [rgb, setRgb] = useState("rgb(59, 130, 246)");
  const [bgColor, setBgColor] = useState("#3B82F6");
  const [copied, setCopied] = useState<string | null>(null);
  const [hexError, setHexError] = useState(false);
  const [rgbError, setRgbError] = useState(false);
  const [eyedropperSupported, setEyedropperSupported] = useState(false);

  useEffect(() => {
    setEyedropperSupported(typeof window !== "undefined" && "EyeDropper" in window);
  }, []);

  const copy = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }, []);

  function onHexChange(val: string) {
    setHex(val);
    setHexError(false);
    const result = hexToRgb(val);
    if (result) {
      const { r, g, b } = result;
      setRgb(`rgb(${r}, ${g}, ${b})`);
      setBgColor(val.startsWith("#") ? val : "#" + val);
      setRgbError(false);
    } else {
      setHexError(true);
    }
  }

  function onRgbChange(val: string) {
    setRgb(val);
    setRgbError(false);
    const result = parseRgb(val);
    if (result) {
      const h = rgbToHex(result.r, result.g, result.b);
      setHex(h);
      setBgColor(h);
      setHexError(false);
    } else {
      setRgbError(true);
    }
  }

  async function openEyeDropper() {
    if (!eyedropperSupported) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dropper = new (window as any).EyeDropper();
      const result = await dropper.open();
      onPickerChange(result.sRGBHex);
    } catch {
      // user cancelled
    }
  }

  function onPickerChange(val: string) {
    setHex(val.toUpperCase());
    const result = hexToRgb(val);
    if (result) {
      const { r, g, b } = result;
      setRgb(`rgb(${r}, ${g}, ${b})`);
      setBgColor(val);
      setHexError(false);
      setRgbError(false);
    }
  }

  const previewStyle = {
    backgroundColor: bgColor,
    transition: "background-color 0.4s ease",
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
        .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
        .card { background: linear-gradient(135deg,#071422 0%,#050d1a 100%); border: 1px solid rgba(14,165,233,0.2); border-radius: 1rem; }
        .input-field { background: rgba(7,20,34,0.8); border: 1px solid rgba(14,165,233,0.25); border-radius: 0.5rem; color: #e2e8f0; padding: 0.75rem 1rem; font-family: 'JetBrains Mono', monospace; font-size: 1rem; width: 100%; outline: none; transition: border-color 0.2s; }
        .input-field:focus { border-color: rgba(0,212,255,0.5); box-shadow: 0 0 0 2px rgba(0,212,255,0.1); }
        .input-error { border-color: rgba(239,68,68,0.6) !important; }
        .copy-btn { background: rgba(14,165,233,0.15); border: 1px solid rgba(14,165,233,0.3); color: #38bdf8; border-radius: 0.4rem; padding: 0.4rem 0.75rem; font-size: 0.75rem; font-family: 'JetBrains Mono', monospace; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .copy-btn:hover { background: rgba(14,165,233,0.3); border-color: rgba(0,212,255,0.5); }
        .copy-btn.success { background: rgba(34,197,94,0.2); border-color: rgba(34,197,94,0.4); color: #4ade80; }
        .picker-btn { width: 48px; height: 48px; border-radius: 0.5rem; border: 2px solid rgba(14,165,233,0.3); cursor: pointer; background: transparent; padding: 2px; overflow: hidden; }
        .picker-btn input[type="color"] { width: 100%; height: 100%; border: none; cursor: pointer; border-radius: 4px; }
        .dropper-btn { width: 48px; height: 48px; border-radius: 0.5rem; border: 2px solid rgba(14,165,233,0.3); cursor: pointer; background: rgba(7,20,34,0.8); color: #38bdf8; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .dropper-btn:hover { background: rgba(14,165,233,0.2); border-color: rgba(0,212,255,0.5); }
      `}</style>

      {/* Nav */}
      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>color-converter</span>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
            Web & Developer Tools
          </div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.8rem)", color: "#fff", marginBottom: "0.5rem" }}>
            HEX ↔ RGB Color Converter
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1rem" }}>Konvertiere Farben sofort in beide Richtungen — mit Live-Vorschau und Color-Picker.</p>
        </div>

        {/* Color Preview */}
        <div className="card mb-8 overflow-hidden" style={{ ...previewStyle, minHeight: "160px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)", borderRadius: "0.75rem", padding: "1rem 2rem", textAlign: "center" }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "1.5rem", fontWeight: 700, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>{hex.toUpperCase()}</div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.9rem", color: "rgba(255,255,255,0.8)", marginTop: "0.25rem" }}>{rgb}</div>
          </div>
        </div>

        {/* Converter */}
        <div className="card p-8 mb-6">
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "1.5rem", alignItems: "center" }}>

            {/* HEX */}
            <div>
              <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.75rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>
                HEX
              </label>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <input
                  className={`input-field ${hexError ? "input-error" : ""}`}
                  value={hex}
                  onChange={(e) => onHexChange(e.target.value)}
                  placeholder="#FF5733"
                  spellCheck={false}
                />
                <button className={`copy-btn ${copied === "hex" ? "success" : ""}`} onClick={() => copy(hex, "hex")}>
                  {copied === "hex" ? "✓" : "Kopieren"}
                </button>
              </div>
              {hexError && <p style={{ color: "#f87171", fontSize: "0.72rem", marginTop: "0.35rem", fontFamily: "'JetBrains Mono',monospace" }}>Ungültiger HEX-Wert</p>}
            </div>

            {/* Arrows + Color Picker + Eyedropper */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", paddingTop: "1.2rem" }}>
              <div style={{ fontSize: "1.4rem", color: "#38bdf8" }}>⇄</div>
              <div className="picker-btn" title="Color Picker">
                <input type="color" value={isValidHex(hex) ? (hex.startsWith("#") ? hex : "#" + hex) : "#3B82F6"} onChange={(e) => onPickerChange(e.target.value)} />
              </div>
              {eyedropperSupported && (
                <button className="dropper-btn" onClick={openEyeDropper} title="Pipette: Farbe vom Bildschirm aufnehmen">
                  🩸
                </button>
              )}
            </div>

            {/* RGB */}
            <div>
              <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.75rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>
                RGB
              </label>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <input
                  className={`input-field ${rgbError ? "input-error" : ""}`}
                  value={rgb}
                  onChange={(e) => onRgbChange(e.target.value)}
                  placeholder="rgb(255, 87, 51)"
                  spellCheck={false}
                />
                <button className={`copy-btn ${copied === "rgb" ? "success" : ""}`} onClick={() => copy(rgb, "rgb")}>
                  {copied === "rgb" ? "✓" : "Kopieren"}
                </button>
              </div>
              {rgbError && <p style={{ color: "#f87171", fontSize: "0.72rem", marginTop: "0.35rem", fontFamily: "'JetBrains Mono',monospace" }}>Format: rgb(0-255, 0-255, 0-255)</p>}
            </div>
          </div>
        </div>

        {/* Quick colors */}
        <div className="card p-6">
          <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: "#64748b", marginBottom: "0.75rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>Schnellauswahl</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {["#EF4444","#F97316","#EAB308","#22C55E","#3B82F6","#8B5CF6","#EC4899","#14B8A6","#F8FAFC","#0F172A"].map((c) => (
              <button
                key={c}
                onClick={() => onHexChange(c)}
                style={{ width: "36px", height: "36px", borderRadius: "0.4rem", backgroundColor: c, border: bgColor.toUpperCase() === c ? "2px solid #00d4ff" : "2px solid transparent", cursor: "pointer", transition: "transform 0.15s", boxShadow: bgColor.toUpperCase() === c ? "0 0 12px rgba(0,212,255,0.5)" : "none" }}
                title={c}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
