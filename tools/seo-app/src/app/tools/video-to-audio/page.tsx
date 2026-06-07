"use client";
import { useState, useRef } from "react";

type Stage = "idle" | "loading-ffmpeg" | "processing" | "done" | "error";

export default function VideoToAudioPage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [fileName, setFileName] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const fileDataRef = useRef<Uint8Array | null>(null);

  function readFile(file: File) {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      fileDataRef.current = new Uint8Array(e.target!.result as ArrayBuffer);
    };
    reader.readAsArrayBuffer(file);
  }

  async function extract() {
    if (!fileDataRef.current) return;
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setStage("loading-ffmpeg");
    try {
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const { fetchFile, toBlobURL } = await import("@ffmpeg/util");
      const ffmpeg = new FFmpeg();
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });
      setStage("processing");
      await ffmpeg.writeFile("input.mp4", fileDataRef.current);
      await ffmpeg.exec(["-i", "input.mp4", "-q:a", "0", "-map", "a", "output.mp3"]);
      const data = await ffmpeg.readFile("output.mp3");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = new Blob([data as any], { type: "audio/mp3" });
      setAudioUrl(URL.createObjectURL(blob));
      setStage("done");
    } catch (e) {
      console.error(e);
      setStage("error");
    }
  }

  return (
    <main className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800/60 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" className="text-purple-400 text-sm hover:text-purple-300 transition">← Tools</a>
          <span className="text-slate-700">/</span>
          <span className="text-slate-500 text-sm font-mono">video-to-audio</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-900/30 border border-purple-700/40 text-purple-300 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            FFmpeg.wasm · Kein Upload · MP3-Export
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            MP4 <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">→ MP3</span>
          </h1>
          <p className="text-slate-400">Tonspur aus Videos extrahieren — ohne Upload, direkt im Browser.</p>
        </div>

        {stage === "idle" || stage === "error" ? (
          <div className="flex flex-col gap-5">
            <div
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition ${dragging ? "border-purple-400 bg-purple-950/20" : "border-slate-700 hover:border-slate-600"}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) { readFile(f); } }}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) readFile(f); }} />
              <div className="text-6xl mb-3">🎬</div>
              <p className="text-slate-300 font-semibold">Video-Datei hier ablegen</p>
              <p className="text-slate-500 text-sm mt-1">MP4, WebM, MOV, AVI …</p>
            </div>
            {fileName && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-5 py-3 flex items-center justify-between">
                <p className="text-slate-200 text-sm font-semibold truncate">{fileName}</p>
                <button onClick={extract} className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-bold transition ml-3 flex-shrink-0">
                  Audio extrahieren
                </button>
              </div>
            )}
            {stage === "error" && <p className="text-red-400 text-sm text-center">Fehler beim Verarbeiten. Bitte erneut versuchen.</p>}
          </div>
        ) : stage === "loading-ffmpeg" ? (
          <div className="flex flex-col items-center gap-6 py-12">
            <div className="w-16 h-16 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
            <p className="text-slate-400 font-mono">Lade FFmpeg-Engine…</p>
            <p className="text-xs text-slate-600">Einmalig ~5 MB, dann im Cache</p>
          </div>
        ) : stage === "processing" ? (
          <div className="flex flex-col items-center gap-6 py-12">
            <div className="w-16 h-16 rounded-full border-4 border-pink-500 border-t-transparent animate-spin" />
            <p className="text-slate-400 font-mono">Extrahiere Audio…</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="bg-slate-900/60 border border-green-800/40 rounded-2xl p-5 text-center">
              <p className="text-green-400 font-bold mb-4">✓ Audio erfolgreich extrahiert</p>
              {audioUrl && <audio controls src={audioUrl} className="w-full mb-4" />}
              <div className="flex gap-3 justify-center">
                <a href={audioUrl ?? "#"} download={`${fileName.replace(/\.[^.]+$/, "")}.mp3`}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition">
                  MP3 herunterladen
                </a>
                <button onClick={() => { setStage("idle"); setFileName(""); setAudioUrl(null); fileDataRef.current = null; }}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition">
                  Neues Video
                </button>
              </div>
            </div>
          </div>
        )}

        <p className="text-center text-slate-600 text-xs mt-8">
          Die Verarbeitung findet ausschließlich in deinem Browser statt. Keine Daten werden an Server übertragen.
        </p>
      </div>
    </main>
  );
}
