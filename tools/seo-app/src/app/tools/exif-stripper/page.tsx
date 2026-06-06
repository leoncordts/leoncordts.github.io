"use client";
import { useState, useRef, useCallback } from "react";

interface ExifInfo {
  hasGps: boolean;
  lat?: number;
  lng?: number;
  make?: string;
  model?: string;
  dateTime?: string;
  software?: string;
}

function parseExifBasic(buffer: ArrayBuffer): ExifInfo {
  const view = new DataView(buffer);
  const info: ExifInfo = { hasGps: false };

  // Check JPEG magic
  if (view.getUint16(0) !== 0xFFD8) return info;

  let offset = 2;
  while (offset < buffer.byteLength - 2) {
    const marker = view.getUint16(offset);
    offset += 2;
    if (marker === 0xFFE1) { // APP1 = EXIF
      const segLen = view.getUint16(offset);
      const exifHeader = String.fromCharCode(...new Uint8Array(buffer, offset + 2, 4));
      if (exifHeader === "Exif") {
        // Try to detect GPS tag presence by scanning for GPS IFD tag 0x8825
        const seg = new Uint8Array(buffer, offset + 2, segLen - 2);
        for (let i = 0; i < seg.length - 2; i++) {
          if (seg[i] === 0x88 && seg[i + 1] === 0x25) { info.hasGps = true; break; }
        }
      }
      offset += segLen;
    } else if ((marker & 0xFF00) === 0xFF00) {
      const segLen = view.getUint16(offset);
      offset += segLen;
    } else break;
  }
  return info;
}

function stripExifViaCanvas(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas nicht verfügbar")); return; }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        if (blob) resolve(blob);
        else reject(new Error("Konvertierung fehlgeschlagen"));
      }, "image/jpeg", 0.95);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Bild konnte nicht geladen werden")); };
    img.src = url;
  });
}

export default function ExifStripperPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [exif, setExif] = useState<ExifInfo | null>(null);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (f: File) => {
    if (!f.type.startsWith("image/")) return;
    setDone(false);
    setFile(f);
    setPreview(URL.createObjectURL(f));
    const buffer = await f.arrayBuffer();
    setExif(parseExifBasic(buffer));
  }, []);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  async function strip() {
    if (!file) return;
    setProcessing(true);
    try {
      const blob = await stripExifViaCanvas(file);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(/\.\w+$/, "") + "_clean.jpg";
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
        .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
        .card { background: linear-gradient(135deg,#071422 0%,#050d1a 100%); border: 1px solid rgba(14,165,233,0.2); border-radius: 1rem; }
        .dropzone { border: 2px dashed rgba(14,165,233,0.3); border-radius: 1rem; padding: 3rem 2rem; text-align: center; cursor: pointer; transition: all 0.2s; }
        .dropzone:hover { border-color: rgba(0,212,255,0.6); background: rgba(14,165,233,0.05); }
        .strip-btn { background: linear-gradient(135deg,rgba(34,197,94,0.3),rgba(34,197,94,0.1)); border: 1px solid rgba(34,197,94,0.45); color: #4ade80; border-radius: 0.75rem; padding: 1rem 2rem; font-family: 'Syne',sans-serif; font-weight: 700; font-size: 1.05rem; cursor: pointer; transition: all 0.2s; width: 100%; }
        .strip-btn:hover:not(:disabled) { box-shadow: 0 0 30px rgba(34,197,94,0.3); }
        .strip-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .warn-box { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.4); border-radius: 0.75rem; padding: 1rem 1.25rem; }
        .safe-box { background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.3); border-radius: 0.75rem; padding: 1rem 1.25rem; }
        .done-box { background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.5); border-radius: 0.75rem; padding: 1rem 1.25rem; text-align: center; }
      `}</style>

      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>exif-stripper</span>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Sicherheit & Privatsphäre</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.8rem)", color: "#fff", marginBottom: "0.5rem" }}>EXIF-Metadaten-Radierer</h1>
          <p style={{ color: "#94a3b8" }}>GPS & Kameradaten aus Fotos löschen — 100% lokal im Browser, kein Server-Upload.</p>
        </div>

        {!file ? (
          <div
            className="dropzone"
            onClick={() => fileInputRef.current?.click()}
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🔒</div>
            <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#e2e8f0", marginBottom: "0.4rem" }}>Foto hier ablegen oder klicken</p>
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.78rem", color: "#64748b" }}>JPEG, PNG, HEIC — dein Foto verlässt nie deinen Browser</p>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            {/* Preview */}
            <div className="card" style={{ overflow: "hidden" }}>
              <img src={preview!} alt="Vorschau" style={{ width: "100%", height: "100%", objectFit: "contain", maxHeight: "400px" }} />
            </div>

            {/* Info + action */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* File info */}
              <div className="card p-5">
                <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Datei</p>
                <p style={{ color: "#e2e8f0", fontWeight: 600 }}>{file.name}</p>
                <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.78rem", color: "#64748b" }}>{(file.size / 1024).toFixed(1)} KB</p>
              </div>

              {/* EXIF result */}
              {exif && (
                exif.hasGps ? (
                  <div className="warn-box">
                    <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: "#f87171", fontSize: "1rem", marginBottom: "0.5rem" }}>⚠️ GPS-Daten gefunden!</p>
                    <p style={{ fontSize: "0.85rem", color: "#fca5a5", lineHeight: 1.6 }}>
                      Dieses Bild enthält versteckte Standortdaten (GPS EXIF-Tag). Wenn du es jetzt hochlädst, kann jeder deinen Aufenthaltsort sehen.
                    </p>
                  </div>
                ) : (
                  <div className="safe-box">
                    <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: "#4ade80", fontSize: "1rem", marginBottom: "0.25rem" }}>✓ Keine GPS-Daten erkannt</p>
                    <p style={{ fontSize: "0.82rem", color: "#86efac" }}>Es können dennoch andere Metadaten (Kameramodell, Datum) vorhanden sein. Bereinigung empfohlen.</p>
                  </div>
                )
              )}

              {done && (
                <div className="done-box">
                  <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: "#4ade80", fontSize: "1.05rem" }}>✓ Sauberes Bild wurde heruntergeladen!</p>
                  <p style={{ fontSize: "0.8rem", color: "#86efac", marginTop: "0.25rem" }}>Alle Metadaten wurden entfernt.</p>
                </div>
              )}

              <button className="strip-btn" onClick={strip} disabled={processing}>
                {processing ? "Verarbeite…" : "🛡️ Metadaten löschen & Bild sichern"}
              </button>

              <button
                onClick={() => { setFile(null); setPreview(null); setExif(null); setDone(false); }}
                style={{ background: "transparent", border: "1px solid rgba(14,165,233,0.2)", color: "#64748b", borderRadius: "0.5rem", padding: "0.5rem", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.75rem", cursor: "pointer" }}
              >
                Anderes Bild wählen
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
