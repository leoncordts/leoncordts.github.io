"use client";
import { useState, useRef, useEffect, useCallback } from "react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
  .card { background: linear-gradient(135deg,#071422 0%,#050d1a 100%); border: 1px solid rgba(14,165,233,0.2); border-radius: 1rem; }
  .drop-zone { border: 2px dashed rgba(14,165,233,0.25); border-radius: 0.75rem; padding: 2rem 1.5rem; text-align: center; cursor: pointer; transition: all 0.2s; }
  .drop-zone:hover, .drop-zone.over { border-color: rgba(0,212,255,0.55); background: rgba(14,165,233,0.04); }
  .shape-btn { border-radius: 0.45rem; padding: 0.45rem 1rem; font-family: 'JetBrains Mono',monospace; font-size: 0.75rem; cursor: pointer; border: 1px solid rgba(14,165,233,0.25); background: transparent; color: #64748b; transition: all 0.2s; }
  .shape-btn.active { border-color: rgba(0,212,255,0.6); background: rgba(14,165,233,0.1); color: #38bdf8; }
  .size-btn { border-radius: 0.45rem; padding: 0.4rem 0.8rem; font-family: 'JetBrains Mono',monospace; font-size: 0.72rem; cursor: pointer; border: 1px solid rgba(14,165,233,0.25); background: transparent; color: #64748b; transition: all 0.2s; }
  .size-btn.active { border-color: rgba(0,212,255,0.6); background: rgba(14,165,233,0.1); color: #38bdf8; }
  .btn-dl { background: linear-gradient(135deg,rgba(14,165,233,0.3),rgba(0,212,255,0.15)); border: 1px solid rgba(14,165,233,0.5); color: #38bdf8; border-radius: 0.6rem; padding: 0.7rem 0; font-family: 'Syne',sans-serif; font-weight: 700; font-size: 0.95rem; cursor: pointer; transition: all 0.2s; width: 100%; }
  .btn-dl:hover:not(:disabled) { background: linear-gradient(135deg,rgba(14,165,233,0.45),rgba(0,212,255,0.25)); }
  .btn-dl:disabled { opacity: 0.35; cursor: default; }
  canvas { display: block; }
`;

type Shape = "circle" | "square" | "rounded";
const SIZES = [128, 256, 512, 1024];

function drawPfp(img: HTMLImageElement, canvas: HTMLCanvasElement, size: number, shape: Shape) {
  canvas.width  = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, size, size);

  // Crop center square from image
  const min = Math.min(img.naturalWidth, img.naturalHeight);
  const sx  = (img.naturalWidth  - min) / 2;
  const sy  = (img.naturalHeight - min) / 2;

  ctx.save();
  if (shape === "circle") {
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();
  } else if (shape === "rounded") {
    const r = size * 0.15;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(size - r, 0);
    ctx.quadraticCurveTo(size, 0, size, r);
    ctx.lineTo(size, size - r);
    ctx.quadraticCurveTo(size, size, size - r, size);
    ctx.lineTo(r, size);
    ctx.quadraticCurveTo(0, size, 0, size - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.clip();
  }
  ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
  ctx.restore();
}

export default function PfpMakerPage() {
  const [over, setOver]     = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [shape, setShape]   = useState<Shape>("circle");
  const [size, setSize]     = useState(512);
  const imgRef   = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);

  const redraw = useCallback(() => {
    const img = imgRef.current;
    if (!img || !canvasRef.current || !previewRef.current) return;
    drawPfp(img, canvasRef.current, size, shape);
    drawPfp(img, previewRef.current, 200, shape);
  }, [shape, size]);

  useEffect(() => { if (loaded) redraw(); }, [loaded, redraw]);

  function loadFile(f: File) {
    if (!f.type.startsWith("image/")) return;
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => { imgRef.current = img; setLoaded(true); };
    img.src = url;
  }

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `pfp-${size}x${size}.png`;
    a.click();
  }

  return (
    <div style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans',sans-serif", minHeight: "100vh" }}>
      <style>{S}</style>
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>pfp-maker</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Social Media</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.6rem,4vw,2.4rem)", color: "#fff", marginBottom: "0.3rem" }}>PFP Maker</h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Profilbild zuschneiden — Kreis, Quadrat oder abgerundet.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: "1.25rem", alignItems: "start" }}>
          {/* Left: controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="card p-5">
              <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.75rem" }}>Bild</label>
              <div
                className={`drop-zone ${over ? "over" : ""}`}
                style={{ padding: "1.25rem 1rem" }}
                onDragOver={e => { e.preventDefault(); setOver(true); }}
                onDragLeave={() => setOver(false)}
                onDrop={e => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files[0]; if (f) loadFile(f); }}
                onClick={() => { const i = document.createElement("input"); i.type = "file"; i.accept = "image/*"; i.onchange = () => { if (i.files?.[0]) loadFile(i.files[0]); }; i.click(); }}
              >
                <div style={{ fontSize: "1.5rem", marginBottom: "0.3rem" }}>🖼️</div>
                <p style={{ color: loaded ? "#38bdf8" : "#475569", fontSize: "0.78rem", fontFamily: "'JetBrains Mono',monospace" }}>
                  {loaded ? "Neues Bild laden" : "Bild ablegen oder klicken"}
                </p>
              </div>
            </div>

            <div className="card p-5">
              <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.6rem" }}>Form</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {(["circle", "square", "rounded"] as Shape[]).map(s => (
                  <button key={s} className={`shape-btn ${shape === s ? "active" : ""}`} onClick={() => setShape(s)}>
                    {s === "circle" ? "⭕ Kreis" : s === "square" ? "⬛ Quadrat" : "🔲 Abgerundet"}
                  </button>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.6rem" }}>Ausgabegröße</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {SIZES.map(s => (
                  <button key={s} className={`size-btn ${size === s ? "active" : ""}`} onClick={() => setSize(s)}>{s}px</button>
                ))}
              </div>
            </div>

            <button className="btn-dl" disabled={!loaded} onClick={download}>⬇ PNG herunterladen ({size}×{size})</button>
          </div>

          {/* Right: preview */}
          <div className="card p-4" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "260px", gap: "0.75rem" }}>
            <canvas
              ref={previewRef}
              width={200}
              height={200}
              style={{
                borderRadius: shape === "circle" ? "50%" : shape === "rounded" ? "30px" : "0",
                background: loaded ? "transparent" : "rgba(14,165,233,0.04)",
              }}
            />
            {!loaded && (
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: "#1e3a5f" }}>Vorschau</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
