"use client";
import { useState, useRef, useCallback } from "react";

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length * numChannels * 2;
  const arrayBuffer = new ArrayBuffer(44 + length);
  const view = new DataView(arrayBuffer);

  function write(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  }
  write(0, "RIFF");
  view.setUint32(4, 36 + length, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  write(36, "data");
  view.setUint32(40, length, true);

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const s = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      offset += 2;
    }
  }
  return new Blob([arrayBuffer], { type: "audio/wav" });
}

export default function AudioModifierPage() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [speed, setSpeed] = useState(1.0);
  const [preservePitch, setPreservePitch] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const arrayBufRef = useRef<ArrayBuffer | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);

  function loadFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      arrayBufRef.current = e.target!.result as ArrayBuffer;
      setFileName(file.name);
    };
    reader.readAsArrayBuffer(file);
  }

  function stopPlayback() {
    try { sourceRef.current?.stop(); } catch { /* already stopped */ }
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
    source.playbackRate.value = speed;
    (source as AudioBufferSourceNode & { preservesPitch?: boolean }).preservesPitch = preservePitch;
    source.connect(ctx.destination);
    source.start();
    source.onended = () => setPlaying(false);
    sourceRef.current = source;
    setPlaying(true);
  }

  async function exportWav() {
    if (!arrayBufRef.current) return;
    setExporting(true);
    stopPlayback();
    try {
      const tmpCtx = new AudioContext();
      const decoded = await tmpCtx.decodeAudioData(arrayBufRef.current.slice(0));
      await tmpCtx.close();

      const newLength = Math.ceil(decoded.length / speed);
      const offCtx = new OfflineAudioContext(decoded.numberOfChannels, newLength, decoded.sampleRate);
      const source = offCtx.createBufferSource();
      source.buffer = decoded;
      source.playbackRate.value = speed;
      (source as AudioBufferSourceNode & { preservesPitch?: boolean }).preservesPitch = preservePitch;
      source.connect(offCtx.destination);
      source.start(0);
      const rendered = await offCtx.startRendering();
      const blob = audioBufferToWav(rendered);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(fileName ?? "audio").replace(/\.[^.]+$/, "")}_${speed}x.wav`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
    setExporting(false);
  }

  return (
    <main className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800/60 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" className="text-orange-400 text-sm hover:text-orange-300 transition">← Tools</a>
          <span className="text-slate-700">/</span>
          <span className="text-slate-500 text-sm font-mono">audio-modifier</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-900/30 border border-orange-700/40 text-orange-300 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            Web Audio API · Kein Upload · WAV-Export
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            Audio <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Speed & Pitch</span>
          </h1>
          <p className="text-slate-400">Audios beschleunigen oder verlangsamen — direkt im Browser, ohne Upload.</p>
        </div>

        {/* Drop zone */}
        {!fileName ? (
          <div
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition ${dragging ? "border-orange-400 bg-orange-950/20" : "border-slate-700 hover:border-slate-600"}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) loadFile(f); }}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f); }} />
            <div className="text-6xl mb-3">🎵</div>
            <p className="text-slate-300 font-semibold">Audiodatei ablegen oder klicken</p>
            <p className="text-slate-500 text-sm mt-1">MP3, WAV, OGG, M4A …</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* File info */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎵</span>
                <p className="text-slate-200 font-semibold text-sm">{fileName}</p>
              </div>
              <button onClick={() => { setFileName(null); arrayBufRef.current = null; stopPlayback(); }} className="text-xs text-red-400 hover:text-red-300 transition">Andere Datei</button>
            </div>

            {/* Speed slider */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-slate-300 font-bold">Geschwindigkeit</label>
                <span className="text-2xl font-black text-orange-400 font-mono">{speed.toFixed(2)}×</span>
              </div>
              <input type="range" min={0.25} max={4} step={0.05} value={speed} onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full accent-orange-500 h-2" />
              <div className="flex justify-between text-xs text-slate-600 mt-1 font-mono">
                <span>0.25×</span><span>1×</span><span>4×</span>
              </div>

              <label className="flex items-center gap-3 mt-4 cursor-pointer">
                <input type="checkbox" checked={preservePitch} onChange={(e) => setPreservePitch(e.target.checked)} className="w-4 h-4 accent-orange-500" />
                <span className="text-sm text-slate-400">Tonhöhe beibehalten (nur Tempo ändern)</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={preview}
                className={`flex-1 py-3 rounded-2xl font-bold transition ${playing ? "bg-slate-700 text-slate-300" : "bg-slate-800 hover:bg-slate-700 text-slate-200"}`}
              >
                {playing ? "⏹ Stop" : "▶ Probehören"}
              </button>
              <button
                onClick={exportWav}
                disabled={exporting}
                className="flex-[2] py-3 rounded-2xl bg-orange-600 hover:bg-orange-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold transition text-lg"
              >
                {exporting ? "Exportiere…" : "Als WAV exportieren"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
