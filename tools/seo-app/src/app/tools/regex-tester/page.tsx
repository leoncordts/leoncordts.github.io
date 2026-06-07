"use client";
import { useState, useMemo } from "react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
  .card { background: linear-gradient(135deg,#071422 0%,#050d1a 100%); border: 1px solid rgba(14,165,233,0.2); border-radius: 1rem; }
  .mono-input { background: rgba(7,20,34,0.8); border: 1px solid rgba(14,165,233,0.2); border-radius: 0.5rem; color: #e2e8f0; padding: 0.65rem 0.9rem; font-family: 'JetBrains Mono',monospace; font-size: 0.85rem; width: 100%; outline: none; transition: border-color 0.2s; line-height: 1.5; }
  .mono-input:focus { border-color: rgba(0,212,255,0.4); }
  .mono-input.err { border-color: rgba(239,68,68,0.5); }
  .flag-btn { border-radius: 0.35rem; padding: 0.3rem 0.65rem; font-family: 'JetBrains Mono',monospace; font-size: 0.72rem; cursor: pointer; border: 1px solid rgba(14,165,233,0.22); background: transparent; color: #64748b; transition: all 0.2s; }
  .flag-btn.on { border-color: rgba(0,212,255,0.6); background: rgba(14,165,233,0.12); color: #38bdf8; }
  .match-chip { display: inline-block; background: rgba(14,165,233,0.18); border: 1px solid rgba(14,165,233,0.3); border-radius: 3px; padding: 1px 5px; font-family: 'JetBrains Mono',monospace; font-size: 0.8rem; color: #38bdf8; margin: 2px; }
  .match-count { font-family: 'JetBrains Mono',monospace; font-size: 0.72rem; color: #38bdf8; }
  .err-msg { font-family: 'JetBrains Mono',monospace; font-size: 0.72rem; color: #f87171; }
  .highlighted span.hit { background: rgba(14,165,233,0.25); border-radius: 2px; outline: 1px solid rgba(0,212,255,0.4); }
  .highlighted { font-family: 'JetBrains Mono',monospace; font-size: 0.85rem; line-height: 1.7; color: #94a3b8; white-space: pre-wrap; word-break: break-all; }
  .copy-btn { background: rgba(14,165,233,0.1); border: 1px solid rgba(14,165,233,0.25); color: #38bdf8; border-radius: 0.4rem; padding: 0.35rem 0.8rem; font-family: 'JetBrains Mono',monospace; font-size: 0.72rem; cursor: pointer; transition: all 0.2s; }
  .copy-btn:hover { background: rgba(14,165,233,0.2); }
  .copy-btn.ok { color: #4ade80; border-color: rgba(34,197,94,0.35); }
`;

const FLAGS_LIST = [
  { f: "g", label: "g — global" },
  { f: "i", label: "i — case" },
  { f: "m", label: "m — multi" },
  { f: "s", label: "s — dotAll" },
];

function highlightMatches(text: string, regex: RegExp | null): string {
  if (!regex || !text) return escHtml(text);
  const parts: string[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  const re = new RegExp(regex.source, regex.flags.includes("g") ? regex.flags : regex.flags + "g");
  while ((m = re.exec(text)) !== null) {
    parts.push(escHtml(text.slice(last, m.index)));
    parts.push(`<span class="hit">${escHtml(m[0])}</span>`);
    last = m.index + m[0].length;
    if (m[0].length === 0) { re.lastIndex++; }
  }
  parts.push(escHtml(text.slice(last)));
  return parts.join("");
}

function escHtml(s: string) {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags]     = useState(new Set<string>(["g"]));
  const [text, setText]       = useState("Hallo Welt! Das ist ein Test.\nNoch eine Zeile zum Testen.");
  const [replace, setReplace] = useState("");
  const [copied, setCopied]   = useState(false);

  function toggleFlag(f: string) {
    setFlags(prev => { const n = new Set(prev); n.has(f) ? n.delete(f) : n.add(f); return n; });
  }

  const { regex, error } = useMemo(() => {
    if (!pattern) return { regex: null, error: null };
    try { return { regex: new RegExp(pattern, [...flags].join("")), error: null }; }
    catch (e) { return { regex: null, error: (e as Error).message }; }
  }, [pattern, flags]);

  const matches = useMemo(() => {
    if (!regex || !text) return [];
    const re = new RegExp(regex.source, regex.flags.includes("g") ? regex.flags : regex.flags + "g");
    const results: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      results.push(m[0]);
      if (m[0].length === 0) re.lastIndex++;
    }
    return results;
  }, [regex, text]);

  const replaced = useMemo(() => {
    if (!regex || replace === "") return null;
    try { return text.replace(new RegExp(regex.source, regex.flags.includes("g") ? regex.flags : regex.flags + "g"), replace); }
    catch { return null; }
  }, [regex, text, replace]);

  function copyReplaced() {
    if (!replaced) return;
    navigator.clipboard.writeText(replaced);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans',sans-serif", minHeight: "100vh" }}>
      <style>{S}</style>

      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>regex-tester</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-6">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Web & Dev</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.6rem,4vw,2.4rem)", color: "#fff", marginBottom: "0.3rem" }}>Regex Tester</h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Reguläre Ausdrücke live testen — Treffer, Gruppen, Replace.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Pattern + flags */}
          <div className="card p-5">
            <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>Muster (RegEx)</label>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", color: "#475569", fontSize: "1.1rem" }}>/</span>
              <input
                className={`mono-input ${error ? "err" : ""}`}
                style={{ flex: 1, padding: "0.5rem 0.75rem" }}
                type="text"
                placeholder="z. B. \\b\\w{4}\\b"
                value={pattern}
                onChange={e => setPattern(e.target.value)}
                autoFocus
              />
              <span style={{ fontFamily: "'JetBrains Mono',monospace", color: "#475569", fontSize: "1.1rem" }}>/</span>
            </div>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              {FLAGS_LIST.map(({ f, label }) => (
                <button key={f} className={`flag-btn ${flags.has(f) ? "on" : ""}`} onClick={() => toggleFlag(f)}>{label}</button>
              ))}
            </div>
            {error && <p className="err-msg" style={{ marginTop: "0.5rem" }}>⚠ {error}</p>}
          </div>

          {/* Test text */}
          <div className="card p-5">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase" }}>Test-Text</label>
              {matches.length > 0 && <span className="match-count">{matches.length} Treffer</span>}
            </div>
            <textarea
              className="mono-input"
              style={{ minHeight: "90px", resize: "vertical" }}
              value={text}
              onChange={e => setText(e.target.value)}
            />
          </div>

          {/* Highlighted preview */}
          {regex && text && (
            <div className="card p-5">
              <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>Treffer (markiert)</label>
              <div
                className="highlighted"
                dangerouslySetInnerHTML={{ __html: highlightMatches(text, regex) }}
              />
              {matches.length > 0 && (
                <div style={{ marginTop: "0.75rem", display: "flex", flexWrap: "wrap" }}>
                  {[...new Set(matches)].slice(0, 20).map((m, i) => (
                    <span key={i} className="match-chip">{m || "(leer)"}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Replace */}
          <div className="card p-5">
            <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>Ersetzen durch</label>
            <input className="mono-input" type="text" placeholder="Ersatz-Text ($1 für Gruppe 1)" value={replace} onChange={e => setReplace(e.target.value)} />
            {replaced !== null && (
              <div style={{ marginTop: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Ergebnis</span>
                  <button className={`copy-btn ${copied ? "ok" : ""}`} onClick={copyReplaced}>{copied ? "✓" : "Kopieren"}</button>
                </div>
                <div className="highlighted" style={{ color: "#4ade80" }}>{replaced}</div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
