"use client";

import { useState, useCallback, useEffect } from "react";

const WORDS = [
  "lorem","ipsum","dolor","sit","amet","consectetur","adipiscing","elit","sed","do",
  "eiusmod","tempor","incididunt","ut","labore","et","dolore","magna","aliqua","enim",
  "ad","minim","veniam","quis","nostrud","exercitation","ullamco","laboris","nisi",
  "aliquip","ex","ea","commodo","consequat","duis","aute","irure","in","reprehenderit",
  "voluptate","velit","esse","cillum","eu","fugiat","nulla","pariatur","excepteur","sint",
  "occaecat","cupidatat","non","proident","sunt","culpa","qui","officia","deserunt",
  "mollit","anim","id","est","laborum","curabitur","pretium","tincidunt","lacus",
  "nunc","pulvinar","sapien","ligula","scelerisque","mauris","pellentesque","pulvinar",
  "pellentesque","habitant","morbi","tristique","senectus","netus","malesuada","fames",
  "turpis","egestas","volutpat","dui","libero","venenatis","faucibus","nisl","pretium",
];

const CLASSIC = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

function randomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function randomSentence(minWords = 6, maxWords = 14): string {
  const len = minWords + Math.floor(Math.random() * (maxWords - minWords));
  const words = Array.from({ length: len }, randomWord);
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(" ") + ".";
}

function generateWords(count: number): string {
  return Array.from({ length: count }, randomWord).join(" ");
}

function generateSentences(count: number): string {
  return Array.from({ length: count }, randomSentence).join(" ");
}

function generateParagraphs(count: number): string {
  return Array.from({ length: count }, () => {
    const sentences = 3 + Math.floor(Math.random() * 4);
    return Array.from({ length: sentences }, randomSentence).join(" ");
  }).join("\n\n");
}

type Mode = "words" | "sentences" | "paragraphs";

export default function LoremIpsumPage() {
  const [mode, setMode] = useState<Mode>("paragraphs");
  const [count, setCount] = useState(3);
  const [startClassic, setStartClassic] = useState(true);
  const [copied, setCopied] = useState(false);

  const generate = useCallback((): string => {
    let result = "";
    switch (mode) {
      case "words": result = generateWords(count); break;
      case "sentences": result = generateSentences(count); break;
      case "paragraphs": result = generateParagraphs(count); break;
    }
    if (startClassic && mode === "paragraphs") {
      const rest = result.split("\n\n").slice(1).join("\n\n");
      return rest ? CLASSIC + "\n\n" + rest : CLASSIC;
    }
    if (startClassic && mode === "sentences") {
      const sentences = result.split(". ").slice(1).join(". ");
      return CLASSIC + (sentences ? " " + sentences : "");
    }
    return result;
  }, [mode, count, startClassic]);

  const [text, setText] = useState(CLASSIC);

  useEffect(() => { setText(generate()); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = () => setText(generate());

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const MODES: { id: Mode; label: string }[] = [
    { id: "paragraphs", label: "Absätze" },
    { id: "sentences", label: "Sätze" },
    { id: "words", label: "Wörter" },
  ];

  const maxCount = mode === "paragraphs" ? 20 : mode === "sentences" ? 50 : 200;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
        .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
        .card { background: linear-gradient(135deg,#071422 0%,#050d1a 100%); border: 1px solid rgba(14,165,233,0.2); border-radius: 1rem; }
        .tab-btn { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; letter-spacing: 0.05em; padding: 0.4rem 1.1rem; border-radius: 0.4rem; border: 1px solid rgba(14,165,233,0.2); cursor: pointer; transition: all 0.2s; color: #64748b; background: transparent; }
        .tab-btn.active { border-color: rgba(0,212,255,0.5); color: #38bdf8; background: rgba(14,165,233,0.1); }
        .copy-btn { background: rgba(14,165,233,0.15); border: 1px solid rgba(14,165,233,0.3); color: #38bdf8; border-radius: 0.4rem; padding: 0.4rem 1rem; font-size: 0.8rem; font-family: 'JetBrains Mono', monospace; cursor: pointer; transition: all 0.2s; }
        .copy-btn:hover { background: rgba(14,165,233,0.3); }
        .copy-btn.success { background: rgba(34,197,94,0.2); border-color: rgba(34,197,94,0.4); color: #4ade80; }
        .refresh-btn { background: transparent; border: 1px solid rgba(14,165,233,0.2); color: #64748b; border-radius: 0.4rem; padding: 0.4rem 1rem; font-size: 0.8rem; font-family: 'JetBrains Mono', monospace; cursor: pointer; transition: all 0.2s; }
        .refresh-btn:hover { border-color: rgba(0,212,255,0.4); color: #38bdf8; }
        input[type=range] { -webkit-appearance: none; width: 100%; height: 4px; border-radius: 2px; background: rgba(14,165,233,0.2); outline: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #38bdf8; cursor: pointer; box-shadow: 0 0 8px rgba(0,212,255,0.4); }
        .toggle { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }
        .toggle input { display: none; }
        .toggle-track { width: 36px; height: 20px; border-radius: 10px; background: rgba(14,165,233,0.15); border: 1px solid rgba(14,165,233,0.25); position: relative; transition: all 0.2s; }
        .toggle input:checked + .toggle-track { background: rgba(14,165,233,0.4); border-color: rgba(0,212,255,0.5); }
        .toggle-track::after { content: ''; position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; border-radius: 50%; background: #94a3b8; transition: all 0.2s; }
        .toggle input:checked + .toggle-track::after { left: 18px; background: #38bdf8; }
      `}</style>

      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>lorem-ipsum</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
            Text &amp; Produktivität
          </div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.5rem)", color: "#fff", marginBottom: "0.4rem" }}>
            Lorem Ipsum Generator
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
            Placeholder-Text sofort generieren — Wörter, Sätze oder Absätze.
          </p>
        </div>

        <div className="card p-6 mb-4">
          {/* Mode + controls row */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {MODES.map((m) => (
                <button key={m.id} className={`tab-btn${mode === m.id ? " active" : ""}`} onClick={() => { setMode(m.id); setCount(m.id === "paragraphs" ? 3 : m.id === "sentences" ? 5 : 50); }}>
                  {m.label}
                </button>
              ))}
            </div>

            <label className="toggle" style={{ marginLeft: "auto" }}>
              <input type="checkbox" checked={startClassic} onChange={(e) => setStartClassic(e.target.checked)} />
              <span className="toggle-track" />
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: "#64748b" }}>Klassisch starten</span>
            </label>
          </div>

          {/* Count slider */}
          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Anzahl {MODES.find((m) => m.id === mode)?.label}
              </label>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.85rem", color: "#e2e8f0" }}>{count}</span>
            </div>
            <input type="range" min={1} max={maxCount} value={count} onChange={(e) => setCount(Number(e.target.value))} />
          </div>

          <button
            style={{ width: "100%", padding: "0.65rem", background: "linear-gradient(135deg,rgba(14,165,233,0.3),rgba(0,212,255,0.15))", border: "1px solid rgba(14,165,233,0.5)", color: "#38bdf8", borderRadius: "0.5rem", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s" }}
            onClick={refresh}
          >
            Generieren
          </button>
        </div>

        {/* Output */}
        <div className="card p-6">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Text
            </span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className="refresh-btn" onClick={refresh}>↺ Neu</button>
              <button className={`copy-btn${copied ? " success" : ""}`} onClick={copy}>
                {copied ? "Kopiert!" : "Kopieren"}
              </button>
            </div>
          </div>
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.9rem",
              color: "#94a3b8",
              lineHeight: 1.7,
              maxHeight: "55vh",
              overflowY: "auto",
              whiteSpace: "pre-wrap",
              paddingRight: "0.25rem",
            }}
          >
            {text}
          </div>
        </div>
      </main>
    </div>
  );
}
