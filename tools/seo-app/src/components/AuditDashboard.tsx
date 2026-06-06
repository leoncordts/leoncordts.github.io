"use client";

import { useCallback, useState } from "react";
import type { AuditResult, TrafficLight } from "@/lib/seoTypes";
import { useBranding } from "@/lib/useBranding";
import BrandingModal from "./BrandingModal";
import { generateOutreachEmail } from "@/lib/emailGenerator";

interface Props {
  result: AuditResult;
  onReset: () => void;
}

const STATUS_CONFIG: Record<TrafficLight, {
  label: string; bg: string; text: string; border: string; dot: string; impact: string;
}> = {
  red: {
    label: "Kritisch", bg: "bg-red-950/60", text: "text-red-300",
    border: "border-red-700/50", dot: "bg-red-500", impact: "bg-red-950/40 border-red-800/40 text-red-200",
  },
  yellow: {
    label: "Warnung", bg: "bg-yellow-950/60", text: "text-yellow-300",
    border: "border-yellow-700/50", dot: "bg-yellow-400", impact: "bg-yellow-950/40 border-yellow-800/40 text-yellow-200",
  },
  green: {
    label: "Optimal", bg: "bg-green-950/60", text: "text-green-300",
    border: "border-green-700/50", dot: "bg-green-500", impact: "bg-green-950/40 border-green-800/40 text-green-200",
  },
};

function scoreColor(score: number) {
  if (score >= 70) return "text-green-400";
  if (score >= 40) return "text-yellow-400";
  return "text-red-400";
}

function scoreRingColor(score: number) {
  if (score >= 70) return "#22c55e";
  if (score >= 40) return "#facc15";
  return "#ef4444";
}

export default function AuditDashboard({ result, onReset }: Props) {
  const { branding, saveBranding } = useBranding();
  const [showBrandingModal, setShowBrandingModal] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  const emailText = generateOutreachEmail(
    result,
    branding.agencyName || "Ihre Agentur"
  );

  const handleDownload = useCallback(async () => {
    const { generatePDF } = await import("@/lib/pdfGenerator");
    const blob = generatePDF(result, branding.agencyName ? branding : undefined);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const domain = result.url.replace(/^https?:\/\//, "").replace(/[^a-z0-9]/gi, "-");
    a.download = `seo-audit-${domain}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }, [result, branding]);

  const handleCopyEmail = async () => {
    await navigator.clipboard.writeText(emailText);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (result.score / 100) * circumference;
  const hasBranding = !!(branding.agencyName || branding.logoUrl);

  return (
    <>
      {showBrandingModal && (
        <BrandingModal
          current={branding}
          onSave={saveBranding}
          onClose={() => setShowBrandingModal(false)}
        />
      )}

      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Analyse-Ergebnis</p>
            <h2 className="text-slate-200 font-semibold truncate max-w-xs sm:max-w-lg text-sm">
              {result.url}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBrandingModal(true)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition
                ${hasBranding
                  ? "border-indigo-700/60 bg-indigo-950/50 text-indigo-300 hover:border-indigo-500"
                  : "border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-500"
                }`}
            >
              {hasBranding && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />}
              <span>🏷️ Agentur-Branding</span>
            </button>
            <button
              onClick={onReset}
              className="text-sm text-slate-400 hover:text-slate-200 transition underline underline-offset-2"
            >
              Neue Analyse
            </button>
          </div>
        </div>

        {/* Branding-Banner wenn aktiv */}
        {hasBranding && (
          <div className="flex items-center gap-3 px-4 py-3 bg-indigo-950/40 border border-indigo-800/40 rounded-xl">
            {branding.logoUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={branding.logoUrl} alt="Agentur-Logo" className="h-6 object-contain" />
            )}
            <p className="text-indigo-300 text-xs">
              White-Label aktiv: PDFs erscheinen unter <strong>{branding.agencyName}</strong>
            </p>
          </div>
        )}

        {/* Score + Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="col-span-2 sm:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="10" />
              <circle
                cx="50" cy="50" r="40" fill="none"
                stroke={scoreRingColor(result.score)} strokeWidth="10"
                strokeDasharray={circumference} strokeDashoffset={offset}
                strokeLinecap="round" className="transition-all duration-1000"
              />
            </svg>
            <div className="mt-1 text-center -mt-24">
              <span className={`text-4xl font-black ${scoreColor(result.score)}`}>{result.score}</span>
              <span className="text-slate-500 text-lg">/100</span>
            </div>
            <p className="mt-20 text-xs text-slate-500 uppercase tracking-wider">SEO-Score</p>
          </div>

          {[
            { label: "Kritisch", count: result.summary.critical, color: "border-red-800 bg-red-950/40 text-red-400" },
            { label: "Warnungen", count: result.summary.warnings, color: "border-yellow-800 bg-yellow-950/40 text-yellow-400" },
            { label: "Optimal", count: result.summary.passed, color: "border-green-800 bg-green-950/40 text-green-400" },
          ].map(({ label, count, color }) => (
            <div key={label} className={`border ${color} rounded-2xl p-5 flex flex-col items-center justify-center`}>
              <span className="text-4xl font-black">{count}</span>
              <span className="text-xs uppercase tracking-wider mt-1 opacity-70">{label}</span>
            </div>
          ))}
        </div>

        {/* PDF Download button */}
        <button
          onClick={handleDownload}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600
                     hover:from-indigo-500 hover:to-purple-500 active:scale-[0.98]
                     text-white font-semibold text-base transition-all flex items-center justify-center gap-2"
        >
          <span>📄</span>
          <span>PDF-Report herunterladen{hasBranding ? ` (${branding.agencyName})` : ""}</span>
        </button>

        {/* ── Akquise-E-Mail ──────────────────────────────────────────────── */}
        <div className="border border-slate-700/60 rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowEmail((v) => !v)}
            className="w-full flex items-center justify-between p-5 bg-slate-900/80 hover:bg-slate-900 transition text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-lg shrink-0">
                ✉️
              </div>
              <div>
                <p className="text-slate-200 font-semibold text-sm">Automatische Akquise-E-Mail generieren</p>
                <p className="text-slate-500 text-xs mt-0.5">Personalisierte Cold-Outreach-Mail auf Knopfdruck</p>
              </div>
            </div>
            <span className={`text-slate-500 transition-transform duration-200 ${showEmail ? "rotate-180" : ""}`}>
              ▼
            </span>
          </button>

          {showEmail && (
            <div className="p-5 border-t border-slate-800 space-y-4">
              {!branding.agencyName && (
                <div className="flex items-center gap-3 p-3 bg-amber-950/40 border border-amber-800/40 rounded-xl">
                  <span className="text-amber-400 text-sm">⚠️</span>
                  <p className="text-amber-300 text-xs">
                    Tipp: Hinterlege deinen{" "}
                    <button
                      onClick={() => setShowBrandingModal(true)}
                      className="underline font-semibold hover:text-amber-200"
                    >
                      Agentur-Namen im Branding
                    </button>
                    , damit die E-Mail mit deinem Namen signiert wird.
                  </p>
                </div>
              )}

              <textarea
                readOnly
                value={emailText}
                rows={18}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700
                           text-slate-300 text-xs font-mono leading-relaxed
                           focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none"
              />

              <button
                onClick={handleCopyEmail}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2
                  ${emailCopied
                    ? "bg-emerald-700 text-emerald-100"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white"
                  }`}
              >
                <span>{emailCopied ? "✓" : "📋"}</span>
                <span>{emailCopied ? "Kopiert!" : "E-Mail in Zwischenablage kopieren"}</span>
              </button>
            </div>
          )}
        </div>

        {/* ── Checks list ─────────────────────────────────────────────────── */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Detaillierte Prüfung</h3>
          {[...result.checks]
            .sort((a, b) => {
              const o: Record<TrafficLight, number> = { red: 0, yellow: 1, green: 2 };
              return o[a.status] - o[b.status];
            })
            .map((c) => {
              const cfg = STATUS_CONFIG[c.status];
              return (
                <div key={c.id} className={`border ${cfg.border} ${cfg.bg} rounded-xl p-4 flex gap-4`}>
                  <div className="mt-1 shrink-0">
                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <p className={`font-semibold text-sm ${cfg.text}`}>{c.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${cfg.border} ${cfg.text} shrink-0`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs">{c.description}</p>
                    {c.value && (
                      <p className="text-slate-500 text-xs font-mono truncate">
                        Gefunden: &quot;{c.value}&quot;
                      </p>
                    )}
                    <p className={`text-xs ${cfg.text} opacity-80`}>→ {c.recommendation}</p>

                    {/* Business Impact */}
                    {c.status !== "green" && (
                      <div className={`border rounded-lg px-3 py-2 ${cfg.impact}`}>
                        <p className="text-xs font-semibold opacity-60 uppercase tracking-wider mb-1">
                          💰 Geschäftliche Auswirkung
                        </p>
                        <p className="text-xs leading-relaxed">{c.businessImpact}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
}
