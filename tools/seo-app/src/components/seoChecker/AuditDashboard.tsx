"use client";

import { useCallback } from "react";
import type { AuditResult, Category, TrafficLight } from "@/lib/seoChecker/types";

interface Props {
  result: AuditResult;
  onReset: () => void;
}

const STATUS_CFG: Record<TrafficLight, { label: string; bg: string; text: string; border: string; dot: string; impactBg: string }> = {
  red: { label: "Kritisch", bg: "bg-red-950/60", text: "text-red-300", border: "border-red-700/50", dot: "bg-red-500", impactBg: "bg-red-950/40 border-red-800/40 text-red-200" },
  yellow: { label: "Warnung", bg: "bg-yellow-950/60", text: "text-yellow-300", border: "border-yellow-700/50", dot: "bg-yellow-400", impactBg: "bg-yellow-950/40 border-yellow-800/40 text-yellow-200" },
  green: { label: "Optimal", bg: "bg-green-950/60", text: "text-green-300", border: "border-green-700/50", dot: "bg-green-500", impactBg: "" },
};

function ringColor(s: number) { return s >= 70 ? "#22c55e" : s >= 40 ? "#eab308" : "#ef4444"; }
function textColor(s: number) { return s >= 70 ? "text-green-400" : s >= 40 ? "text-yellow-400" : "text-red-400"; }

export default function AuditDashboard({ result, onReset }: Props) {
  const handleDownload = useCallback(async () => {
    const { generatePDF } = await import("@/lib/seoChecker/pdfGenerator");
    const blob = generatePDF(result);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `seo-tiefenscan-${result.url.replace(/^https?:\/\//, "").replace(/[^a-z0-9]/gi, "-")}.pdf`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [result]);

  const circ = 2 * Math.PI * 40;
  const offset = circ - (result.score / 100) * circ;
  const categories = [...new Set(result.checks.map((c) => c.category))] as Category[];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">{result.totalChecks}-Punkte-Tiefenscan · Ergebnis</p>
          <h2 className="text-slate-200 font-semibold truncate max-w-xs sm:max-w-lg text-sm">{result.url}</h2>
        </div>
        <button onClick={onReset} className="text-sm text-slate-400 hover:text-slate-200 transition underline underline-offset-2">
          Neue Analyse
        </button>
      </div>

      {/* Score + Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="col-span-2 sm:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="10" />
            <circle cx="50" cy="50" r="40" fill="none" stroke={ringColor(result.score)} strokeWidth="10"
              strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000" />
          </svg>
          <div className="mt-1 text-center -mt-24">
            <span className={`text-4xl font-black ${textColor(result.score)}`}>{result.score}</span>
            <span className="text-slate-500 text-lg">/100</span>
          </div>
          <p className="mt-20 text-xs text-slate-500 uppercase tracking-wider">SEO-Score</p>
        </div>
        {([
          { label: "Kritisch", count: result.summary.critical, color: "border-red-800 bg-red-950/40 text-red-400" },
          { label: "Warnungen", count: result.summary.warnings, color: "border-yellow-800 bg-yellow-950/40 text-yellow-400" },
          { label: "Optimal", count: result.summary.passed, color: "border-green-800 bg-green-950/40 text-green-400" },
        ] as const).map(({ label, count, color }) => (
          <div key={label} className={`border ${color} rounded-2xl p-5 flex flex-col items-center justify-center`}>
            <span className="text-4xl font-black">{count}</span>
            <span className="text-xs uppercase tracking-wider mt-1 opacity-70">{label}</span>
          </div>
        ))}
      </div>

      {/* PDF Download */}
      <button onClick={handleDownload}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600
                   hover:from-indigo-500 hover:to-purple-500 active:scale-[0.98]
                   text-white font-semibold text-base transition-all flex items-center justify-center gap-2">
        <span>📄</span>
        <span>Vollständigen PDF-Tiefenscan herunterladen ({result.totalChecks} Prüfpunkte)</span>
      </button>

      {/* ── CTA Box ──────────────────────────────────────────────────────── */}
      {(result.summary.critical > 0 || result.summary.warnings > 0) && (
        <div className="relative overflow-hidden rounded-2xl border border-indigo-700/50 bg-gradient-to-br from-indigo-950/80 to-purple-950/60 p-6">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-indigo-600/20 blur-2xl pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-600/50 flex items-center justify-center text-2xl shrink-0">
              🚀
            </div>
            <div className="flex-1">
              <p className="text-indigo-200 font-bold text-base mb-1">
                {result.summary.critical + result.summary.warnings} Problem{result.summary.critical + result.summary.warnings !== 1 ? "e" : ""} gefunden? Lass sie uns gemeinsam beheben!
              </p>
              <p className="text-slate-400 text-sm leading-relaxed">
                Buche jetzt ein <strong className="text-indigo-300">kostenloses 15-Minuten-Erstgespräch</strong> mit Leon Cordts IT Solutions und erhalte einen konkreten Maßnahmenplan für deine Website.
              </p>
            </div>
            <a
              href="/kontakt"
              className="shrink-0 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95
                         text-white font-semibold text-sm transition-all whitespace-nowrap"
            >
              Jetzt Termin buchen →
            </a>
          </div>
        </div>
      )}

      {/* ── Kategorie-Übersicht ───────────────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">Ergebnis nach Kategorien</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {categories.map((cat) => {
            const catChecks = result.checks.filter((c) => c.category === cat);
            const catScore = Math.round(
              (catChecks.filter((c) => c.status === "green").length * 100 +
               catChecks.filter((c) => c.status === "yellow").length * 50) /
              catChecks.length
            );
            const catColor = catScore >= 70 ? "border-green-800/50 bg-green-950/30" : catScore >= 40 ? "border-yellow-800/50 bg-yellow-950/30" : "border-red-800/50 bg-red-950/30";
            const scoreText = catScore >= 70 ? "text-green-400" : catScore >= 40 ? "text-yellow-400" : "text-red-400";
            return (
              <div key={cat} className={`border ${catColor} rounded-xl p-3`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-slate-300 font-medium text-xs">{cat}</p>
                  <span className={`font-bold text-sm ${scoreText}`}>{catScore}%</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="text-red-400">{catChecks.filter((c) => c.status === "red").length}×</span>
                  <span className="text-yellow-400">{catChecks.filter((c) => c.status === "yellow").length}×</span>
                  <span className="text-green-400">{catChecks.filter((c) => c.status === "green").length}×</span>
                  <span className="ml-auto">{catChecks.length} Checks</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Check-Liste ───────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Alle {result.totalChecks} Prüfpunkte im Detail</h3>
        {[...result.checks].sort((a, b) => {
          const o: Record<TrafficLight, number> = { red: 0, yellow: 1, green: 2 };
          return o[a.status] - o[b.status];
        }).map((c) => {
          const cfg = STATUS_CFG[c.status];
          return (
            <div key={c.id} className={`border ${cfg.border} ${cfg.bg} rounded-xl p-4 flex gap-3`}>
              <div className="mt-1 shrink-0">
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <span className="text-slate-500 text-xs">{c.category} · </span>
                    <span className={`font-semibold text-sm ${cfg.text}`}>{c.title}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${cfg.border} ${cfg.text} shrink-0`}>{cfg.label}</span>
                </div>
                <p className="text-slate-400 text-xs">{c.description}</p>
                {c.value && <p className="text-slate-500 text-xs font-mono truncate">Gefunden: &quot;{c.value}&quot;</p>}
                <p className={`text-xs ${cfg.text} opacity-80`}>→ {c.recommendation}</p>
                {c.status !== "green" && c.businessImpact && (
                  <div className={`border rounded-lg px-3 py-2 ${cfg.impactBg}`}>
                    <p className="text-xs font-semibold opacity-60 uppercase tracking-wider mb-0.5">💰 Geschäftliche Auswirkung</p>
                    <p className="text-xs leading-relaxed">{c.businessImpact}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="border border-slate-700 rounded-2xl p-6 text-center bg-slate-900/50">
        <p className="text-slate-300 font-semibold mb-1">Bereit, deine SEO zu verbessern?</p>
        <p className="text-slate-500 text-sm mb-4">Leon Cordts IT Solutions hilft lokalen Unternehmen, online sichtbarer zu werden.</p>
        <a href="/kontakt"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition text-white font-semibold text-sm">
          <span>📅</span> Kostenloses Erstgespräch buchen
        </a>
        <p className="text-slate-600 text-xs mt-3">Ein kostenloses Tool von leoncordts.de · Ihr Partner für IT-Support & Web-Optimierung</p>
      </div>
    </div>
  );
}
