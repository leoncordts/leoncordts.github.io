"use client";
import { useState, useMemo } from "react";

interface HardwareItem { name: string; score: number; }

const CPUS: HardwareItem[] = [
  { name: "Intel Core i9-14900K", score: 99 },
  { name: "AMD Ryzen 9 7950X", score: 98 },
  { name: "Intel Core i9-13900K", score: 97 },
  { name: "AMD Ryzen 9 7900X", score: 95 },
  { name: "Intel Core i7-14700K", score: 93 },
  { name: "AMD Ryzen 7 7700X", score: 90 },
  { name: "Intel Core i7-13700K", score: 89 },
  { name: "AMD Ryzen 5 7600X", score: 85 },
  { name: "Intel Core i5-14600K", score: 84 },
  { name: "Intel Core i7-12700K", score: 82 },
  { name: "AMD Ryzen 9 5900X", score: 80 },
  { name: "AMD Ryzen 7 5800X3D", score: 86 },
  { name: "Intel Core i5-13600K", score: 78 },
  { name: "AMD Ryzen 5 5600X", score: 72 },
  { name: "Intel Core i7-10700K", score: 70 },
  { name: "AMD Ryzen 7 3700X", score: 65 },
  { name: "Intel Core i5-12400F", score: 68 },
  { name: "Intel Core i5-11600K", score: 62 },
  { name: "AMD Ryzen 5 3600", score: 58 },
  { name: "Intel Core i7-9700K", score: 56 },
  { name: "AMD Ryzen 5 3400G", score: 45 },
  { name: "Intel Core i5-10400F", score: 55 },
  { name: "Intel Core i5-9600K", score: 50 },
  { name: "AMD Ryzen 5 2600", score: 44 },
  { name: "Intel Core i7-8700K", score: 52 },
  { name: "Intel Core i5-8400", score: 42 },
  { name: "AMD Ryzen 3 3300X", score: 40 },
  { name: "Intel Core i3-12100F", score: 55 },
  { name: "Intel Core i5-7600K", score: 35 },
  { name: "AMD FX-8350", score: 22 },
];

const GPUS: HardwareItem[] = [
  { name: "NVIDIA GeForce RTX 4090", score: 100 },
  { name: "NVIDIA GeForce RTX 4080 Super", score: 93 },
  { name: "NVIDIA GeForce RTX 4080", score: 90 },
  { name: "AMD Radeon RX 7900 XTX", score: 88 },
  { name: "NVIDIA GeForce RTX 4070 Ti Super", score: 85 },
  { name: "AMD Radeon RX 7900 XT", score: 82 },
  { name: "NVIDIA GeForce RTX 4070 Ti", score: 80 },
  { name: "NVIDIA GeForce RTX 4070 Super", score: 77 },
  { name: "AMD Radeon RX 7800 XT", score: 72 },
  { name: "NVIDIA GeForce RTX 4070", score: 74 },
  { name: "NVIDIA GeForce RTX 3080 Ti", score: 78 },
  { name: "NVIDIA GeForce RTX 3080", score: 73 },
  { name: "AMD Radeon RX 7700 XT", score: 65 },
  { name: "NVIDIA GeForce RTX 4060 Ti", score: 68 },
  { name: "AMD Radeon RX 6800 XT", score: 70 },
  { name: "NVIDIA GeForce RTX 3070 Ti", score: 67 },
  { name: "NVIDIA GeForce RTX 3070", score: 64 },
  { name: "AMD Radeon RX 6700 XT", score: 60 },
  { name: "NVIDIA GeForce RTX 4060", score: 58 },
  { name: "NVIDIA GeForce RTX 3060 Ti", score: 56 },
  { name: "AMD Radeon RX 6600 XT", score: 50 },
  { name: "NVIDIA GeForce RTX 3060", score: 48 },
  { name: "NVIDIA GeForce RTX 2080 Ti", score: 66 },
  { name: "NVIDIA GeForce RTX 2070 Super", score: 55 },
  { name: "NVIDIA GeForce RTX 2060 Super", score: 46 },
  { name: "NVIDIA GeForce GTX 1080 Ti", score: 52 },
  { name: "NVIDIA GeForce GTX 1080", score: 42 },
  { name: "NVIDIA GeForce RTX 2060", score: 40 },
  { name: "NVIDIA GeForce GTX 1070 Ti", score: 36 },
  { name: "AMD Radeon RX 580", score: 30 },
  { name: "NVIDIA GeForce GTX 1070", score: 32 },
  { name: "NVIDIA GeForce GTX 1660 Super", score: 35 },
  { name: "NVIDIA GeForce GTX 1660", score: 30 },
  { name: "NVIDIA GeForce GTX 1060 6GB", score: 22 },
  { name: "NVIDIA GeForce GTX 1650", score: 18 },
  { name: "AMD Radeon RX 570", score: 20 },
  { name: "NVIDIA GeForce GTX 1050 Ti", score: 14 },
  { name: "NVIDIA GeForce GTX 970", score: 18 },
];

function calcBottleneck(cpuScore: number, gpuScore: number) {
  const diff = cpuScore - gpuScore;
  const pct = Math.round(Math.abs(diff) / Math.max(cpuScore, gpuScore) * 100);
  if (pct < 10) return { type: "balanced", pct, label: "Ausgewogen", color: "#22c55e", desc: "Dein System ist gut ausbalanciert. CPU und GPU arbeiten harmonisch zusammen." };
  if (diff < 0) return { type: "cpu", pct, label: "CPU-Bottleneck", color: "#ef4444", desc: `Deine CPU ist ${pct}% schwächer als deine GPU. Die GPU wartet auf Daten vom Prozessor — du verlierst FPS.` };
  return { type: "gpu", pct, label: "GPU-Bottleneck", color: "#f97316", desc: `Deine GPU ist ${pct}% schwächer als deine CPU. Der Prozessor könnte mehr leisten — begrenzender Faktor ist die Grafikkarte.` };
}

export default function PcBottleneckPage() {
  const [cpuIdx, setCpuIdx] = useState<number | null>(null);
  const [gpuIdx, setGpuIdx] = useState<number | null>(null);
  const [cpuSearch, setCpuSearch] = useState("");
  const [gpuSearch, setGpuSearch] = useState("");

  const filteredCpus = useMemo(() => CPUS.filter((c) => c.name.toLowerCase().includes(cpuSearch.toLowerCase())), [cpuSearch]);
  const filteredGpus = useMemo(() => GPUS.filter((g) => g.name.toLowerCase().includes(gpuSearch.toLowerCase())), [gpuSearch]);

  const result = useMemo(() => {
    if (cpuIdx === null || gpuIdx === null) return null;
    return calcBottleneck(CPUS[cpuIdx].score, GPUS[gpuIdx].score);
  }, [cpuIdx, gpuIdx]);

  return (
    <main className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800/60 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <a href="/tools" className="text-red-400 text-sm hover:text-red-300 transition">← Tools</a>
          <span className="text-slate-700">/</span>
          <span className="text-slate-500 text-sm font-mono">pc-bottleneck-checker</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-900/30 border border-red-700/40 text-red-300 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            Kostenlos · Kein Login · Statische Datenbank
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            PC <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">Bottleneck</span> Checker
          </h1>
          <p className="text-slate-400">Bremst deine CPU die GPU aus — oder umgekehrt? Finde es in 10 Sekunden heraus.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* CPU */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-800 bg-blue-950/30">
              <span className="font-bold text-blue-300">🔵 Prozessor (CPU)</span>
            </div>
            <div className="p-4">
              <input
                type="text"
                placeholder="Suchen... z.B. Ryzen 5"
                value={cpuSearch}
                onChange={(e) => { setCpuSearch(e.target.value); setCpuIdx(null); }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 text-sm mb-3 focus:outline-none focus:border-blue-500"
              />
              <div className="flex flex-col gap-1 max-h-52 overflow-y-auto pr-1">
                {filteredCpus.map((cpu) => {
                  const idx = CPUS.indexOf(cpu);
                  return (
                    <button key={cpu.name} onClick={() => { setCpuIdx(idx); setCpuSearch(""); }}
                      className={`text-left px-3 py-2 rounded-lg text-sm transition ${cpuIdx === idx ? "bg-blue-700 text-white" : "text-slate-300 hover:bg-slate-800"}`}>
                      <span className="font-semibold">{cpu.name}</span>
                      <span className="text-xs text-slate-500 ml-2">Score: {cpu.score}</span>
                    </button>
                  );
                })}
              </div>
              {cpuIdx !== null && !cpuSearch && (
                <div className="mt-3 px-3 py-2 bg-blue-900/20 border border-blue-800/40 rounded-xl">
                  <p className="text-blue-300 text-sm font-semibold">{CPUS[cpuIdx].name}</p>
                  <div className="mt-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${CPUS[cpuIdx].score}%` }} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-mono">Score: {CPUS[cpuIdx].score}/100</p>
                </div>
              )}
            </div>
          </div>

          {/* GPU */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-800 bg-green-950/30">
              <span className="font-bold text-green-300">🟢 Grafikkarte (GPU)</span>
            </div>
            <div className="p-4">
              <input
                type="text"
                placeholder="Suchen... z.B. RTX 4070"
                value={gpuSearch}
                onChange={(e) => { setGpuSearch(e.target.value); setGpuIdx(null); }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 text-sm mb-3 focus:outline-none focus:border-green-500"
              />
              <div className="flex flex-col gap-1 max-h-52 overflow-y-auto pr-1">
                {filteredGpus.map((gpu) => {
                  const idx = GPUS.indexOf(gpu);
                  return (
                    <button key={gpu.name} onClick={() => { setGpuIdx(idx); setGpuSearch(""); }}
                      className={`text-left px-3 py-2 rounded-lg text-sm transition ${gpuIdx === idx ? "bg-green-700 text-white" : "text-slate-300 hover:bg-slate-800"}`}>
                      <span className="font-semibold">{gpu.name}</span>
                      <span className="text-xs text-slate-500 ml-2">Score: {gpu.score}</span>
                    </button>
                  );
                })}
              </div>
              {gpuIdx !== null && !gpuSearch && (
                <div className="mt-3 px-3 py-2 bg-green-900/20 border border-green-800/40 rounded-xl">
                  <p className="text-green-300 text-sm font-semibold">{GPUS[gpuIdx].name}</p>
                  <div className="mt-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${GPUS[gpuIdx].score}%` }} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-mono">Score: {GPUS[gpuIdx].score}/100</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Result */}
        {result ? (
          <div className="flex flex-col gap-5">
            <div className="border rounded-2xl p-6 text-center" style={{ borderColor: result.color + "40", background: result.color + "0d" }}>
              {/* Gauge */}
              <div className="relative w-48 h-24 mx-auto mb-4">
                <svg viewBox="0 0 200 100" className="w-full">
                  <path d="M10,100 A90,90 0 0,1 190,100" fill="none" stroke="#1e293b" strokeWidth="18" strokeLinecap="round" />
                  <path d="M10,100 A90,90 0 0,1 190,100" fill="none" stroke={result.color} strokeWidth="18" strokeLinecap="round"
                    strokeDasharray="283" strokeDashoffset={283 - (283 * result.pct / 100)} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
                  <span className="text-3xl font-black" style={{ color: result.color }}>{result.pct}%</span>
                </div>
              </div>
              <h2 className="text-2xl font-black text-white mb-2">{result.label}</h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto">{result.desc}</p>
            </div>

            {/* Comparison bar */}
            {cpuIdx !== null && gpuIdx !== null && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs text-slate-500 w-24 text-right font-mono">CPU {CPUS[cpuIdx].score}</span>
                  <div className="flex-1 h-4 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${CPUS[cpuIdx].score}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-24 text-right font-mono">GPU {GPUS[gpuIdx].score}</span>
                  <div className="flex-1 h-4 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${GPUS[gpuIdx].score}%` }} />
                  </div>
                </div>
              </div>
            )}

            {/* CTA */}
            {result.pct >= 15 && (
              <div className="bg-slate-900/60 border border-amber-700/40 rounded-2xl p-6 text-center">
                <p className="text-amber-200 font-semibold mb-2">🔧 Dein PC bremst sich selbst aus — verschenk keine FPS!</p>
                <p className="text-slate-400 text-sm mb-4">Ich berate dich beim perfekten Hardware-Upgrade und baue dir die neuen Teile in Köln und Umgebung fachgerecht und sicher ein.</p>
                <a href="/kontakt" className="inline-block px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition">
                  Jetzt PC-Tuning mit Leon Cordts buchen →
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-slate-600 border border-slate-800 border-dashed rounded-2xl py-12">
            Wähle oben CPU und GPU aus, um dein Ergebnis zu sehen.
          </div>
        )}
      </div>
    </main>
  );
}
