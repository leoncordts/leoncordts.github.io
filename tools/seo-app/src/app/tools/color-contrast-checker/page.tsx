"use client";
import { useState, useMemo } from "react";

function hexToRgb(hex: string): [number,number,number] | null {
  const clean = hex.replace("#","");
  if (clean.length === 3) {
    const [r,g,b] = clean.split("").map(c => parseInt(c+c,16));
    return [r,g,b];
  }
  if (clean.length === 6) {
    return [parseInt(clean.slice(0,2),16), parseInt(clean.slice(2,4),16), parseInt(clean.slice(4,6),16)];
  }
  return null;
}

function luminance([r,g,b]: [number,number,number]): number {
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126*toLinear(r) + 0.7152*toLinear(g) + 0.0722*toLinear(b);
}

function contrastRatio(fg: [number,number,number], bg: [number,number,number]): number {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const lighter = Math.max(l1,l2);
  const darker  = Math.min(l1,l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function wcagLevel(ratio: number, large: boolean): { aa: boolean; aaa: boolean } {
  if (large) return { aa: ratio >= 3, aaa: ratio >= 4.5 };
  return { aa: ratio >= 4.5, aaa: ratio >= 7 };
}

const PRESETS: [string, string, string][] = [
  ["Weiß auf Schwarz","#ffffff","#000000"],
  ["Schwarz auf Weiß","#000000","#ffffff"],
  ["Blau auf Weiß","#0044cc","#ffffff"],
  ["Grau auf Weiß","#767676","#ffffff"],
  ["Azure auf Navy","#38bdf8","#020b18"],
  ["Gelb auf Dunkel","#fbbf24","#1c1917"],
];

export default function ColorContrastCheckerPage() {
  const [fg, setFg] = useState("#ffffff");
  const [bg, setBg] = useState("#020b18");

  const result = useMemo(() => {
    const fgRgb = hexToRgb(fg);
    const bgRgb = hexToRgb(bg);
    if (!fgRgb || !bgRgb) return null;
    const ratio = contrastRatio(fgRgb, bgRgb);
    return { ratio, normal: wcagLevel(ratio, false), large: wcagLevel(ratio, true) };
  }, [fg, bg]);

  const ratioStr = result ? result.ratio.toFixed(2) : "–";
  const grade = result
    ? result.ratio >= 7 ? "AAA" : result.ratio >= 4.5 ? "AA" : result.ratio >= 3 ? "AA (Groß)" : "FAIL"
    : "–";
  const gradeColor = result
    ? result.ratio >= 4.5 ? "text-emerald-400" : result.ratio >= 3 ? "text-amber-400" : "text-red-400"
    : "text-slate-500";

  return (
    <main className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800/60 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <a href="/tools" className="text-emerald-400 text-sm hover:text-emerald-300 transition">← Tools</a>
          <span className="text-slate-700">/</span>
          <span className="text-slate-500 text-sm font-mono">color-contrast-checker</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-900/30 border border-emerald-700/40 text-emerald-300 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            WCAG 2.1 · 100% lokal
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            Kontrast <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Checker</span>
          </h1>
          <p className="text-slate-400">WCAG-Kontrastverhältnis prüfen — für barrierefreies Design.</p>
        </div>

        {/* Preview */}
        <div className="rounded-2xl overflow-hidden mb-6 border border-slate-800" style={{ backgroundColor: bg }}>
          <div className="p-8 text-center">
            <p className="text-2xl font-bold mb-1" style={{ color: fg }}>Beispieltext (Normal)</p>
            <p className="text-sm" style={{ color: fg }}>Kleinerer Texte für Lesbarkeitstests — AA erfordert 4.5:1</p>
            <p className="text-4xl font-black mt-3" style={{ color: fg }}>Großer Text AA ≥ 3:1</p>
          </div>
        </div>

        {/* Color pickers */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { label: "Vordergrundfarbe (Text)", val: fg, set: setFg },
            { label: "Hintergrundfarbe",        val: bg, set: setBg },
          ].map(({ label, val, set }) => (
            <div key={label} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
              <label className="text-xs font-mono text-slate-500 uppercase tracking-wider block mb-3">{label}</label>
              <div className="flex items-center gap-3">
                <input type="color" value={val} onChange={e => set(e.target.value)}
                  className="w-12 h-10 rounded-lg cursor-pointer border-0 bg-transparent" />
                <input type="text" value={val} onChange={e => set(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono text-sm outline-none focus:border-emerald-500" />
              </div>
            </div>
          ))}
        </div>

        {/* Result */}
        {result && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-slate-500 text-xs font-mono uppercase tracking-wider mb-1">Kontrastverhältnis</div>
                <div className="text-5xl font-black text-white">{ratioStr}<span className="text-slate-600 text-2xl">:1</span></div>
              </div>
              <div className={`text-4xl font-black ${gradeColor}`}>{grade}</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Normaler Text (< 18pt)", ...result.normal },
                { label: "Großer Text (≥ 18pt / fett ≥ 14pt)", ...result.large },
              ].map(({ label, aa, aaa }) => (
                <div key={label} className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-3">{label}</p>
                  <div className="flex flex-col gap-2">
                    {[{ name:"AA", pass: aa }, { name:"AAA", pass: aaa }].map(({ name, pass }) => (
                      <div key={name} className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-300">WCAG {name}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${pass ? "bg-emerald-900/50 text-emerald-400" : "bg-red-900/30 text-red-400"}`}>
                          {pass ? "✓ PASS" : "✗ FAIL"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Presets */}
        <div>
          <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-3">Schnell-Vorlagen</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PRESETS.map(([name, f, b]) => (
              <button key={name} onClick={() => { setFg(f); setBg(b); }}
                className="rounded-xl px-3 py-2 text-xs font-semibold transition border border-slate-700 hover:border-emerald-500/50"
                style={{ backgroundColor: b, color: f }}>
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
