"use client";

import { useState } from "react";
import type { AuditResult } from "@/lib/seoTypes";

interface Props {
  onResult: (result: AuditResult) => void;
}

export default function AuditForm({ onResult }: Props) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/audit", {
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
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
            🌐
          </span>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://dein-unternehmen.de"
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
          className="px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95
                     text-white font-semibold text-base transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {loading ? "Analysiere…" : "Audit generieren"}
        </button>
      </div>

      {loading && (
        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/30 pulse-ring" />
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-slate-400 text-sm animate-pulse">
            Seite wird analysiert — bitte warten…
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-red-900/40 border border-red-700/50 text-red-300 text-sm">
          {error}
        </div>
      )}
    </form>
  );
}
