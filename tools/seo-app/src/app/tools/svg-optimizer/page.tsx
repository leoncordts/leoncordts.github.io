"use client";
import { useState, useCallback } from "react";

function optimizeSvg(svg: string): string {
  return svg
    // Remove XML declaration
    .replace(/<\?xml[^?]*\?>/g, "")
    // Remove comments
    .replace(/<!--[\s\S]*?-->/g, "")
    // Remove doctype
    .replace(/<!DOCTYPE[^>]*>/gi, "")
    // Remove empty groups
    .replace(/<g[^>]*>\s*<\/g>/g, "")
    // Remove metadata
    .replace(/<metadata[\s\S]*?<\/metadata>/g, "")
    // Remove title inside SVG
    .replace(/<title>[^<]*<\/title>/g, "")
    // Remove desc
    .replace(/<desc>[\s\S]*?<\/desc>/g, "")
    // Remove inkscape/sodipodi/adobe namespaces and attrs
    .replace(/\s+inkscape:[^\s"'>]+(="[^"]*")*/g, "")
    .replace(/\s+sodipodi:[^\s"'>]+(="[^"]*")*/g, "")
    .replace(/\s+dc:[^\s"'>]+(="[^"]*")*/g, "")
    .replace(/\s+rdf:[^\s"'>]+(="[^"]*")*/g, "")
    .replace(/\s+xlink:[^\s"'>]+(="[^"]*")*/g, "")
    .replace(/<defs>\s*<\/defs>/g, "")
    // Remove unnecessary whitespace between tags
    .replace(/>\s+</g, "><")
    // Remove trailing whitespace in attrs
    .replace(/\s+>/g, ">")
    // Collapse multiple spaces
    .replace(/  +/g, " ")
    .trim();
}

function fmtBytes(n: number) {
  if (n < 1024) return n + " B";
  return (n / 1024).toFixed(2) + " KB";
}

export default function SvgOptimizerPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const optimize = useCallback(() => {
    setOutput(optimizeSvg(input));
  }, [input]);

  const origBytes = new Blob([input]).size;
  const newBytes = new Blob([output]).size;
  const saved = origBytes > 0 ? Math.round((1 - newBytes / origBytes) * 100) : 0;

  function copy() { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1500); }

  function download() {
    const blob = new Blob([output], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "optimized.svg"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800/60 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <a href="/tools" className="text-indigo-400 text-sm hover:text-indigo-300 transition">← Tools</a>
          <span className="text-slate-700">/</span>
          <span className="text-slate-500 text-sm font-mono">svg-optimizer</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-900/50 border border-indigo-700/50 text-indigo-300 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Regex-basiert · 100% lokal · Kein Upload
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            SVG <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Optimizer</span>
          </h1>
          <p className="text-slate-400">SVG-Dateien komprimieren — entfernt Kommentare, Metadaten und überflüssige Attribute.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 mb-5">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">SVG Eingabe</label>
            <textarea
              rows={16}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={"<svg xmlns='http://www.w3.org/2000/svg'>\n  <!-- Inkscape Comment -->\n  <title>My Icon</title>\n  <g>\n    <rect width='100' height='100' fill='blue'/>\n  </g>\n</svg>"}
              className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-slate-200 font-mono text-xs outline-none resize-none transition placeholder-slate-600 leading-relaxed"
            />
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Optimiertes SVG</label>
              {output && (
                <div className="flex gap-2">
                  <button onClick={copy} className={`text-xs px-2.5 py-1 rounded-lg font-mono transition ${copied ? "bg-green-700 text-green-100" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}>{copied ? "✓" : "Kopieren"}</button>
                  <button onClick={download} className="text-xs px-2.5 py-1 rounded-lg font-mono bg-slate-700 text-slate-300 hover:bg-slate-600 transition">↓ .svg</button>
                </div>
              )}
            </div>
            <textarea
              rows={16}
              readOnly
              value={output}
              placeholder="Optimiertes SVG erscheint hier…"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-400 font-mono text-xs resize-none cursor-default leading-relaxed"
            />
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <button
            onClick={optimize}
            disabled={!input.trim()}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition"
          >
            SVG optimieren
          </button>
          {output && (
            <div className="flex gap-3 text-sm font-mono">
              <span className="text-slate-500">{fmtBytes(origBytes)}</span>
              <span className="text-slate-700">→</span>
              <span className="text-slate-300">{fmtBytes(newBytes)}</span>
              {saved > 0 && <span className="text-green-400 font-bold">-{saved}%</span>}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
