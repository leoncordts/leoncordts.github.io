"use client";

import { useState } from "react";
import type { AuditResult } from "@/lib/seoChecker/types";

interface Props {
  onResult: (r: AuditResult) => void;
}

const STEPS = [
  "Seite wird aufgerufen…",
  "HTML analysieren…",
  "Meta-Tags prüfen…",
  "Struktur analysieren…",
  "Technik & Sicherheit prüfen…",
  "robots.txt abrufen…",
  "Schema.org prüfen…",
  "Bericht wird generiert…",
];

export default function AuditForm({ onResult }: Props) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setStep(0);

    const interval = setInterval(() => {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, 700);

    try {
      const res = await fetch("/api/tools/seo-checker/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Fehler beim Audit");
      onResult(data as AuditResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none select-none">
            🌐
          </span>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://deine-website.de"
            required
            disabled={loading}
            className="w-full pl-10 pr-4 py-4 rounded-xl bg-slate-800 border border-slate-700
                       text-slate-100 placeholder-slate-500 text-base
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                       disabled:opacity-50 transition"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="px-7 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95
                     text-white font-semibold text-base transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {loading ? "Analysiere…" : "Jetzt analysieren"}
        </button>
      </div>

      {loading && (
        <div className="mt-8 flex flex-col items-center gap-5">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping" />
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-indigo-300 font-medium text-sm">{STEPS[step]}</p>
            <p className="text-slate-500 text-xs mt-1">25+ Prüfpunkte werden analysiert…</p>
          </div>
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 w-6 rounded-full transition-all duration-500 ${i <= step ? "bg-indigo-500" : "bg-slate-700"}`}
              />
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-red-950/50 border border-red-700/50 text-red-300 text-sm">
          ⚠️ {error}
        </div>
      )}
    </form>
  );
}
