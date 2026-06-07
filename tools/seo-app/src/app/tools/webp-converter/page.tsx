"use client";
import { useState, useRef, useCallback } from "react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
  .card { background: linear-gradient(135deg,#071422 0%,#050d1a 100%); border: 1px solid rgba(14,165,233,0.2); border-radius: 1rem; }
  .drop-zone { border: 2px dashed rgba(14,165,233,0.25); border-radius: 0.75rem; padding: 2.5rem 1.5rem; text-align: center; cursor: pointer; transition: all 0.2s; }
  .drop-zone:hover, .drop-zone.over { border-color: rgba(0,212,255,0.55); background: rgba(14,165,233,0.04); }
  .fmt-btn { border-radius: 0.5rem; padding: 0.5rem 1.1rem; font-family: 'JetBrains Mono',monospace; font-size: 0.8rem; font-weight: 600; cursor: pointer; border: 1px solid rgba(14,165,233,0.25); background: transparent; color: #64748b; transition: all 0.2s; }
  .fmt-btn.active { border-color: rgba(0,212,255,0.7); background: rgba(14,165,233,0.12); color: #38bdf8; }
  .fmt-btn:hover:not(.active) { border-color: rgba(14,165,233,0.4); color: #94a3b8; }
  .quality-slider { width: 100%; accent-color: #0ea5e9; }
  .btn-dl { background: linear-gradient(135deg,rgba(14,165,233,0.3),rgba(0,212,255,0.15)); border: 1px solid rgba(14,165,233,0.5); color: #38bdf8; border-radius: 0.6rem; padding: 0.7rem 0; font-family: 'Syne',sans-serif; font-weight: 700; font-size: 0.95rem; cursor: pointer; transition: all 0.2s; width: 100%; }
  .btn-dl:hover:not(:disabled) { background: linear-gradient(135deg,rgba(14,165,233,0.45),rgba(0,212,255,0.25)); }
  .btn-dl:disabled { opacity: 0.35; cursor: default; }
  .stat { font-family: 'JetBrains Mono',monospace; font-size: 0.75rem; color: #475569; }
  .stat span { color: #38bdf8; }
`;

type Format = "webp" | "png" | "jpeg";

function fmtBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / 1024 / 1024).toFixed(2) + " MB";
}

export default function WebpConverterPage() {
  const [file, setFile]     = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [over, setOver]     = useState(false);
  const [format, setFormat] = useState<Format>("webp");
  const [quality, setQuality] = useState(90);
  const [outputSize, setOutputSize] = useState<number | null>(null);
  const imgRef  = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const loadFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    setOutputSize(null);
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setPreview(url);
    };
    img.src = url;
  }, []);

  function convert(): string | null {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return null;
    canvas.width  = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    if (format === "jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);
    const mime = format === "png" ? "image/png" : format === "jpeg" ? "image/jpeg" : "image/webp";
    return canvas.toDataURL(mime, quality / 100);
  }

  function download() {
    const dataUrl = convert();
    if (!dataUrl || !file) return;
    // estimate output size from base64
    const base64 = dataUrl.split(",")[1];
    const bytes = Math.round((base64.length * 3) / 4);
    setOutputSize(bytes);
    const ext = format === "jpeg" ? "jpg" : format;
    const stem = file.name.replace(/\.[^.]+$/, "");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${stem}.${ext}`;
    a.click();
  }

  const formats: Format[] = ["webp", "png", "jpeg"];

  return (
    <div style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans',sans-serif", minHeight: "100vh" }}>
      <style>{S}</style>
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>webp-converter</span>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-6 py-10">
        <div className="mb-7">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Medien</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.6rem)", color: "#fff", marginBottom: "0.3rem" }}>WebP Konverter</h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Bilder in WebP, PNG oder JPEG — direkt im Browser.</p>
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
                <img src={preview} alt="preview" style={{ maxHeight: "160px", maxWidth: "100%", borderRadius: "0.5rem", margin: "0 auto", display: "block" }} />
              ) : (
                <>
                  <div style={{ fontSize: "2rem", marginBottom: "0.4rem" }}>🖼️</div>
                  <p style={{ color: "#475569", fontSize: "0.8rem", fontFamily: "'JetBrains Mono',monospace" }}>Bild ablegen oder klicken</p>
                </>
              )}
            </div>
            {file && (
              <p className="stat" style={{ marginTop: "0.5rem" }}>
                {file.name} · <span>{fmtBytes(file.size)}</span>
                {outputSize && <> → <span>{fmtBytes(outputSize)}</span></>}
              </p>
            )}
          </div>

          {/* Format picker */}
          <div className="card p-5">
            <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.75rem" }}>Zielformat</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {formats.map(f => (
                <button key={f} className={`fmt-btn ${format === f ? "active" : ""}`} onClick={() => { setFormat(f); setOutputSize(null); }}>
                  .{f === "jpeg" ? "jpg" : f}
                </button>
              ))}
            </div>
          </div>

          {/* Quality (hidden for PNG) */}
          {format !== "png" && (
            <div className="card p-5">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase" }}>Qualität</label>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem", color: "#94a3b8" }}>{quality}%</span>
              </div>
              <input type="range" min={10} max={100} value={quality} onChange={e => { setQuality(Number(e.target.value)); setOutputSize(null); }} className="quality-slider" />
            </div>
          )}

          <button className="btn-dl" disabled={!file} onClick={download}>
            ⬇ Konvertieren &amp; Herunterladen
          </button>
        </div>
      </main>
    </div>
  );
}
