"use client";
import { useState, useEffect } from "react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
  .card { background: linear-gradient(135deg,#071422 0%,#050d1a 100%); border: 1px solid rgba(14,165,233,0.2); border-radius: 1rem; }
  .mono-input { background: rgba(7,20,34,0.8); border: 1px solid rgba(14,165,233,0.2); border-radius: 0.5rem; color: #e2e8f0; padding: 0.7rem 1rem; font-family: 'JetBrains Mono',monospace; font-size: 1rem; width: 100%; outline: none; transition: border-color 0.2s; }
  .mono-input:focus { border-color: rgba(0,212,255,0.4); }
  .mono-input.error { border-color: rgba(239,68,68,0.5); }
  .info-row { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid rgba(14,165,233,0.08); font-size: 0.88rem; }
  .info-row:last-child { border-bottom: none; }
  .info-label { color: #475569; font-family: 'JetBrains Mono',monospace; font-size: 0.72rem; letter-spacing: 0.05em; }
  .info-val { color: #e2e8f0; font-family: 'JetBrains Mono',monospace; font-size: 0.85rem; text-align: right; }
  .copy-btn { background: rgba(14,165,233,0.12); border: 1px solid rgba(14,165,233,0.25); color: #38bdf8; border-radius: 0.35rem; padding: 0.25rem 0.6rem; font-size: 0.7rem; font-family: 'JetBrains Mono',monospace; cursor: pointer; transition: all 0.2s; }
  .copy-btn:hover { background: rgba(14,165,233,0.25); }
  .now-btn { background: rgba(14,165,233,0.15); border: 1px solid rgba(14,165,233,0.35); color: #38bdf8; border-radius: 0.5rem; padding: 0.5rem 1.2rem; font-family: 'JetBrains Mono',monospace; font-size: 0.8rem; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
  .now-btn:hover { background: rgba(14,165,233,0.3); }
  .tab-btn { font-family: 'JetBrains Mono',monospace; font-size: 0.72rem; padding: 0.45rem 1.1rem; border-radius: 0.45rem; border: 1px solid rgba(14,165,233,0.2); cursor: pointer; transition: all 0.2s; color: #64748b; background: transparent; }
  .tab-btn.active { border-color: rgba(0,212,255,0.6); color: #38bdf8; background: rgba(14,165,233,0.1); }
`;

function pad(n: number) { return String(n).padStart(2, "0"); }

function toLocalDatetimeInput(ts: number): string {
  const d = new Date(ts * 1000);
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function toUTCDatetimeInput(ts: number): string {
  const d = new Date(ts * 1000);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
}

export default function TimestampConverterPage() {
  const [ts, setTs] = useState<string>("");
  const [dtLocal, setDtLocal] = useState("");
  const [dtUTC, setDtUTC] = useState("");
  const [tsError, setTsError] = useState(false);
  const [liveTs, setLiveTs] = useState(0);
  const [mode, setMode] = useState<"ts2dt" | "dt2ts">("ts2dt");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    const id = setInterval(() => setLiveTs(Math.floor(Date.now() / 1000)), 1000);
    setLiveTs(Math.floor(Date.now() / 1000));
    return () => clearInterval(id);
  }, []);

  function handleTs(val: string) {
    setTs(val);
    const num = parseInt(val, 10);
    if (!val || isNaN(num)) { setTsError(false); setDtLocal(""); setDtUTC(""); return; }
    if (num < 0 || num > 9999999999) { setTsError(true); setDtLocal(""); setDtUTC(""); return; }
    setTsError(false);
    setDtLocal(toLocalDatetimeInput(num));
    setDtUTC(toUTCDatetimeInput(num));
  }

  function handleDtLocal(val: string) {
    setDtLocal(val);
    if (!val) { setTs(""); return; }
    const ms = new Date(val).getTime();
    if (isNaN(ms)) { setTs(""); return; }
    setTs(String(Math.floor(ms / 1000)));
    setDtUTC(toUTCDatetimeInput(Math.floor(ms / 1000)));
  }

  function setNow() {
    const n = Math.floor(Date.now() / 1000);
    setTs(String(n));
    setDtLocal(toLocalDatetimeInput(n));
    setDtUTC(toUTCDatetimeInput(n));
    setTsError(false);
  }

  function copy(val: string, key: string) {
    navigator.clipboard.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(""), 1500);
  }

  const parsedTs = parseInt(ts, 10);
  const valid = ts && !isNaN(parsedTs) && !tsError;
  const d = valid ? new Date(parsedTs * 1000) : null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{S}</style>
      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>timestamp-converter</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Web &amp; Developer Tools</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.8rem)", color: "#fff", marginBottom: "0.5rem" }}>Timestamp Konverter</h1>
          <p style={{ color: "#94a3b8" }}>Unix-Timestamps in Datum/Zeit umrechnen und zurück — lokal, sofort.</p>
        </div>

        {/* Live ticker */}
        <div className="card p-4" style={{ marginBottom: "1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65rem", color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.25rem" }}>Jetzt</div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "1.4rem", color: "#38bdf8", letterSpacing: "0.04em" }}>{liveTs}</div>
          </div>
          <button className="now-btn" onClick={setNow}>Jetzt verwenden</button>
        </div>

        {/* Mode toggle */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
          <button className={`tab-btn ${mode === "ts2dt" ? "active" : ""}`} onClick={() => setMode("ts2dt")}>Timestamp → Datum</button>
          <button className={`tab-btn ${mode === "dt2ts" ? "active" : ""}`} onClick={() => setMode("dt2ts")}>Datum → Timestamp</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Timestamp input */}
          <div className="card p-5">
            <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>
              Unix Timestamp (Sekunden)
            </label>
            <input
              type="number"
              className={`mono-input ${tsError ? "error" : ""}`}
              placeholder="z.B. 1749123456"
              value={ts}
              onChange={e => handleTs(e.target.value)}
            />
            {tsError && <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.75rem", color: "#f87171", marginTop: "0.4rem" }}>Ungültiger Timestamp</div>}
          </div>

          {/* Datetime inputs */}
          <div className="card p-5" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>Lokalzeit</label>
              <input
                type="datetime-local"
                step="1"
                className="mono-input"
                style={{ fontSize: "0.85rem" }}
                value={dtLocal}
                onChange={e => handleDtLocal(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>UTC</label>
              <input
                type="datetime-local"
                step="1"
                className="mono-input"
                style={{ fontSize: "0.85rem", cursor: "default" }}
                value={dtUTC}
                readOnly
              />
            </div>
          </div>

          {/* Details */}
          {d && valid && (
            <div className="card p-5">
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Details</div>
              {[
                { label: "ISO 8601", val: d.toISOString() },
                { label: "Locale DE", val: d.toLocaleString("de-DE") },
                { label: "UTC String", val: d.toUTCString() },
                { label: "Millisekunden", val: String(parsedTs * 1000) },
                { label: "Wochentag", val: d.toLocaleDateString("de-DE", { weekday: "long" }) },
              ].map(({ label, val }) => (
                <div key={label} className="info-row">
                  <span className="info-label">{label}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span className="info-val">{val}</span>
                    <button className="copy-btn" onClick={() => copy(val, label)}>{copied === label ? "✓" : "Copy"}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
