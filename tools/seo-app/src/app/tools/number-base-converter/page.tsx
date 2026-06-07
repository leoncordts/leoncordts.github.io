"use client";
import { useState } from "react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
  .card { background: linear-gradient(135deg,#071422 0%,#050d1a 100%); border: 1px solid rgba(14,165,233,0.2); border-radius: 1rem; }
  .base-input { background: rgba(7,20,34,0.8); border: 1px solid rgba(14,165,233,0.18); border-radius: 0.5rem; color: #e2e8f0; padding: 0.65rem 1rem; font-family: 'JetBrains Mono',monospace; font-size: 1rem; width: 100%; outline: none; transition: border-color 0.2s; }
  .base-input:focus { border-color: rgba(0,212,255,0.45); }
  .base-input.err { border-color: rgba(239,68,68,0.45); }
  .base-label { font-family: 'JetBrains Mono',monospace; font-size: 0.68rem; color: #38bdf8; letter-spacing: 0.08em; text-transform: uppercase; display: block; margin-bottom: 0.4rem; }
  .copy-btn { background: rgba(14,165,233,0.1); border: 1px solid rgba(14,165,233,0.22); color: #38bdf8; border-radius: 0.35rem; padding: 0.22rem 0.6rem; font-size: 0.68rem; font-family: 'JetBrains Mono',monospace; cursor: pointer; transition: all 0.2s; position: absolute; right: 0.5rem; top: 50%; transform: translateY(-50%); }
  .copy-btn:hover { background: rgba(14,165,233,0.22); }
  .copy-btn.ok { background: rgba(34,197,94,0.15); border-color: rgba(34,197,94,0.3); color: #4ade80; }
  .bit-cell { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 0.3rem; font-family: 'JetBrains Mono',monospace; font-size: 0.8rem; font-weight: 600; border: 1px solid rgba(14,165,233,0.15); }
  .bit-1 { background: rgba(56,189,248,0.18); border-color: rgba(56,189,248,0.4); color: #38bdf8; }
  .bit-0 { color: #334155; }
`;

const BASES = [
  { label: "Binaer (2)",        radix: 2,  placeholder: "z.B. 1010",    pattern: /^[01]*$/ },
  { label: "Oktal (8)",         radix: 8,  placeholder: "z.B. 17",      pattern: /^[0-7]*$/ },
  { label: "Dezimal (10)",      radix: 10, placeholder: "z.B. 255",     pattern: /^\d*$/ },
  { label: "Hexadezimal (16)",  radix: 16, placeholder: "z.B. FF",      pattern: /^[0-9a-fA-F]*$/ },
];

export default function NumberBaseConverterPage() {
  const [values, setValues] = useState(["", "", "", ""]);
  const [errors, setErrors] = useState([false, false, false, false]);
  const [copied, setCopied] = useState(-1);

  function handleChange(idx: number, raw: string) {
    const base = BASES[idx];
    if (raw !== "" && !base.pattern.test(raw)) return;
    const next = [...values];
    const errs = [false, false, false, false];

    if (raw === "") {
      setValues(["", "", "", ""]);
      setErrors(errs);
      return;
    }

    const num = parseInt(raw, base.radix);
    if (isNaN(num) || num < 0) {
      errs[idx] = true;
      next[idx] = raw;
      setValues(next);
      setErrors(errs);
      return;
    }

    const updated = BASES.map((b, i) =>
      i === idx ? raw : num.toString(b.radix).toUpperCase()
    );
    setValues(updated);
    setErrors(errs);
  }

  function copy(idx: number) {
    if (values[idx]) {
      navigator.clipboard.writeText(values[idx].toUpperCase());
      setCopied(idx);
      setTimeout(() => setCopied(-1), 1400);
    }
  }

  const decNum = parseInt(values[2], 10);
  const validDec = values[2] !== "" && !isNaN(decNum) && decNum >= 0;
  const bits = validDec
    ? decNum.toString(2).padStart(Math.max(8, Math.ceil(decNum.toString(2).length / 8) * 8), "0")
    : null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{S}</style>
      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>number-base-converter</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Web &amp; Developer Tools</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.8rem)", color: "#fff", marginBottom: "0.5rem" }}>Zahlensystem Konverter</h1>
          <p style={{ color: "#94a3b8" }}>Binaer, Oktal, Dezimal und Hexadezimal — gegenseitig umrechnen mit Bit-Visualisierung.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          <div className="card p-6" style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            {BASES.map((b, i) => (
              <div key={b.radix}>
                <label className="base-label">{b.label}</label>
                <div style={{ position: "relative" }}>
                  <input
                    className={"base-input" + (errors[i] ? " err" : "")}
                    placeholder={b.placeholder}
                    value={values[i]}
                    onChange={e => handleChange(i, e.target.value)}
                    style={{ paddingRight: "3.5rem", textTransform: i === 3 ? "uppercase" : "none" }}
                  />
                  {values[i] && (
                    <button className={"copy-btn" + (copied === i ? " ok" : "")} onClick={() => copy(i)}>
                      {copied === i ? "Copied" : "Copy"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {bits && (
            <div className="card p-5">
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                Bit-Darstellung ({bits.length} Bit)
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                {bits.split("").map((bit, i) => (
                  <div key={i} className={"bit-cell " + (bit === "1" ? "bit-1" : "bit-0")}>{bit}</div>
                ))}
              </div>
              <div style={{ marginTop: "0.85rem", display: "flex", gap: "1.75rem", flexWrap: "wrap" }}>
                {[
                  { label: "Dezimalwert", val: decNum.toLocaleString("de-DE") },
                  { label: "Bits gesamt", val: String(bits.length) },
                  { label: "Bits gesetzt", val: String(bits.split("").filter(b => b === "1").length) },
                ].map(({ label, val }) => (
                  <div key={label}>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.62rem", color: "#475569", letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</div>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.92rem", color: "#e2e8f0" }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
