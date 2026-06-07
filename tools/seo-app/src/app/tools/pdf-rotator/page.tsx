"use client";
import { useState, useRef } from "react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
  .card { background: linear-gradient(135deg,#071422 0%,#050d1a 100%); border: 1px solid rgba(14,165,233,0.2); border-radius: 1rem; }
  .drop-zone { border: 2px dashed rgba(14,165,233,0.25); border-radius: 0.75rem; padding: 2rem 1.5rem; text-align: center; cursor: pointer; transition: all 0.2s; }
  .drop-zone:hover, .drop-zone.over { border-color: rgba(0,212,255,0.55); background: rgba(14,165,233,0.04); }
  .rot-btn { border-radius: 0.45rem; padding: 0.4rem 0.85rem; font-family: 'JetBrains Mono',monospace; font-size: 0.72rem; cursor: pointer; border: 1px solid rgba(14,165,233,0.25); background: transparent; color: #64748b; transition: all 0.2s; }
  .rot-btn:hover { border-color: rgba(0,212,255,0.5); color: #38bdf8; background: rgba(14,165,233,0.08); }
  .rot-btn.active { border-color: rgba(0,212,255,0.7); background: rgba(14,165,233,0.15); color: #38bdf8; }
  .page-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 0.9rem; border-radius: 0.5rem; background: rgba(7,20,34,0.5); border: 1px solid rgba(14,165,233,0.1); transition: border-color 0.2s; }
  .page-row:hover { border-color: rgba(14,165,233,0.25); }
  .btn-dl { background: linear-gradient(135deg,rgba(14,165,233,0.3),rgba(0,212,255,0.15)); border: 1px solid rgba(14,165,233,0.5); color: #38bdf8; border-radius: 0.6rem; padding: 0.7rem 0; font-family: 'Syne',sans-serif; font-weight: 700; font-size: 0.95rem; cursor: pointer; transition: all 0.2s; width: 100%; }
  .btn-dl:hover:not(:disabled) { background: linear-gradient(135deg,rgba(14,165,233,0.45),rgba(0,212,255,0.25)); }
  .btn-dl:disabled { opacity: 0.35; cursor: default; }
  .status { font-family: 'JetBrains Mono',monospace; font-size: 0.8rem; text-align: center; }
`;

const ROTATIONS = [0, 90, 180, 270] as const;
type Rotation = (typeof ROTATIONS)[number];

export default function PdfRotatorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [rotations, setRotations] = useState<Rotation[]>([]);
  const [globalRot, setGlobalRot] = useState<Rotation>(90);
  const [status, setStatus] = useState("");
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function loadFile(f: File) {
    if (!f.type.includes("pdf") && !f.name.endsWith(".pdf")) return;
    setFile(f);
    setStatus("Lade PDF…");
    try {
      const { PDFDocument } = await import("pdf-lib");
      const buf = await f.arrayBuffer();
      const doc = await PDFDocument.load(buf);
      const n = doc.getPageCount();
      setPageCount(n);
      setRotations(Array(n).fill(0));
      setStatus(`${n} Seite${n > 1 ? "n" : ""} geladen`);
    } catch {
      setStatus("Fehler beim Laden der PDF.");
    }
  }

  function setPageRot(idx: number, r: Rotation) {
    setRotations(prev => prev.map((v, i) => i === idx ? r : v));
  }

  function applyGlobal() {
    setRotations(prev => prev.map(() => globalRot));
  }

  async function process() {
    if (!file) return;
    setBusy(true);
    setStatus("Drehe Seiten…");
    try {
      const { PDFDocument, degrees } = await import("pdf-lib");
      const buf = await file.arrayBuffer();
      const doc = await PDFDocument.load(buf);
      doc.getPages().forEach((page, i) => {
        const cur = page.getRotation().angle;
        page.setRotation(degrees((cur + rotations[i]) % 360));
      });
      const out = await doc.save();
      const blob = new Blob([out as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, "") + "_rotated.pdf";
      a.click();
      URL.revokeObjectURL(url);
      setStatus("PDF heruntergeladen ✓");
    } catch {
      setStatus("Fehler beim Verarbeiten.");
    }
    setBusy(false);
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{S}</style>
      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>pdf-rotator</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Medien &amp; Konverter</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.8rem)", color: "#fff", marginBottom: "0.5rem" }}>PDF Rotator</h1>
          <p style={{ color: "#94a3b8" }}>PDF-Seiten drehen — einzeln oder alle auf einmal. Kein Upload, kein Server.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Drop zone */}
          <div className="card p-6">
            <div
              className={`drop-zone ${over ? "over" : ""}`}
              onDragOver={e => { e.preventDefault(); setOver(true); }}
              onDragLeave={() => setOver(false)}
              onDrop={e => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files[0]; if (f) loadFile(f); }}
              onClick={() => inputRef.current?.click()}
            >
              <input ref={inputRef} type="file" accept=".pdf,application/pdf" style={{ display: "none" }} onChange={e => { if (e.target.files?.[0]) loadFile(e.target.files[0]); }} />
              {file
                ? <span style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.85rem" }}>📄 {file.name}</span>
                : <><div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📄</div><div style={{ color: "#64748b", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>PDF hierher ziehen oder klicken</div></>}
            </div>
          </div>

          {/* Pages */}
          {pageCount > 0 && (
            <div className="card p-6" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Global rotation */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", paddingBottom: "0.75rem", borderBottom: "1px solid rgba(14,165,233,0.12)" }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase" }}>Alle</span>
                {ROTATIONS.filter(r => r !== 0).map(r => (
                  <button key={r} className={`rot-btn ${globalRot === r ? "active" : ""}`} onClick={() => setGlobalRot(r)}>+{r}°</button>
                ))}
                <button
                  onClick={applyGlobal}
                  style={{ marginLeft: "auto", background: "rgba(14,165,233,0.15)", border: "1px solid rgba(14,165,233,0.35)", color: "#38bdf8", borderRadius: "0.45rem", padding: "0.4rem 1rem", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", cursor: "pointer" }}
                >
                  Auf alle anwenden
                </button>
              </div>

              {/* Per-page */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", maxHeight: "320px", overflowY: "auto" }}>
                {rotations.map((r, i) => (
                  <div key={i} className="page-row">
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.75rem", color: "#475569", minWidth: "60px" }}>Seite {i + 1}</span>
                    <div style={{ display: "flex", gap: "0.4rem", flex: 1 }}>
                      <button className={`rot-btn ${r === 0 ? "active" : ""}`} onClick={() => setPageRot(i, 0)}>0°</button>
                      {([90, 180, 270] as Rotation[]).map(deg => (
                        <button key={deg} className={`rot-btn ${r === deg ? "active" : ""}`} onClick={() => setPageRot(i, deg)}>+{deg}°</button>
                      ))}
                    </div>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: r > 0 ? "#38bdf8" : "#334155" }}>{r > 0 ? `+${r}°` : "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Download */}
          {pageCount > 0 && (
            <button className="btn-dl" onClick={process} disabled={busy}>
              {busy ? "Verarbeite…" : "PDF herunterladen"}
            </button>
          )}

          {status && <p className="status" style={{ color: status.includes("✓") ? "#4ade80" : status.includes("Fehler") ? "#f87171" : "#64748b" }}>{status}</p>}
        </div>
      </main>
    </div>
  );
}
