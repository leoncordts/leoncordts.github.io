"use client";
import { useState, useRef, useCallback } from "react";

type FileResult = { name: string; url: string; size: string; originalSize: string };

const COLORS = {
  bg: "#020b18", nav: "rgba(5,13,26,0.95)", card: "linear-gradient(135deg,#071422 0%,#050d1a 100%)",
  border: "rgba(14,165,233,0.2)", accent: "#00d4ff", muted: "#94a3b8", dim: "#475569",
};

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
}

export default function HeicToJpgPage() {
  const [results, setResults] = useState<FileResult[]>([]);
  const [converting, setConverting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [format, setFormat] = useState<"jpeg" | "png">("jpeg");
  const [quality, setQuality] = useState(0.9);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const convertFiles = useCallback(async (files: FileList | File[]) => {
    setError(null);
    setConverting(true);
    const arr = Array.from(files);

    try {
      const heic2any = (await import("heic2any")).default;
      const newResults: FileResult[] = [];

      for (const file of arr) {
        const isHeic = file.type === "image/heic" || file.type === "image/heif"
          || file.name.toLowerCase().endsWith(".heic") || file.name.toLowerCase().endsWith(".heif");

        let blob: Blob;

        if (isHeic) {
          const converted = await heic2any({
            blob: file,
            toType: format === "jpeg" ? "image/jpeg" : "image/png",
            quality: format === "jpeg" ? quality : 1,
          });
          blob = Array.isArray(converted) ? converted[0] : converted;
        } else {
          // Non-HEIC: just re-export via canvas
          const url = URL.createObjectURL(file);
          const img = await new Promise<HTMLImageElement>((res, rej) => {
            const i = new Image();
            i.onload = () => res(i);
            i.onerror = rej;
            i.src = url;
          });
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          canvas.getContext("2d")!.drawImage(img, 0, 0);
          blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), `image/${format}`, quality));
          URL.revokeObjectURL(url);
        }

        const ext = format === "jpeg" ? "jpg" : "png";
        const baseName = file.name.replace(/\.(heic|heif|jpg|jpeg|png|webp)$/i, "");
        const resultUrl = URL.createObjectURL(blob);
        newResults.push({
          name: `${baseName}.${ext}`,
          url: resultUrl,
          size: formatBytes(blob.size),
          originalSize: formatBytes(file.size),
        });
      }

      setResults((prev) => [...prev, ...newResults]);
    } catch (e) {
      console.error(e);
      setError("Konvertierung fehlgeschlagen. Stelle sicher, dass die Datei ein gueltiges HEIC/HEIF-Bild ist.");
    }

    setConverting(false);
  }, [format, quality]);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) convertFiles(e.dataTransfer.files);
  }

  function downloadAll() {
    results.forEach((r) => {
      const a = document.createElement("a");
      a.href = r.url;
      a.download = r.name;
      a.click();
    });
  }

  const S = {
    page: { minHeight: "100vh", backgroundColor: COLORS.bg, color: "#cbd5e1", fontFamily: "'DM Sans',sans-serif" } as React.CSSProperties,
    nav: { borderBottom: `1px solid ${COLORS.border}`, backgroundColor: COLORS.nav, backdropFilter: "blur(12px)", padding: "1rem 1.5rem" } as React.CSSProperties,
    card: { background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: "1rem", padding: "2rem" } as React.CSSProperties,
    mono: { fontFamily: "'JetBrains Mono',monospace" } as React.CSSProperties,
    label: { fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: COLORS.accent, letterSpacing: "0.12em", textTransform: "uppercase" as const, display: "block", marginBottom: "0.5rem" },
  };

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
        .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45),0 0 80px rgba(0,212,255,0.15); }
        .drop-zone { border: 2px dashed rgba(14,165,233,0.3); border-radius: 1rem; padding: 3rem 2rem; text-align: center; cursor: pointer; transition: all 0.2s; }
        .drop-zone.active,.drop-zone:hover { border-color: rgba(0,212,255,0.6); background: rgba(0,212,255,0.04); }
        .btn-primary { background: linear-gradient(135deg,rgba(0,212,255,0.15),rgba(14,165,233,0.1)); border: 1px solid rgba(0,212,255,0.4); color: #00d4ff; border-radius: 0.6rem; padding: 0.75rem 1.5rem; font-family: 'JetBrains Mono',monospace; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; }
        .btn-primary:hover { box-shadow: 0 0 20px rgba(0,212,255,0.2); }
        .btn-secondary { background: rgba(14,165,233,0.06); border: 1px solid rgba(14,165,233,0.2); color: #64748b; border-radius: 0.5rem; padding: 0.5rem 1rem; font-family: 'JetBrains Mono',monospace; font-size: 0.75rem; cursor: pointer; transition: all 0.2s; }
        .btn-secondary:hover { color: #94a3b8; }
        .format-btn { padding: 0.4rem 1rem; border-radius: 0.4rem; font-family: 'JetBrains Mono',monospace; font-size: 0.75rem; cursor: pointer; border: 1px solid; transition: all 0.15s; }
        .format-btn.active { background: rgba(0,212,255,0.15); border-color: rgba(0,212,255,0.4); color: #00d4ff; }
        .format-btn.inactive { background: transparent; border-color: rgba(14,165,233,0.15); color: #475569; }
        .result-row { display: flex; align-items: center; gap: 1rem; padding: 0.75rem; border-radius: 0.5rem; background: rgba(14,165,233,0.04); border: 1px solid rgba(14,165,233,0.1); }
        .result-row:hover { border-color: rgba(14,165,233,0.25); }
        .spinner { display: inline-block; width: 20px; height: 20px; border: 2px solid rgba(0,212,255,0.2); border-top-color: #00d4ff; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <nav style={S.nav}>
        <div style={{ maxWidth: "56rem", margin: "0 auto", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <a href="/tools" style={{ color: COLORS.accent, ...S.mono, fontSize: "0.8rem" }}>{"<-"} Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: COLORS.muted, ...S.mono, fontSize: "0.8rem" }}>heic-to-jpg</span>
        </div>
      </nav>

      <main style={{ maxWidth: "56rem", margin: "0 auto", padding: "3rem 1.5rem" }}>
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={S.label}>Medien & Konverter</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.8rem)", color: "#fff", marginBottom: "0.5rem" }}>
            HEIC zu JPG
          </h1>
          <p style={{ color: COLORS.muted }}>iPhone HEIC/HEIF Fotos zu JPG oder PNG konvertieren. 100% lokal, kein Upload.</p>
        </div>

        <div style={S.card}>
          {/* Options */}
          <div style={{ display: "flex", gap: "2rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            <div>
              <div style={S.label}>Ausgabe-Format</div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {(["jpeg", "png"] as const).map((f) => (
                  <button key={f} className={`format-btn ${format === f ? "active" : "inactive"}`} onClick={() => setFormat(f)}>
                    {f === "jpeg" ? "JPG" : "PNG"}
                  </button>
                ))}
              </div>
            </div>
            {format === "jpeg" && (
              <div>
                <div style={S.label}>Qualitaet: {Math.round(quality * 100)}%</div>
                <input type="range" min={0.5} max={1} step={0.05} value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  style={{ accentColor: COLORS.accent, width: "150px" }} />
              </div>
            )}
          </div>

          {/* Drop zone */}
          <div
            className={`drop-zone ${dragging ? "active" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".heic,.heif,image/heic,image/heif"
              multiple
              style={{ display: "none" }}
              onChange={(e) => { if (e.target.files?.length) convertFiles(e.target.files); }}
            />
            {converting ? (
              <div>
                <div className="spinner" style={{ margin: "0 auto 1rem" }} />
                <p style={{ color: COLORS.muted }}>Konvertiere...</p>
              </div>
            ) : (
              <>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📷</div>
                <p style={{ color: COLORS.muted, marginBottom: "0.5rem" }}>HEIC/HEIF Dateien hier reinziehen oder klicken</p>
                <p style={{ color: COLORS.dim, fontSize: "0.8rem", ...S.mono }}>Mehrere Dateien gleichzeitig moeglich</p>
              </>
            )}
          </div>

          {error && (
            <div style={{ marginTop: "1rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "0.5rem", padding: "0.75rem 1rem", color: "#f87171", fontSize: "0.85rem" }}>
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div style={{ ...S.card, marginTop: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ ...S.mono, fontSize: "0.72rem", color: "#4ade80" }}>
                {results.length} Datei{results.length !== 1 ? "en" : ""} konvertiert
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button className="btn-secondary" onClick={() => setResults([])}>Leeren</button>
                {results.length > 1 && <button className="btn-primary" onClick={downloadAll}>Alle herunterladen</button>}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {results.map((r, i) => (
                <div key={i} className="result-row">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.url} alt={r.name} style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "0.35rem", border: "1px solid rgba(14,165,233,0.2)" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ ...S.mono, fontSize: "0.78rem", color: COLORS.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</div>
                    <div style={{ fontSize: "0.72rem", color: COLORS.dim }}>
                      {r.originalSize} <span style={{ color: COLORS.accent }}>→</span> {r.size}
                    </div>
                  </div>
                  <a href={r.url} download={r.name}>
                    <button className="btn-secondary">⬇ Download</button>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info box */}
        <div style={{ ...S.card, marginTop: "1rem" }}>
          <div style={{ ...S.label, marginBottom: "0.5rem" }}>Was ist HEIC?</div>
          <p style={{ color: COLORS.dim, fontSize: "0.85rem", lineHeight: 1.7 }}>
            HEIC (High Efficiency Image Container) ist das Standard-Fotoformat neuerer iPhones. Es ist kompakter als JPG, wird aber nicht ueberall unterstuetzt. Dieses Tool konvertiert HEIC/HEIF-Bilder direkt im Browser zu JPG oder PNG — ohne Upload, ohne Cloud.
          </p>
        </div>
      </main>
    </div>
  );
}
