"use client";
import { useState } from "react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
  .card { background: linear-gradient(135deg,#071422 0%,#050d1a 100%); border: 1px solid rgba(14,165,233,0.2); border-radius: 1rem; }
  .base-input { background: rgba(7,20,34,0.8); border: 1px solid rgba(14,165,233,0.2); border-radius: 0.5rem; color: #e2e8f0; padding: 0.65rem 0.9rem; font-family: 'JetBrains Mono',monospace; font-size: 1rem; width: 100%; outline: none; transition: border-color 0.2s; }
  .base-input:focus { border-color: rgba(0,212,255,0.45); }
  .base-input.err { border-color: rgba(239,68,68,0.5); color: #f87171; }
  .base-input:read-only { cursor: pointer; }
  .base-input:read-only:hover { border-color: rgba(0,212,255,0.3); }
  .base-label { font-family: 'JetBrains Mono',monospace; font-size: 0.65rem; color: #38bdf8; letter-spacing: 0.08em; text-transform: uppercase; display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem; }
  .copy-mini { background: transparent; border: none; color: #475569; cursor: pointer; font-family: 'JetBrains Mono',monospace; font-size: 0.65rem; padding: 0; transition: color 0.15s; }
  .copy-mini:hover { color: #38bdf8; }
  .copy-mini.ok { color: #4ade80; }
  .bit-grid { display: flex; flex-wrap: wrap; gap: 3px; }
  .bit { width: 22px; height: 22px; border-radius: 3px; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono',monospace; font-size: 0.7rem; font-weight: 600; }
  .bit-1 { background: rgba(14,165,233,0.25); border: 1px solid rgba(14,165,233,0.4); color: #38bdf8; }
  .bit-0 { background: rgba(7,20,34,0.6); border: 1px solid rgba(14,165,233,0.1); color: #334155; }
`;

type BaseId = "dec" | "hex" | "bin" | "oct";
const BASES: { id: BaseId; label: string; radix: number; prefix: string; placeholder: string }[] = [
  { id: "dec", label: "Dezimal (10)", radix: 10, prefix: "",   placeholder: "255" },
  { id: "hex", label: "Hexadezimal (16)", radix: 16, prefix: "0x", placeholder: "FF" },
  { id: "bin", label: "Binär (2)",    radix: 2,  prefix: "0b", placeholder: "11111111" },
  { id: "oct", label: "Oktal (8)",    radix: 8,  prefix: "0o", placeholder: "377" },
];

function parseAny(s: string): number | null {
  const clean = s.trim().replace(/^0x/i, "").replace(/^0b/i, "").replace(/^0o/i, "");
  if (!clean) return null;
  const n = parseInt(clean, 16);
  if (!isNaN(n) && n.toString(16).toLowerCase() === clean.toLowerCase().replace(/^0+/, "") || clean === "0") return null;
  return null;
}

export default function NumberBaseConverterPage() {
  const [values, setValues] = useState<Record<BaseId, string>>({ dec: "", hex: "", bin: "", oct: "" });
  const [activeBase, setActiveBase] = useState<BaseId>("dec");
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState<BaseId | null>(null);

  function handleChange(id: BaseId, raw: string) {
    setActiveBase(id);
    const base = BASES.find(b => b.id === id)!;
    const clean = raw.replace(/^0x/i, "").replace(/^0b/i, "").replace(/^0o/i, "").trim();
    if (!clean) {
      setValues({ dec: "", hex: "", bin: "", oct: "" });
      setError(false);
      return;
    }
    const n = parseInt(clean, base.radix);
    if (isNaN(n) || n < 0) {
      setValues(prev => ({ ...prev, [id]: raw }));
      setError(true);
      return;
    }
    setError(false);
    setValues({
      dec: n.toString(10),
      hex: n.toString(16).toUpperCase(),
      bin: n.toString(2),
      oct: n.toString(8),
    });
  }

  function copyVal(id: BaseId) {
    const v = values[id];
    if (!v) return;
    navigator.clipboard.writeText(v);
    setCopied(id);
    setTimeout(() => setCopied(null), 1200);
  }

  const binStr = values.bin;
  const bits = binStr ? binStr.padStart(Math.max(8, Math.ceil(binStr.length / 8) * 8), "0").split("") : [];

  return (
    <div style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans',sans-serif", minHeight: "100vh" }}>
      <style>{S}</style>

      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>number-base-converter</span>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-6 py-10">
        <div className="mb-7">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Web & Dev</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.6rem)", color: "#fff", marginBottom: "0.3rem" }}>Zahlensystem Konverter</h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Dezimal, Hex, Binär, Oktal — sofort, lokal.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          <div className="card p-5">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              {BASES.map(b => (
                <div key={b.id}>
                  <div className="base-label">
                    <span>{b.label}</span>
                    <button className={`copy-mini ${copied === b.id ? "ok" : ""}`} onClick={() => copyVal(b.id)}>
                      {copied === b.id ? "✓ kopiert" : "kopieren"}
                    </button>
                  </div>
                  <input
                    className={`base-input ${activeBase === b.id && error ? "err" : ""}`}
                    type="text"
                    placeholder={b.placeholder}
                    value={values[b.id]}
                    onChange={e => handleChange(b.id, e.target.value)}
                    spellCheck={false}
                  />
                </div>
              ))}
            </div>
            {error && (
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: "#f87171", marginTop: "0.5rem" }}>
                ⚠ Ungültige Eingabe für dieses Zahlensystem.
              </p>
            )}
          </div>

          {bits.length > 0 && (
            <div className="card p-5">
              <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.6rem" }}>
                Bit-Visualisierung ({bits.length} Bit)
              </label>
              <div className="bit-grid">
                {bits.map((bit, i) => (
                  <div key={i} className={`bit ${bit === "1" ? "bit-1" : "bit-0"}`}>{bit}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
