"use client";
import { useState, useRef } from "react";

interface PdfInfo {
  name: string;
  bytes: Uint8Array;
  pageCount: number;
}

export default function PdfSplitterPage() {
  const [pdf, setPdf] = useState<PdfInfo | null>(null);
  const [mode, setMode] = useState<"single" | "range">("single");
  const [rangeInput, setRangeInput] = useState("");
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function loadPdf(file: File) {
    setError(null);
    setSelectedPages(new Set());
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = new Uint8Array(await file.arrayBuffer());
      const doc = await PDFDocument.load(bytes);
      setPdf({ name: file.name, bytes, pageCount: doc.getPageCount() });
    } catch {
      setError("Datei konnte nicht geladen werden. Ist es ein gültiges PDF?");
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadPdf(file);
  }

  function togglePage(page: number) {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(page)) next.delete(page);
      else next.add(page);
      return next;
    });
  }

  function parseRange(input: string, max: number): number[] {
    const pages = new Set<number>();
    for (const part of input.split(",")) {
      const trimmed = part.trim();
      if (trimmed.includes("-")) {
        const [a, b] = trimmed.split("-").map(Number);
        for (let i = a; i <= Math.min(b, max); i++) if (i >= 1) pages.add(i);
      } else {
        const n = Number(trimmed);
        if (n >= 1 && n <= max) pages.add(n);
      }
    }
    return Array.from(pages).sort((a, b) => a - b);
  }

  async function extract() {
    if (!pdf) return;
    const pages = mode === "single"
      ? Array.from(selectedPages).sort((a, b) => a - b)
      : parseRange(rangeInput, pdf.pageCount);

    if (!pages.length) {
      setError("Keine Seiten ausgewählt.");
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const srcDoc = await PDFDocument.load(pdf.bytes);
      const newDoc = await PDFDocument.create();
      const copied = await newDoc.copyPages(srcDoc, pages.map((p) => p - 1));
      copied.forEach((p) => newDoc.addPage(p));
      const bytes = await newDoc.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${pdf.name.replace(/\.pdf$/i, "")}_seiten_${pages.join("-")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Fehler beim Extrahieren der Seiten.");
    }
    setProcessing(false);
  }

  const pages = mode === "range" && pdf ? parseRange(rangeInput, pdf.pageCount) : [];

  return (
    <main className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800/60 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" className="text-indigo-400 text-sm hover:text-indigo-300 transition">← Tools</a>
          <span className="text-slate-700">/</span>
          <span className="text-slate-500 text-sm font-mono">pdf-splitter</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-900/30 border border-indigo-700/40 text-indigo-300 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Kein Upload · 100% lokal · pdf-lib
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            PDF <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Splitter</span>
          </h1>
          <p className="text-slate-400">Seiten aus PDFs extrahieren — per Klick oder Seitenbereich.</p>
        </div>

        {!pdf ? (
          <div
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition ${dragging ? "border-indigo-400 bg-indigo-950/30" : "border-slate-700 hover:border-slate-600"}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input ref={inputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && loadPdf(e.target.files[0])} />
            <div className="text-5xl mb-3">📄</div>
            <p className="text-slate-300 font-semibold">PDF hierher ziehen</p>
            <p className="text-slate-500 text-sm mt-1">oder klicken zum Auswählen</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* File info */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-slate-200 font-semibold text-sm">{pdf.name}</p>
                <p className="text-slate-500 text-xs">{pdf.pageCount} Seiten</p>
              </div>
              <button onClick={() => setPdf(null)} className="text-xs text-red-400 hover:text-red-300 transition">Andere Datei</button>
            </div>

            {/* Mode toggle */}
            <div className="flex gap-2">
              {(["single", "range"] as const).map((m) => (
                <button key={m} onClick={() => setMode(m)} className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${mode === m ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}>
                  {m === "single" ? "Seiten anklicken" : "Bereich eingeben"}
                </button>
              ))}
            </div>

            {mode === "single" ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
                <p className="text-sm text-slate-400 mb-3">Klicke auf Seiten um sie auszuwählen:</p>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: pdf.pageCount }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => togglePage(p)}
                      className={`w-10 h-10 rounded-lg text-sm font-mono font-bold transition ${selectedPages.has(p) ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                {selectedPages.size > 0 && (
                  <p className="text-xs text-indigo-400 mt-3 font-mono">{selectedPages.size} Seite(n) ausgewählt: {Array.from(selectedPages).sort((a,b)=>a-b).join(", ")}</p>
                )}
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
                <label className="text-sm text-slate-400 mb-2 block">Seitenbereich (z.B. <code className="text-indigo-400">1-3, 5, 7-9</code>):</label>
                <input
                  type="text"
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  placeholder={`1-${Math.min(3, pdf.pageCount)}`}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 font-mono text-sm focus:outline-none focus:border-indigo-500"
                />
                {pages.length > 0 && (
                  <p className="text-xs text-indigo-400 mt-2 font-mono">{pages.length} Seite(n): {pages.join(", ")}</p>
                )}
              </div>
            )}

            {error && (
              <div className="bg-red-950/30 border border-red-800/40 text-red-300 text-sm rounded-xl px-4 py-3">{error}</div>
            )}

            <button
              onClick={extract}
              disabled={processing || (mode === "single" ? selectedPages.size === 0 : pages.length === 0)}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold text-lg transition"
            >
              {processing ? "Wird extrahiert…" : "Seiten extrahieren & herunterladen"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
