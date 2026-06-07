"use client";
import { useState } from "react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
  .card { background: linear-gradient(135deg,#071422 0%,#050d1a 100%); border: 1px solid rgba(14,165,233,0.2); border-radius: 1rem; }
  .pw-input { background: rgba(7,20,34,0.8); border: 1px solid rgba(14,165,233,0.2); border-radius: 0.5rem; color: #e2e8f0; padding: 0.7rem 0.9rem; font-family: 'JetBrains Mono',monospace; font-size: 1rem; width: 100%; outline: none; transition: border-color 0.2s; box-sizing: border-box; letter-spacing: 0.05em; }
  .pw-input:focus { border-color: rgba(0,212,255,0.45); }
  .bar-track { height: 8px; background: rgba(14,165,233,0.08); border-radius: 99px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 99px; transition: width 0.3s, background 0.3s; }
  .check-row { display: flex; align-items: center; gap: 0.5rem; padding: 0.28rem 0; font-family: 'JetBrains Mono',monospace; font-size: 0.75rem; }
  .check-icon { width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; flex-shrink: 0; }
  .check-ok { background: rgba(74,222,128,0.15); color: #4ade80; }
  .check-fail { background: rgba(100,116,139,0.12); color: #475569; }
  .entropy-badge { font-family: 'JetBrains Mono',monospace; font-size: 0.7rem; padding: 0.25rem 0.6rem; border-radius: 0.35rem; }
  .show-btn { background: transparent; border: none; color: #475569; cursor: pointer; font-family: 'JetBrains Mono',monospace; font-size: 0.7rem; padding: 0 0.2rem; transition: color 0.15s; flex-shrink: 0; }
  .show-btn:hover { color: #38bdf8; }
  .tip-row { display: flex; align-items: flex-start; gap: 0.45rem; font-size: 0.8rem; color: #64748b; padding: 0.25rem 0; }
`;

const COMMON = ["password","123456","qwerty","letmein","abc123","iloveyou","admin","welcome","monkey","dragon"];

function calcEntropy(pw: string): number {
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) pool += 32;
  return pool === 0 ? 0 : Math.round(pw.length * Math.log2(pool));
}

interface Check { label: string; ok: boolean }

function analyze(pw: string) {
  const checks: Check[] = [
    { label: "Mindestens 8 Zeichen",       ok: pw.length >= 8 },
    { label: "Mindestens 12 Zeichen",      ok: pw.length >= 12 },
    { label: "Kleinbuchstaben (a-z)",      ok: /[a-z]/.test(pw) },
    { label: "Großbuchstaben (A-Z)",       ok: /[A-Z]/.test(pw) },
    { label: "Ziffern (0-9)",              ok: /[0-9]/.test(pw) },
    { label: "Sonderzeichen (!@#…)",       ok: /[^a-zA-Z0-9]/.test(pw) },
    { label: "Kein häufiges Passwort",     ok: !COMMON.includes(pw.toLowerCase()) },
    { label: "Keine Zeichenwiederholung",  ok: !/(.)\1{2,}/.test(pw) },
  ];
  const entropy = calcEntropy(pw);
  const score = checks.filter(c => c.ok).length;
  return { checks, entropy, score };
}

const LEVELS = [
  { label: "Sehr schwach", color: "#ef4444", min: 0 },
  { label: "Schwach",      color: "#f97316", min: 2 },
  { label: "Mittel",       color: "#eab308", min: 4 },
  { label: "Stark",        color: "#22c55e", min: 6 },
  { label: "Sehr stark",   color: "#38bdf8", min: 7 },
];

function getLevel(score: number) {
  return [...LEVELS].reverse().find(l => score >= l.min) ?? LEVELS[0];
}

const TIPS = [
  "Nutze eine zufällige Passphrase aus 4+ Wörtern.",
  "Verwende einen Passwort-Manager statt Passwörter zu merken.",
  "Kein Passwort für mehrere Dienste wiederverwenden.",
  "Aktiviere 2-Faktor-Authentifizierung (2FA) wo möglich.",
];

export default function PasswordStrengthPage() {
  const [pw, setPw]       = useState("");
  const [show, setShow]   = useState(false);

  const { checks, entropy, score } = pw ? analyze(pw) : { checks: [], entropy: 0, score: 0 };
  const level = pw ? getLevel(score) : null;
  const barWidth = pw ? Math.min(100, (score / 8) * 100) : 0;

  return (
    <div style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans',sans-serif", minHeight: "100vh" }}>
      <style>{S}</style>

      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>password-strength</span>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-6 py-10">
        <div className="mb-7">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Security</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.6rem)", color: "#fff", marginBottom: "0.3rem" }}>Passwort-Stärke</h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Analyse läuft lokal — nichts wird übertragen.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>

          {/* Input */}
          <div className="card p-5">
            <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.4rem" }}>Passwort eingeben</label>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input
                className="pw-input"
                type={show ? "text" : "password"}
                placeholder="Passwort hier testen…"
                value={pw}
                onChange={e => setPw(e.target.value)}
                autoComplete="new-password"
                spellCheck={false}
              />
              <button className="show-btn" onClick={() => setShow(s => !s)}>{show ? "🙈" : "👁"}</button>
            </div>

            {pw && level && (
              <div style={{ marginTop: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem", color: level.color, fontWeight: 600 }}>{level.label}</span>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <span className="entropy-badge" style={{ background: "rgba(14,165,233,0.08)", border: "1px solid rgba(14,165,233,0.2)", color: "#38bdf8" }}>
                      ~{entropy} bits
                    </span>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65rem", color: "#475569" }}>{pw.length} Zeichen</span>
                  </div>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${barWidth}%`, background: level.color }} />
                </div>
              </div>
            )}
          </div>

          {pw && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
              {/* Checks */}
              <div className="card p-4">
                <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>Kriterien</label>
                {checks.map((c, i) => (
                  <div key={i} className="check-row">
                    <div className={`check-icon ${c.ok ? "check-ok" : "check-fail"}`}>{c.ok ? "✓" : "·"}</div>
                    <span style={{ color: c.ok ? "#94a3b8" : "#334155" }}>{c.label}</span>
                  </div>
                ))}
              </div>

              {/* Tips */}
              <div className="card p-4">
                <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>Tipps</label>
                {TIPS.map((t, i) => (
                  <div key={i} className="tip-row">
                    <span style={{ color: "#38bdf8", flexShrink: 0 }}>→</span>
                    <span>{t}</span>
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
