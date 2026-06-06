"use client";
import { useState, useMemo } from "react";

const STOPWORDS = new Set([
  "der","die","das","die","ein","eine","und","oder","aber","nicht","ist","sind","war","waren","hat","haben","wird","werden","mit","von","zu","in","an","auf","bei","nach","aus","um","für","über","unter","vor","seit","durch","zwischen","gegen","ohne","als","wie","wenn","weil","dass","ob","sich","auch","noch","schon","mehr","nur","sehr","so","da","hier","dort","ich","du","er","sie","es","wir","ihr","sie","mich","dich","ihm","ihr","uns","euch","ihnen","mein","dein","sein","unser","euer","ihr",
  "a","an","the","and","or","but","not","is","are","was","were","has","have","will","with","of","to","in","on","at","by","for","from","about","as","like","if","when","that","this","these","those","it","its","i","you","he","she","we","they","my","your","his","her","our","their"
]);

function analyze(text: string) {
  const chars = text.length;
  const charsNoSpace = text.replace(/\s/g, "").length;
  const words = text.trim() === "" ? [] : text.trim().split(/\s+/);
  const sentences = text.trim() === "" ? 0 : text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
  const readingTime = Math.max(1, Math.ceil(words.length / 200));

  const freq: Record<string, number> = {};
  for (const w of words) {
    const clean = w.toLowerCase().replace(/[^a-zäöüß]/g, "");
    if (clean.length > 2 && !STOPWORDS.has(clean)) {
      freq[clean] = (freq[clean] || 0) + 1;
    }
  }
  const topKeywords = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word, count]) => ({ word, count, pct: words.length > 0 ? ((count / words.length) * 100).toFixed(1) : "0.0" }));

  return { chars, charsNoSpace, wordCount: words.length, sentences, readingTime, topKeywords };
}

export default function WordCounterPage() {
  const [text, setText] = useState("");
  const stats = useMemo(() => analyze(text), [text]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
        .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
        .card { background: linear-gradient(135deg,#071422 0%,#050d1a 100%); border: 1px solid rgba(14,165,233,0.2); border-radius: 1rem; }
        textarea { background: rgba(7,20,34,0.8); border: 1px solid rgba(14,165,233,0.2); border-radius: 0.5rem; color: #e2e8f0; padding: 1.25rem; font-family: 'DM Sans', sans-serif; font-size: 1rem; width: 100%; outline: none; resize: vertical; transition: border-color 0.2s; line-height: 1.7; }
        textarea:focus { border-color: rgba(0,212,255,0.4); }
        .metric-card { background: rgba(14,165,233,0.06); border: 1px solid rgba(14,165,233,0.15); border-radius: 0.75rem; padding: 1rem 1.25rem; text-align: center; }
        .metric-value { font-family: 'Syne',sans-serif; font-weight: 800; font-size: 2rem; color: #38bdf8; line-height: 1; }
        .metric-label { font-family: 'JetBrains Mono',monospace; font-size: 0.68rem; color: #64748b; letter-spacing: 0.08em; text-transform: uppercase; margin-top: 0.3rem; }
        .kw-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0; border-bottom: 1px solid rgba(14,165,233,0.08); }
        .kw-row:last-child { border-bottom: none; }
        .kw-bar-bg { flex: 1; height: 4px; background: rgba(14,165,233,0.1); border-radius: 2px; overflow: hidden; }
        .kw-bar { height: 100%; background: linear-gradient(90deg,#38bdf8,#00d4ff); border-radius: 2px; transition: width 0.4s ease; }
      `}</style>

      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>word-counter</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
            Text & Produktivität
          </div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.8rem)", color: "#fff", marginBottom: "0.5rem" }}>
            Zeichen- & Wortzähler
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1rem" }}>Echtzeit-Textanalyse: Wörter, Zeichen, Lesezeit und Keyword-Dichte — lokal im Browser.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem", alignItems: "start" }}>
          {/* Textarea */}
          <div className="card p-6">
            <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>
              Text eingeben oder einfügen
            </label>
            <textarea
              rows={18}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Füge hier deinen Text ein. Alle Metriken werden in Echtzeit berechnet…"
            />
          </div>

          {/* Stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Metrics grid */}
            <div className="card p-5">
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.68rem", color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Statistiken</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div className="metric-card">
                  <div className="metric-value">{stats.wordCount.toLocaleString()}</div>
                  <div className="metric-label">Wörter</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">{stats.chars.toLocaleString()}</div>
                  <div className="metric-label">Zeichen</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">{stats.charsNoSpace.toLocaleString()}</div>
                  <div className="metric-label">Ohne Leer.</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">{stats.sentences}</div>
                  <div className="metric-label">Sätze</div>
                </div>
              </div>
              <div className="metric-card" style={{ marginTop: "0.75rem" }}>
                <div className="metric-value" style={{ fontSize: "1.5rem" }}>~{stats.readingTime} Min</div>
                <div className="metric-label">Lesezeit (200 Wörter/Min)</div>
              </div>
            </div>

            {/* Keywords */}
            <div className="card p-5">
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.68rem", color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Top Keywords</p>
              {stats.topKeywords.length === 0 ? (
                <p style={{ color: "#475569", fontSize: "0.85rem", fontFamily: "'JetBrains Mono',monospace" }}>Noch kein Text…</p>
              ) : (
                stats.topKeywords.map(({ word, count, pct }, i) => (
                  <div key={word} className="kw-row">
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: "#64748b", width: "18px" }}>#{i + 1}</span>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.85rem", color: "#e2e8f0", minWidth: "80px" }}>{word}</span>
                    <div className="kw-bar-bg">
                      <div className="kw-bar" style={{ width: `${Math.min(100, parseFloat(pct) * 10)}%` }} />
                    </div>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: "#38bdf8", whiteSpace: "nowrap" }}>{count}× ({pct}%)</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
