"use client";
import { useState, useRef } from "react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
  .card { background: linear-gradient(135deg,#071422 0%,#050d1a 100%); border: 1px solid rgba(14,165,233,0.2); border-radius: 1rem; }
  .drop-zone { border: 2px dashed rgba(14,165,233,0.25); border-radius: 0.75rem; padding: 2rem 1.5rem; text-align: center; cursor: pointer; transition: all 0.2s; }
  .drop-zone:hover, .drop-zone.over { border-color: rgba(0,212,255,0.55); background: rgba(14,165,233,0.04); }
  .txt-input { background: rgba(7,20,34,0.8); border: 1px solid rgba(14,165,233,0.2); border-radius: 0.5rem; color: #e2e8f0; padding: 0.65rem 0.9rem; font-family: 'DM Sans',sans-serif; font-size: 0.95rem; width: 100%; outline: none; transition: border-color 0.2s; }
  .txt-input:focus { border-color: rgba(0,212,255,0.4); }
  .pos-btn { border-radius: 0.45rem; padding: 0.4rem 0.85rem; font-family: 'JetBrains Mono',monospace; font-size: 0.72rem; cursor: pointer; border: 1px solid rgba(14,165,233,0.25); background: transparent; color: #64748b; transition: all 0.2s; }
  .pos-btn.active { border-color: rgba(0,212,255,0.6); background: rgba(14,165,233,0.1); color: #38bdf8; }
  .btn-dl { background: linear-gradient(135deg,rgba(14,165,233,0.3),rgba(0,212,255,0.15)); border: 1px solid rgba(14,165,233,0.5); color: #38bdf8; border-radius: 0.6rem; padding: 0.7rem 0; font-family: 'Syne',sans-serif; font-weight: 700; font-size: 0.95rem; cursor: pointer; transition: all 0.2s; width: 100%; }
  .btn-dl:hover:not(:disabled) { background: linear-gradient(135deg,rgba(14,165,233,0.45),rgba(0,212,255,0.25)); }
  .btn-dl:disabled { opacity: 0.35; cursor: default; }
  .status { font-family: 'JetBrains Mono',monospace; font-size: 0.8rem; text-align: center; }
  .slider { width: 100%; accent-color: #0ea5e9; }
`;

type Position = "center" | "bottom-right" | "bottom-left" | "top-right";

const POSITIONS: { id: Position; label: string }[] = [
  { id: "center",       label: "Mitte (diagonal)" },
  { id: "bottom-right", label: "Unten rechts" },
  { id: "bottom-left",  label: "Unten links" },
  { id: "top-right",    label: "Oben rechts" },
];

export default function PdfWatermarkerPage() {
  const [file, setFile]    = useState<File | null>(null);
  const [over, setOver]    = useState(false);
  const [text, setText]    = useState("VERTRAULICH");
  const [opacity, setOpacity] = useState(30);
  const [fontSize, setFontSize] = useState(48);
  const [position, setPosition] = useState<Position>("center");
  const [status, setStatus]  = useState<{ msg: string; ok: boolean } | null>(null);
  const [busy, setBusy]      = useState(false);
  const fileRef = useRef<File | null>(null);

  function loadFile(f: File) {
    if (!f.name.toLowerCase().endsWith(".pdf")) { setStatus({ msg: "Nur PDF-Dateien unterstützt.", ok: false }); return; }
    fileRef.current = f;
    setFile(f);
    setStatus(null);
  }

  async function watermark() {
    const f = fileRef.current;
    if (!f || !text.trim()) return;
    setBusy(true);
    setStatus(null);
    try {
      const { PDFDocument, rgb, degrees } = await import("pdf-lib");
      const bytes = await f.arrayBuffer();
      const doc   = await PDFDocument.load(bytes);
      const pages = doc.getPages();
      const opacityVal = opacity / 100;

      for (const page of pages) {
        const { width, height } = page.getSize();
        const fs = fontSize;

        let x = 0, y = 0, rot = 0;
        switch (position) {
          case "center":
            x = width / 2 - (text.length * fs * 0.35);
            y = height / 2;
            rot = 45;
            break;
          case "bottom-right":
            x = width - text.length * fs * 0.6 - 30;
            y = 30;
            rot = 0;
            break;
          case "bottom-left":
            x = 30;
            y = 30;
            rot = 0;
            break;
          case "top-right":
            x = width - text.length * fs * 0.6 - 30;
            y = height - fs - 20;
            rot = 0;
            break;
        }

        page.drawText(text, {
          x, y,
          size: fs,
          color: rgb(0.5, 0.5, 0.5),
          opacity: opacityVal,
          rotate: degrees(rot),
        });
      }

      const output = await doc.save();
      const blob = new Blob([output.buffer as ArrayBuffer], { type: "application/pdf" });
      const stem = f.name.replace(/\.pdf$/i, "");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${stem}-wasserzeichen.pdf`;
      a.click();
      setStatus({ msg: `✓ Wasserzeichen auf ${pages.length} Seite(n) gesetzt.`, ok: true });
    } catch (e) {
      setStatus({ msg: `Fehler: ${e instanceof Error ? e.message : String(e)}`, ok: false });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans',sans-serif", minHeight: "100vh" }}>
      <style>{S}</style>

      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>pdf-watermarker</span>
        </div>
      </nav>

      <main className="max-w-md mx-auto px-6 py-10">
        <div className="mb-7">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>PDF</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.6rem)", color: "#fff", marginBottom: "0.3rem" }}>PDF Wasserzeichen</h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Text-Wasserzeichen auf jede Seite — kein Upload.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Drop zone */}
          <div className="card p-5">
            <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.75rem" }}>PDF</label>
            <div
              className={`drop-zone ${over ? "over" : ""}`}
              onDragOver={e => { e.preventDefault(); setOver(true); }}
              onDragLeave={() => setOver(false)}
              onDrop={e => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files[0]; if (f) loadFile(f); }}
              onClick={() => { const i = document.createElement("input"); i.type = "file"; i.accept = ".pdf"; i.onchange = () => { if (i.files?.[0]) loadFile(i.files[0]); }; i.click(); }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "0.4rem" }}>📄</div>
              <p style={{ color: file ? "#38bdf8" : "#475569", fontSize: "0.8rem", fontFamily: "'JetBrains Mono',monospace" }}>
                {file ? file.name : "PDF ablegen oder klicken"}
              </p>
            </div>
          </div>

          {/* Text + options */}
          <div className="card p-5">
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.4rem" }}>Wasserzeichen-Text</label>
                <input className="txt-input" type="text" value={text} onChange={e => setText(e.target.value)} placeholder="z. B. VERTRAULICH" />
              </div>

              <div>
                <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.4rem" }}>Position</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {POSITIONS.map(p => (
                    <button key={p.id} className={`pos-btn ${position === p.id ? "active" : ""}`} onClick={() => setPosition(p.id)}>{p.label}</button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                  <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase" }}>Schriftgröße</label>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.75rem", color: "#94a3b8" }}>{fontSize}pt</span>
                </div>
                <input type="range" className="slider" min={12} max={120} value={fontSize} onChange={e => setFontSize(Number(e.target.value))} />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                  <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase" }}>Deckkraft</label>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.75rem", color: "#94a3b8" }}>{opacity}%</span>
                </div>
                <input type="range" className="slider" min={5} max={100} value={opacity} onChange={e => setOpacity(Number(e.target.value))} />
              </div>
            </div>
          </div>

          <button className="btn-dl" disabled={!file || !text.trim() || busy} onClick={watermark}>
            {busy ? "Verarbeite…" : "💧 Wasserzeichen setzen & herunterladen"}
          </button>

          {status && <p className="status" style={{ color: status.ok ? "#4ade80" : "#f87171" }}>{status.msg}</p>}
        </div>
      </main>
    </div>
  );
}
