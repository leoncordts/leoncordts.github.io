"use client";
import { useState, useRef, useCallback } from "react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
  .card { background: linear-gradient(135deg,#071422 0%,#050d1a 100%); border: 1px solid rgba(14,165,233,0.2); border-radius: 1rem; }
  .drop-zone { border: 2px dashed rgba(14,165,233,0.25); border-radius: 0.75rem; padding: 2rem 1.5rem; text-align: center; cursor: pointer; transition: all 0.2s; }
  .drop-zone:hover, .drop-zone.over { border-color: rgba(0,212,255,0.55); background: rgba(14,165,233,0.04); }
  .dim-input { background: rgba(7,20,34,0.8); border: 1px solid rgba(14,165,233,0.2); border-radius: 0.45rem; color: #e2e8f0; padding: 0.5rem 0.75rem; font-family: 'JetBrains Mono',monospace; font-size: 0.9rem; width: 100px; outline: none; text-align: center; transition: border-color 0.2s; }
  .dim-input:focus { border-color: rgba(0,212,255,0.4); }
  .lock-btn { background: transparent; border: 1px solid rgba(14,165,233,0.2); border-radius: 0.45rem; color: #38bdf8; padding: 0.5rem 0.7rem; cursor: pointer; font-size: 0.9rem; transition: all 0.2s; }
  .lock-btn.locked { border-color: rgba(0,212,255,0.5); background: rgba(14,165,233,0.1); }
  .fmt-btn { border-radius: 0.5rem; padding: 0.45rem 0.9rem; font-family: 'JetBrains Mono',monospace; font-size: 0.75rem; font-weight: 600; cursor: pointer; border: 1px solid rgba(14,165,233,0.25); background: transparent; color: #64748b; transition: all 0.2s; }
  .fmt-btn.active { border-color: rgba(0,212,255,0.7); background: rgba(14,165,233,0.12); color: #38bdf8; }
  .btn-dl { background: linear-gradient(135deg,rgba(14,165,233,0.3),rgba(0,212,255,0.15)); border: 1px solid rgba(14,165,233,0.5); color: #38bdf8; border-radius: 0.6rem; padding: 0.7rem 0; font-family: 'Syne',sans-serif; font-weight: 700; font-size: 0.95rem; cursor: pointer; transition: all 0.2s; width: 100%; }
  .btn-dl:hover:not(:disabled) { background: linear-gradient(135deg,rgba(14,165,233,0.45),rgba(0,212,255,0.25)); }
  .btn-dl:disabled { opacity: 0.35; cursor: default; }
  .dim-label { font-family: 'JetBrains Mono',monospace; font-size: 0.65rem; color: #475569; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.3rem; display: block; }
`;

type Format = "png" | "jpeg" | "webp";

export default function ImageResizerPage() {
  const [file, setFile]     = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [over, setOver]     = useState(false);
  const [origW, setOrigW]   = useState(0);
  const [origH, setOrigH]   = useState(0);
  const [w, setW]           = useState(0);
  const [h, setH]           = useState(0);
  const [locked, setLocked] = useState(true);
  const [format, setFormat] = useState<Format>("png");
  const imgRef   = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const loadFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setOrigW(img.naturalWidth);
      setOrigH(img.naturalHeight);
      setW(img.naturalWidth);
      setH(img.naturalHeight);
      setPreview(url);
    };
    img.src = url;
  }, []);

  function onWChange(val: string) {
    const n = parseInt(val) || 1;
    setW(n);
    if (locked && origW) setH(Math.round((n / origW) * origH));
  }

  function onHChange(val: string) {
    const n = parseInt(val) || 1;
    setH(n);
    if (locked && origH) setW(Math.round((n / origH) * origW));
  }

  function download() {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || !file) return;
    canvas.width  = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    if (format === "jpeg") { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h); }
    ctx.drawImage(img, 0, 0, w, h);
    const mime = format === "jpeg" ? "image/jpeg" : format === "webp" ? "image/webp" : "image/png";
    const ext  = format === "jpeg" ? "jpg" : format;
    const stem = file.name.replace(/\.[^.]+$/, "");
    const a = document.createElement("a");
    a.href = canvas.toDataURL(mime, 0.92);
    a.download = `${stem}-${w}x${h}.${ext}`;
    a.click();
  }

  return (
    <div style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans',sans-serif", minHeight: "100vh" }}>
      <style>{S}</style>
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>image-resizer</span>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-6 py-10">
        <div className="mb-7">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Medien</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.6rem)", color: "#fff", marginBottom: "0.3rem" }}>Bild Verkleinern</h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Breite &amp; Höhe setzen, Seitenverhältnis optional sperren — lokal, kein Upload.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Drop zone */}
          <div className="card p-5">
            <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.75rem" }}>Bild</label>
            <div
              className={`drop-zone ${over ? "over" : ""}`}
              onDragOver={e => { e.preventDefault(); setOver(true); }}
              onDragLeave={() => setOver(false)}
              onDrop={e => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files[0]; if (f) loadFile(f); }}
              onClick={() => { const i = document.createElement("input"); i.type = "file"; i.accept = "image/*"; i.onchange = () => { if (i.files?.[0]) loadFile(i.files[0]); }; i.click(); }}
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="preview" style={{ maxHeight: "120px", maxWidth: "100%", borderRadius: "0.4rem", margin: "0 auto", display: "block" }} />
              ) : (
                <>
                  <div style={{ fontSize: "2rem", marginBottom: "0.4rem" }}>🖼️</div>
                  <p style={{ color: "#475569", fontSize: "0.8rem", fontFamily: "'JetBrains Mono',monospace" }}>Bild ablegen oder klicken</p>
                </>
              )}
            </div>
            {origW > 0 && (
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#475569", marginTop: "0.5rem" }}>
                Original: <span style={{ color: "#38bdf8" }}>{origW} × {origH}px</span>
              </p>
            )}
          </div>

          {/* Dimensions */}
          <div className="card p-5">
            <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.75rem" }}>Maße (px)</label>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "0.75rem" }}>
              <div>
                <span className="dim-label">Breite</span>
                <input className="dim-input" type="number" min={1} value={w || ""} onChange={e => onWChange(e.target.value)} disabled={!file} />
              </div>
              <button
                className={`lock-btn ${locked ? "locked" : ""}`}
                onClick={() => setLocked(l => !l)}
                title={locked ? "Seitenverhältnis gesperrt" : "Seitenverhältnis frei"}
                style={{ marginBottom: "1px" }}
              >
                {locked ? "🔒" : "🔓"}
              </button>
              <div>
                <span className="dim-label">Höhe</span>
                <input className="dim-input" type="number" min={1} value={h || ""} onChange={e => onHChange(e.target.value)} disabled={!file} />
              </div>
            </div>
          </div>

          {/* Format */}
          <div className="card p-5">
            <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.75rem" }}>Format</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {(["png", "jpeg", "webp"] as Format[]).map(f => (
                <button key={f} className={`fmt-btn ${format === f ? "active" : ""}`} onClick={() => setFormat(f)}>
                  .{f === "jpeg" ? "jpg" : f}
                </button>
              ))}
            </div>
          </div>

          <button className="btn-dl" disabled={!file || w < 1 || h < 1} onClick={download}>
            ⬇ Skalieren &amp; Herunterladen
          </button>
        </div>
      </main>
    </div>
  );
}
