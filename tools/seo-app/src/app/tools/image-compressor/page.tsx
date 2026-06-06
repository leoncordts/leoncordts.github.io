"use client";
import { useState, useRef, useCallback } from "react";

interface CompressResult {
  originalSize: number;
  compressedSize: number;
  objectUrl: string;
  fileName: string;
  dataUrl: string;
}

function compressImage(file: File, quality: number, maxPx: number): Promise<CompressResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (w > maxPx || h > maxPx) {
        if (w > h) { h = Math.round(h * maxPx / w); w = maxPx; }
        else { w = Math.round(w * maxPx / h); h = maxPx; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas not available")); return; }
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      const isJpeg = file.type === "image/jpeg";
      canvas.toBlob((blob) => {
        if (!blob) { reject(new Error("Komprimierung fehlgeschlagen")); return; }
        const objUrl = URL.createObjectURL(blob);
        resolve({
          originalSize: file.size,
          compressedSize: blob.size,
          objectUrl: objUrl,
          fileName: file.name.replace(/\.\w+$/, "") + (isJpeg ? "_compressed.jpg" : "_compressed.png"),
          dataUrl: objUrl,
        });
      }, isJpeg ? "image/jpeg" : "image/png", quality / 100);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Bild konnte nicht geladen werden")); };
    img.src = url;
  });
}

function fmtSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export default function ImageCompressorPage() {
  const [result, setResult] = useState<CompressResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [quality, setQuality] = useState(75);
  const [maxPx, setMaxPx] = useState(1920);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setFileName(file.name);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setLoading(true);
    try {
      const r = await compressImage(file, quality, maxPx);
      setResult(r);
    } finally {
      setLoading(false);
    }
  }, [quality, maxPx]);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  function download() {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.objectUrl; a.download = result.fileName; a.click();
  }

  const savings = result ? Math.round((1 - result.compressedSize / result.originalSize) * 100) : 0;

  return (
    <main className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800/60 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <a href="/tools" className="text-indigo-400 text-sm hover:text-indigo-300 transition">← Tools</a>
          <span className="text-slate-700">/</span>
          <span className="text-slate-500 text-sm font-mono">image-compressor</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-900/50 border border-indigo-700/50 text-indigo-300 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            TinyPNG-Klon · 100% lokal · Kein Upload
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            Bild-<span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Kompressor</span>
          </h1>
          <p className="text-slate-400">JPG & PNG lokal komprimieren — kein Server, kein Upload, sofort.</p>
        </div>

        {/* Settings */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 mb-5 grid grid-cols-2 gap-5">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Qualität</label>
              <span className="text-xs font-mono text-indigo-400">{quality}%</span>
            </div>
            <input type="range" min={10} max={100} value={quality} onChange={(e) => setQuality(parseInt(e.target.value))}
              className="w-full accent-indigo-500" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Max. Auflösung</label>
              <span className="text-xs font-mono text-indigo-400">{maxPx}px</span>
            </div>
            <select value={maxPx} onChange={(e) => setMaxPx(parseInt(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 text-sm outline-none">
              {[640, 1280, 1920, 2560, 3840].map((v) => <option key={v} value={v}>{v}px</option>)}
            </select>
          </div>
        </div>

        {/* Drop zone */}
        {!preview && (
          <div
            className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-16 text-center cursor-pointer transition"
            onClick={() => fileRef.current?.click()}
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <div className="text-5xl mb-4">🖼️</div>
            <p className="text-slate-300 font-semibold mb-2">Bild ablegen oder klicken</p>
            <p className="text-slate-600 text-sm font-mono">JPG, PNG, WebP</p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-400 font-mono text-sm">Komprimiere…</p>
          </div>
        )}

        {result && preview && (
          <div className="flex flex-col gap-5">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-900/70 border border-slate-700 rounded-xl p-4 text-center">
                <div className="text-slate-400 text-xs uppercase tracking-wider mb-1 font-mono">Original</div>
                <div className="text-white font-bold text-xl">{fmtSize(result.originalSize)}</div>
              </div>
              <div className="bg-green-950/50 border border-green-700/50 rounded-xl p-4 text-center">
                <div className="text-green-400 text-xs uppercase tracking-wider mb-1 font-mono">Gespart</div>
                <div className="text-green-300 font-black text-3xl">-{savings}%</div>
              </div>
              <div className="bg-slate-900/70 border border-slate-700 rounded-xl p-4 text-center">
                <div className="text-slate-400 text-xs uppercase tracking-wider mb-1 font-mono">Komprimiert</div>
                <div className="text-white font-bold text-xl">{fmtSize(result.compressedSize)}</div>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={result.dataUrl} alt={fileName} className="w-full max-h-64 object-contain rounded-xl" />
            </div>

            <div className="flex gap-3">
              <button onClick={download} className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition">
                ↓ Komprimiertes Bild speichern
              </button>
              <button onClick={() => { setPreview(null); setResult(null); }} className="px-5 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl transition text-sm">
                Neu
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
