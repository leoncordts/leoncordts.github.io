"use client";
import { useState, useRef, useEffect, useCallback } from "react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
  .card { background: linear-gradient(135deg,#071422 0%,#050d1a 100%); border: 1px solid rgba(14,165,233,0.2); border-radius: 1rem; }
  input[type=text], input[type=range] { outline: none; }
  .meme-input { background: rgba(7,20,34,0.8); border: 1px solid rgba(14,165,233,0.2); border-radius: 0.5rem; color: #e2e8f0; padding: 0.6rem 0.9rem; font-family: 'DM Sans',sans-serif; font-size: 0.9rem; width: 100%; transition: border-color 0.2s; }
  .meme-input:focus { border-color: rgba(0,212,255,0.45); }
  .btn-primary { background: linear-gradient(135deg,rgba(14,165,233,0.3),rgba(0,212,255,0.15)); border: 1px solid rgba(14,165,233,0.5); color: #38bdf8; border-radius: 0.6rem; padding: 0.6rem 1.4rem; font-family: 'Syne',sans-serif; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; }
  .btn-primary:hover { background: linear-gradient(135deg,rgba(14,165,233,0.45),rgba(0,212,255,0.25)); }
  .btn-secondary { background: transparent; border: 1px solid rgba(14,165,233,0.3); color: #64748b; border-radius: 0.6rem; padding: 0.6rem 1.4rem; font-family: 'Syne',sans-serif; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; }
  .btn-secondary:hover { border-color: rgba(14,165,233,0.5); color: #94a3b8; }
  .drop-zone { border: 2px dashed rgba(14,165,233,0.25); border-radius: 0.75rem; padding: 2rem; text-align: center; cursor: pointer; transition: all 0.2s; }
  .drop-zone:hover, .drop-zone.over { border-color: rgba(0,212,255,0.5); background: rgba(14,165,233,0.04); }
  canvas { border-radius: 0.5rem; max-width: 100%; }
`;

export default function MemeGeneratorPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [topText, setTopText]   = useState("TOP TEXT");
  const [botText, setBotText]   = useState("BOTTOM TEXT");
  const [fontSize, setFontSize] = useState(48);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [over, setOver]         = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img    = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width  = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    const fs = Math.round(fontSize * (img.naturalWidth / 500));
    ctx.font         = `900 ${fs}px Impact, Arial Black, sans-serif`;
    ctx.textAlign    = "center";
    ctx.lineWidth    = fs * 0.08;
    ctx.strokeStyle  = "#000";
    ctx.fillStyle    = "#fff";
    ctx.lineJoin     = "round";

    const margin = fs * 0.2;
    const cx = canvas.width / 2;

    if (topText) {
      ctx.strokeText(topText.toUpperCase(), cx, fs + margin, canvas.width * 0.9);
      ctx.fillText(topText.toUpperCase(),   cx, fs + margin, canvas.width * 0.9);
    }
    if (botText) {
      const y = canvas.height - margin;
      ctx.strokeText(botText.toUpperCase(), cx, y, canvas.width * 0.9);
      ctx.fillText(botText.toUpperCase(),   cx, y, canvas.width * 0.9);
    }
  }, [topText, botText, fontSize]);

  useEffect(() => { if (imgLoaded) draw(); }, [imgLoaded, draw]);

  function loadFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { imgRef.current = img; setImgLoaded(true); };
    img.src = url;
  }

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href     = canvas.toDataURL("image/png");
    a.download = "meme.png";
    a.click();
  }

  return (
    <div style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans',sans-serif", minHeight: "100vh" }}>
      <style>{S}</style>
      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>meme-generator</span>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Social Media</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.6rem,4vw,2.4rem)", color: "#fff", marginBottom: "0.4rem" }}>Meme Generator</h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Bild hochladen, Text eingeben, herunterladen — fertig.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", alignItems: "start" }}>
          {/* Left: controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Drop zone */}
            <div className="card p-5">
              <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.6rem" }}>Bild</label>
              <div
                className={`drop-zone ${over ? "over" : ""}`}
                onDragOver={e => { e.preventDefault(); setOver(true); }}
                onDragLeave={() => setOver(false)}
                onDrop={e => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files[0]; if (f) loadFile(f); }}
                onClick={() => { const i = document.createElement("input"); i.type = "file"; i.accept = "image/*"; i.onchange = () => { if (i.files?.[0]) loadFile(i.files[0]); }; i.click(); }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "0.4rem" }}>🖼️</div>
                <p style={{ color: "#475569", fontSize: "0.8rem", fontFamily: "'JetBrains Mono',monospace" }}>
                  {imgLoaded ? "Neues Bild ablegen oder klicken" : "Bild ablegen oder klicken"}
                </p>
              </div>
            </div>

            {/* Text inputs */}
            <div className="card p-5">
              <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.75rem" }}>Text</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "#64748b", display: "block", marginBottom: "0.3rem" }}>Oben</label>
                  <input className="meme-input" type="text" value={topText} onChange={e => { setTopText(e.target.value); }} placeholder="Top Text" />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "#64748b", display: "block", marginBottom: "0.3rem" }}>Unten</label>
                  <input className="meme-input" type="text" value={botText} onChange={e => { setBotText(e.target.value); }} placeholder="Bottom Text" />
                </div>
              </div>
            </div>

            {/* Font size */}
            <div className="card p-5">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase" }}>Schriftgröße</label>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem", color: "#94a3b8" }}>{fontSize}px</span>
              </div>
              <input
                type="range" min={20} max={100} value={fontSize}
                onChange={e => setFontSize(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#0ea5e9" }}
              />
            </div>

            {/* Download */}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button className="btn-primary" style={{ flex: 1 }} onClick={download} disabled={!imgLoaded}>
                ⬇ Als PNG herunterladen
              </button>
            </div>
          </div>

          {/* Right: canvas preview */}
          <div className="card p-4" style={{ minHeight: "300px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {imgLoaded ? (
              <canvas ref={canvasRef} style={{ maxWidth: "100%", maxHeight: "60vh", borderRadius: "0.5rem" }} />
            ) : (
              <div style={{ textAlign: "center", color: "#1e3a5f" }}>
                <div style={{ fontSize: "3rem" }}>😂</div>
                <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.75rem", marginTop: "0.5rem" }}>Vorschau erscheint hier</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
