"use client";

import { useState } from "react";
import AuditForm from "@/components/seoChecker/AuditForm";
import AuditDashboard from "@/components/seoChecker/AuditDashboard";
import type { AuditResult } from "@/lib/seoChecker/types";

export default function SeoCheckerPage() {
  const [result, setResult] = useState<AuditResult | null>(null);

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-900/25 blur-3xl" />
        <div className="absolute top-1/3 right-0 w-72 h-72 rounded-full bg-purple-900/15 blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 border-b border-slate-800/60 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <a href="https://leoncordts.de" className="flex items-center gap-2 text-slate-300 hover:text-white transition">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://leoncordts.github.io/favicon-32x32.png" alt="leoncordts.de Logo" className="w-7 h-7 rounded-lg" />
            <span className="text-sm font-semibold">leoncordts.de</span>
            <span className="text-slate-600 text-xs">/ Tools / SEO-Checker</span>
          </a>
          <a href="/kontakt"
            className="text-xs px-3 py-1.5 rounded-lg border border-indigo-700/50 text-indigo-300 hover:border-indigo-500 hover:text-indigo-200 transition">
            Kontakt
          </a>
        </div>
      </nav>

      <div className="relative z-10">
        {!result ? (
          /* ── Landingpage ── */
          <div className="flex flex-col items-center px-4 py-16 sm:py-24">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-900/50 border border-indigo-700/50 text-indigo-300 text-xs font-medium mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Kostenlos · Kein Account · Sofortiger Report
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-center max-w-3xl leading-tight">
              <span className="text-white">Wie gut ist dein</span>
              <br />
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Google-Ranking?
              </span>
            </h1>

            <p className="mt-5 text-slate-400 text-center max-w-xl text-base sm:text-lg leading-relaxed">
              Unser kostenloser <strong className="text-slate-300">25+-Punkte-Tiefenscan</strong> analysiert deine Website
              auf alle wichtigen SEO-Faktoren — in Sekunden, ohne Anmeldung.
            </p>

            <div className="mt-10 w-full max-w-2xl">
              <AuditForm onResult={setResult} />
            </div>

            {/* Feature Grid */}
            <div className="mt-16 grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-3xl w-full">
              {[
                { icon: "🔍", title: "25+ Prüfpunkte", desc: "Von Meta-Tags über Schema.org bis robots.txt — umfassend wie ein Profi-Audit." },
                { icon: "🚦", title: "Ampel-System", desc: "Rot, Gelb, Grün — auf einen Blick erkennst du, wo dringender Handlungsbedarf besteht." },
                { icon: "💰", title: "Umsatz-Impact", desc: "Jeder Fehler wird in echten Geschäftsauswirkungen erklärt, nicht als technischer Fachjargon." },
                { icon: "📄", title: "PDF-Report", desc: "Professioneller Bericht zum Drucken, Versenden oder Präsentieren." },
                { icon: "🏢", title: "Schema.org-Check", desc: "LocalBusiness-Markup direkt erkannt — entscheidend für Google Maps-Sichtbarkeit." },
                { icon: "⚡", title: "Sofortergebnis", desc: "Keine Wartezeit, keine E-Mail-Bestätigung, keine Paywall." },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-center">
                  <div className="text-2xl mb-2">{icon}</div>
                  <h3 className="font-semibold text-slate-200 text-sm mb-1">{title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            {/* Social Proof / Trust */}
            <div className="mt-12 flex flex-col items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://leoncordts.github.io/logo.png" alt="Leon Cordts IT Solutions" className="h-10 object-contain opacity-70" />
              <p className="text-slate-500 text-xs">Ihr Partner für IT-Support & Web-Optimierung</p>
            </div>
          </div>
        ) : (
          /* ── Dashboard ── */
          <div className="px-4 py-10 sm:py-14 max-w-4xl mx-auto">
            <AuditDashboard result={result} onReset={() => setResult(null)} />
          </div>
        )}
      </div>

      <footer className="relative z-10 border-t border-slate-800 py-5 text-center text-slate-600 text-xs">
        <p>leoncordts.de SEO-Checker · 25+ Prüfpunkte · 0 € · Powered by cheerio & jsPDF</p>
        <p className="mt-1">© {new Date().getFullYear()} Leon Cordts IT Solutions · <a href="/kontakt" className="hover:text-slate-400 transition">Kontakt</a></p>
      </footer>
    </main>
  );
}
