"use client";
import { useState, useEffect, useRef, useCallback } from "react";

type OcrState = "idle" | "loading" | "done" | "error";

export default function InstantOcrPage() {
  const [state, setState] = useState<OcrState>("idle");
  const [text, setText] = useState("");
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const runOcr = useCallback(async (file: File | Blob) => {
    setState("loading");
    setProgress(0);
    setText("");
    setImgSrc(URL.createObjectURL(file));
    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("deu+eng", 1, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === "recognizing text") setProgress(Math.round(m.progress * 100));
        },
      });
      const { data } = await worker.recognize(file);
      await worker.terminate();
      setText(data.text.trim());
      setState("done");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const blob = item.getAsFile();
          if (blob) runOcr(blob);
          break;
        }
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [runOcr]);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) runOcr(file);
  }

  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function reset() {
    setState("idle");
    setText("");
    setProgress(0);
    if (imgSrc) URL.revokeObjectURL(imgSrc);
    setImgSrc(null);
  }

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col">
      <nav className="border-b border-slate-800/60 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" className="text-cyan-400 text-sm hover:text-cyan-300 transition">← Tools</a>
          <span className="text-slate-700">/</span>
          <span className="text-slate-500 text-sm font-mono">instant-ocr</span>
        </div>
      </nav>

      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-12 flex flex-col">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-900/30 border border-cyan-700/40 text-cyan-300 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Tesseract.js · DE+EN · Kein Upload
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            Sofort <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">OCR</span>
          </h1>
          <p className="text-slate-400">Screenshot einfügen oder Bild ablegen → Text wird sofort extrahiert.</p>
        </div>

        {state === "idle" && (
          <div
            className={`flex-1 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer transition p-10 text-center min-h-64 ${dragging ? "border-cyan-400 bg-cyan-950/20" : "border-slate-700 hover:border-slate-600"}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) runOcr(f); }} />
            <div className="text-7xl">📋</div>
            <div>
              <p className="text-2xl font-black text-slate-200 mb-1">Screenshot hier einfügen</p>
              <p className="text-slate-500">Strg+V · Drag & Drop · oder klicken</p>
            </div>
          </div>
        )}

        {state === "loading" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 min-h-64">
            {imgSrc && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imgSrc} alt="Vorschau" className="max-h-40 max-w-full rounded-xl border border-slate-800 object-contain" />
            )}
            <div className="w-full max-w-sm">
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>Lese Text…</span>
                <span className="font-mono">{progress}%</span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        )}

        {state === "done" && (
          <div className="flex flex-col gap-4">
            {imgSrc && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imgSrc} alt="Eingabebild" className="max-h-40 max-w-full rounded-xl border border-slate-800 object-contain mx-auto" />
            )}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
                <span className="text-slate-300 font-semibold text-sm">Erkannter Text</span>
                <span className="text-xs text-slate-500 font-mono">{text.split(/\s+/).filter(Boolean).length} Wörter</span>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={10}
                className="w-full bg-transparent text-slate-200 p-5 text-sm resize-y focus:outline-none font-mono"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={copy} className={`flex-1 py-3 rounded-2xl font-bold text-sm transition ${copied ? "bg-green-700 text-green-200" : "bg-cyan-600 hover:bg-cyan-500 text-white"}`}>
                {copied ? "✓ Kopiert!" : "Text in Zwischenablage kopieren"}
              </button>
              <button onClick={reset} className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition">
                Neues Bild
              </button>
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 min-h-64">
            <p className="text-red-400 font-semibold">Fehler beim Lesen des Bildes.</p>
            <button onClick={reset} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition">
              Erneut versuchen
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
