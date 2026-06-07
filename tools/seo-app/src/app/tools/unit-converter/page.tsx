"use client";
import { useState } from "react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
  .card { background: linear-gradient(135deg,#071422 0%,#050d1a 100%); border: 1px solid rgba(14,165,233,0.2); border-radius: 1rem; }
  .cat-btn { border-radius: 0.45rem; padding: 0.35rem 0.75rem; font-family: 'JetBrains Mono',monospace; font-size: 0.7rem; cursor: pointer; border: 1px solid rgba(14,165,233,0.22); background: transparent; color: #64748b; transition: all 0.2s; white-space: nowrap; }
  .cat-btn.active { border-color: rgba(0,212,255,0.6); background: rgba(14,165,233,0.1); color: #38bdf8; }
  .uc-input { background: rgba(7,20,34,0.8); border: 1px solid rgba(14,165,233,0.2); border-radius: 0.5rem; color: #e2e8f0; padding: 0.6rem 0.85rem; font-family: 'JetBrains Mono',monospace; font-size: 0.95rem; width: 100%; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
  .uc-input:focus { border-color: rgba(0,212,255,0.45); }
  .uc-select { background: rgba(7,20,34,0.8); border: 1px solid rgba(14,165,233,0.2); border-radius: 0.5rem; color: #94a3b8; padding: 0.6rem 0.75rem; font-family: 'JetBrains Mono',monospace; font-size: 0.78rem; outline: none; cursor: pointer; width: 100%; }
  .uc-select:focus { border-color: rgba(0,212,255,0.45); }
  .swap-btn { background: rgba(14,165,233,0.08); border: 1px solid rgba(14,165,233,0.25); border-radius: 0.45rem; color: #38bdf8; cursor: pointer; padding: 0.5rem 0.7rem; font-size: 0.9rem; transition: all 0.2s; flex-shrink: 0; }
  .swap-btn:hover { background: rgba(14,165,233,0.18); }
  .result-row { display: flex; align-items: center; justify-content: space-between; padding: 0.55rem 0; border-bottom: 1px solid rgba(14,165,233,0.07); }
  .result-row:last-child { border-bottom: none; }
  .copy-mini { background: transparent; border: none; color: #475569; cursor: pointer; font-family: 'JetBrains Mono',monospace; font-size: 0.65rem; padding: 0; transition: color 0.15s; }
  .copy-mini:hover { color: #38bdf8; }
  .copy-mini.ok { color: #4ade80; }
`;

type Category = "temp" | "length" | "weight" | "volume" | "speed";

interface UnitDef {
  id: string;
  label: string;
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
}

const UNITS: Record<Category, { label: string; units: UnitDef[] }> = {
  temp: {
    label: "Temperatur",
    units: [
      { id: "c",  label: "Celsius (°C)",     toBase: v => v,                  fromBase: v => v },
      { id: "f",  label: "Fahrenheit (°F)",   toBase: v => (v - 32) * 5/9,    fromBase: v => v * 9/5 + 32 },
      { id: "k",  label: "Kelvin (K)",        toBase: v => v - 273.15,         fromBase: v => v + 273.15 },
      { id: "r",  label: "Rankine (°R)",      toBase: v => (v - 491.67) * 5/9,fromBase: v => (v + 273.15) * 9/5 },
    ],
  },
  length: {
    label: "Länge",
    units: [
      { id: "mm",  label: "Millimeter (mm)", toBase: v => v / 1000,      fromBase: v => v * 1000 },
      { id: "cm",  label: "Zentimeter (cm)", toBase: v => v / 100,       fromBase: v => v * 100 },
      { id: "m",   label: "Meter (m)",       toBase: v => v,              fromBase: v => v },
      { id: "km",  label: "Kilometer (km)",  toBase: v => v * 1000,       fromBase: v => v / 1000 },
      { id: "in",  label: "Zoll (in)",       toBase: v => v * 0.0254,    fromBase: v => v / 0.0254 },
      { id: "ft",  label: "Fuß (ft)",        toBase: v => v * 0.3048,    fromBase: v => v / 0.3048 },
      { id: "mi",  label: "Meile (mi)",      toBase: v => v * 1609.344,  fromBase: v => v / 1609.344 },
      { id: "nmi", label: "Seemeile (nmi)",  toBase: v => v * 1852,      fromBase: v => v / 1852 },
    ],
  },
  weight: {
    label: "Gewicht",
    units: [
      { id: "mg",  label: "Milligramm (mg)", toBase: v => v / 1e6,       fromBase: v => v * 1e6 },
      { id: "g",   label: "Gramm (g)",       toBase: v => v / 1000,      fromBase: v => v * 1000 },
      { id: "kg",  label: "Kilogramm (kg)",  toBase: v => v,              fromBase: v => v },
      { id: "t",   label: "Tonne (t)",       toBase: v => v * 1000,       fromBase: v => v / 1000 },
      { id: "oz",  label: "Unze (oz)",       toBase: v => v * 0.028349,  fromBase: v => v / 0.028349 },
      { id: "lb",  label: "Pfund (lb)",      toBase: v => v * 0.453592,  fromBase: v => v / 0.453592 },
      { id: "st",  label: "Stone (st)",      toBase: v => v * 6.35029,   fromBase: v => v / 6.35029 },
    ],
  },
  volume: {
    label: "Volumen",
    units: [
      { id: "ml",   label: "Milliliter (ml)",  toBase: v => v / 1000,      fromBase: v => v * 1000 },
      { id: "cl",   label: "Centiliter (cl)",  toBase: v => v / 100,       fromBase: v => v * 100 },
      { id: "dl",   label: "Deziliter (dl)",   toBase: v => v / 10,        fromBase: v => v * 10 },
      { id: "l",    label: "Liter (l)",        toBase: v => v,              fromBase: v => v },
      { id: "m3",   label: "Kubikmeter (m³)",  toBase: v => v * 1000,       fromBase: v => v / 1000 },
      { id: "tsp",  label: "Teelöffel (tsp)",  toBase: v => v * 0.00492892, fromBase: v => v / 0.00492892 },
      { id: "tbsp", label: "Esslöffel (tbsp)", toBase: v => v * 0.0147868,  fromBase: v => v / 0.0147868 },
      { id: "floz", label: "Fl. Oz (fl oz)",   toBase: v => v * 0.0295735,  fromBase: v => v / 0.0295735 },
      { id: "cup",  label: "Cup (cup)",        toBase: v => v * 0.236588,   fromBase: v => v / 0.236588 },
      { id: "gal",  label: "Gallone (gal)",    toBase: v => v * 3.78541,    fromBase: v => v / 3.78541 },
    ],
  },
  speed: {
    label: "Geschwindigkeit",
    units: [
      { id: "ms",   label: "m/s",           toBase: v => v,              fromBase: v => v },
      { id: "kmh",  label: "km/h",          toBase: v => v / 3.6,       fromBase: v => v * 3.6 },
      { id: "mph",  label: "mph",           toBase: v => v * 0.44704,   fromBase: v => v / 0.44704 },
      { id: "kn",   label: "Knoten (kn)",   toBase: v => v * 0.514444,  fromBase: v => v / 0.514444 },
      { id: "mach", label: "Mach",          toBase: v => v * 343,        fromBase: v => v / 343 },
      { id: "c",    label: "Lichtgeschw.", toBase: v => v * 299792458,   fromBase: v => v / 299792458 },
    ],
  },
};

const CATS: { id: Category; icon: string }[] = [
  { id: "temp",   icon: "🌡" },
  { id: "length", icon: "📏" },
  { id: "weight", icon: "⚖" },
  { id: "volume", icon: "🧪" },
  { id: "speed",  icon: "🚀" },
];

function fmt(n: number): string {
  if (!isFinite(n)) return "—";
  if (Math.abs(n) < 1e-10 && n !== 0) return n.toExponential(4);
  if (Math.abs(n) >= 1e10) return n.toExponential(4);
  const s = parseFloat(n.toPrecision(8)).toString();
  return s;
}

export default function UnitConverterPage() {
  const [cat, setCat] = useState<Category>("length");
  const [fromId, setFromId] = useState("m");
  const [toId, setToId]     = useState("ft");
  const [input, setInput]   = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const catDef = UNITS[cat];

  function changeCategory(c: Category) {
    setCat(c);
    setInput("");
    setFromId(UNITS[c].units[0].id);
    setToId(UNITS[c].units[1].id);
  }

  function getUnit(id: string) {
    return catDef.units.find(u => u.id === id) ?? catDef.units[0];
  }

  function convert(val: number, from: UnitDef, to: UnitDef) {
    return to.fromBase(from.toBase(val));
  }

  const numVal = parseFloat(input);
  const valid  = input !== "" && !isNaN(numVal);
  const fromUnit = getUnit(fromId);
  const toUnit   = getUnit(toId);
  const result   = valid ? convert(numVal, fromUnit, toUnit) : null;

  const allResults = valid
    ? catDef.units.filter(u => u.id !== fromId).map(u => ({
        label: u.label,
        value: fmt(convert(numVal, fromUnit, u)),
        id: u.id,
      }))
    : [];

  function swap() {
    setFromId(toId);
    setToId(fromId);
  }

  function copyVal(v: string, id: string) {
    navigator.clipboard.writeText(v);
    setCopied(id);
    setTimeout(() => setCopied(null), 1200);
  }

  return (
    <div style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans',sans-serif", minHeight: "100vh" }}>
      <style>{S}</style>

      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>unit-converter</span>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-6 py-10">
        <div className="mb-7">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Utilities</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.6rem)", color: "#fff", marginBottom: "0.3rem" }}>Einheitenrechner</h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Temperatur, Länge, Gewicht, Volumen, Geschwindigkeit — lokal.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {/* Category tabs */}
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {CATS.map(c => (
              <button key={c.id} className={`cat-btn ${cat === c.id ? "active" : ""}`} onClick={() => changeCategory(c.id)}>
                {c.icon} {UNITS[c.id].label}
              </button>
            ))}
          </div>

          {/* Converter */}
          <div className="card p-5">
            <div style={{ display: "flex", gap: "0.6rem", alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.35rem" }}>Von</label>
                <select className="uc-select" style={{ marginBottom: "0.4rem" }} value={fromId} onChange={e => setFromId(e.target.value)}>
                  {catDef.units.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
                </select>
                <input className="uc-input" type="number" placeholder="Wert eingeben…" value={input} onChange={e => setInput(e.target.value)} />
              </div>

              <button className="swap-btn" onClick={swap} title="Tauschen" style={{ marginBottom: "0.4rem" }}>⇄</button>

              <div style={{ flex: 1 }}>
                <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.35rem" }}>Nach</label>
                <select className="uc-select" style={{ marginBottom: "0.4rem" }} value={toId} onChange={e => setToId(e.target.value)}>
                  {catDef.units.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
                </select>
                <div style={{
                  background: "rgba(7,20,34,0.8)", border: "1px solid rgba(14,165,233,0.2)", borderRadius: "0.5rem",
                  padding: "0.6rem 0.85rem", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.95rem",
                  color: result !== null ? "#38bdf8" : "#334155", minHeight: "2.45rem",
                  display: "flex", alignItems: "center",
                }}>
                  {result !== null ? fmt(result) : "—"}
                </div>
              </div>
            </div>
            {result !== null && (
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: "#475569", marginTop: "0.6rem" }}>
                {input} {fromUnit.label} = <span style={{ color: "#38bdf8" }}>{fmt(result)} {toUnit.label}</span>
              </p>
            )}
          </div>

          {/* All conversions */}
          {allResults.length > 0 && (
            <div className="card p-5">
              <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>
                Alle Einheiten ({input} {fromUnit.label})
              </label>
              {allResults.map(r => (
                <div key={r.id} className="result-row">
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.78rem", color: "#64748b" }}>{r.label}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.85rem", color: "#e2e8f0" }}>{r.value}</span>
                    <button className={`copy-mini ${copied === r.id ? "ok" : ""}`} onClick={() => copyVal(r.value, r.id)}>
                      {copied === r.id ? "✓" : "copy"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
