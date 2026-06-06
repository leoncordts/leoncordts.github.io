"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import jsQR from "jsqr";

export default function QrScannerPage() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [isUrl, setIsUrl] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function processImage(file: File) {
    setError(""); setResult(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current!;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code) {
        setResult(code.data);
        try { new URL(code.data); setIsUrl(true); } catch { setIsUrl(false); }
      } else {
        setError("Kein QR-Code im Bild gefunden. Bitte ein schärferes oder klareres Bild verwenden.");
      }
    };
    img.src = url;
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith("image/")) processImage(f);
  }

  const onPaste = useCallback((e: ClipboardEvent) => {
    const item = Array.from(e.clipboardData?.items || []).find((i) => i.type.startsWith("image/"));
    if (item) { const f = item.getAsFile(); if (f) processImage(f); }
  }, []);

  useEffect(() => {
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [onPaste]);

  function copy() {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function reset() { setResult(null); setError(""); setPreview(null); }

  return (
    <main className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800/60 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" className="text-indigo-400 text-sm hover:text-indigo-300 transition">← Tools</a>
          <span className="text-slate-700">/</span>
          <span className="text-slate-500 text-sm font-mono">qr-scanner-offline</span>
        </div>
      </nav>

      <canvas ref={canvasRef} className="hidden" />

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-900/50 border border-indigo-700/50 text-indigo-300 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            100% offline · Kein Upload · Strg+V zum Einfügen
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            QR-Code <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Scanner</span>
          </h1>
          <p className="text-slate-400">Bild hochladen, ablegen oder mit Strg+V einfügen — QR-Code wird sofort ausgelesen.</p>
        </div>

        {!result && !error && (
          <div
            className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-16 text-center cursor-pointer transition"
            onClick={() => fileRef.current?.click()}
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <div className="text-6xl mb-4">📷</div>
            <p className="text-slate-300 font-semibold text-lg mb-2">QR-Code Bild hier ablegen</p>
            <p className="text-slate-500 text-sm font-mono">oder klicken zum Auswählen · Strg+V zum Einfügen</p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) processImage(e.target.files[0]); }} />
          </div>
        )}

        {error && (
          <div className="bg-red-950/40 border border-red-700/50 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">❌</div>
            <p className="text-red-300 font-semibold mb-2">{error}</p>
            <button onClick={reset} className="text-slate-400 text-sm underline hover:text-slate-200 transition">Neu versuchen</button>
          </div>
        )}

        {result && preview && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="QR-Code" className="rounded-xl border border-slate-700 max-h-60 object-contain w-full" />
              <div className="bg-green-950/40 border border-green-700/50 rounded-xl p-5 flex flex-col justify-center gap-3">
                <div className="text-green-400 text-xs font-mono uppercase tracking-wider">✓ QR-Code erkannt</div>
                <div className="text-white font-mono text-sm break-all leading-relaxed">{result}</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={copy} className={`flex-1 py-3 font-bold rounded-xl transition ${copied ? "bg-green-600 text-white" : "bg-indigo-600 hover:bg-indigo-500 text-white"}`}>
                {copied ? "✓ Kopiert!" : "Inhalt kopieren"}
              </button>
              {isUrl && (
                <a href={result} target="_blank" rel="noopener noreferrer" className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-xl transition text-center">
                  🔗 Link sicher öffnen
                </a>
              )}
              <button onClick={reset} className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition text-sm">
                Neu
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
