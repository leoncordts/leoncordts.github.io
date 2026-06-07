"use client";
import { useState } from "react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
  .card { background: linear-gradient(135deg,#071422 0%,#050d1a 100%); border: 1px solid rgba(14,165,233,0.2); border-radius: 1rem; }
  .cron-input { background: rgba(7,20,34,0.8); border: 1px solid rgba(14,165,233,0.2); border-radius: 0.5rem; color: #38bdf8; padding: 0.75rem 1rem; font-family: 'JetBrains Mono',monospace; font-size: 1.3rem; width: 100%; outline: none; transition: border-color 0.2s; letter-spacing: 0.12em; box-sizing: border-box; }
  .cron-input:focus { border-color: rgba(0,212,255,0.5); }
  .cron-input.err { border-color: rgba(239,68,68,0.5); color: #f87171; }
  .field-box { background: rgba(7,20,34,0.7); border: 1px solid rgba(14,165,233,0.15); border-radius: 0.5rem; padding: 0.6rem 0.75rem; }
  .field-label { font-family: 'JetBrains Mono',monospace; font-size: 0.6rem; color: #38bdf8; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.3rem; display: block; }
  .field-input { background: transparent; border: none; outline: none; color: #e2e8f0; font-family: 'JetBrains Mono',monospace; font-size: 0.9rem; width: 100%; }
  .preset-btn { background: transparent; border: 1px solid rgba(14,165,233,0.18); border-radius: 0.4rem; color: #64748b; cursor: pointer; font-family: 'JetBrains Mono',monospace; font-size: 0.7rem; padding: 0.3rem 0.6rem; transition: all 0.15s; white-space: nowrap; }
  .preset-btn:hover { color: #38bdf8; border-color: rgba(0,212,255,0.4); }
  .copy-btn { background: rgba(14,165,233,0.1); border: 1px solid rgba(14,165,233,0.3); border-radius: 0.4rem; color: #38bdf8; cursor: pointer; padding: 0.4rem 0.9rem; font-family: 'JetBrains Mono',monospace; font-size: 0.72rem; transition: all 0.15s; }
  .copy-btn:hover { background: rgba(14,165,233,0.2); }
  .copy-btn.ok { color: #4ade80; border-color: rgba(74,222,128,0.4); }
  .next-row { display: flex; justify-content: space-between; padding: 0.28rem 0; border-bottom: 1px solid rgba(14,165,233,0.06); font-family: 'JetBrains Mono',monospace; font-size: 0.78rem; }
  .next-row:last-child { border-bottom: none; }
`;

const PRESETS = [
  { label: "Jede Minute",      expr: "* * * * *" },
  { label: "Jede Stunde",      expr: "0 * * * *" },
  { label: "Täglich 00:00",    expr: "0 0 * * *" },
  { label: "Täglich 08:00",    expr: "0 8 * * *" },
  { label: "Wöchentlich Mo",   expr: "0 9 * * 1" },
  { label: "Monatlich 1.",     expr: "0 0 1 * *" },
  { label: "Alle 5 Min",       expr: "*/5 * * * *" },
  { label: "Alle 15 Min",      expr: "*/15 * * * *" },
  { label: "Werktags 09:00",   expr: "0 9 * * 1-5" },
  { label: "Jährlich",         expr: "0 0 1 1 *" },
];

const DAYS   = ["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"];
const MONTHS = ["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"];

function describeField(val: string, type: "minute"|"hour"|"dom"|"month"|"dow"): string {
  if (val === "*") return type === "minute" ? "jede Minute" : type === "hour" ? "jede Stunde" : type === "dom" ? "jeden Tag" : type === "month" ? "jeden Monat" : "jeden Wochentag";
  if (val.startsWith("*/")) {
    const n = val.slice(2);
    const unit = type === "minute" ? "Minuten" : type === "hour" ? "Stunden" : type === "dom" ? "Tage" : type === "month" ? "Monate" : "Wochentage";
    return `alle ${n} ${unit}`;
  }
  if (val.includes("-")) {
    const [a,b] = val.split("-");
    if (type === "dow") return `${DAYS[+a] ?? a} bis ${DAYS[+b] ?? b}`;
    if (type === "month") return `${MONTHS[+a-1] ?? a} bis ${MONTHS[+b-1] ?? b}`;
    return `${a}–${b}`;
  }
  if (val.includes(",")) {
    const parts = val.split(",");
    if (type === "dow") return parts.map(p => DAYS[+p] ?? p).join(", ");
    if (type === "month") return parts.map(p => MONTHS[+p-1] ?? p).join(", ");
    return parts.join(", ");
  }
  if (type === "dow") return DAYS[+val] ?? val;
  if (type === "month") return MONTHS[+val-1] ?? val;
  return val;
}

function explain(expr: string): string {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return "Ungültiger Ausdruck (5 Felder erwartet).";
  const [min, hr, dom, mon, dow] = parts;
  const lines: string[] = [];

  if (min.startsWith("*/"))      lines.push(`Alle ${min.slice(2)} Minuten`);
  else if (min === "*")          lines.push("Jede Minute");
  else                           lines.push(`Minute ${describeField(min, "minute")}`);

  if (hr !== "*")                lines.push(`Stunde ${describeField(hr, "hour")}`);
  if (dom !== "*")               lines.push(`Tag ${describeField(dom, "dom")} des Monats`);
  if (mon !== "*")               lines.push(`Monat ${describeField(mon, "month")}`);
  if (dow !== "*")               lines.push(`Wochentag ${describeField(dow, "dow")}`);

  return lines.join(", ") + ".";
}

function isValid(expr: string): boolean {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return false;
  const ranges = [[0,59],[0,23],[1,31],[1,12],[0,7]];
  return parts.every((p, i) => {
    if (p === "*") return true;
    if (/^\*\/\d+$/.test(p)) return true;
    if (/^\d+$/.test(p)) { const n = +p; return n >= ranges[i][0] && n <= ranges[i][1]; }
    if (/^\d+-\d+$/.test(p)) return true;
    if (/^[\d,]+$/.test(p)) return true;
    return false;
  });
}

function nextRuns(expr: string, count = 5): string[] {
  if (!isValid(expr)) return [];
  const [minF, hrF, domF, monF, dowF] = expr.trim().split(/\s+/);

  function matches(val: number, field: string, offset = 0): boolean {
    const v = val + offset;
    if (field === "*") return true;
    if (field.startsWith("*/")) return v % +field.slice(2) === 0;
    if (field.includes("-")) { const [a,b] = field.split("-"); return v >= +a && v <= +b; }
    if (field.includes(",")) return field.split(",").map(Number).includes(v);
    return +field === v;
  }

  const results: string[] = [];
  const now = new Date();
  now.setSeconds(0, 0);
  now.setMinutes(now.getMinutes() + 1);

  for (let i = 0; i < 50000 && results.length < count; i++) {
    const mon = now.getMonth() + 1;
    const dom = now.getDate();
    const dow = now.getDay();
    const hr  = now.getHours();
    const min = now.getMinutes();

    if (matches(mon, monF) && matches(dom, domF) && matches(dow, dowF) && matches(hr, hrF) && matches(min, minF)) {
      results.push(now.toLocaleString("de-DE", { weekday:"short", day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" }));
    }
    now.setMinutes(now.getMinutes() + 1);
  }
  return results;
}

export default function CronHelperPage() {
  const [expr, setExpr]   = useState("0 9 * * 1-5");
  const [copied, setCopied] = useState(false);

  const parts  = expr.trim().split(/\s+/);
  const valid  = isValid(expr);
  const desc   = explain(expr);
  const nexts  = valid ? nextRuns(expr) : [];

  function updateField(idx: number, val: string) {
    const p = [...(parts.length === 5 ? parts : ["*","*","*","*","*"])];
    p[idx] = val || "*";
    setExpr(p.join(" "));
  }

  function copy() {
    navigator.clipboard.writeText(expr);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  const FIELDS = [
    { label: "Minute",     placeholder: "0-59" },
    { label: "Stunde",     placeholder: "0-23" },
    { label: "Tag (Mon.)", placeholder: "1-31" },
    { label: "Monat",      placeholder: "1-12" },
    { label: "Wochentag",  placeholder: "0-7" },
  ];

  return (
    <div style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans',sans-serif", minHeight: "100vh" }}>
      <style>{S}</style>

      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>cron-helper</span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-7">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Dev Tools</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.6rem)", color: "#fff", marginBottom: "0.3rem" }}>Cron Helper</h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Cron-Ausdrücke verstehen und bauen — lokal.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>

          {/* Main input */}
          <div className="card p-5">
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.8rem" }}>
              <input
                className={`cron-input ${expr && !valid ? "err" : ""}`}
                value={expr}
                onChange={e => setExpr(e.target.value)}
                spellCheck={false}
              />
              <button className={`copy-btn ${copied ? "ok" : ""}`} onClick={copy}>{copied ? "✓" : "copy"}</button>
            </div>

            {/* Human-readable */}
            <div style={{ background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.15)", borderRadius: "0.5rem", padding: "0.65rem 0.9rem" }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.25rem" }}>Bedeutung</span>
              <span style={{ fontSize: "0.9rem", color: valid ? "#e2e8f0" : "#f87171" }}>{desc}</span>
            </div>

            {/* Field labels */}
            <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.7rem", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.6rem", color: "#334155", textAlign: "center", justifyContent: "space-around" }}>
              {["MIN","STD","TAG","MON","DOW"].map(f => <span key={f} style={{ flex: 1 }}>{f}</span>)}
            </div>
          </div>

          {/* Field editors */}
          <div className="card p-4">
            <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.6rem" }}>Felder bearbeiten</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.4rem" }}>
              {FIELDS.map((f, i) => (
                <div key={i} className="field-box">
                  <span className="field-label">{f.label}</span>
                  <input
                    className="field-input"
                    placeholder={f.placeholder}
                    value={parts[i] ?? "*"}
                    onChange={e => updateField(i, e.target.value)}
                    spellCheck={false}
                  />
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
            {/* Presets */}
            <div className="card p-4">
              <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.6rem" }}>Presets</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                {PRESETS.map(p => (
                  <button key={p.expr} className="preset-btn" onClick={() => setExpr(p.expr)}>{p.label}</button>
                ))}
              </div>
            </div>

            {/* Next runs */}
            <div className="card p-4">
              <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.6rem" }}>Nächste Ausführungen</label>
              {nexts.length > 0
                ? nexts.map((n, i) => (
                    <div key={i} className="next-row">
                      <span style={{ color: "#475569" }}>#{i+1}</span>
                      <span style={{ color: "#94a3b8" }}>{n}</span>
                    </div>
                  ))
                : <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.75rem", color: "#334155" }}>—</span>
              }
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
