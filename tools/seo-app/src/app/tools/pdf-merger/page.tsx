"use client";
import { useState, useRef, useCallback } from "react";

interface PdfFile {
  id: string;
  name: string;
  bytes: Uint8Array;
  size: number;
}

export default function PdfMergerPage() {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [merging, setMerging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function readFile(file: File): Promise<PdfFile> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const bytes = new Uint8Array(e.target!.result as ArrayBuffer);
        resolve({ id: Math.random().toString(36).slice(2), name: file.name, bytes, size: file.size });
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  async function addFiles(fileList: FileList | File[]) {
    const pdfs = Array.from(fileList).filter((f) => f.type === "application/pdf" || f.name.endsWith(".pdf"));
    if (!pdfs.length) return;
    const loaded = await Promise.all(pdfs.map(readFile));
    setFiles((prev) => [...prev, ...loaded]);
    setError(null);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }

  function moveUp(idx: number) {
    if (idx === 0) return;
    setFiles((prev) => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  }

  function moveDown(idx: number) {
    setFiles((prev) => {
      if (idx === prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  }

  function remove(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  async function merge() {
    if (files.length < 2) {
      setError("Bitte mindestens 2 PDFs hinzufügen.");
      return;
    }
    setMerging(true);
    setError(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const merged = await PDFDocument.create();
      for (const file of files) {
        const doc = await PDFDocument.load(file.bytes);
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      const bytes = await merged.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "merged.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Fehler beim Zusammenfügen. Sind alle Dateien gültige PDFs?");
      console.error(err);
    }
    setMerging(false);
  }

  const totalPages = files.reduce((acc, f) => {
    // estimate: can't read without pdf-lib, just show file count
    return acc;
  }, 0);

  return (
    <main className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800/60 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" className="text-indigo-400 text-sm hover:text-indigo-300 transition">← Tools</a>
          <span className="text-slate-700">/</span>
          <span className="text-slate-500 text-sm font-mono">pdf-merger</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-900/30 border border-indigo-700/40 text-indigo-300 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Kein Upload · 100% lokal · pdf-lib
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            PDF <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Merger</span>
          </h1>
          <p className="text-slate-400">Mehrere PDFs zu einer Datei zusammenfügen — im Browser, ohne Upload.</p>
        </div>

        {/* Drop zone */}
        <div
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition mb-6 ${dragging ? "border-indigo-400 bg-indigo-950/30" : "border-slate-700 hover:border-slate-600"}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input ref={inputRef} type="file" accept=".pdf,application/pdf" multiple className="hidden" onChange={(e) => e.target.files && addFiles(e.target.files)} />
          <div className="text-5xl mb-3">📄</div>
          <p className="text-slate-300 font-semibold">PDF-Dateien hierher ziehen</p>
          <p className="text-slate-500 text-sm mt-1">oder klicken zum Auswählen</p>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden mb-6">
            <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
              <span className="font-bold text-slate-200">{files.length} Datei{files.length !== 1 ? "en" : ""}</span>
              <button onClick={() => setFiles([])} className="text-xs text-red-400 hover:text-red-300 transition">Alle entfernen</button>
            </div>
            <div className="flex flex-col divide-y divide-slate-800/50">
              {files.map((file, idx) => (
                <div key={file.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-slate-600 font-mono text-xs w-5 text-right">{idx + 1}</span>
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <span className="text-sm text-slate-200 truncate">{file.name}</span>
                    <span className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => moveUp(idx)} disabled={idx === 0} className="p-1 text-slate-500 hover:text-slate-200 disabled:opacity-20 transition" title="Nach oben">↑</button>
                    <button onClick={() => moveDown(idx)} disabled={idx === files.length - 1} className="p-1 text-slate-500 hover:text-slate-200 disabled:opacity-20 transition" title="Nach unten">↓</button>
                    <button onClick={() => remove(file.id)} className="p-1 text-red-500/60 hover:text-red-400 transition ml-1" title="Entfernen">✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-950/30 border border-red-800/40 text-red-300 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <button
          onClick={merge}
          disabled={files.length < 2 || merging}
          className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold text-lg transition"
        >
          {merging ? "Wird zusammengefügt…" : `${files.length < 2 ? "Mindestens 2 PDFs hinzufügen" : `${files.length} PDFs zusammenfügen & herunterladen`}`}
        </button>

        <p className="text-center text-slate-600 text-xs mt-4">
          Alle Verarbeitungen finden ausschließlich in deinem Browser statt. Keine Daten werden übertragen.
        </p>
      </div>
    </main>
  );
}
