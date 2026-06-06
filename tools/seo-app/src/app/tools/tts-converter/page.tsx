"use client";
import { useState, useEffect, useRef } from "react";

export default function TtsConverterPage() {
  const [text, setText] = useState("Willkommen bei Leon Cordts IT Solutions. Dieser Text wird gerade vorgelesen.");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const animRef = useRef<number>(0);
  const [bars, setBars] = useState<number[]>(Array(20).fill(4));

  useEffect(() => {
    function loadVoices() {
      const v = speechSynthesis.getVoices().filter((v) =>
        v.lang.startsWith("de") || v.lang.startsWith("en")
      );
      setVoices(v);
      if (v.length > 0 && !selectedVoice) setSelectedVoice(v[0].name);
    }
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
    return () => { speechSynthesis.cancel(); };
  }, [selectedVoice]);

  function animateBars() {
    setBars(Array(20).fill(0).map(() => Math.random() * 28 + 4));
    animRef.current = requestAnimationFrame(animateBars);
  }

  function speak() {
    if (!text.trim()) return;
    speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    const voice = voices.find((v) => v.name === selectedVoice);
    if (voice) utt.voice = voice;
    utt.rate = rate;
    utt.pitch = pitch;
    utt.onstart = () => { setSpeaking(true); setPaused(false); animateBars(); };
    utt.onend = () => { setSpeaking(false); setPaused(false); cancelAnimationFrame(animRef.current); setBars(Array(20).fill(4)); };
    utt.onerror = () => { setSpeaking(false); cancelAnimationFrame(animRef.current); };
    speechSynthesis.speak(utt);
  }

  function togglePause() {
    if (paused) { speechSynthesis.resume(); setPaused(false); animateBars(); }
    else { speechSynthesis.pause(); setPaused(true); cancelAnimationFrame(animRef.current); }
  }

  function stop() {
    speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
    cancelAnimationFrame(animRef.current);
    setBars(Array(20).fill(4));
  }

  const deVoices = voices.filter((v) => v.lang.startsWith("de"));
  const enVoices = voices.filter((v) => v.lang.startsWith("en"));

  return (
    <main className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800/60 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" className="text-indigo-400 text-sm hover:text-indigo-300 transition">← Tools</a>
          <span className="text-slate-700">/</span>
          <span className="text-slate-500 text-sm font-mono">tts-converter</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-900/50 border border-indigo-700/50 text-indigo-300 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Web Speech API · 100% lokal · Kein Server
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            Text-zu-<span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Sprache</span>
          </h1>
          <p className="text-slate-400">Text vorlesen mit nativen Browser-Stimmen — lokal, kostenlos, kein Limit.</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6">
          {/* Textarea */}
          <textarea
            rows={7}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Text hier eingeben…"
            className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-slate-200 text-sm outline-none resize-none transition placeholder-slate-600 leading-relaxed"
          />

          {/* Voice selector */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Stimme</label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-slate-200 text-sm outline-none transition"
            >
              {deVoices.length > 0 && (
                <optgroup label="Deutsch">
                  {deVoices.map((v) => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
                </optgroup>
              )}
              {enVoices.length > 0 && (
                <optgroup label="Englisch">
                  {enVoices.map((v) => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
                </optgroup>
              )}
              {voices.length === 0 && <option>Keine Stimmen verfügbar</option>}
            </select>
          </div>

          {/* Sliders */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Geschwindigkeit</label>
                <span className="text-xs font-mono text-indigo-400">{rate.toFixed(1)}x</span>
              </div>
              <input type="range" min={0.5} max={2} step={0.1} value={rate} onChange={(e) => setRate(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 h-1.5 rounded cursor-pointer" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tonhöhe</label>
                <span className="text-xs font-mono text-indigo-400">{pitch.toFixed(1)}</span>
              </div>
              <input type="range" min={0} max={2} step={0.1} value={pitch} onChange={(e) => setPitch(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 h-1.5 rounded cursor-pointer" />
            </div>
          </div>

          {/* Waveform */}
          <div className="flex items-end justify-center gap-0.5 h-10">
            {bars.map((h, i) => (
              <div
                key={i}
                className="w-1.5 rounded-full transition-all duration-75"
                style={{
                  height: `${h}px`,
                  background: speaking && !paused
                    ? `hsl(${230 + i * 4}, 80%, 65%)`
                    : "rgba(100,116,139,0.3)",
                }}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            <button
              onClick={speaking ? togglePause : speak}
              disabled={!text.trim() || voices.length === 0}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition text-lg"
            >
              {speaking ? (paused ? "▶ Fortsetzen" : "⏸ Pause") : "▶ Vorlesen"}
            </button>
            {speaking && (
              <button onClick={stop} className="px-5 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-xl transition">
                ⏹
              </button>
            )}
          </div>
          {voices.length === 0 && (
            <p className="text-amber-400/80 text-xs text-center font-mono">Keine Stimmen gefunden. Stelle sicher, dass dein Browser Text-to-Speech unterstützt.</p>
          )}
        </div>
      </div>
    </main>
  );
}
