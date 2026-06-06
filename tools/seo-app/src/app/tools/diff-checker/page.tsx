"use client";

import { useState, useCallback } from "react";
import * as Diff from "diff";

type Mode = "words" | "lines";

export default function DiffCheckerPage() {
  const [original, setOriginal] = useState("");
  const [changed, setChanged] = useState("");
  const [mode, setMode] = useState<Mode>("words");
  const [diffs, setDiffs] = useState<Diff.Change[] | null>(null);

  const runDiff = useCallback(() => {
    if (mode === "words") {
      setDiffs(Diff.diffWords(original, changed));
    } else {
      setDiffs(Diff.diffLines(original, changed));
    }
  }, [original, changed, mode]);

  const stats = diffs
    ? diffs.reduce(
        (acc, part) => {
          const count =
            mode === "words"
              ? part.value.trim().split(/\s+/).filter(Boolean).length
              : (part.count ?? 0);
          if (part.added) acc.added += count;
          if (part.removed) acc.removed += count;
          return acc;
        },
        { added: 0, removed: 0 }
      )
    : null;

  const unit = mode === "words" ? "Wörter" : "Zeilen";

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-900/25 blur-3xl" />
        <div className="absolute top-1/3 right-0 w-72 h-72 rounded-full bg-purple-900/15 blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 border-b border-slate-800/60 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a
            href="https://leoncordts.de"
            className="flex items-center gap-2 text-slate-300 hover:text-white transition"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://leoncordts.github.io/favicon-32x32.png"
              alt="leoncordts.de Logo"
              className="w-7 h-7 rounded-lg"
            />
            <span className="text-sm font-semibold">leoncordts.de</span>
            <span className="text-slate-600 text-xs">/ Tools / Diff-Checker</span>
          </a>
          <a
            href="/kontakt"
            className="text-xs px-3 py-1.5 rounded-lg border border-indigo-700/50 text-indigo-300 hover:border-indigo-500 hover:text-indigo-200 transition"
          >
            Kontakt
          </a>
        </div>
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-900/50 border border-indigo-700/50 text-indigo-300 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Lokal im Browser · Kein Upload · Kostenlos
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-center leading-tight mb-4">
            <span className="text-white">Text</span>
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              {" "}Vergleicher
            </span>
          </h1>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            Füge zwei Texte ein und sieh sofort die Unterschiede — wort- oder zeilenweise.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-6">
          <div className="flex bg-slate-900 border border-slate-700 rounded-xl p-1 gap-1">
            <button
              onClick={() => setMode("words")}
              className={`px-4 py-2 text-sm rounded-lg font-medium transition ${
                mode === "words"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Wörter vergleichen
            </button>
            <button
              onClick={() => setMode("lines")}
              className={`px-4 py-2 text-sm rounded-lg font-medium transition ${
                mode === "lines"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Zeilen vergleichen
            </button>
          </div>
        </div>

        {/* Text areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Originaltext
            </label>
            <textarea
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
              placeholder="Originaltext hier einfügen…"
              rows={12}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none font-mono"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Geänderter Text
            </label>
            <textarea
              value={changed}
              onChange={(e) => setChanged(e.target.value)}
              placeholder="Geänderten Text hier einfügen…"
              rows={12}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none font-mono"
            />
          </div>
        </div>

        {/* Compare Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={runDiff}
            disabled={!original && !changed}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition shadow-lg shadow-indigo-900/30"
          >
            Texte vergleichen
          </button>
        </div>

        {/* Stats */}
        {diffs && stats && (
          <div className="flex justify-center gap-6 mb-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-950/50 border border-green-800/50 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-green-300 text-sm font-medium">
                +{stats.added} {unit} hinzugefügt
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-red-950/50 border border-red-800/50 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-red-300 text-sm font-medium">
                -{stats.removed} {unit} entfernt
              </span>
            </div>
          </div>
        )}

        {/* Diff Result */}
        {diffs ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Ergebnis
            </h2>
            <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap break-words text-slate-200">
              {diffs.map((part, i) => {
                if (part.added) {
                  return (
                    <mark
                      key={i}
                      className="bg-green-900/60 text-green-200 rounded px-0.5 not-italic"
                      style={{ textDecoration: "none" }}
                    >
                      {part.value}
                    </mark>
                  );
                }
                if (part.removed) {
                  return (
                    <mark
                      key={i}
                      className="bg-red-900/60 text-red-300 rounded px-0.5 line-through"
                    >
                      {part.value}
                    </mark>
                  );
                }
                return <span key={i}>{part.value}</span>;
              })}
            </div>
          </div>
        ) : (
          /* Empty state */
          <div className="text-center text-slate-600 py-12 bg-slate-900/30 border border-slate-800/50 rounded-2xl">
            <p className="text-4xl mb-3">⇄</p>
            <p className="text-sm">
              Füge zwei Texte ein und klicke auf &quot;Texte vergleichen&quot;
            </p>
          </div>
        )}
      </div>

      <footer className="relative z-10 border-t border-slate-800 py-5 text-center text-slate-600 text-xs mt-12">
        <p>leoncordts.de Diff-Checker · Wort- &amp; Zeilenvergleich · 0 € · Powered by diff.js</p>
        <p className="mt-1">
          © {new Date().getFullYear()} Leon Cordts IT Solutions ·{" "}
          <a href="/kontakt" className="hover:text-slate-400 transition">
            Kontakt
          </a>
        </p>
      </footer>
    </main>
  );
}
