"use client";

import { useState, useCallback, useEffect } from "react";

const CHARSETS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  digits: "0123456789",
  special: "!@#$%^&*()_+-=[]{}|;:,.<>?",
} as const;

type CharsetKey = keyof typeof CHARSETS;

function generatePassword(
  length: number,
  opts: Record<CharsetKey, boolean>
): string {
  const activePools = (Object.keys(CHARSETS) as CharsetKey[]).filter(
    (k) => opts[k]
  );
  if (activePools.length === 0) return "";

  const pools = activePools.map((k) => CHARSETS[k]);
  const combined = pools.join("");

  // Random indices for guaranteed chars + rest
  const totalNeeded = length + pools.length;
  const randBuf = new Uint32Array(totalNeeded);
  crypto.getRandomValues(randBuf);

  // Guarantee at least one char from each active pool
  const guaranteed = pools.map((pool, i) => pool[randBuf[length + i] % pool.length]);

  // Fill the rest from combined charset
  const rest: string[] = [];
  for (let i = 0; i < length - guaranteed.length; i++) {
    rest.push(combined[randBuf[i] % combined.length]);
  }

  // Fisher-Yates shuffle with crypto
  const all = [...guaranteed, ...rest];
  const shuffleBuf = new Uint32Array(all.length);
  crypto.getRandomValues(shuffleBuf);
  for (let i = all.length - 1; i > 0; i--) {
    const j = shuffleBuf[i] % (i + 1);
    [all[i], all[j]] = [all[j], all[i]];
  }

  return all.join("");
}

function getStrength(pw: string): { label: string; color: string; pct: number } {
  if (pw.length === 0) return { label: "–", color: "#475569", pct: 0 };
  if (pw.length < 10) return { label: "Schwach", color: "#ef4444", pct: 20 };
  if (pw.length < 14) return { label: "Mittel", color: "#f97316", pct: 45 };
  if (pw.length < 20) return { label: "Stark", color: "#eab308", pct: 70 };
  if (pw.length < 32) return { label: "Sehr stark", color: "#22c55e", pct: 88 };
  return { label: "Extrem stark", color: "#a78bfa", pct: 100 };
}

const TOGGLE_LABELS: { key: CharsetKey; label: string; example: string }[] = [
  { key: "upper", label: "Großbuchstaben", example: "A–Z" },
  { key: "lower", label: "Kleinbuchstaben", example: "a–z" },
  { key: "digits", label: "Zahlen", example: "0–9" },
  { key: "special", label: "Sonderzeichen", example: "!@#…" },
];

export default function PasswordGeneratorPage() {
  const [length, setLength] = useState(16);
  const [opts, setOpts] = useState<Record<CharsetKey, boolean>>({
    upper: true,
    lower: true,
    digits: true,
    special: true,
  });
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    setPassword(generatePassword(length, opts));
  }, [length, opts]);

  useEffect(() => {
    generate();
  }, [generate]);

  function toggle(key: CharsetKey) {
    const next = { ...opts, [key]: !opts[key] };
    // Don't allow disabling all
    if (Object.values(next).every((v) => !v)) return;
    setOpts(next);
  }

  function handleCopy() {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const strength = getStrength(password);
  const noneActive = Object.values(opts).every((v) => !v);
  const sliderPct = ((length - 8) / (64 - 8)) * 100;

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
            <span className="text-slate-600 text-xs">/ Tools / Passwort-Generator</span>
          </a>
          <a
            href="/kontakt"
            className="text-xs px-3 py-1.5 rounded-lg border border-indigo-700/50 text-indigo-300 hover:border-indigo-500 hover:text-indigo-200 transition"
          >
            Kontakt
          </a>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-4 py-12 sm:py-20">
        {/* Badge */}
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-900/50 border border-indigo-700/50 text-indigo-300 text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Kryptografisch sicher · Kein Server · 100 % lokal
        </span>

        <h1 className="text-4xl sm:text-5xl font-black text-center max-w-2xl leading-tight mb-3">
          <span className="text-white">Sicherer</span>{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Passwort-Generator
          </span>
        </h1>
        <p className="text-slate-400 text-center max-w-lg text-sm sm:text-base leading-relaxed mb-10">
          Generiert starke Passwörter mit{" "}
          <strong className="text-slate-300">crypto.getRandomValues()</strong> —
          direkt im Browser, ohne Datenübertragung.
        </p>

        {/* Main card */}
        <div className="w-full max-w-lg bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">

          {/* Warning if all disabled (shouldn't happen but guard) */}
          {noneActive && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-900/30 border border-red-700/50 text-red-300 text-sm text-center">
              Bitte mindestens einen Zeichensatz aktivieren.
            </div>
          )}

          {/* Password display */}
          <div className="flex items-stretch gap-3 mb-5">
            <div className="flex-1 min-h-[72px] flex items-center justify-center rounded-xl bg-slate-950 border border-slate-700/60 px-4 py-4 font-mono text-base sm:text-lg text-slate-100 break-all text-center tracking-wide select-all">
              {password || "—"}
            </div>
            <button
              onClick={generate}
              title="Neu generieren"
              className="px-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition text-xl"
            >
              ↻
            </button>
          </div>

          {/* Strength bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-1.5 text-xs font-mono">
              <span className="text-slate-500">Stärke</span>
              <span style={{ color: strength.color }} className="font-semibold">
                {strength.label}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${strength.pct}%`, backgroundColor: strength.color }}
              />
            </div>
          </div>

          {/* Length slider */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Länge
              </label>
              <span className="text-sm font-mono font-bold text-indigo-300">
                {length} Zeichen
              </span>
            </div>
            <input
              type="range"
              min={8}
              max={64}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #818cf8 0%, #818cf8 ${sliderPct}%, #1e293b ${sliderPct}%, #1e293b 100%)`,
              }}
            />
            <div className="flex justify-between text-xs font-mono text-slate-600 mt-1">
              <span>8</span>
              <span>64</span>
            </div>
          </div>

          {/* Toggle switches */}
          <div className="mb-7 divide-y divide-slate-800/60">
            {TOGGLE_LABELS.map(({ key, label, example }) => (
              <div key={key} className="flex items-center justify-between py-3">
                <div>
                  <span className="text-sm text-slate-300">{label}</span>
                  <span className="ml-2 text-xs text-slate-500 font-mono">({example})</span>
                </div>
                <button
                  role="switch"
                  aria-checked={opts[key]}
                  onClick={() => toggle(key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    opts[key]
                      ? "bg-indigo-600 border-indigo-500"
                      : "bg-slate-700 border-slate-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      opts[key] ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleCopy}
              disabled={!password}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                copied
                  ? "bg-green-700/40 border border-green-600/50 text-green-300"
                  : "bg-indigo-600/30 border border-indigo-600/50 text-indigo-200 hover:bg-indigo-600/50 hover:border-indigo-500"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {copied ? "✓ Kopiert!" : "Passwort kopieren"}
            </button>
            <button
              onClick={generate}
              className="w-full py-3 rounded-xl text-sm font-semibold bg-slate-800/60 border border-slate-700 text-slate-300 hover:bg-slate-700/80 hover:text-white transition"
            >
              ↻ Neu generieren
            </button>
          </div>
        </div>

        {/* Info cards */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg w-full">
          {[
            { icon: "🔐", title: "Kryptografisch sicher", desc: "Ausschließlich crypto.getRandomValues() — kein Math.random()." },
            { icon: "🚫", title: "Kein Server", desc: "Alles passiert lokal im Browser. Kein Passwort verlässt dein Gerät." },
            { icon: "✅", title: "Garantierte Vielfalt", desc: "Mindestens 1 Zeichen aus jeder aktivierten Kategorie." },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-center">
              <div className="text-2xl mb-2">{icon}</div>
              <h3 className="font-semibold text-slate-200 text-sm mb-1">{title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 py-5 text-center text-slate-600 text-xs">
        <p>leoncordts.de Passwort-Generator · 100 % lokal · Kein Tracking · crypto.getRandomValues()</p>
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
