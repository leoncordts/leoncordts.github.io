"use client";
import { useState, useRef } from "react";

type Stage = "idle" | "processing" | "done" | "error";

export default function BgRemoverPage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState("");
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function process(file: File) {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setOriginalUrl(URL.createObjectURL(file));
    setResultUrl(null);
    setStage("processing");
    setProgress("Lade KI-Modell…");
    try {
      const { removeBackground } = await import("@imgly/background-removal");
      setProgress("Lokale KI analysiert Bild…");
      const blob = await removeBackground(file, {
        progress: (key: string, current: number, total: number) => {
          if (key === "compute:inference") setProgress(`Berechne Maske… ${Math.round((current / total) * 100)}%`);
          else if (key.startsWith("fetch")) setProgress("Lade KI-Modell…");
        },
      });
      setResultUrl(URL.createObjectURL(blob));
      setStage("done");
    } catch (e) {
      console.error(e);
      setStage("error");
    }
  }

  function reset() {
    setStage("idle");
    setOriginalUrl(null);
    setResultUrl(null);
    setProgress("");
  }

  return (
    <main className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800/60 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" className="text-violet-400 text-sm hover:text-violet-300 transition">← Tools</a>
          <span className="text-slate-700">/</span>
          <span className="text-slate-500 text-sm font-mono">bg-remover</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-900/30 border border-violet-700/40 text-violet-300 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Lokale KI · Kein Upload · PNG mit Transparenz
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            KI <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Hintergrund</span> entfernen
          </h1>
          <p className="text-slate-400">Hintergrund aus Fotos lokal per KI entfernen — verlässt deinen Rechner nicht.</p>
        </div>

        {stage === "idle" && (
          <div
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition ${dragging ? "border-violet-400 bg-violet-950/20" : "border-slate-700 hover:border-slate-600"}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) process(f); }}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) process(f); }} />
            <div className="text-6xl mb-3">✂️</div>
            <p className="text-slate-300 font-semibold">Bild hier ablegen oder klicken</p>
            <p className="text-slate-500 text-sm mt-1">JPG, PNG, WebP …</p>
          </div>
        )}

        {stage === "processing" && (
          <div className="flex flex-col items-center gap-6 py-16">
            {originalUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={originalUrl} alt="Original" className="max-h-40 max-w-full rounded-xl border border-slate-800 opacity-50" />
            )}
            <div className="w-16 h-16 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
            <p className="text-slate-300 font-mono text-center max-w-xs">{progress || "Verarbeite…"}<br /><span className="text-xs text-slate-600">(Dieser Vorgang verlässt deinen PC nicht)</span></p>
          </div>
        )}

        {stage === "done" && resultUrl && (
          <div className="flex flex-col gap-5">
            {/* Checkerboard preview */}
            <div className="rounded-2xl overflow-hidden border border-slate-800 flex justify-center items-center p-4"
              style={{ background: "repeating-conic-gradient(#334155 0% 25%, #1e293b 0% 50%) 0 0 / 24px 24px" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resultUrl} alt="Freigestellt" className="max-h-72 max-w-full object-contain rounded-lg" />
            </div>
            {/* Before/after */}
            {originalUrl && (
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-1">Vorher</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={originalUrl} alt="Original" className="w-full rounded-xl border border-slate-800 max-h-32 object-contain" />
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-1">Nachher</p>
                  <div className="rounded-xl border border-slate-800 max-h-32 overflow-hidden flex items-center justify-center"
                    style={{ background: "repeating-conic-gradient(#334155 0% 25%, #1e293b 0% 50%) 0 0 / 12px 12px", height: "128px" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={resultUrl} alt="Freigestellt" className="max-h-full max-w-full object-contain" />
                  </div>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <a href={resultUrl} download="freigestellt.png"
                className="flex-1 py-3 text-center rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition">
                Als PNG speichern
              </a>
              <button onClick={reset} className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition">
                Neues Bild
              </button>
            </div>
          </div>
        )}

        {stage === "error" && (
          <div className="flex flex-col items-center gap-4 py-12">
            <p className="text-red-400">Fehler beim Verarbeiten des Bildes.</p>
            <button onClick={reset} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition">Erneut versuchen</button>
          </div>
        )}
      </div>
    </main>
  );
}
