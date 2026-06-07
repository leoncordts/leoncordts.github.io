"use client";
import { useState, useRef, useEffect, useCallback } from "react";

export default function ImageConverterPage() {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [dragging, setDragging] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadImageFromBlob = useCallback((blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    setImgSrc(url);
    setFileName(name);
  }, []);

  function loadFile(file: File) {
    loadImageFromBlob(file, file.name);
  }

  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const blob = item.getAsFile();
          if (blob) loadImageFromBlob(blob, "clipboard-image");
          break;
        }
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [loadImageFromBlob]);

  function download(format: "jpeg" | "png" | "webp") {
    if (!imgSrc) return;
    const canvas = canvasRef.current!;
    const img = new Image();
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      if (format === "jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      const ext = format === "jpeg" ? "jpg" : format;
      const mime = `image/${format}`;
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${fileName.replace(/\.[^.]+$/, "")}.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
      }, mime, 0.95);
    };
    img.src = imgSrc;
  }

  const baseName = fileName.replace(/\.[^.]+$/, "");

  return (
    <main className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800/60 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" className="text-sky-400 text-sm hover:text-sky-300 transition">← Tools</a>
          <span className="text-slate-700">/</span>
          <span className="text-slate-500 text-sm font-mono">image-converter</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-900/30 border border-sky-700/40 text-sky-300 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            Canvas · Kein Upload · Sofort-Download
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            Bild <span className="bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">Format</span> Konverter
          </h1>
          <p className="text-slate-400">WebP → JPG/PNG und zurück — kein Upload, sofort fertig.</p>
        </div>

        {!imgSrc ? (
          <div
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition ${dragging ? "border-sky-400 bg-sky-950/20" : "border-slate-700 hover:border-slate-600"}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) loadFile(f); }}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f); }} />
            <div className="text-6xl mb-3">🖼️</div>
            <p className="text-slate-300 font-semibold text-xl">Bild hier reinziehen oder klicken</p>
            <p className="text-slate-500 mt-2">Strg+V · Drag & Drop · WebP, JPG, PNG, AVIF …</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Preview */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgSrc} alt="Vorschau" className="max-h-48 max-w-full object-contain rounded-lg" />
              <p className="text-slate-500 text-xs font-mono">{fileName}</p>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => download("jpeg")}
                className="py-4 rounded-2xl bg-amber-700 hover:bg-amber-600 text-white font-black text-lg transition flex flex-col items-center gap-1">
                <span>JPG</span>
                <span className="text-xs font-normal opacity-70">kleinste Datei</span>
              </button>
              <button onClick={() => download("png")}
                className="py-4 rounded-2xl bg-sky-700 hover:bg-sky-600 text-white font-black text-lg transition flex flex-col items-center gap-1">
                <span>PNG</span>
                <span className="text-xs font-normal opacity-70">mit Transparenz</span>
              </button>
              <button onClick={() => download("webp")}
                className="py-4 rounded-2xl bg-violet-700 hover:bg-violet-600 text-white font-black text-lg transition flex flex-col items-center gap-1">
                <span>WebP</span>
                <span className="text-xs font-normal opacity-70">modern & klein</span>
              </button>
            </div>

            <button onClick={() => { setImgSrc(null); setFileName(""); }}
              className="text-sm text-slate-500 hover:text-slate-400 transition text-center">
              Anderes Bild laden
            </button>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </main>
  );
}
