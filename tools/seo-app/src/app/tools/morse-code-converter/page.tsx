"use client";
import { useState } from "react";

const MORSE: Record<string, string> = {
  A:".-", B:"-...", C:"-.-.", D:"-..", E:".", F:"..-.", G:"--.", H:"....",
  I:"..", J:".---", K:"-.-", L:".-..", M:"--", N:"-.", O:"---", P:".--.",
  Q:"--.-", R:".-.", S:"...", T:"-", U:"..-", V:"...-", W:".--", X:"-..-",
  Y:"-.--", Z:"--..",
  "0":"-----","1":".----","2":"..---","3":"...--","4":"....-","5":".....",
  "6":"-....","7":"--...","8":"---..","9":"----.",
  ".":".-.-.-",",":"--..--","?":"..--..","'":".----.",
  "!":"-.-.--","/":"-..-.","(":"-.--.",")":"-.--.-","&":".-...",
  ":":"---...",";":"-.-.-.","=":"-...-","+":".-.-.","-":"-....-",
  "_":"..--.-",'"':".-..-.",  "$":"...-..-","@":".--.-.","ä":".-.-","ö":"---.","ü":"..--",
};
const REVERSE = Object.fromEntries(Object.entries(MORSE).map(([k,v])=>[v,k]));

function textToMorse(text: string): string {
  return text.toUpperCase().split("").map(c => {
    if (c === " ") return "/";
    return MORSE[c] ?? "?";
  }).join(" ");
}

function morseToText(morse: string): string {
  return morse.trim().split(/\s+\/\s+|\s*\/\s*/).map(word =>
    word.trim().split(/\s+/).map(code => REVERSE[code] ?? "?").join("")
  ).join(" ");
}

export default function MorseCodeConverterPage() {
  const [mode, setMode] = useState<"encode"|"decode">("encode");
  const [input, setInput] = useState("");

  const output = mode === "encode" ? textToMorse(input) : morseToText(input);

  function copy() { navigator.clipboard.writeText(output); }
  function swap() {
    setMode(m => m === "encode" ? "decode" : "encode");
    setInput(output);
  }

  return (
    <main className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800/60 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <a href="/tools" className="text-indigo-400 text-sm hover:text-indigo-300 transition">← Tools</a>
          <span className="text-slate-700">/</span>
          <span className="text-slate-500 text-sm font-mono">morse-code-converter</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-900/30 border border-indigo-700/40 text-indigo-300 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            100% lokal · Kein Upload
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            Morse<span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">code</span>
          </h1>
          <p className="text-slate-400">Text in Morsecode umwandeln — und zurück.</p>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-6">
          {(["encode","decode"] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setInput(""); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${mode === m ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}>
              {m === "encode" ? "Text → Morse" : "Morse → Text"}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <label className="text-xs font-mono text-slate-500 uppercase tracking-wider block mb-2">
              {mode === "encode" ? "Text eingeben" : "Morse eingeben (Leerzeichen zw. Zeichen, / zw. Wörtern)"}
            </label>
            <textarea
              className="w-full bg-transparent text-slate-200 text-sm font-mono resize-none outline-none min-h-[100px] placeholder:text-slate-600"
              placeholder={mode === "encode" ? "Hallo Welt..." : ".... .- .-.. .-.. --- / .-- . .-.. -"}
              value={input}
              onChange={e => setInput(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <button onClick={swap} className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition">
              ⇅ Umkehren
            </button>
            <button onClick={copy} disabled={!output}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-sm font-semibold transition">
              Kopieren
            </button>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <label className="text-xs font-mono text-slate-500 uppercase tracking-wider block mb-2">
              {mode === "encode" ? "Morsecode" : "Text"}
            </label>
            <p className="text-slate-200 text-sm font-mono leading-relaxed min-h-[60px] break-all whitespace-pre-wrap">
              {output || <span className="text-slate-600">Ergebnis erscheint hier…</span>}
            </p>
          </div>
        </div>

        {/* Reference */}
        <details className="mt-8 bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
          <summary className="text-slate-400 text-sm cursor-pointer font-semibold">Morse-Alphabet anzeigen</summary>
          <div className="mt-4 grid grid-cols-4 sm:grid-cols-6 gap-2">
            {Object.entries(MORSE).filter(([k]) => /[A-Z0-9]/.test(k)).map(([char, code]) => (
              <div key={char} className="bg-slate-800/60 rounded-lg px-2 py-1.5 text-center">
                <div className="text-white text-sm font-bold">{char}</div>
                <div className="text-indigo-400 text-xs font-mono">{code}</div>
              </div>
            ))}
          </div>
        </details>
      </div>
    </main>
  );
}
