"use client";
import { useState } from "react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
  .diff-area { background: rgba(7,20,34,0.85); border: 1px solid rgba(14,165,233,0.18); border-radius: 0.5rem; color: #cbd5e1; font-family: 'JetBrains Mono',monospace; font-size: 0.82rem; line-height: 1.65; resize: none; width: 100%; height: 180px; padding: 0.85rem; box-sizing: border-box; outline: none; transition: border-color 0.2s; }
  .diff-area:focus { border-color: rgba(0,212,255,0.45); }
  .diff-output { background: rgba(7,20,34,0.85); border: 1px solid rgba(14,165,233,0.18); border-radius: 0.5rem; padding: 0.85rem; font-family: 'JetBrains Mono',monospace; font-size: 0.82rem; line-height: 1.65; min-height: 80px; max-height: 320px; overflow-y: auto; white-space: pre-wrap; word-break: break-word; }
  .seg-btn { border-radius: 0.4rem; padding: 0.3rem 0.65rem; font-family: 'JetBrains Mono',monospace; font-size: 0.7rem; cursor: pointer; border: 1px solid rgba(14,165,233,0.22); background: transparent; color: #64748b; transition: all 0.15s; }
  .seg-btn.active { border-color: rgba(0,212,255,0.6); background: rgba(14,165,233,0.1); color: #38bdf8; }
  .stat-chip { font-family: 'JetBrains Mono',monospace; font-size: 0.68rem; padding: 0.22rem 0.55rem; border-radius: 0.3rem; }
  .add  { background: rgba(74,222,128,0.12); color: #4ade80; }
  .del  { background: rgba(248,113,113,0.12); color: #f87171; }
  .same { color: #475569; }
  ins  { background: rgba(74,222,128,0.18); color: #4ade80; text-decoration: none; border-radius: 2px; }
  del  { background: rgba(248,113,113,0.18); color: #f87171; text-decoration: none; border-radius: 2px; }
`;

type Mode = "line" | "word" | "char";

/* Myers-diff on arrays */
function diffArrays<T>(a: T[], b: T[]): Array<{ type: "="| "+"| "-"; val: T }> {
  const m = a.length, n = b.length;
  const max = m + n;
  const v: number[] = new Array(2 * max + 1).fill(0);
  const trace: number[][] = [];

  outer:
  for (let d = 0; d <= max; d++) {
    trace.push([...v]);
    for (let k = -d; k <= d; k += 2) {
      let x: number;
      const ki = k + max;
      if (k === -d || (k !== d && v[ki - 1] < v[ki + 1])) {
        x = v[ki + 1];
      } else {
        x = v[ki - 1] + 1;
      }
      let y = x - k;
      while (x < m && y < n && a[x] === b[y]) { x++; y++; }
      v[ki] = x;
      if (x >= m && y >= n) break outer;
    }
  }

  const result: Array<{ type: "=" | "+" | "-"; val: T }> = [];
  let x = m, y = n;
  for (let d = trace.length - 1; d >= 0 && (x > 0 || y > 0); d--) {
    const vd = trace[d];
    const ki = (x - y) + max;
    let prevK: number;
    if (x - y === -d || (x - y !== d && vd[ki - 1] < vd[ki + 1])) {
      prevK = ki + 1;
    } else {
      prevK = ki - 1;
    }
    const prevX = vd[prevK];
    const prevY = prevX - (prevK - max);
    while (x > prevX + 1 && y > prevY + 1) { result.unshift({ type: "=", val: a[--x] }); y--; }
    if (x > prevX) {
      result.unshift({ type: "-", val: a[--x] });
    } else if (y > prevY) {
      result.unshift({ type: "+", val: b[--y] });
    } else if (x > 0) {
      result.unshift({ type: "=", val: a[--x] }); y--;
    }
  }
  return result;
}

function buildHtml(a: string, b: string, mode: Mode): { html: string; adds: number; dels: number; same: number } {
  let tokensA: string[], tokensB: string[];
  const NL = "\n";

  if (mode === "line") {
    tokensA = a.split(NL);
    tokensB = b.split(NL);
  } else if (mode === "word") {
    tokensA = a.split(/(\s+)/);
    tokensB = b.split(/(\s+)/);
  } else {
    tokensA = a.split("");
    tokensB = b.split("");
  }

  const diff = diffArrays(tokensA, tokensB);
  let html = "";
  let adds = 0, dels = 0, same = 0;

  for (const seg of diff) {
    const escaped = seg.val.toString()
      .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    if (seg.type === "=")  { html += escaped === "\n" ? "\n" : escaped; same++; }
    else if (seg.type === "+") { html += `<ins>${escaped}</ins>`; adds++; }
    else                       { html += `<del>${escaped}</del>`; dels++; }
  }

  return { html, adds, dels, same };
}

const DEFAULT_A = `Das ist der erste Text.
Er hat mehrere Zeilen.
Diese Zeile bleibt gleich.
Und diese auch.`;

const DEFAULT_B = `Das ist der zweite Text.
Er hat mehrere Zeilen.
Diese Zeile bleibt gleich.
Aber diese wurde geändert!`;

export default function TextDiffPage() {
  const [a, setA]     = useState(DEFAULT_A);
  const [b, setB]     = useState(DEFAULT_B);
  const [mode, setMode] = useState<Mode>("line");

  const { html, adds, dels, same } = buildHtml(a, b, mode);

  return (
    <div style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans',sans-serif", minHeight: "100vh" }}>
      <style>{S}</style>

      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>text-diff</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-6">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Text Tools</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.6rem)", color: "#fff", marginBottom: "0.3rem" }}>Text Diff</h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Zwei Texte vergleichen und Unterschiede farblich hervorheben — lokal.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>

          {/* Mode + stats */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              {(["line","word","char"] as Mode[]).map(m => (
                <button key={m} className={`seg-btn ${mode === m ? "active" : ""}`} onClick={() => setMode(m)}>{m}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              <span className="stat-chip add">+{adds} hinzugefügt</span>
              <span className="stat-chip del">−{dels} entfernt</span>
              <span className="stat-chip" style={{ background: "rgba(14,165,233,0.07)", color: "#475569" }}>{same} gleich</span>
            </div>
          </div>

          {/* Inputs */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div>
              <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.35rem" }}>Text A (Original)</label>
              <textarea className="diff-area" value={a} onChange={e => setA(e.target.value)} spellCheck={false} />
            </div>
            <div>
              <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.35rem" }}>Text B (Neu)</label>
              <textarea className="diff-area" value={b} onChange={e => setB(e.target.value)} spellCheck={false} />
            </div>
          </div>

          {/* Diff output */}
          <div>
            <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.35rem" }}>
              Vergleich — <span style={{ color: "#4ade80" }}>grün = neu</span>, <span style={{ color: "#f87171" }}>rot = entfernt</span>
            </label>
            <div className="diff-output" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>
      </main>
    </div>
  );
}
