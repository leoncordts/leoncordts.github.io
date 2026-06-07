"use client";
import { useState } from "react";

function textToBinary(text: string): string {
  return text.split("").map(c =>
    c.charCodeAt(0).toString(2).padStart(8, "0")
  ).join(" ");
}

function binaryToText(binary: string): string {
  try {
    return binary.trim().split(/\s+/).map(b => {
      const code = parseInt(b, 2);
      if (isNaN(code) || code < 0 || code > 127) return "?";
      return String.fromCharCode(code);
    }).join("");
  } catch {
    return "Ungültige Binäreingabe";
  }
}

function textToHex(text: string): string {
  return text.split("").map(c => c.charCodeAt(0).toString(16).padStart(2,"0")).join(" ");
}

function hexToText(hex: string): string {
  try {
    return hex.trim().split(/\s+/).map(h => String.fromCharCode(parseInt(h, 16))).join("");
  } catch {
    return "Ungültige Hex-Eingabe";
  }
}

type Mode = "text-bin" | "bin-text" | "text-hex" | "hex-text";

const MODES: { id: Mode; label: string }[] = [
  { id: "text-bin", label: "Text → Binär" },
  { id: "bin-text", label: "Binär → Text" },
  { id: "text-hex", label: "Text → Hex" },
  { id: "hex-text", label: "Hex → Text" },
];

export default function BinaryTextPage() {
  const [mode, setMode] = useState<Mode>("text-bin");
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  function convert(text: string): string {
    switch (mode) {
      case "text-bin": return textToBinary(text);
      case "bin-text": return binaryToText(text);
      case "text-hex": return textToHex(text);
      case "hex-text": return hexToText(text);
    }
  }

  const output = input ? convert(input) : "";

  function copy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const placeholders: Record<Mode, string> = {
    "text-bin": "Hallo Welt",
    "bin-text": "01001000 01100001 01101100 01101100 01101111",
    "text-hex": "Hello",
    "hex-text": "48 65 6c 6c 6f",
  };

  return (
    <main className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800/60 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <a href="/tools" className="text-emerald-400 text-sm hover:text-emerald-300 transition">← Tools</a>
          <span className="text-slate-700">/</span>
          <span className="text-slate-500 text-sm font-mono">binary-text</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-900/30 border border-emerald-700/40 text-emerald-300 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            100% lokal · Live
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            Binär <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Konverter</span>
          </h1>
          <p className="text-slate-400">Text ↔ Binär ↔ Hexadezimal umwandeln.</p>
        </div>

        {/* Mode selector */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {MODES.map(m => (
            <button key={m.id} onClick={() => { setMode(m.id); setInput(""); }}
              className={`py-2.5 rounded-xl text-sm font-semibold transition ${mode === m.id ? "bg-emerald-700 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}>
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <label className="text-xs font-mono text-slate-500 uppercase tracking-wider block mb-2">Eingabe</label>
            <textarea
              className="w-full bg-transparent text-slate-200 text-sm font-mono resize-none outline-none min-h-[100px] placeholder:text-slate-600"
              placeholder={placeholders[mode]}
              value={input}
              onChange={e => setInput(e.target.value)}
            />
          </div>

          <button onClick={copy} disabled={!output}
            className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-600 text-white font-semibold transition">
            {copied ? "Kopiert!" : "Ergebnis kopieren"}
          </button>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <label className="text-xs font-mono text-slate-500 uppercase tracking-wider block mb-2">Ergebnis</label>
            <p className="text-emerald-300 text-sm font-mono leading-relaxed min-h-[60px] break-all whitespace-pre-wrap">
              {output || <span className="text-slate-600">Ergebnis erscheint hier…</span>}
            </p>
          </div>

          {mode === "text-bin" && input && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
              <p className="text-xs font-mono text-slate-500 mb-3 uppercase tracking-wider">Zeichen-Aufschlüsselung</p>
              <div className="flex flex-wrap gap-2">
                {input.slice(0,20).split("").map((c, i) => (
                  <div key={i} className="text-center bg-slate-800 rounded-lg px-2 py-1">
                    <div className="text-white text-xs font-bold">{c === " " ? "SPC" : c}</div>
                    <div className="text-emerald-400 text-[9px] font-mono">{c.charCodeAt(0).toString(2).padStart(8,"0")}</div>
                    <div className="text-slate-500 text-[9px]">{c.charCodeAt(0)}</div>
                  </div>
                ))}
                {input.length > 20 && <div className="text-slate-500 text-xs self-center">+{input.length-20} mehr</div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
