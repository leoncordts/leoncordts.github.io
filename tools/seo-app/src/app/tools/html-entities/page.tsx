"use client";
import { useState } from "react";

const NAMED: [string, string][] = [
  ["&amp;","&"],["&lt;","<"],["&gt;",">"],["&quot;",'"'],["&apos;","'"],
  ["&nbsp;"," "],["&copy;","©"],["&reg;","®"],["&trade;","™"],
  ["&euro;","€"],["&pound;","£"],["&yen;","¥"],["&cent;","¢"],
  ["&mdash;","—"],["&ndash;","–"],["&hellip;","…"],["&laquo;","«"],["&raquo;","»"],
  ["&ldquo;","“"],["&rdquo;","”"],["&lsquo;","‘"],["&rsquo;","’"],
  ["&times;","×"],["&divide;","÷"],["&plusmn;","±"],["&ne;","≠"],
  ["&le;","≤"],["&ge;","≥"],["&infin;","∞"],["&sum;","∑"],["&pi;","π"],
  ["&alpha;","α"],["&beta;","β"],["&gamma;","γ"],["&delta;","δ"],["&omega;","ω"],
  ["&hearts;","♥"],["&spades;","♠"],["&clubs;","♣"],["&diams;","♦"],
  ["&star;","★"],["&check;","✓"],["&cross;","✗"],
];

function encodeEntities(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function decodeEntities(text: string): string {
  const el = document.createElement("textarea");
  el.innerHTML = text;
  return el.value;
}

export default function HtmlEntitiesPage() {
  const [mode, setMode] = useState<"encode"|"decode">("encode");
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const output = mode === "encode" ? encodeEntities(input) : (typeof document !== "undefined" ? decodeEntities(input) : input);

  function copy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <main className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800/60 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <a href="/tools" className="text-cyan-400 text-sm hover:text-cyan-300 transition">← Tools</a>
          <span className="text-slate-700">/</span>
          <span className="text-slate-500 text-sm font-mono">html-entities</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-900/30 border border-cyan-700/40 text-cyan-300 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            100% lokal · Sofort
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            HTML <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Entities</span>
          </h1>
          <p className="text-slate-400">HTML-Sonderzeichen kodieren und dekodieren.</p>
        </div>

        <div className="flex gap-2 mb-6">
          {(["encode","decode"] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setInput(""); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${mode === m ? "bg-cyan-700 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}>
              {m === "encode" ? "Kodieren" : "Dekodieren"}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <label className="text-xs font-mono text-slate-500 uppercase tracking-wider block mb-2">
              {mode === "encode" ? "Rohtext eingeben" : "HTML Entities eingeben"}
            </label>
            <textarea
              className="w-full bg-transparent text-slate-200 text-sm font-mono resize-none outline-none min-h-[120px] placeholder:text-slate-600"
              placeholder={mode === "encode" ? '<p class="test">Hallo & Welt</p>' : "&lt;p&gt;Hallo &amp; Welt&lt;/p&gt;"}
              value={input}
              onChange={e => setInput(e.target.value)}
            />
          </div>

          <button onClick={copy} disabled={!output}
            className="w-full py-3 rounded-xl bg-cyan-700 hover:bg-cyan-600 disabled:bg-slate-800 disabled:text-slate-600 text-white font-semibold transition">
            {copied ? "Kopiert!" : "Ergebnis kopieren"}
          </button>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <label className="text-xs font-mono text-slate-500 uppercase tracking-wider block mb-2">
              {mode === "encode" ? "HTML Entities" : "Dekodierter Text"}
            </label>
            <p className="text-slate-200 text-sm font-mono leading-relaxed min-h-[60px] break-all whitespace-pre-wrap">
              {output || <span className="text-slate-600">Ergebnis erscheint hier…</span>}
            </p>
          </div>
        </div>

        {/* Reference table */}
        <div className="mt-8">
          <h2 className="text-slate-400 text-sm font-semibold mb-3">Häufige HTML Entities</h2>
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 text-xs font-mono text-slate-500 px-4 py-2 border-b border-slate-800">
              <span>Entity</span><span>Zeichen</span><span>Bedeutung</span>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {NAMED.map(([entity, char]) => (
                <div key={entity} className="grid grid-cols-3 px-4 py-1.5 text-sm border-b border-slate-800/40 hover:bg-slate-800/30 transition cursor-pointer"
                  onClick={() => setInput(mode === "encode" ? char : entity)}>
                  <span className="text-cyan-400 font-mono text-xs">{entity}</span>
                  <span className="text-white font-bold">{char}</span>
                  <span className="text-slate-500 text-xs">{entity.slice(1,-1)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
