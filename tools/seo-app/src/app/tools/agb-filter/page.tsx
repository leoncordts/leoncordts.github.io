"use client";

import { useState, useRef } from "react";
import { analyzeText, type AnalysisResult } from "@/lib/agbFilter/analyzer";
import ResultDashboard from "@/components/agbFilter/ResultDashboard";

const EXAMPLE_SNIPPET = `Diese Vereinbarung verlängert sich automatisch um weitere 12 Monate, sofern Sie nicht spätestens 30 Tage vor Ablauf schriftlich kündigen. Wir behalten uns vor, Preise und Gebühren jederzeit anzupassen. Durch die Nutzung unseres Dienstes räumen Sie uns eine weltweite, unwiderrufliche, kostenlose und exklusive Lizenz ein, Ihre hochgeladenen Inhalte zu verwenden, zu vervielfältigen und zu vermarkten. Ihre Daten können zu Werbezwecken an Partnerunternehmen und verbundene Unternehmen weitergegeben werden. Geräteinformationen werden ausgelesen, um personalisierte Angebote zu erstellen. Änderungen dieser Bedingungen können jederzeit vorgenommen werden; die weitere Nutzung gilt als Zustimmung.`;

export default function AgbFilterPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleScan() {
    if (!text.trim() || text.trim().length < 50) return;
    setScanning(true);
    // Yield to browser so the button state updates before sync work
    requestAnimationFrame(() => {
      const res = analyzeText(text);
      setResult(res);
      setScanning(false);
    });
  }

  function handleExample() {
    setText(EXAMPLE_SNIPPET);
    textareaRef.current?.focus();
  }

  if (result) {
    return (
      <main className="min-h-screen bg-slate-950">
        <AgbNav />
        <div className="relative z-10 max-w-3xl mx-auto px-4 py-10 sm:py-14">
          <ResultDashboard result={result} onReset={() => setResult(null)} />
        </div>
        <AgbFooter />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-blue-900/20 blur-3xl" />
        <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-teal-900/15 blur-3xl" />
      </div>

      <AgbNav />

      <div className="relative z-10 flex-1 flex flex-col items-center px-4 py-12 sm:py-20">
        {/* Badge */}
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-900/50 border border-blue-700/50 text-blue-300 text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          100% Lokal · Kein Server · DSGVO-konform
        </span>

        {/* Hero */}
        <div className="text-center max-w-2xl">
          <div className="text-6xl mb-4">🛡️</div>
          <h1 className="text-4xl sm:text-5xl font-black leading-tight">
            <span className="text-white">AGB & Cookie</span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
              Bullshit-Filter
            </span>
          </h1>
          <p className="mt-5 text-slate-400 text-base sm:text-lg leading-relaxed">
            Kopiere Nutzungsbedingungen oder Cookie-Richtlinien in das Feld
            unten. Das Tool findet versteckte <strong className="text-slate-300">Kostenfallen</strong>,{" "}
            <strong className="text-slate-300">Datenweitergabe</strong> und{" "}
            <strong className="text-slate-300">Rechteabtretungen</strong> —
            vollständig lokal in deinem Browser.
          </p>
        </div>

        {/* Privacy badge */}
        <div className="mt-8 flex items-center gap-3 bg-emerald-950/50 border border-emerald-800/40 rounded-xl px-5 py-3 text-sm text-emerald-300">
          <span className="text-xl">🔒</span>
          <span>
            <strong>100% Privat:</strong> Dein Text wird nur auf deinem Gerät
            analysiert und verlässt niemals deinen Browser.
          </span>
        </div>

        {/* Input area */}
        <div className="mt-10 w-full max-w-2xl space-y-3">
          <label className="text-slate-400 text-sm font-medium" htmlFor="agb-input">
            AGB- oder Datenschutztext einfügen
          </label>
          <textarea
            id="agb-input"
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Kopiere hier den Text der Nutzungsbedingungen oder Datenschutzerklärung hinein…"
            rows={10}
            className="w-full bg-slate-900/80 border border-slate-700 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-2xl px-5 py-4 text-slate-200 text-sm leading-relaxed placeholder:text-slate-600 outline-none resize-y transition"
          />
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleExample}
              className="text-xs text-slate-500 hover:text-slate-300 underline underline-offset-2 transition"
            >
              Beispiel laden
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600">
                {text.trim().length} Zeichen
              </span>
              <button
                type="button"
                onClick={handleScan}
                disabled={text.trim().length < 50 || scanning}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-semibold text-sm transition shadow-lg shadow-blue-900/30 disabled:shadow-none"
              >
                {scanning ? "Scanne…" : "🔍 Dokument scannen"}
              </button>
            </div>
          </div>
          {text.trim().length > 0 && text.trim().length < 50 && (
            <p className="text-red-400 text-xs">
              Bitte mindestens 50 Zeichen eingeben.
            </p>
          )}
        </div>

        {/* Feature cards */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full">
          {[
            {
              emoji: "🔴",
              title: "Kostenfallen",
              desc: "Automatische Verlängerungen, versteckte Gebühren, Stornoklauseln",
            },
            {
              emoji: "🟠",
              title: "Datenweitergabe",
              desc: "Drittanbieter, Tracking, Gerätefingerprinting, Drittlandtransfer",
            },
            {
              emoji: "🟡",
              title: "Rechteabtretung",
              desc: "Exklusivlizenzen, Urheberrecht, Verwertung deiner Inhalte",
            },
          ].map(({ emoji, title, desc }) => (
            <div
              key={title}
              className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-center"
            >
              <div className="text-2xl mb-2">{emoji}</div>
              <h3 className="font-semibold text-slate-200 text-sm mb-1">{title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <AgbFooter />
    </main>
  );
}

function AgbNav() {
  return (
    <nav className="relative z-10 border-b border-slate-800/60 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
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
          <span className="text-slate-600 text-xs">/ Tools / AGB-Filter</span>
        </a>
        <a
          href="/kontakt"
          className="text-xs px-3 py-1.5 rounded-lg border border-blue-700/50 text-blue-300 hover:border-blue-500 hover:text-blue-200 transition"
        >
          Kontakt
        </a>
      </div>
    </nav>
  );
}

function AgbFooter() {
  return (
    <footer className="relative z-10 border-t border-slate-800 py-5 text-center text-slate-600 text-xs">
      <p>
        AGB & Cookie-Bullshit-Filter · 100% lokal · 0 € · Keine Datenweitergabe
      </p>
      <p className="mt-1">
        © {new Date().getFullYear()} Leon Cordts IT Solutions ·{" "}
        <a href="/kontakt" className="hover:text-slate-400 transition">
          Kontakt
        </a>
      </p>
    </footer>
  );
}
