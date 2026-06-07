"use client";
import { useState, useRef, useEffect, useCallback } from "react";

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length * numChannels * 2;
  const ab = new ArrayBuffer(44 + length);
  const view = new DataView(ab);
  const write = (off: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };
  write(0, "RIFF"); view.setUint32(4, 36 + length, true); write(8, "WAVE"); write(12, "fmt ");
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true); view.setUint16(34, 16, true); write(36, "data"); view.setUint32(40, length, true);
  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const s = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      offset += 2;
    }
  }
  return new Blob([ab], { type: "audio/wav" });
}

export default function AudioTrimmerPage() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const arrayBufRef = useRef<ArrayBuffer | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const startTimeRef = useRef(0);

  function fmt(s: number) {
    const m = Math.floor(s / 60);
    return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  }

  async function loadFile(file: File) {
    setFileName(file.name);
    const buf = await file.arrayBuffer();
    arrayBufRef.current = buf;
    const tmpCtx = new AudioContext();
    const decoded = await tmpCtx.decodeAudioData(buf.slice(0));
    setDuration(decoded.duration);
    setStart(0);
    setEnd(decoded.duration);
    await tmpCtx.close();
  }

  function stopPlayback() {
    try { sourceRef.current?.stop(); } catch { /* */ }
    sourceRef.current = null;
    setPlaying(false);
  }

  async function preview() {
    if (!arrayBufRef.current) return;
    if (playing) { stopPlayback(); return; }
    if (!ctxRef.current || ctxRef.current.state === "closed") ctxRef.current = new AudioContext();
    const ctx = ctxRef.current;
    const decoded = await ctx.decodeAudioData(arrayBufRef.current.slice(0));
    const source = ctx.createBufferSource();
    source.buffer = decoded;
    source.connect(ctx.destination);
    source.start(0, start, end - start);
    startTimeRef.current = ctx.currentTime;
    source.onended = () => setPlaying(false);
    sourceRef.current = source;
    setPlaying(true);
  }

  async function trim() {
    if (!arrayBufRef.current) return;
    stopPlayback();
    const tmpCtx = new AudioContext();
    const decoded = await tmpCtx.decodeAudioData(arrayBufRef.current.slice(0));
    const sr = decoded.sampleRate;
    const startSample = Math.floor(start * sr);
    const endSample = Math.floor(end * sr);
    const trimLength = endSample - startSample;
    const trimmed = new AudioContext().createBuffer(decoded.numberOfChannels, trimLength, sr);
    for (let ch = 0; ch < decoded.numberOfChannels; ch++) {
      const src = decoded.getChannelData(ch).slice(startSample, endSample);
      trimmed.getChannelData(ch).set(src);
    }
    await tmpCtx.close();
    const blob = audioBufferToWav(trimmed);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(fileName ?? "audio").replace(/\.[^.]+$/, "")}_trimmed.wav`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800/60 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" className="text-yellow-400 text-sm hover:text-yellow-300 transition">← Tools</a>
          <span className="text-slate-700">/</span>
          <span className="text-slate-500 text-sm font-mono">audio-trimmer</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-900/30 border border-yellow-700/40 text-yellow-300 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            Web Audio API · Kein Upload · WAV-Export
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            Audio <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Schnippler</span>
          </h1>
          <p className="text-slate-400">Sprachnotizen und Audio-Dateien zuschneiden — direkt im Browser.</p>
        </div>

        {!fileName ? (
          <div
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition ${dragging ? "border-yellow-400 bg-yellow-950/20" : "border-slate-700 hover:border-slate-600"}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) loadFile(f); }}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f); }} />
            <div className="text-6xl mb-3">✂️</div>
            <p className="text-slate-300 font-semibold">Audiodatei hier ablegen oder klicken</p>
            <p className="text-slate-500 text-sm mt-1">MP3, WAV, M4A, OGG …</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* File info */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-5 py-3 flex items-center justify-between">
              <p className="text-slate-200 text-sm font-semibold">{fileName}</p>
              <button onClick={() => { setFileName(null); stopPlayback(); }} className="text-xs text-red-400 hover:text-red-300 transition">Andere Datei</button>
            </div>

            {/* Trim sliders */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm font-semibold">Bereich auswählen</span>
                <span className="text-yellow-400 font-mono text-sm">{fmt(start)} – {fmt(end)} ({fmt(end - start)} Dauer)</span>
              </div>

              {/* Visual trim bar */}
              <div className="relative h-12 bg-slate-800 rounded-xl overflow-hidden">
                <div
                  className="absolute top-0 bottom-0 bg-yellow-500/20 border-x-2 border-yellow-500"
                  style={{ left: `${(start / duration) * 100}%`, right: `${(1 - end / duration) * 100}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-xs font-mono">
                  {fmt(duration)} gesamt
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Start: {fmt(start)}</label>
                  <input type="range" min={0} max={duration} step={0.1} value={start}
                    onChange={(e) => setStart(Math.min(Number(e.target.value), end - 0.5))}
                    className="w-full accent-yellow-500" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Ende: {fmt(end)}</label>
                  <input type="range" min={0} max={duration} step={0.1} value={end}
                    onChange={(e) => setEnd(Math.max(Number(e.target.value), start + 0.5))}
                    className="w-full accent-yellow-500" />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={preview}
                className={`flex-1 py-3 rounded-2xl font-bold transition ${playing ? "bg-slate-700 text-slate-300" : "bg-slate-800 hover:bg-slate-700 text-slate-200"}`}>
                {playing ? "⏹ Stop" : "▶ Probehören"}
              </button>
              <button onClick={trim}
                className="flex-[2] py-3 rounded-2xl bg-yellow-600 hover:bg-yellow-500 text-white font-bold transition text-lg">
                ✂️ Zuschneiden & herunterladen
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
