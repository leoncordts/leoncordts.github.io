"use client";
import { useState, useMemo } from "react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
  .card { background: linear-gradient(135deg,#071422 0%,#050d1a 100%); border: 1px solid rgba(14,165,233,0.2); border-radius: 1rem; }
  .txt-area { background: rgba(7,20,34,0.8); border: 1px solid rgba(14,165,233,0.2); border-radius: 0.5rem; color: #e2e8f0; padding: 0.75rem 1rem; font-family: 'DM Sans',sans-serif; font-size: 0.95rem; width: 100%; outline: none; resize: vertical; min-height: 180px; transition: border-color 0.2s; line-height: 1.6; }
  .txt-area:focus { border-color: rgba(0,212,255,0.4); }
  .stat-box { background: rgba(14,165,233,0.07); border: 1px solid rgba(14,165,233,0.15); border-radius: 0.6rem; padding: 0.9rem 1rem; text-align: center; }
  .stat-num { font-family: 'Syne',sans-serif; font-weight: 800; font-size: 1.6rem; color: #38bdf8; }
  .stat-label { font-family: 'JetBrains Mono',monospace; font-size: 0.65rem; color: #475569; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 0.2rem; }
  .clear-btn { background: transparent; border: 1px solid rgba(14,165,233,0.2); color: #64748b; border-radius: 0.4rem; padding: 0.35rem 0.8rem; font-family: 'JetBrains Mono',monospace; font-size: 0.75rem; cursor: pointer; transition: all 0.2s; }
  .clear-btn:hover { border-color: rgba(239,68,68,0.4); color: #f87171; }
`;

export default function CharCounterPage() {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;
    const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
    const sentences = text.trim() === "" ? 0 : (text.match(/[.!?]+/g) || []).length;
    const paragraphs = text.trim() === "" ? 0 : text.split(/\n\s*\n/).filter(p => p.trim()).length;
    const lines = text === "" ? 0 : text.split("\n").length;
    const readingTime = Math.max(1, Math.round(words / 200));
    return { chars, charsNoSpace, words, sentences, paragraphs, lines, readingTime };
  }, [text]);

  return (
    <div style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans',sans-serif", minHeight: "100vh" }}>
      <style>{S}</style>

      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>char-counter</span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-7">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Text & Produktivität</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.6rem,5vw,2.4rem)", color: "#fff", marginBottom: "0.3rem" }}>Zeichen & Wörter Zählen</h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Zeichen, Wörter, Sätze und Lesezeit sofort zählen – lokal im Browser.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="card p-5">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
              <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase" }}>Text eingeben</label>
              {text && <button className="clear-btn" onClick={() => setText("")}>Leeren</button>}
            </div>
            <textarea
              className="txt-area"
              placeholder="Text hier einfügen oder tippen…"
              value={text}
              onChange={e => setText(e.target.value)}
              autoFocus
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.6rem" }}>
            {[
              { n: stats.chars, label: "Zeichen" },
              { n: stats.charsNoSpace, label: "Ohne Leer." },
              { n: stats.words, label: "Wörter" },
              { n: stats.sentences, label: "Sätze" },
            ].map(({ n, label }) => (
              <div key={label} className="stat-box">
                <div className="stat-num">{n.toLocaleString("de-DE")}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.6rem" }}>
            {[
              { n: stats.paragraphs, label: "Absätze" },
              { n: stats.lines, label: "Zeilen" },
              { n: stats.readingTime, label: "Min. Lesezeit" },
            ].map(({ n, label }) => (
              <div key={label} className="stat-box">
                <div className="stat-num">{n}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
