"use client";
import { useState, useMemo } from "react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
  .card { background: linear-gradient(135deg,#071422 0%,#050d1a 100%); border: 1px solid rgba(14,165,233,0.2); border-radius: 1rem; }
  .jwt-input { background: rgba(7,20,34,0.8); border: 1px solid rgba(14,165,233,0.2); border-radius: 0.5rem; color: #e2e8f0; padding: 0.7rem 0.9rem; font-family: 'JetBrains Mono',monospace; font-size: 0.78rem; width: 100%; outline: none; resize: vertical; min-height: 80px; transition: border-color 0.2s; line-height: 1.5; word-break: break-all; }
  .jwt-input:focus { border-color: rgba(0,212,255,0.4); }
  .part-header { background: rgba(14,165,233,0.12); border: 1px solid rgba(14,165,233,0.25); border-radius: 0.5rem 0.5rem 0 0; padding: 0.4rem 0.85rem; font-family: 'JetBrains Mono',monospace; font-size: 0.68rem; letter-spacing: 0.08em; text-transform: uppercase; }
  .part-body { background: rgba(7,20,34,0.6); border: 1px solid rgba(14,165,233,0.15); border-top: none; border-radius: 0 0 0.5rem 0.5rem; padding: 0.75rem; font-family: 'JetBrains Mono',monospace; font-size: 0.78rem; color: #94a3b8; line-height: 1.6; white-space: pre-wrap; word-break: break-all; }
  .key-name { color: #38bdf8; }
  .val-str { color: #4ade80; }
  .val-num { color: #fbbf24; }
  .val-bool { color: #c084fc; }
  .val-null { color: #64748b; }
  .claim-chip { display: inline-flex; align-items: center; gap: 0.3rem; background: rgba(14,165,233,0.08); border: 1px solid rgba(14,165,233,0.18); border-radius: 0.35rem; padding: 0.25rem 0.6rem; font-family: 'JetBrains Mono',monospace; font-size: 0.7rem; color: #64748b; margin: 2px; }
  .claim-chip .cv { color: #e2e8f0; }
  .exp-ok { color: #4ade80; }
  .exp-bad { color: #f87171; }
  .copy-btn { background: rgba(14,165,233,0.1); border: 1px solid rgba(14,165,233,0.25); color: #38bdf8; border-radius: 0.4rem; padding: 0.3rem 0.75rem; font-family: 'JetBrains Mono',monospace; font-size: 0.7rem; cursor: pointer; transition: all 0.2s; }
  .copy-btn:hover { background: rgba(14,165,233,0.2); }
`;

function b64decode(s: string): string {
  try {
    const base64 = s.replace(/-/g, "+").replace(/_/g, "/");
    const padded  = base64 + "=".repeat((4 - base64.length % 4) % 4);
    return decodeURIComponent(
      atob(padded).split("").map(c => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join("")
    );
  } catch { return ""; }
}

function syntaxColor(json: string): string {
  return json
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"([\w@./-]+)"(\s*:)/g, '<span class="key-name">"$1"</span>$2')
    .replace(/:\s*"([^"]*)"/g, ': <span class="val-str">"$1"</span>')
    .replace(/:\s*(-?\d+\.?\d*)/g, ': <span class="val-num">$1</span>')
    .replace(/:\s*(true|false)/g, ': <span class="val-bool">$1</span>')
    .replace(/:\s*(null)/g, ': <span class="val-null">$1</span>');
}

function fmtDate(ts: number) {
  return new Date(ts * 1000).toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "medium" });
}

export default function JwtDecoderPage() {
  const [token, setToken] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const decoded = useMemo(() => {
    const t = token.trim();
    if (!t) return null;
    const parts = t.split(".");
    if (parts.length !== 3) return { error: "Kein gültiges JWT (muss 3 Teile haben)." };
    try {
      const header  = JSON.parse(b64decode(parts[0]));
      const payload = JSON.parse(b64decode(parts[1]));
      return { header, payload, sig: parts[2], error: null };
    } catch { return { error: "Fehler beim Dekodieren des Tokens." }; }
  }, [token]);

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1400);
  }

  const now = Math.floor(Date.now() / 1000);
  const exp = decoded && !decoded.error ? (decoded.payload as Record<string, unknown>).exp as number | undefined : undefined;
  const expired = exp !== undefined ? exp < now : undefined;

  return (
    <div style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans',sans-serif", minHeight: "100vh" }}>
      <style>{S}</style>

      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>jwt-decoder</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-6">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Web & Dev</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.6rem,4vw,2.4rem)", color: "#fff", marginBottom: "0.3rem" }}>JWT Decoder</h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>JSON Web Token dekodieren — Header, Payload, Ablaufdatum — lokal.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Input */}
          <div className="card p-5">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase" }}>Token einfügen</label>
              {token && <button className="copy-btn" style={{ fontSize: "0.68rem" }} onClick={() => setToken("")}>✕ Löschen</button>}
            </div>
            <textarea className="jwt-input" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." value={token} onChange={e => setToken(e.target.value)} />
          </div>

          {decoded?.error && (
            <div className="card p-4">
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem", color: "#f87171" }}>⚠ {decoded.error}</p>
            </div>
          )}

          {decoded && !decoded.error && (
            <>
              {/* Exp status */}
              {exp !== undefined && (
                <div className="card p-4" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontSize: "1.2rem" }}>{expired ? "⛔" : "✅"}</span>
                  <div>
                    <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.78rem" }} className={expired ? "exp-bad" : "exp-ok"}>
                      {expired ? "Token abgelaufen" : "Token gültig"}
                    </p>
                    <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#475569" }}>
                      exp: {fmtDate(exp)}
                    </p>
                  </div>
                </div>
              )}

              {/* Header */}
              <div>
                <div className="part-header" style={{ color: "#38bdf8" }}>
                  <span>Header</span>
                  <button className={`copy-btn ${copied === "h" ? "exp-ok" : ""}`} style={{ float: "right", marginTop: "-2px" }} onClick={() => copy(JSON.stringify(decoded.header, null, 2), "h")}>
                    {copied === "h" ? "✓" : "Copy"}
                  </button>
                </div>
                <div className="part-body" dangerouslySetInnerHTML={{ __html: syntaxColor(JSON.stringify(decoded.header, null, 2)) }} />
              </div>

              {/* Payload */}
              <div>
                <div className="part-header" style={{ color: "#4ade80" }}>
                  <span>Payload</span>
                  <button className={`copy-btn ${copied === "p" ? "exp-ok" : ""}`} style={{ float: "right", marginTop: "-2px" }} onClick={() => copy(JSON.stringify(decoded.payload, null, 2), "p")}>
                    {copied === "p" ? "✓" : "Copy"}
                  </button>
                </div>
                <div className="part-body" dangerouslySetInnerHTML={{ __html: syntaxColor(JSON.stringify(decoded.payload, null, 2)) }} />
              </div>

              {/* Signature */}
              <div>
                <div className="part-header" style={{ color: "#c084fc" }}>Signature (nicht verifiziert)</div>
                <div className="part-body" style={{ color: "#475569", wordBreak: "break-all" }}>{decoded.sig as string}</div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
