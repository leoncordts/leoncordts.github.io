"use client";
import { useState } from "react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
  .card { background: linear-gradient(135deg,#071422 0%,#050d1a 100%); border: 1px solid rgba(14,165,233,0.2); border-radius: 1rem; }
  .btn-primary { background: linear-gradient(135deg,rgba(14,165,233,0.3),rgba(0,212,255,0.15)); border: 1px solid rgba(14,165,233,0.5); color: #38bdf8; border-radius: 0.6rem; padding: 0.65rem 1.8rem; font-family: 'Syne',sans-serif; font-weight: 700; font-size: 0.95rem; cursor: pointer; transition: all 0.2s; }
  .btn-primary:hover { background: linear-gradient(135deg,rgba(14,165,233,0.45),rgba(0,212,255,0.25)); }
  .copy-btn { background: rgba(14,165,233,0.15); border: 1px solid rgba(14,165,233,0.3); color: #38bdf8; border-radius: 0.4rem; padding: 0.4rem 0.9rem; font-size: 0.75rem; font-family: 'JetBrains Mono',monospace; cursor: pointer; transition: all 0.2s; }
  .copy-btn:hover { background: rgba(14,165,233,0.3); }
  .copy-btn.success { background: rgba(34,197,94,0.2); border-color: rgba(34,197,94,0.4); color: #4ade80; }
  .uuid-line { font-family: 'JetBrains Mono',monospace; font-size: 0.9rem; color: #e2e8f0; padding: 0.55rem 1rem; border-radius: 0.4rem; background: rgba(7,20,34,0.6); border: 1px solid rgba(14,165,233,0.12); display: flex; align-items: center; justify-content: space-between; gap: 1rem; transition: border-color 0.2s; }
  .uuid-line:hover { border-color: rgba(14,165,233,0.3); }
  .num-input { background: rgba(7,20,34,0.8); border: 1px solid rgba(14,165,233,0.25); border-radius: 0.5rem; color: #e2e8f0; padding: 0.55rem 0.9rem; font-family: 'JetBrains Mono',monospace; font-size: 0.9rem; width: 90px; outline: none; text-align: center; transition: border-color 0.2s; }
  .num-input:focus { border-color: rgba(0,212,255,0.4); }
`;

function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}

export default function UuidGeneratorPage() {
  const [count, setCount] = useState(5);
  const [uuids, setUuids] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  function generate() {
    const n = Math.min(Math.max(1, count), 100);
    setUuids(Array.from({ length: n }, generateUUID));
    setCopiedIdx(null);
    setCopiedAll(false);
  }

  function copyOne(i: number, val: string) {
    navigator.clipboard.writeText(val);
    setCopiedIdx(i);
    setTimeout(() => setCopiedIdx(null), 1500);
  }

  function copyAll() {
    navigator.clipboard.writeText(uuids.join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1500);
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{S}</style>
      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>uuid-generator</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Web &amp; Developer Tools</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.8rem)", color: "#fff", marginBottom: "0.5rem" }}>UUID Generator</h1>
          <p style={{ color: "#94a3b8" }}>Kryptografisch sichere UUIDs v4 — lokal, kein Server.</p>
        </div>

        <div className="card p-6" style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.75rem", color: "#64748b", letterSpacing: "0.06em" }}>ANZAHL</label>
              <input
                type="number"
                className="num-input"
                min={1}
                max={100}
                value={count}
                onChange={e => setCount(Number(e.target.value))}
              />
            </div>
            <button className="btn-primary" onClick={generate}>Generieren</button>
            {uuids.length > 0 && (
              <button className={`copy-btn ${copiedAll ? "success" : ""}`} onClick={copyAll}>
                {copiedAll ? "✓ Alle kopiert" : "Alle kopieren"}
              </button>
            )}
          </div>
        </div>

        {uuids.length > 0 && (
          <div className="card p-6" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {uuids.map((uuid, i) => (
              <div key={i} className="uuid-line">
                <span>{uuid}</span>
                <button
                  className={`copy-btn ${copiedIdx === i ? "success" : ""}`}
                  onClick={() => copyOne(i, uuid)}
                  style={{ flexShrink: 0 }}
                >
                  {copiedIdx === i ? "✓" : "Kopieren"}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
