"use client";
import { useState, useRef } from "react";

export default function SvgToPngPage() {
  const [svgContent, setSvgContent] = useState("");
  const [scale, setScale] = useState(2);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function loadFile(file: File) {
    if (!file.name.endsWith(".svg") && file.type !== "image/svg+xml") {
      setError("Bitte eine .svg-Datei auswählen.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setSvgContent(e.target!.result as string);
      setPreview(null);
      setError(null);
    };
    reader.readAsText(file);
  }

  function renderToPng(): Promise<string> {
    return new Promise((resolve, reject) => {
      const blob = new Blob([svgContent], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current!;
        canvas.width = img.naturalWidth * scale;
        canvas.height = img.naturalHeight * scale;
        const ctx = canvas.getContext("2d")!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("SVG konnte nicht gerendert werden.")); };
      img.src = url;
    });
  }

  async function convert() {
    if (!svgContent) return;
    setError(null);
    try {
      const dataUrl = await renderToPng();
      setPreview(dataUrl);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function download() {
    const dataUrl = preview || await renderToPng().catch((e) => { setError((e as Error).message); return null; });
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "converted.png";
    a.click();
  }

  return (
    <main className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800/60 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" className="text-orange-400 text-sm hover:text-orange-300 transition">← Tools</a>
          <span className="text-slate-700">/</span>
          <span className="text-slate-500 text-sm font-mono">svg-to-png</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-900/30 border border-orange-700/40 text-orange-300 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            Canvas-basiert · Kein Upload · Skalierbar
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            SVG <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">→ PNG</span>
          </h1>
          <p className="text-slate-400">SVG-Grafiken in hochauflösende PNGs umwandeln — direkt im Browser.</p>
        </div>

        {/* Drop zone */}
        <div
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition mb-6 ${dragging ? "border-orange-400 bg-orange-950/20" : "border-slate-700 hover:border-slate-600"}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) loadFile(f); }}
          onClick={() => inputRef.current?.click()}
        >
          <input ref={inputRef} type="file" accept=".svg,image/svg+xml" className="hidden" onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])} />
          <div className="text-5xl mb-3">🖼️</div>
          <p className="text-slate-300 font-semibold">SVG hierher ziehen</p>
          <p className="text-slate-500 text-sm mt-1">oder klicken zum Auswählen</p>
        </div>

        {svgContent && (
          <div className="flex flex-col gap-5">
            {/* Scale */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-5 py-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-slate-300 font-semibold">Auflösung (Skalierungsfaktor)</label>
                <span className="text-sm font-mono text-orange-400">{scale}×</span>
              </div>
              <input type="range" min={1} max={8} value={scale} onChange={(e) => setScale(Number(e.target.value))}
                className="w-full accent-orange-500" />
              <p className="text-xs text-slate-500 mt-1">Höherer Wert = mehr Pixel, größere Datei</p>
            </div>

            {/* SVG code editor */}
            <details className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
              <summary className="px-5 py-3 cursor-pointer text-sm text-slate-400 hover:text-slate-300 transition">SVG-Code bearbeiten</summary>
              <textarea
                value={svgContent}
                onChange={(e) => setSvgContent(e.target.value)}
                rows={8}
                className="w-full bg-slate-950 text-slate-300 font-mono text-xs p-4 focus:outline-none resize-y"
              />
            </details>

            {error && (
              <div className="bg-red-950/30 border border-red-800/40 text-red-300 text-sm rounded-xl px-4 py-3">{error}</div>
            )}

            <button onClick={convert} className="w-full py-3 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-lg transition">
              Vorschau generieren
            </button>

            {preview && (
              <div className="flex flex-col gap-3">
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="PNG Vorschau" className="max-w-full max-h-64 object-contain rounded-lg" />
                </div>
                <button onClick={download} className="w-full py-3 rounded-2xl bg-green-700 hover:bg-green-600 text-white font-bold transition">
                  PNG herunterladen
                </button>
              </div>
            )}
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </main>
  );
}
