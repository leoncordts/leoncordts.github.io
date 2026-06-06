"use client";

import { CATEGORY_META } from "@/lib/agbFilter/redFlags";
import type { AnalysisResult, MatchResult } from "@/lib/agbFilter/analyzer";

interface Props {
  result: AnalysisResult;
  onReset: () => void;
}

function RiskMeter({ score, label }: { score: number; label: string }) {
  const color =
    score <= 15
      ? "bg-emerald-500"
      : score <= 40
      ? "bg-yellow-500"
      : score <= 70
      ? "bg-orange-500"
      : "bg-red-500";

  const textColor =
    score <= 15
      ? "text-emerald-400"
      : score <= 40
      ? "text-yellow-400"
      : score <= 70
      ? "text-orange-400"
      : "text-red-400";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">Risiko-Score</span>
        <span className={`font-black text-lg ${textColor}`}>
          {score}/100 — {label}
        </span>
      </div>
      <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function MatchCard({ match }: { match: MatchResult }) {
  const meta = CATEGORY_META[match.category];
  const severityBadge =
    match.severity === "high"
      ? "bg-red-900/60 text-red-300 border-red-700/50"
      : match.severity === "medium"
      ? "bg-orange-900/60 text-orange-300 border-orange-700/50"
      : "bg-yellow-900/60 text-yellow-300 border-yellow-700/50";

  const highlightContext = (ctx: string, matched: string) => {
    const idx = ctx.toLowerCase().indexOf(matched.toLowerCase());
    if (idx === -1) return ctx;
    return (
      <>
        {ctx.slice(0, idx)}
        <mark className="bg-red-500/30 text-red-200 rounded px-0.5 not-italic">
          {ctx.slice(idx, idx + matched.length)}
        </mark>
        {ctx.slice(idx + matched.length)}
      </>
    );
  };

  return (
    <div className={`rounded-2xl border p-5 ${meta.bg} ${meta.border}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{meta.emoji}</span>
          <span className={`font-semibold text-sm ${meta.color}`}>
            {match.label}
          </span>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${severityBadge}`}
        >
          {match.severity === "high"
            ? "Kritisch"
            : match.severity === "medium"
            ? "Warnung"
            : "Hinweis"}
        </span>
      </div>

      <blockquote className="text-slate-300 text-sm italic border-l-2 border-slate-600 pl-3 mb-3 leading-relaxed">
        „{highlightContext(match.context, match.matchedText)}"
      </blockquote>

      <p className="text-slate-400 text-xs leading-relaxed">
        ⚠️ {match.explanation}
      </p>
    </div>
  );
}

export default function ResultDashboard({ result, onReset }: Props) {
  const categories = (
    ["kosten", "datenschutz", "nutzungsrechte"] as const
  ).map((cat) => ({
    key: cat,
    meta: CATEGORY_META[cat],
    matches: result.matches.filter((m) => m.category === cat),
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">
            Scan-Ergebnis
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">
            {result.totalMatches === 0
              ? "Keine Red Flags gefunden."
              : `${result.totalMatches} Red Flag${result.totalMatches !== 1 ? "s" : ""} gefunden`}
          </p>
        </div>
        <button
          onClick={onReset}
          className="text-xs px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200 transition"
        >
          ← Neues Dokument
        </button>
      </div>

      {/* Risk Meter */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <RiskMeter score={result.riskScore} label={result.riskLabel} />
        <div className="grid grid-cols-3 gap-4 mt-5">
          {[
            { label: "Kritisch", count: result.highCount, color: "text-red-400" },
            { label: "Warnung", count: result.mediumCount, color: "text-orange-400" },
            { label: "Hinweis", count: result.lowCount, color: "text-yellow-400" },
          ].map(({ label, count, color }) => (
            <div key={label} className="text-center">
              <div className={`text-2xl font-black ${color}`}>{count}</div>
              <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* No findings */}
      {result.totalMatches === 0 && (
        <div className="text-center py-16 bg-emerald-950/30 border border-emerald-800/40 rounded-2xl">
          <div className="text-5xl mb-3">✅</div>
          <h3 className="text-emerald-400 font-bold text-lg">Keine Treffer</h3>
          <p className="text-slate-400 text-sm mt-2 max-w-sm mx-auto">
            In diesem Dokument wurden keine bekannten Red Flags gefunden. Das
            bedeutet nicht, dass das Dokument problemlos ist — lies es trotzdem
            kritisch.
          </p>
        </div>
      )}

      {/* Findings by category */}
      {categories.map(({ key, meta, matches }) =>
        matches.length === 0 ? null : (
          <section key={key}>
            <h3 className={`font-bold text-sm mb-3 ${meta.color}`}>
              {meta.emoji} {meta.label}{" "}
              <span className="text-slate-500 font-normal">
                ({matches.length} Treffer)
              </span>
            </h3>
            <div className="space-y-3">
              {matches.map((m, i) => (
                <MatchCard key={`${m.flagId}-${i}`} match={m} />
              ))}
            </div>
          </section>
        )
      )}

      {/* CTA */}
      <div className="bg-gradient-to-br from-blue-950/60 to-teal-950/60 border border-blue-800/40 rounded-2xl p-6 text-center space-y-4">
        <div className="text-3xl">🛡️</div>
        <h3 className="text-white font-bold text-lg leading-snug">
          Genervt davon, dass Unternehmen heimlich deine Daten abgreifen?
        </h3>
        <p className="text-slate-300 text-sm leading-relaxed max-w-xl mx-auto">
          Hol dir deine digitale Privatsphäre zurück. Ich richte dein Heimnetzwerk
          in Köln sicher ein, blockiere Tracker systemweit mit einem Pi-hole und
          schütze deine Geräte vor Spionage.
        </p>
        <a
          href="/kontakt"
          className="inline-block px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition shadow-lg shadow-blue-900/40"
        >
          Privates IT-Setup mit Leon Cordts IT Solutions vereinbaren →
        </a>
      </div>
    </div>
  );
}
