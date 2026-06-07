"use client";
import { useState } from "react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
  .card { background: linear-gradient(135deg,#071422 0%,#050d1a 100%); border: 1px solid rgba(14,165,233,0.2); border-radius: 1rem; }
  .pct-input { background: rgba(7,20,34,0.8); border: 1px solid rgba(14,165,233,0.2); border-radius: 0.45rem; color: #e2e8f0; padding: 0.5rem 0.75rem; font-family: 'JetBrains Mono',monospace; font-size: 0.9rem; width: 90px; outline: none; text-align: center; transition: border-color 0.2s; }
  .pct-input:focus { border-color: rgba(0,212,255,0.4); }
  .result-box { background: rgba(14,165,233,0.08); border: 1px solid rgba(14,165,233,0.2); border-radius: 0.45rem; padding: 0.5rem 1rem; font-family: 'JetBrains Mono',monospace; font-size: 1rem; color: #38bdf8; min-width: 110px; text-align: center; }
  .formula-row { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; font-size: 0.95rem; color: #94a3b8; }
  .label-sep { color: #1e3a5f; font-size: 0.9rem; }
  .result-label { font-family: 'JetBrains Mono',monospace; font-size: 0.7rem; color: #38bdf8; letter-spacing: 0.08em; text-transform: uppercase; display: block; margin-bottom: 0.4rem; }
`;

function fmt(n: number): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  return parseFloat(n.toFixed(4)).toLocaleString("de-DE");
}

export default function PercentageCalculatorPage() {
  // Formula 1: X% of Y = ?
  const [f1x, setF1x] = useState(""); const [f1y, setF1y] = useState("");
  const f1result = f1x && f1y ? (parseFloat(f1x) / 100) * parseFloat(f1y) : NaN;

  // Formula 2: Change from X to Y = ?%
  const [f2x, setF2x] = useState(""); const [f2y, setF2y] = useState("");
  const f2result = f2x && f2y ? ((parseFloat(f2y) - parseFloat(f2x)) / Math.abs(parseFloat(f2x))) * 100 : NaN;

  // Formula 3: X is what % of Y?
  const [f3x, setF3x] = useState(""); const [f3y, setF3y] = useState("");
  const f3result = f3x && f3y ? (parseFloat(f3x) / parseFloat(f3y)) * 100 : NaN;

  // Formula 4: X + Y% = ?
  const [f4x, setF4x] = useState(""); const [f4y, setF4y] = useState("");
  const f4result = f4x && f4y ? parseFloat(f4x) * (1 + parseFloat(f4y) / 100) : NaN;

  return (
    <div style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans',sans-serif", minHeight: "100vh" }}>
      <style>{S}</style>
      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>percentage-calculator</span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-7">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Rechner</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.6rem)", color: "#fff", marginBottom: "0.3rem" }}>Prozentrechner</h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Alle Prozent-Formeln auf einen Blick — Ergebnis sofort.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          {/* F1 */}
          <div className="card p-5">
            <span className="result-label">Wie viel sind X % von Y?</span>
            <div className="formula-row">
              <input className="pct-input" type="number" placeholder="X" value={f1x} onChange={e => setF1x(e.target.value)} />
              <span>% von</span>
              <input className="pct-input" type="number" placeholder="Y" value={f1y} onChange={e => setF1y(e.target.value)} />
              <span className="label-sep">=</span>
              <div className="result-box">{f1x && f1y ? fmt(f1result) : "—"}</div>
            </div>
          </div>

          {/* F2 */}
          <div className="card p-5">
            <span className="result-label">Änderung von X auf Y in %?</span>
            <div className="formula-row">
              <input className="pct-input" type="number" placeholder="X (alt)" value={f2x} onChange={e => setF2x(e.target.value)} />
              <span>→</span>
              <input className="pct-input" type="number" placeholder="Y (neu)" value={f2y} onChange={e => setF2y(e.target.value)} />
              <span className="label-sep">=</span>
              <div className="result-box" style={{ color: f2x && f2y ? (f2result >= 0 ? "#4ade80" : "#f87171") : "#38bdf8" }}>
                {f2x && f2y ? (f2result >= 0 ? "+" : "") + fmt(f2result) + " %" : "—"}
              </div>
            </div>
          </div>

          {/* F3 */}
          <div className="card p-5">
            <span className="result-label">X ist wie viel % von Y?</span>
            <div className="formula-row">
              <input className="pct-input" type="number" placeholder="X" value={f3x} onChange={e => setF3x(e.target.value)} />
              <span>von</span>
              <input className="pct-input" type="number" placeholder="Y" value={f3y} onChange={e => setF3y(e.target.value)} />
              <span className="label-sep">=</span>
              <div className="result-box">{f3x && f3y ? fmt(f3result) + " %" : "—"}</div>
            </div>
          </div>

          {/* F4 */}
          <div className="card p-5">
            <span className="result-label">X erhöht / verringert um Y%?</span>
            <div className="formula-row">
              <input className="pct-input" type="number" placeholder="X" value={f4x} onChange={e => setF4x(e.target.value)} />
              <span>±</span>
              <input className="pct-input" type="number" placeholder="Y %" value={f4y} onChange={e => setF4y(e.target.value)} />
              <span className="label-sep">=</span>
              <div className="result-box">{f4x && f4y ? fmt(f4result) : "—"}</div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
