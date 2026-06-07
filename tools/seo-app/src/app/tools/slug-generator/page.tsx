"use client";
import { useState } from "react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
  .card { background: linear-gradient(135deg,#071422 0%,#050d1a 100%); border: 1px solid rgba(14,165,233,0.2); border-radius: 1rem; }
  .txt-input { background: rgba(7,20,34,0.8); border: 1px solid rgba(14,165,233,0.2); border-radius: 0.5rem; color: #e2e8f0; padding: 0.65rem 0.9rem; font-family: 'DM Sans',sans-serif; font-size: 1rem; width: 100%; outline: none; transition: border-color 0.2s; }
  .txt-input:focus { border-color: rgba(0,212,255,0.4); }
  .slug-output { background: rgba(14,165,233,0.07); border: 1px solid rgba(14,165,233,0.2); border-radius: 0.5rem; padding: 0.75rem 1rem; font-family: 'JetBrains Mono',monospace; font-size: 0.95rem; color: #38bdf8; word-break: break-all; min-height: 2.8rem; line-height: 1.5; }
  .opt-btn { border-radius: 0.45rem; padding: 0.4rem 0.9rem; font-family: 'JetBrains Mono',monospace; font-size: 0.75rem; font-weight: 600; cursor: pointer; border: 1px solid rgba(14,165,233,0.25); background: transparent; color: #64748b; transition: all 0.2s; }
  .opt-btn.active { border-color: rgba(0,212,255,0.6); background: rgba(14,165,233,0.1); color: #38bdf8; }
  .copy-btn { background: rgba(14,165,233,0.12); border: 1px solid rgba(14,165,233,0.3); color: #38bdf8; border-radius: 0.45rem; padding: 0.45rem 1rem; font-family: 'JetBrains Mono',monospace; font-size: 0.8rem; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
  .copy-btn:hover { background: rgba(14,165,233,0.22); }
  .copy-btn.ok { background: rgba(34,197,94,0.15); border-color: rgba(34,197,94,0.35); color: #4ade80; }
`;

const ACCENT_MAP: Record<string, string> = {
  ä:"ae", ö:"oe", ü:"ue", ß:"ss", à:"a", á:"a", â:"a", ã:"a", å:"a",
  è:"e", é:"e", ê:"e", ë:"e", ì:"i", í:"i", î:"i", ï:"i",
  ò:"o", ó:"o", ô:"o", õ:"o", ø:"o", ù:"u", ú:"u", û:"u",
  ý:"y", ñ:"n", ç:"c", æ:"ae",
};

function toSlug(input: string, sep: string): string {
  let s = input.toLowerCase();
  s = s.replace(/[äöüßàáâãåèéêëìíîïòóôõøùúûýñçæ]/g, c => ACCENT_MAP[c] ?? c);
  s = s.replace(/[^a-z0-9\s-]/g, "");
  s = s.trim().replace(/[\s-]+/g, sep);
  return s;
}

export default function SlugGeneratorPage() {
  const [input, setInput] = useState("");
  const [sep, setSep]     = useState("-");
  const [copied, setCopied] = useState(false);

  const slug = toSlug(input, sep);

  function copy() {
    if (!slug) return;
    navigator.clipboard.writeText(slug);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans',sans-serif", minHeight: "100vh" }}>
      <style>{S}</style>

      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>slug-generator</span>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-6 py-10">
        <div className="mb-7">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Text & Produktivität</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.6rem)", color: "#fff", marginBottom: "0.3rem" }}>Slug Generator</h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Text in URL-freundliche Slugs umwandeln — live, lokal.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Input */}
          <div className="card p-5">
            <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.6rem" }}>Eingabe</label>
            <input
              className="txt-input"
              type="text"
              placeholder="Mein Blog-Titel mit Leerzeichen & Umlauten"
              value={input}
              onChange={e => setInput(e.target.value)}
              autoFocus
            />
          </div>

          {/* Separator */}
          <div className="card p-5">
            <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.6rem" }}>Trennzeichen</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {(["-", "_", "."] as string[]).map(s => (
                <button key={s} className={`opt-btn ${sep === s ? "active" : ""}`} onClick={() => setSep(s)}>
                  {s === "-" ? "Bindestrich  —" : s === "_" ? "Unterstrich  _" : "Punkt  ."}
                </button>
              ))}
            </div>
          </div>

          {/* Output */}
          <div className="card p-5">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
              <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase" }}>Slug</label>
              <button className={`copy-btn ${copied ? "ok" : ""}`} onClick={copy} disabled={!slug}>
                {copied ? "✓ Kopiert" : "Kopieren"}
              </button>
            </div>
            <div className="slug-output">{slug || <span style={{ color: "#1e3a5f" }}>slug-erscheint-hier</span>}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
