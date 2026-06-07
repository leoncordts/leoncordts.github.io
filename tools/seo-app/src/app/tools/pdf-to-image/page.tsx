"use client";
import { useState, useRef, useCallback } from "react";

type PagePreview = { page: number; url: string };
type Stage = "idle" | "loading" | "done";

const COLORS = {
  bg: "#020b18", nav: "rgba(5,13,26,0.95)", card: "linear-gradient(135deg,#071422 0%,#050d1a 100%)",
  border: "rgba(14,165,233,0.2)", accent: "#00d4ff", muted: "#94a3b8", dim: "#475569",
};

export default function PdfToImagePage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [previews, setPreviews] = useState<PagePreview[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [fileName, setFileName] = useState("");
  const [dragging, setDragging] = useState(false);
  const [format, setFormat] = useState<"jpeg" | "png">("jpeg");
  const [scale, setScale] = useState(2);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const blobsRef = useRef<Blob[]>([]);

  const processFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setStage("loading");
    setPreviews([]);
    blobsRef.current = [];

    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const total = pdf.numPages;
      setProgress({ current: 0, total });

      const newPreviews: PagePreview[] = [];

      for (let i = 1; i <= total; i++) {
        setProgress({ current: i, total });
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;

        const mimeType = format === "jpeg" ? "image/jpeg" : "image/png";
        const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), mimeType, 0.92));
        blobsRef.current.push(blob);
        const url = URL.createObjectURL(blob);
        newPreviews.push({ page: i, url });
        setPreviews([...newPreviews]);
      }

      setStage("done");
    } catch (e) {
      console.error(e);
      setStage("idle");
      alert("Fehler beim Laden des PDFs. Bitte stelle sicher, dass die Datei ein gueltiges PDF ist.");
    }
  }, [format, scale]);

  async function downloadAll() {
    if (!blobsRef.current.length) return;
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    const ext = format === "jpeg" ? "jpg" : "png";
    blobsRef.current.forEach((blob, i) => {
      zip.file(`seite-${String(i + 1).padStart(3, "0")}.${ext}`, blob);
    });
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName.replace(/\.pdf$/i, "")}-bilder.zip`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadSingle(preview: PagePreview) {
    const ext = format === "jpeg" ? "jpg" : "png";
    const a = document.createElement("a");
    a.href = preview.url;
    a.download = `seite-${preview.page}.${ext}`;
    a.click();
  }

  function reset() {
    previews.forEach((p) => URL.revokeObjectURL(p.url));
    setPreviews([]);
    setBlobsRef();
    setStage("idle");
    setFileName("");
  }

  function setBlobsRef() { blobsRef.current = []; }

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
        .btn-secondary { background: rgba(14,165,233,0.06); border: 1px solid rgba(14,165,233,0.2); color: #64748b; border-radius: 0.6rem; padding: 0.6rem 1.25rem; font-family: 'JetBrains Mono',monospace; font-size: 0.78rem; cursor: pointer; transition: all 0.2s; }
        .btn-secondary:hover { color: #94a3b8; border-color: rgba(14,165,233,0.35); }
        .format-btn { padding: 0.4rem 1rem; border-radius: 0.4rem; font-family: 'JetBrains Mono',monospace; font-size: 0.75rem; cursor: pointer; border: 1px solid; transition: all 0.15s; }
        .format-btn.active { background: rgba(0,212,255,0.15); border-color: rgba(0,212,255,0.4); color: #00d4ff; }
        .format-btn.inactive { background: transparent; border-color: rgba(14,165,233,0.15); color: #475569; }
        .page-card { background: rgba(7,20,34,0.8); border: 1px solid rgba(14,165,233,0.12); border-radius: 0.75rem; overflow: hidden; transition: border-color 0.2s; }
        .page-card:hover { border-color: rgba(14,165,233,0.3); }
        .progress-bar { background: rgba(14,165,233,0.1); border-radius: 9999px; height: 6px; overflow: hidden; }
        .progress-fill { background: linear-gradient(90deg,#0ea5e9,#00d4ff); height: 100%; transition: width 0.3s; border-radius: 9999px; }
      `}</style>

      <nav style={S.nav}>
        <div style={{ maxWidth: "64rem", margin: "0 auto", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <a href="/tools" style={{ color: COLORS.accent, ...S.mono, fontSize: "0.8rem" }}>{"<-"} Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: COLORS.muted, ...S.mono, fontSize: "0.8rem" }}>pdf-to-image</span>
        </div>
      </nav>

      <main style={{ maxWidth: "64rem", margin: "0 auto", padding: "3rem 1.5rem" }}>
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={S.label}>Medien & Konverter</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.8rem)", color: "#fff", marginBottom: "0.5rem" }}>
            PDF zu Bild
          </h1>
          <p style={{ color: COLORS.muted }}>PDF-Seiten in hochaufloesende Bilder umwandeln. 100% lokal, kein Upload.</p>
        </div>

        {stage === "idle" && (
          <div style={S.card}>
            {/* Format + Scale options */}
            <div style={{ display: "flex", gap: "2rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
              <div>
                <div style={S.label}>Format</div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {(["jpeg", "png"] as const).map((f) => (
                    <button key={f} className={`format-btn ${format === f ? "active" : "inactive"}`} onClick={() => setFormat(f)}>
                      {f.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div style={S.label}>Aufloesung (Scale)</div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {[1, 2, 3].map((s) => (
                    <button key={s} className={`format-btn ${scale === s ? "active" : "inactive"}`} onClick={() => setScale(s)}>
                      {s}x {s === 2 ? "(empfohlen)" : ""}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div
              className={`drop-zone ${dragging ? "active" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📄</div>
              <p style={{ color: COLORS.muted, marginBottom: "0.5rem" }}>PDF hier reinziehen oder klicken</p>
              <p style={{ color: COLORS.dim, fontSize: "0.8rem", ...S.mono }}>Alle PDF-Seiten werden einzeln als Bild exportiert</p>
            </div>
          </div>
        )}

        {stage === "loading" && (
          <div style={{ ...S.card, textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚙️</div>
            <p style={{ color: COLORS.muted, marginBottom: "1rem" }}>
              Verarbeite Seite {progress.current} von {progress.total}...
            </p>
            <div className="progress-bar" style={{ maxWidth: "400px", margin: "0 auto" }}>
              <div className="progress-fill" style={{ width: `${progress.total ? (progress.current / progress.total) * 100 : 0}%` }} />
            </div>
            {previews.length > 0 && (
              <div style={{ marginTop: "2rem", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))", gap: "0.75rem" }}>
                {previews.map((p) => (
                  <div key={p.page} className="page-card">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt={`Seite ${p.page}`} style={{ width: "100%", display: "block" }} />
                    <div style={{ padding: "0.4rem", textAlign: "center", ...S.mono, fontSize: "0.65rem", color: COLORS.dim }}>Seite {p.page}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {stage === "done" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ ...S.card, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <div style={{ ...S.mono, fontSize: "0.72rem", color: COLORS.dim }}>{fileName}</div>
                <div style={{ color: "#4ade80", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                  {previews.length} Seite{previews.length !== 1 ? "n" : ""} konvertiert
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button className="btn-secondary" onClick={reset}>Neue PDF</button>
                <button className="btn-primary" onClick={downloadAll}>
                  ⬇ Alle als ZIP herunterladen
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: "0.75rem" }}>
              {previews.map((p) => (
                <div key={p.page} className="page-card" style={{ cursor: "pointer" }} onClick={() => downloadSingle(p)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={`Seite ${p.page}`} style={{ width: "100%", display: "block" }} />
                  <div style={{ padding: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ ...S.mono, fontSize: "0.65rem", color: COLORS.dim }}>Seite {p.page}</span>
                    <span style={{ fontSize: "0.65rem", color: COLORS.accent }}>⬇</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
