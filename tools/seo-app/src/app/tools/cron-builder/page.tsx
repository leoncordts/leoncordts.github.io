"use client";
import { useState, useMemo } from "react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
  .card { background: linear-gradient(135deg,#071422 0%,#050d1a 100%); border: 1px solid rgba(14,165,233,0.2); border-radius: 1rem; }
  .seg-input { background: rgba(7,20,34,0.8); border: 1px solid rgba(14,165,233,0.2); border-radius: 0.5rem; color: #e2e8f0; padding: 0.55rem 0.75rem; font-family: 'JetBrains Mono',monospace; font-size: 0.9rem; width: 100%; outline: none; transition: border-color 0.2s; text-align: center; }
  .seg-input:focus { border-color: rgba(0,212,255,0.45); }
  .seg-input.err { border-color: rgba(239,68,68,0.5); }
  .preset-btn { background: rgba(14,165,233,0.08); border: 1px solid rgba(14,165,233,0.18); color: #64748b; border-radius: 0.45rem; padding: 0.4rem 0.9rem; font-family: 'JetBrains Mono',monospace; font-size: 0.72rem; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
  .preset-btn:hover { background: rgba(14,165,233,0.18); border-color: rgba(14,165,233,0.4); color: #38bdf8; }
  .next-row { display: flex; justify-content: space-between; align-items: center; padding: 0.45rem 0; border-bottom: 1px solid rgba(14,165,233,0.07); font-size: 0.82rem; }
  .next-row:last-child { border-bottom: none; }
  .copy-btn { background: rgba(14,165,233,0.12); border: 1px solid rgba(14,165,233,0.25); color: #38bdf8; border-radius: 0.35rem; padding: 0.25rem 0.65rem; font-size: 0.7rem; font-family: 'JetBrains Mono',monospace; cursor: pointer; transition: all 0.2s; }
  .copy-btn:hover { background: rgba(14,165,233,0.22); }
  .copy-btn.ok { background: rgba(34,197,94,0.15); border-color: rgba(34,197,94,0.3); color: #4ade80; }
  .cron-display { font-family: 'JetBrains Mono',monospace; font-size: 1.6rem; color: #38bdf8; letter-spacing: 0.12em; text-align: center; }
  .seg-label { font-family: 'JetBrains Mono',monospace; font-size: 0.62rem; color: #475569; letter-spacing: 0.06em; text-transform: uppercase; text-align: center; margin-top: 0.3rem; }
`;

const DAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const MONTHS = ["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"];

const PRESETS = [
  { label: "Jede Minute",      cron: "* * * * *" },
  { label: "Stündlich",        cron: "0 * * * *" },
  { label: "Täglich 00:00",    cron: "0 0 * * *" },
  { label: "Täglich 09:00",    cron: "0 9 * * *" },
  { label: "Wöchentlich Mo",   cron: "0 9 * * 1" },
  { label: "Monatlich 1.",     cron: "0 0 1 * *" },
  { label: "Jede 5 Minuten",   cron: "*/5 * * * *" },
  { label: "Werktags 08:00",   cron: "0 8 * * 1-5" },
  { label: "Jährlich",         cron: "0 0 1 1 *" },
];

function parseSegment(val: string): { valid: boolean; desc: string } {
  if (val === "*") return { valid: true, desc: "Jeden Wert" };
  if (/^\d+$/.test(val)) return { valid: true, desc: `Genau ${val}` };
  if (/^\*\/\d+$/.test(val)) return { valid: true, desc: `Alle ${val.split("/")[1]}` };
  if (/^\d+-\d+$/.test(val)) { const [a,b]=val.split("-"); return { valid: true, desc: `Von ${a} bis ${b}` }; }
  if (/^[\d,]+$/.test(val)) return { valid: true, desc: `Einer von: ${val}` };
  if (/^[\d,*\-/]+$/.test(val)) return { valid: true, desc: val };
  return { valid: false, desc: "Ungültig" };
}

function nextRuns(cron: string, count = 6): Date[] {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return [];
  const [minS, hourS, domS, monS, dowS] = parts;

  function matches(val: number, spec: string, min: number, max: number): boolean {
    if (spec === "*") return true;
    if (/^\*\/(\d+)$/.test(spec)) { const s = parseInt(RegExp.$1); return (val - min) % s === 0; }
    if (/^(\d+)-(\d+)$/.test(spec)) { return val >= parseInt(RegExp.$1) && val <= parseInt(RegExp.$2); }
    if (/^[\d,]+$/.test(spec)) { return spec.split(",").map(Number).includes(val); }
    if (/^\d+$/.test(spec)) return val === parseInt(spec);
    return false;
    void min; void max;
  }

  const results: Date[] = [];
  const now = new Date();
  now.setSeconds(0, 0);
  const d = new Date(now.getTime() + 60000);

  for (let i = 0; i < 100000 && results.length < count; i++) {
    if (
      matches(d.getMonth() + 1, monS, 1, 12) &&
      matches(d.getDate(), domS, 1, 31) &&
      matches(d.getDay(), dowS, 0, 6) &&
      matches(d.getHours(), hourS, 0, 23) &&
      matches(d.getMinutes(), minS, 0, 59)
    ) {
      results.push(new Date(d));
    }
    d.setMinutes(d.getMinutes() + 1);
  }
  return results;
}

function humanize(parts: string[]): string {
  const [min, hour, dom, mon, dow] = parts;
  if (parts.join(" ") === "* * * * *") return "Jede Minute";
  if (min === "0" && hour === "*" && dom === "*" && mon === "*" && dow === "*") return "Zu Beginn jeder Stunde";
  if (/^\d+$/.test(min) && /^\d+$/.test(hour) && dom === "*" && mon === "*" && dow === "*")
    return `Täglich um ${hour.padStart(2,"0")}:${min.padStart(2,"0")} Uhr`;
  if (/^\*\/(\d+)$/.test(min) && hour === "*" && dom === "*" && mon === "*" && dow === "*")
    return `Alle ${min.split("/")[1]} Minuten`;
  if (/^\d+$/.test(min) && /^\d+$/.test(hour) && dom === "*" && mon === "*" && /^\d+$/.test(dow))
    return `${DAYS[parseInt(dow)]}s um ${hour.padStart(2,"0")}:${min.padStart(2,"0")} Uhr`;
  return "Benutzerdefinierter Zeitplan";
}

export default function CronBuilderPage() {
  const [segs, setSegs] = useState(["*", "*", "*", "*", "*"]);
  const [rawInput, setRawInput] = useState("* * * * *");
  const [copied, setCopied] = useState(false);

  const labels = ["Minute (0-59)", "Stunde (0-23)", "Tag (1-31)", "Monat (1-12)", "Wochentag (0-6)"];
  const labelShort = ["min", "std", "tag", "mon", "wtag"];

  const validations = segs.map(s => parseSegment(s));
  const allValid = validations.every(v => v.valid);
  const cronStr = segs.join(" ");
  const runs = useMemo(() => allValid ? nextRuns(cronStr) : [], [cronStr, allValid]);
  const humanDesc = allValid ? humanize(segs) : "Ungültiger Ausdruck";

  function updateSeg(i: number, val: string) {
    const next = [...segs];
    next[i] = val;
    setSegs(next);
    setRawInput(next.join(" "));
  }

  function applyRaw(val: string) {
    setRawInput(val);
    const parts = val.trim().split(/\s+/);
    if (parts.length === 5) setSegs(parts);
  }

  function applyPreset(cron: string) {
    const parts = cron.split(" ");
    setSegs(parts);
    setRawInput(cron);
  }

  function copy() {
    navigator.clipboard.writeText(cronStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{S}</style>
      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>cron-builder</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Web &amp; Developer Tools</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.8rem)", color: "#fff", marginBottom: "0.5rem" }}>Cron Builder</h1>
          <p style={{ color: "#94a3b8" }}>Cron-Ausdrücke visuell erstellen, erklären und die nächsten Ausführungszeiten sehen.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Presets */}
          <div className="card p-5">
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Vorlagen</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {PRESETS.map(p => (
                <button key={p.cron} className="preset-btn" onClick={() => applyPreset(p.cron)}>{p.label}</button>
              ))}
            </div>
          </div>

          {/* Visual segments */}
          <div className="card p-5">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "0.75rem" }}>
              {segs.map((s, i) => (
                <div key={i}>
                  <input
                    className={`seg-input ${validations[i].valid ? "" : "err"}`}
                    value={s}
                    onChange={e => updateSeg(i, e.target.value)}
                    title={labels[i]}
                  />
                  <div className="seg-label">{labelShort[i]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Expression + copy */}
          <div className="card p-5">
            <div style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <input
                style={{ background: "rgba(7,20,34,0.8)", border: "1px solid rgba(14,165,233,0.2)", borderRadius: "0.5rem", color: "#e2e8f0", padding: "0.55rem 1rem", fontFamily: "'JetBrains Mono',monospace", fontSize: "1rem", flex: 1, outline: "none" }}
                value={rawInput}
                onChange={e => applyRaw(e.target.value)}
                spellCheck={false}
              />
              <button className={`copy-btn ${copied ? "ok" : ""}`} onClick={copy}>{copied ? "✓" : "Copy"}</button>
            </div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.82rem", color: allValid ? "#38bdf8" : "#f87171", textAlign: "center" }}>{humanDesc}</div>
          </div>

          {/* Segment explanations */}
          {allValid && (
            <div className="card p-5">
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Erklärung</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                {segs.map((s, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.83rem" }}>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: "#475569" }}>{labels[i]}</span>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem", color: "#94a3b8" }}>
                      <span style={{ color: "#38bdf8", marginRight: "0.5rem" }}>{s}</span>{validations[i].desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next runs */}
          {runs.length > 0 && (
            <div className="card p-5">
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Nächste Ausführungen</div>
              {runs.map((d, i) => (
                <div key={i} className="next-row">
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: "#475569" }}>#{i + 1}</span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.82rem", color: "#e2e8f0" }}>
                    {DAYS[d.getDay()]}, {d.toLocaleDateString("de-DE")} — {String(d.getHours()).padStart(2,"0")}:{String(d.getMinutes()).padStart(2,"0")} Uhr
                  </span>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
