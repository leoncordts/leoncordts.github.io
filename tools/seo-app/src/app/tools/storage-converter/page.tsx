"use client";

import { useState, useCallback } from "react";

// ── Unit definitions ──────────────────────────────────────────────────────────

const DECIMAL_UNITS = [
  { label: "Byte",  key: "byte_d", factor: 1 },
  { label: "KB",    key: "kb",     factor: 1_000 },
  { label: "MB",    key: "mb",     factor: 1_000_000 },
  { label: "GB",    key: "gb",     factor: 1_000_000_000 },
  { label: "TB",    key: "tb",     factor: 1_000_000_000_000 },
  { label: "PB",    key: "pb",     factor: 1_000_000_000_000_000 },
] as const;

const BINARY_UNITS = [
  { label: "Byte",  key: "byte_b", factor: 1 },
  { label: "KiB",   key: "kib",    factor: 1024 },
  { label: "MiB",   key: "mib",    factor: 1024 ** 2 },
  { label: "GiB",   key: "gib",    factor: 1024 ** 3 },
  { label: "TiB",   key: "tib",    factor: 1024 ** 4 },
  { label: "PiB",   key: "pib",    factor: 1024 ** 5 },
] as const;

type UnitKey =
  | (typeof DECIMAL_UNITS)[number]["key"]
  | (typeof BINARY_UNITS)[number]["key"];

type Fields = Record<UnitKey, string>;

const EMPTY_FIELDS: Fields = {
  byte_d: "", kb: "", mb: "", gb: "", tb: "", pb: "",
  byte_b: "", kib: "", mib: "", gib: "", tib: "", pib: "",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatValue(bytes: number, factor: number): string {
  const v = bytes / factor;
  if (!isFinite(v)) return "";
  // Strip trailing zeros up to 6 decimal places
  const s = v.toFixed(6);
  return parseFloat(s).toString();
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function StorageConverterPage() {
  const [fields, setFields] = useState<Fields>(EMPTY_FIELDS);

  const handleChange = useCallback(
    (key: UnitKey, factor: number, raw: string) => {
      if (raw.trim() === "") {
        setFields(EMPTY_FIELDS);
        return;
      }

      const num = parseFloat(raw);
      if (isNaN(num) || num < 0) {
        setFields((prev) => ({ ...prev, [key]: raw }));
        return;
      }

      const bytes = num * factor;

      const next: Fields = { ...EMPTY_FIELDS };
      next[key] = raw; // keep raw while typing
      for (const u of DECIMAL_UNITS) {
        if (u.key !== key) next[u.key] = formatValue(bytes, u.factor);
      }
      for (const u of BINARY_UNITS) {
        if (u.key !== key) next[u.key] = formatValue(bytes, u.factor);
      }
      setFields(next);
    },
    []
  );

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-green-900/20 blur-3xl" />
        <div className="absolute top-1/3 right-0 w-72 h-72 rounded-full bg-blue-900/15 blur-3xl" />
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
            <span className="text-slate-600 text-xs">/ Tools / Speicher-Konverter</span>
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
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-900/40 border border-green-700/50 text-green-300 text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Echtzeit-Konvertierung · Dezimal &amp; Binär
        </span>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-center max-w-2xl leading-tight mb-3">
          <span className="text-white">Digitaler</span>{" "}
          <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            Speichergrößen-Konverter
          </span>
        </h1>

        <p className="text-slate-400 text-center max-w-xl text-sm sm:text-base leading-relaxed mb-10">
          Trage einen Wert in ein beliebiges Feld ein — alle anderen aktualisieren sich sofort.
          Links{" "}
          <span className="text-green-400 font-semibold">Dezimal (1 000er-Basis)</span>, rechts{" "}
          <span className="text-blue-400 font-semibold">Binär (1 024er-Basis)</span>.
        </p>

        {/* Converter grid */}
        <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Decimal column */}
          <div className="bg-slate-900/70 border border-green-800/40 rounded-2xl p-6">
            <h2 className="text-green-400 font-bold text-sm uppercase tracking-widest mb-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              Dezimal (Basis 1 000)
            </h2>
            <div className="flex flex-col gap-4">
              {DECIMAL_UNITS.map((u) => (
                <div key={u.key}>
                  <label className="block text-slate-400 text-xs mb-1">{u.label}</label>
                  <input
                    type="number"
                    min="0"
                    value={fields[u.key]}
                    onChange={(e) => handleChange(u.key, u.factor, e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-800/80 border border-slate-700 hover:border-green-700/60 focus:border-green-500 focus:ring-1 focus:ring-green-500/30 rounded-lg px-3 py-2 text-slate-100 text-sm outline-none transition placeholder-slate-600"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Binary column */}
          <div className="bg-slate-900/70 border border-blue-800/40 rounded-2xl p-6">
            <h2 className="text-blue-400 font-bold text-sm uppercase tracking-widest mb-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              Binär (Basis 1 024)
            </h2>
            <div className="flex flex-col gap-4">
              {BINARY_UNITS.map((u) => (
                <div key={u.key}>
                  <label className="block text-slate-400 text-xs mb-1">{u.label}</label>
                  <input
                    type="number"
                    min="0"
                    value={fields[u.key]}
                    onChange={(e) => handleChange(u.key, u.factor, e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-800/80 border border-slate-700 hover:border-blue-700/60 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 rounded-lg px-3 py-2 text-slate-100 text-sm outline-none transition placeholder-slate-600"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reset button */}
        <button
          onClick={() => setFields(EMPTY_FIELDS)}
          className="mt-6 text-xs text-slate-500 hover:text-slate-300 transition underline underline-offset-2"
        >
          Alle Felder leeren
        </button>

        {/* Info box */}
        <div className="mt-10 w-full max-w-3xl bg-slate-900/50 border border-slate-800 rounded-xl p-5 text-xs text-slate-500 leading-relaxed">
          <p>
            <span className="text-slate-300 font-semibold">Dezimal</span> (SI-Einheiten wie KB, MB, GB) verwenden Potenzen
            von 1 000 — Standard bei Festplatten-Herstellern und Netzwerkgeschwindigkeiten.
          </p>
          <p className="mt-2">
            <span className="text-slate-300 font-semibold">Binär</span> (IEC-Einheiten wie KiB, MiB, GiB) verwenden
            Potenzen von 1 024 — Standard in Betriebssystemen, RAM-Angaben und Dateisystemen.
          </p>
        </div>
      </div>

      <footer className="relative z-10 border-t border-slate-800 py-5 text-center text-slate-600 text-xs">
        <p>leoncordts.de Speicher-Konverter · Dezimal &amp; Binär · Kostenlos &amp; ohne Anmeldung</p>
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
