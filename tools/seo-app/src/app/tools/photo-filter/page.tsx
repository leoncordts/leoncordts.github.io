"use client";
import { useState, useRef, useCallback } from "react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
  .card { background: linear-gradient(135deg,#071422 0%,#050d1a 100%); border: 1px solid rgba(14,165,233,0.2); border-radius: 1rem; }
  .drop-zone { border: 2px dashed rgba(14,165,233,0.25); border-radius: 0.75rem; padding: 2rem 1.5rem; text-align: center; cursor: pointer; transition: all 0.2s; }
  .drop-zone:hover, .drop-zone.over { border-color: rgba(0,212,255,0.55); background: rgba(14,165,233,0.04); }
  .filter-slider { width: 100%; accent-color: #0ea5e9; }
  .preset-btn { border-radius: 0.45rem; padding: 0.4rem 0.85rem; font-family: 'JetBrains Mono',monospace; font-size: 0.72rem; cursor: pointer; border: 1px solid rgba(14,165,233,0.22); background: transparent; color: #64748b; transition: all 0.2s; }
  .preset-btn:hover { border-color: rgba(14,165,233,0.4); color: #94a3b8; }
  .btn-dl { background: linear-gradient(135deg,rgba(14,165,233,0.3),rgba(0,212,255,0.15)); border: 1px solid rgba(14,165,233,0.5); color: #38bdf8; border-radius: 0.6rem; padding: 0.65rem 0; font-family: 'Syne',sans-serif; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; width: 100%; }
  .btn-dl:hover:not(:disabled) { background: linear-gradient(135deg,rgba(14,165,233,0.45),rgba(0,212,255,0.25)); }
  .btn-dl:disabled { opacity: 0.35; cursor: default; }
  .btn-reset { background: transparent; border: 1px solid rgba(14,165,233,0.2); color: #64748b; border-radius: 0.5rem; padding: 0.5rem 1rem; font-family: 'JetBrains Mono',monospace; font-size: 0.75rem; cursor: pointer; transition: all 0.2s; }
  .btn-reset:hover { border-color: rgba(14,165,233,0.35); color: #94a3b8; }
  .f-row { display: flex; align-items: center; gap: 0.75rem; }
  .f-label { font-family: 'JetBrains Mono',monospace; font-size: 0.7rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; width: 88px; flex-shrink: 0; }
  .f-val { font-family: 'JetBrains Mono',monospace; font-size: 0.75rem; color: #38bdf8; width: 42px; text-align: right; flex-shrink: 0; }
`;

type Filters = { brightness: number; contrast: number; saturate: number; blur: number; grayscale: number };
const DEF: Filters = { brightness: 100, contrast: 100, saturate: 100, blur: 0, grayscale: 0 };

const PRESETS: { label: string; f: Partial<Filters> }[] = [
  { label: "Normal",     f: {} },
  { label: "Graustufen", f: { grayscale: 100, saturate: 0 } },
  { label: "Vintage",    f: { saturate: 60, contrast: 115, brightness: 95 } },
  { label: "Vivid",      f: { saturate: 180, contrast: 110 } },
  { label: "Soft",       f: { brightness: 110, contrast: 85, blur: 1 } },
];

function toFilterStr(f: Filters) {
  return `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturate}%) blur(${f.blur}px) grayscale(${f.grayscale}%)`;
}

export default function PhotoFilterPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [over, setOver]       = useState(false);
  const [filters, setFilters] = useState<Filters>({ ...DEF });
  const imgRef   = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef  = useRef<File | null>(null);

  const loadFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) return;
    fileRef.current = f;
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => { imgRef.current = img; setPreview(url); };
    img.src = url;
  }, []);

  function setF<K extends keyof Filters>(key: K, val: number) {
    setFilters(prev => ({ ...prev, [key]: val }));
  }

  function applyPreset(p: typeof PRESETS[number]) {
    setFilters({ ...DEF, ...p.f });
  }

  function download() {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || !fileRef.current) return;
    canvas.width  = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.filter = toFilterStr(filters);
    ctx.drawImage(img, 0, 0);
    ctx.filter = "none";
    const a = document.createElement("a");
    const stem = fileRef.current.name.replace(/\.[^.]+$/, "");
    a.href = canvas.toDataURL("image/jpeg", 0.92);
    a.download = `${stem}-filtered.jpg`;
    a.click();
  }

  const filterStr = toFilterStr(filters);

  return (
    <div style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans',sans-serif", minHeight: "100vh" }}>
      <style>{S}</style>
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>photo-filter</span>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Medien</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.6rem,4vw,2.4rem)", color: "#fff", marginBottom: "0.3rem" }}>Foto Filter</h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Filter anpassen, Live-Vorschau, als JPEG herunterladen.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "1.25rem", alignItems: "start" }}>
          {/* Left: controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
            {/* Drop zone */}
            <div className="card p-4">
              <div
                className={`drop-zone ${over ? "over" : ""}`}
                style={{ padding: "1.25rem 1rem" }}
                onDragOver={e => { e.preventDefault(); setOver(true); }}
                onDragLeave={() => setOver(false)}
                onDrop={e => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files[0]; if (f) loadFile(f); }}
                onClick={() => { const i = document.createElement("input"); i.type = "file"; i.accept = "image/*"; i.onchange = () => { if (i.files?.[0]) loadFile(i.files[0]); }; i.click(); }}
              >
                <div style={{ fontSize: "1.5rem", marginBottom: "0.3rem" }}>🖼️</div>
                <p style={{ color: "#475569", fontSize: "0.75rem", fontFamily: "'JetBrains Mono',monospace" }}>
                  {preview ? "Neues Bild laden" : "Bild ablegen / klicken"}
                </p>
              </div>
            </div>

            {/* Presets */}
            <div className="card p-4">
              <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.6rem" }}>Presets</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {PRESETS.map(p => (
                  <button key={p.label} className="preset-btn" onClick={() => applyPreset(p)}>{p.label}</button>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="card p-4">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase" }}>Filter</label>
                <button className="btn-reset" onClick={() => setFilters({ ...DEF })}>Reset</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {([
                  { key: "brightness", label: "Helligkeit", min: 0, max: 200, unit: "%" },
                  { key: "contrast",   label: "Kontrast",   min: 0, max: 200, unit: "%" },
                  { key: "saturate",   label: "Sättigung",  min: 0, max: 300, unit: "%" },
                  { key: "grayscale",  label: "Graustufen", min: 0, max: 100, unit: "%" },
                  { key: "blur",       label: "Unschärfe",  min: 0, max: 20,  unit: "px" },
                ] as const).map(({ key, label, min, max, unit }) => (
                  <div key={key}>
                    <div className="f-row" style={{ marginBottom: "0.25rem" }}>
                      <span className="f-label">{label}</span>
                      <span className="f-val">{filters[key]}{unit}</span>
                    </div>
                    <input type="range" className="filter-slider" min={min} max={max} value={filters[key]}
                      onChange={e => setF(key, Number(e.target.value))} />
                  </div>
                ))}
              </div>
            </div>

            <button className="btn-dl" disabled={!preview} onClick={download}>⬇ JPEG herunterladen</button>
          </div>

          {/* Right: preview */}
          <div className="card p-4" style={{ minHeight: "340px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="preview"
                style={{ maxWidth: "100%", maxHeight: "65vh", borderRadius: "0.5rem", filter: filterStr, display: "block" }}
              />
            ) : (
              <div style={{ textAlign: "center", color: "#1e3a5f" }}>
                <div style={{ fontSize: "3rem" }}>📷</div>
                <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.75rem", marginTop: "0.5rem" }}>Vorschau erscheint hier</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
