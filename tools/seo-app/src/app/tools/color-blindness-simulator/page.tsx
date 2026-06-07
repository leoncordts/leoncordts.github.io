"use client";
import { useState, useRef, useEffect, useCallback } from "react";

type BlindType = "normal" | "protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia" | "protanomaly" | "deuteranomaly";

const TYPES: { id: BlindType; label: string; desc: string }[] = [
  { id: "normal",        label: "Normal",         desc: "Normales Farbsehen" },
  { id: "protanopia",    label: "Protanopie",      desc: "Kein Rot-Sehen (1% der Männer)" },
  { id: "deuteranopia",  label: "Deuteranopie",    desc: "Kein Grün-Sehen (1% der Männer)" },
  { id: "tritanopia",    label: "Tritanopie",      desc: "Kein Blau-Sehen (selten)" },
  { id: "achromatopsia", label: "Achromatopsie",   desc: "Komplett farbenblind (sehr selten)" },
  { id: "protanomaly",   label: "Protanomalie",    desc: "Schwaches Rot-Sehen" },
  { id: "deuteranomaly", label: "Deuteranomalie",  desc: "Schwaches Grün-Sehen (5% der Männer)" },
];

// Color transformation matrices
function applyMatrix(r: number, g: number, b: number, m: number[]): [number,number,number] {
  return [
    Math.min(255, Math.max(0, m[0]*r + m[1]*g + m[2]*b)),
    Math.min(255, Math.max(0, m[3]*r + m[4]*g + m[5]*b)),
    Math.min(255, Math.max(0, m[6]*r + m[7]*g + m[8]*b)),
  ];
}

const MATRICES: Record<BlindType, number[]> = {
  normal:        [1,0,0,  0,1,0,  0,0,1],
  protanopia:    [0.567,0.433,0,  0.558,0.442,0,  0,0.242,0.758],
  deuteranopia:  [0.625,0.375,0,  0.7,0.3,0,      0,0.3,0.7],
  tritanopia:    [0.95,0.05,0,    0,0.433,0.567,  0,0.475,0.525],
  achromatopsia: [0.299,0.587,0.114, 0.299,0.587,0.114, 0.299,0.587,0.114],
  protanomaly:   [0.817,0.183,0,  0.333,0.667,0,  0,0.125,0.875],
  deuteranomaly: [0.8,0.2,0,      0.258,0.742,0,  0,0.142,0.858],
};

export default function ColorBlindnessSimulatorPage() {
  const [type, setType] = useState<BlindType>("deuteranopia");
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const origCanvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processImage = useCallback((src: string, blindType: BlindType) => {
    const img = new Image();
    img.onload = () => {
      const maxW = 800;
      const scale = Math.min(1, maxW / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);

      // Original canvas
      const oc = origCanvasRef.current!;
      oc.width = w; oc.height = h;
      const octx = oc.getContext("2d")!;
      octx.drawImage(img, 0, 0, w, h);

      // Filtered canvas
      const fc = canvasRef.current!;
      fc.width = w; fc.height = h;
      const fctx = fc.getContext("2d")!;
      fctx.drawImage(img, 0, 0, w, h);

      if (blindType !== "normal") {
        const data = fctx.getImageData(0, 0, w, h);
        const m = MATRICES[blindType];
        for (let i = 0; i < data.data.length; i += 4) {
          const [r,g,b] = applyMatrix(data.data[i], data.data[i+1], data.data[i+2], m);
          data.data[i]=r; data.data[i+1]=g; data.data[i+2]=b;
        }
        fctx.putImageData(data, 0, 0);
      }
    };
    img.src = src;
  }, []);

  useEffect(() => {
    if (imgSrc) processImage(imgSrc, type);
  }, [imgSrc, type, processImage]);

  function onFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = e => setImgSrc(e.target!.result as string);
    reader.readAsDataURL(file);
  }

  function download() {
    const a = document.createElement("a");
    a.href = canvasRef.current!.toDataURL("image/png");
    a.download = `colorblind-${type}.png`;
    a.click();
  }

  return (
    <main className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800/60 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <a href="/tools" className="text-violet-400 text-sm hover:text-violet-300 transition">← Tools</a>
          <span className="text-slate-700">/</span>
          <span className="text-slate-500 text-sm font-mono">color-blindness-simulator</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-900/30 border border-violet-700/40 text-violet-300 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            100% lokal · Kein Upload
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            Farbenblindheit <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Simulator</span>
          </h1>
          <p className="text-slate-400">Bild hochladen und sehen, wie Farbenblinde es wahrnehmen.</p>
        </div>

        {/* Type selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          {TYPES.map(t => (
            <button key={t.id} onClick={() => setType(t.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition text-left ${type === t.id ? "bg-violet-700 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}>
              <div>{t.label}</div>
              <div className={`text-[10px] mt-0.5 ${type === t.id ? "text-violet-200" : "text-slate-600"}`}>{t.desc}</div>
            </button>
          ))}
        </div>

        {/* Drop zone */}
        {!imgSrc && (
          <div
            className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition ${dragging ? "border-violet-400 bg-violet-950/30" : "border-slate-700 hover:border-slate-600"}`}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if(f) onFile(f); }}
            onClick={() => inputRef.current?.click()}
          >
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && onFile(e.target.files[0])} />
            <div className="text-5xl mb-3">🖼️</div>
            <p className="text-slate-300 font-semibold">Bild hierher ziehen</p>
            <p className="text-slate-500 text-sm mt-1">oder klicken zum Auswählen</p>
          </div>
        )}

        {imgSrc && (
          <div className="flex flex-col gap-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-4 py-2 border-b border-slate-800 text-xs font-mono text-slate-500">Original</div>
                <canvas ref={origCanvasRef} className="w-full h-auto" />
              </div>
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-4 py-2 border-b border-slate-800 text-xs font-mono text-violet-400">
                  {TYPES.find(t => t.id === type)?.label}
                </div>
                <canvas ref={canvasRef} className="w-full h-auto" />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setImgSrc(null); }} className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition">
                Anderes Bild
              </button>
              <button onClick={download} className="flex-1 py-3 rounded-xl bg-violet-700 hover:bg-violet-600 text-white font-semibold text-sm transition">
                Simuliertes Bild downloaden
              </button>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-500">
              <strong className="text-slate-400">Hinweis:</strong> Ca. 8% der Männer und 0,5% der Frauen sind farbenblind.
              Deuteranomalie (Grün-Schwäche) ist die häufigste Form.
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
