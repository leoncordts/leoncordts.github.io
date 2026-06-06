"use client";
import { useState, useRef, useCallback } from "react";

const SIZES = [16, 32, 48, 96, 192, 512];

function resizeImage(img: HTMLImageElement, size: number): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, size, size);
    canvas.toBlob((blob) => resolve(blob!), "image/png");
  });
}

export default function FaviconGeneratorPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [generating, setGenerating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setFileName(file.name);
    const url = URL.createObjectURL(file);
    setPreview(url);
    const img = new Image();
    img.onload = () => setImgEl(img);
    img.src = url;
  }, []);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  }

  async function downloadSize(size: number) {
    if (!imgEl) return;
    const blob = await resizeImage(imgEl, size);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = size === 32 ? "favicon.png" : `icon-${size}x${size}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadAll() {
    if (!imgEl) return;
    setGenerating(true);
    for (const size of SIZES) {
      await downloadSize(size);
      await new Promise((r) => setTimeout(r, 200));
    }
    setGenerating(false);
  }

  const S = {
    page: { minHeight: "100vh", backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans', sans-serif" } as React.CSSProperties,
    nav: { borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)", padding: "1rem 1.5rem" } as React.CSSProperties,
    card: { background: "linear-gradient(135deg,#071422 0%,#050d1a 100%)", border: "1px solid rgba(14,165,233,0.2)", borderRadius: "1rem", padding: "2rem" } as React.CSSProperties,
    mono: { fontFamily: "'JetBrains Mono',monospace" } as React.CSSProperties,
    label: { fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase" as const, display: "block", marginBottom: "0.5rem" },
  };

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
        .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
        .btn-primary { background: linear-gradient(135deg, rgba(0,212,255,0.15), rgba(14,165,233,0.1)); border: 1px solid rgba(0,212,255,0.4); color: #00d4ff; border-radius: 0.6rem; padding: 0.75rem 1.5rem; font-family: 'JetBrains Mono',monospace; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; }
        .btn-primary:hover { background: linear-gradient(135deg, rgba(0,212,255,0.25), rgba(14,165,233,0.2)); box-shadow: 0 0 20px rgba(0,212,255,0.2); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-size { background: rgba(14,165,233,0.08); border: 1px solid rgba(14,165,233,0.2); color: #94a3b8; border-radius: 0.5rem; padding: 0.5rem 1rem; font-family: 'JetBrains Mono',monospace; font-size: 0.75rem; cursor: pointer; transition: all 0.2s; }
        .btn-size:hover { border-color: rgba(0,212,255,0.5); color: #38bdf8; background: rgba(14,165,233,0.15); }
        .drop-zone { border: 2px dashed rgba(14,165,233,0.3); border-radius: 1rem; padding: 3rem 2rem; text-align: center; cursor: pointer; transition: all 0.2s; }
        .drop-zone.active { border-color: rgba(0,212,255,0.6); background: rgba(0,212,255,0.05); }
        .drop-zone:hover { border-color: rgba(14,165,233,0.5); background: rgba(14,165,233,0.03); }
      `}</style>

      <nav style={S.nav}>
        <div style={{ maxWidth: "56rem", margin: "0 auto", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <a href="/tools" style={{ color: "#38bdf8", ...S.mono, fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", ...S.mono, fontSize: "0.8rem" }}>favicon-generator</span>
        </div>
      </nav>

      <main style={{ maxWidth: "56rem", margin: "0 auto", padding: "3rem 1.5rem" }}>
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={S.label}>Web & Developer Tools</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.8rem)", color: "#fff", marginBottom: "0.5rem" }}>
            Favicon Generator
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1rem" }}>Lade ein Bild hoch und erhalte es in allen wichtigen Favicon-Größen. 100% lokal — kein Upload.</p>
        </div>

        <div style={S.card}>
          {/* Drop zone */}
          <div
            className={`drop-zone ${dragging ? "active" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f); }} />
            {preview ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                {/* Browser tab preview */}
                <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem 0.5rem 0 0", padding: "0.4rem 1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <img src={preview} alt="preview" style={{ width: "16px", height: "16px", objectFit: "cover", borderRadius: "2px" }} />
                  <span style={{ color: "#94a3b8", fontSize: "0.75rem", ...S.mono }}>leoncordts.de</span>
                </div>
                <img src={preview} alt="original" style={{ maxWidth: "120px", maxHeight: "120px", objectFit: "contain", borderRadius: "0.75rem", border: "1px solid rgba(14,165,233,0.3)" }} />
                <p style={{ color: "#64748b", fontSize: "0.8rem", ...S.mono }}>{fileName} · Klicken zum Wechseln</p>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🖼️</div>
                <p style={{ color: "#94a3b8", marginBottom: "0.5rem" }}>Bild hierher ziehen oder klicken</p>
                <p style={{ color: "#475569", fontSize: "0.8rem", ...S.mono }}>PNG, JPG, SVG, WebP · Empfohlen: quadratisch</p>
              </div>
            )}
          </div>

          {/* Size grid */}
          {imgEl && (
            <div style={{ marginTop: "2rem" }}>
              <div style={{ ...S.label, marginBottom: "1rem" }}>Einzelne Größen herunterladen</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.5rem" }}>
                {SIZES.map((size) => (
                  <button key={size} className="btn-size" onClick={() => downloadSize(size)}>
                    ↓ {size}×{size}
                    {size === 16 || size === 32 ? " (favicon)" : ""}
                    {size === 192 ? " (Android)" : ""}
                    {size === 512 ? " (PWA)" : ""}
                  </button>
                ))}
              </div>
              <button className="btn-primary" onClick={downloadAll} disabled={generating} style={{ width: "100%", fontSize: "0.95rem", padding: "1rem" }}>
                {generating ? "Generiere…" : "⬇ Alle Größen herunterladen"}
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ ...S.card, marginTop: "1.5rem" }}>
          <div style={{ ...S.label, marginBottom: "0.75rem" }}>Welche Größen brauchst du?</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.75rem" }}>
            {[
              { size: "16×16", use: "Browser-Tab (favicon)" },
              { size: "32×32", use: "Standard favicon.png" },
              { size: "48×48", use: "Windows-Taskleiste" },
              { size: "96×96", use: "Google-Suche" },
              { size: "192×192", use: "Android Chrome" },
              { size: "512×512", use: "PWA / App Store" },
            ].map(({ size, use }) => (
              <div key={size} style={{ background: "rgba(14,165,233,0.05)", border: "1px solid rgba(14,165,233,0.1)", borderRadius: "0.5rem", padding: "0.75rem" }}>
                <div style={{ color: "#38bdf8", ...S.mono, fontSize: "0.85rem", fontWeight: 600 }}>{size}</div>
                <div style={{ color: "#64748b", fontSize: "0.75rem", marginTop: "0.25rem" }}>{use}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
