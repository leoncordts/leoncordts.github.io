"use client";
import { useState, useRef } from "react";

type Stage = "idle" | "loading-ffmpeg" | "processing" | "done" | "error";
type Quality = "high" | "medium" | "low";

const QUALITY_OPTS: { value: Quality; label: string; fps: number; scale: number }[] = [
  { value: "high", label: "Hoch (groß)", fps: 15, scale: 480 },
  { value: "medium", label: "Mittel (ausgewogen)", fps: 10, scale: 320 },
  { value: "low", label: "Klein (WhatsApp)", fps: 8, scale: 240 },
];

export default function VideoToGifPage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [fileName, setFileName] = useState("");
  const [quality, setQuality] = useState<Quality>("medium");
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [gifSize, setGifSize] = useState(0);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const fileDataRef = useRef<Uint8Array | null>(null);

  function readFile(file: File) {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => { fileDataRef.current = new Uint8Array(e.target!.result as ArrayBuffer); };
    reader.readAsArrayBuffer(file);
  }

  async function convert() {
    if (!fileDataRef.current) return;
    if (gifUrl) URL.revokeObjectURL(gifUrl);
    setGifUrl(null);
    setStage("loading-ffmpeg");
    try {
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const { toBlobURL } = await import("@ffmpeg/util");
      const ffmpeg = new FFmpeg();
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });
      setStage("processing");
      const opt = QUALITY_OPTS.find((q) => q.value === quality)!;
      await ffmpeg.writeFile("input.mp4", fileDataRef.current);
      await ffmpeg.exec(["-i", "input.mp4", "-vf", `fps=${opt.fps},scale=${opt.scale}:-1:flags=lanczos`, "-c:v", "gif", "output.gif"]);
      const data = await ffmpeg.readFile("output.gif");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = new Blob([data as any], { type: "image/gif" });
      setGifSize(blob.size);
      setGifUrl(URL.createObjectURL(blob));
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
          <a href="/tools" className="text-emerald-400 text-sm hover:text-emerald-300 transition">← Tools</a>
          <span className="text-slate-700">/</span>
          <span className="text-slate-500 text-sm font-mono">video-to-gif</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-900/30 border border-emerald-700/40 text-emerald-300 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            FFmpeg.wasm · Kein Upload · GIF-Export
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            Video <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">→ GIF</span>
          </h1>
          <p className="text-slate-400">Videoclips in animierte GIFs umwandeln — ohne Upload, direkt im Browser.</p>
        </div>

        {(stage === "idle" || stage === "error") && (
          <div className="flex flex-col gap-5">
            <div
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition ${dragging ? "border-emerald-400 bg-emerald-950/20" : "border-slate-700 hover:border-slate-600"}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) readFile(f); }}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) readFile(f); }} />
              <div className="text-6xl mb-3">🎞️</div>
              <p className="text-slate-300 font-semibold">Video-Datei hier ablegen</p>
              <p className="text-slate-500 text-sm mt-1">MP4, WebM, MOV … (kurze Clips empfohlen)</p>
            </div>

            {/* Quality */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <p className="text-sm text-slate-400 font-semibold mb-3">GIF-Qualität</p>
              <div className="flex gap-2">
                {QUALITY_OPTS.map((opt) => (
                  <button key={opt.value} onClick={() => setQuality(opt.value)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${quality === opt.value ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {fileName && (
              <button onClick={convert} className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg transition">
                GIF konvertieren
              </button>
            )}
            {stage === "error" && <p className="text-red-400 text-sm text-center">Fehler. Bitte erneut versuchen.</p>}
          </div>
        )}

        {(stage === "loading-ffmpeg" || stage === "processing") && (
          <div className="flex flex-col items-center gap-6 py-12">
            <div className="w-16 h-16 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
            <p className="text-slate-400 font-mono">{stage === "loading-ffmpeg" ? "Lade FFmpeg-Engine…" : "Konvertiere zu GIF…"}</p>
            {stage === "loading-ffmpeg" && <p className="text-xs text-slate-600">Einmalig ~5 MB, dann im Cache</p>}
          </div>
        )}

        {stage === "done" && gifUrl && (
          <div className="flex flex-col gap-5">
            <div className="bg-slate-900/60 border border-emerald-800/40 rounded-2xl p-5 text-center">
              <p className="text-emerald-400 font-bold mb-4">✓ GIF fertig — {(gifSize / 1024).toFixed(0)} KB</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={gifUrl} alt="GIF Vorschau" className="max-w-full max-h-64 rounded-xl mx-auto mb-4 border border-slate-700" />
              <div className="flex gap-3 justify-center">
                <a href={gifUrl} download={`${fileName.replace(/\.[^.]+$/, "")}.gif`}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition">
                  GIF speichern
                </a>
                <button onClick={() => { setStage("idle"); setFileName(""); setGifUrl(null); fileDataRef.current = null; }}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition">
                  Neues Video
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
