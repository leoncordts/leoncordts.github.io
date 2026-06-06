"use client";
import { useState, useMemo, useCallback } from "react";
import zxcvbn from "zxcvbn";

const GERMAN_WORDS = ["Kaffee","Sommer","Hund","Baum","Haus","Stadt","Regen","Wind","Mond","Stern","Feuer","Wasser","Berg","Blume","Nacht"];

function sha1(str: string): Promise<string> {
  const encoder = new TextEncoder();
  return crypto.subtle.digest("SHA-1", encoder.encode(str)).then((buf) =>
    Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase()
  );
}

async function checkHibp(password: string): Promise<number> {
  const hash = await sha1(password);
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);
  const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
  const text = await res.text();
  const line = text.split("\n").find((l) => l.startsWith(suffix));
  return line ? parseInt(line.split(":")[1]) : 0;
}

function calcEntropy(pw: string): number {
  let charset = 0;
  if (/[a-z]/.test(pw)) charset += 26;
  if (/[A-Z]/.test(pw)) charset += 26;
  if (/[0-9]/.test(pw)) charset += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) charset += 32;
  return charset > 0 ? pw.length * Math.log2(charset) : 0;
}

function crackTime(entropy: number): { gpu: string; cluster: string; supercomp: string } {
  const ops = { gpu: 1e10, cluster: 8e10, supercomp: 1e13 };
  const combinations = Math.pow(2, entropy);
  const fmt = (secs: number) => {
    if (secs < 1) return "< 1 Sekunde";
    if (secs < 60) return `${Math.round(secs)} Sekunden`;
    if (secs < 3600) return `${Math.round(secs / 60)} Minuten`;
    if (secs < 86400) return `${Math.round(secs / 3600)} Stunden`;
    if (secs < 31536000) return `${Math.round(secs / 86400)} Tage`;
    if (secs < 3153600000) return `${Math.round(secs / 31536000)} Jahre`;
    return `${(secs / 31536000 / 1e6).toFixed(0)} Mio. Jahre`;
  };
  return {
    gpu: fmt(combinations / ops.gpu / 2),
    cluster: fmt(combinations / ops.cluster / 2),
    supercomp: fmt(combinations / ops.supercomp / 2),
  };
}

const STRENGTH_LABELS = ["Sehr schwach","Schwach","Mittel","Stark","Sehr stark"];
const STRENGTH_COLORS = ["#ef4444","#f97316","#eab308","#22c55e","#00d4ff"];

export default function PasswordCheckerPage() {
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [hibpCount, setHibpCount] = useState<number | null>(null);
  const [hibpLoading, setHibpLoading] = useState(false);
  const [passphrase, setPassphrase] = useState("");
  const [ppCopied, setPpCopied] = useState(false);

  const analysis = useMemo(() => {
    if (!password) return null;
    const z = zxcvbn(password);
    const entropy = calcEntropy(password);
    const times = crackTime(entropy);
    const bsi = [
      { label: "Mindestens 8 Zeichen", ok: password.length >= 8 },
      { label: "Mindestens 12 Zeichen (empfohlen)", ok: password.length >= 12 },
      { label: "Großbuchstaben enthalten", ok: /[A-Z]/.test(password) },
      { label: "Kleinbuchstaben enthalten", ok: /[a-z]/.test(password) },
      { label: "Zahlen enthalten", ok: /[0-9]/.test(password) },
      { label: "Sonderzeichen enthalten", ok: /[^a-zA-Z0-9]/.test(password) },
      { label: "Keine bekannten Wörterbuchworte (laut zxcvbn)", ok: z.score >= 3 },
    ];
    return { z, entropy, times, bsi };
  }, [password]);

  const checkHibpAsync = useCallback(async () => {
    if (!password) return;
    setHibpLoading(true);
    try {
      const count = await checkHibp(password);
      setHibpCount(count);
    } catch {
      setHibpCount(-1);
    } finally {
      setHibpLoading(false);
    }
  }, [password]);

  function generatePassphrase() {
    const words = Array.from({ length: 4 }, () => GERMAN_WORDS[Math.floor(Math.random() * GERMAN_WORDS.length)]);
    const nums = Math.floor(Math.random() * 90 + 10);
    setPassphrase(words.join("-") + "-" + nums);
  }

  function copyPp() {
    navigator.clipboard.writeText(passphrase);
    setPpCopied(true);
    setTimeout(() => setPpCopied(false), 1500);
  }

  const score = analysis?.z.score ?? 0;
  const color = STRENGTH_COLORS[score];

  return (
    <main className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800/60 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" className="text-indigo-400 text-sm hover:text-indigo-300 transition">← Tools</a>
          <span className="text-slate-700">/</span>
          <span className="text-slate-500 text-sm font-mono">password-checker</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Lokale Analyse · k-Anonymität · DSGVO-konform
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            Enterprise <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Password Auditor</span>
          </h1>
          <p className="text-slate-400">Kryptografische Stärkeanalyse, Datenleck-Abgleich und Compliance-Check.</p>
        </div>

        {/* Input */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 mb-6">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">Passwort eingeben</label>
          <div className="flex gap-2">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setHibpCount(null); }}
              placeholder="Passwort hier eingeben…"
              className="flex-1 bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-slate-100 font-mono outline-none transition"
              autoComplete="off"
            />
            <button onClick={() => setShowPw(!showPw)} className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-slate-200 transition text-sm">
              {showPw ? "👁‍🗨" : "👁"}
            </button>
          </div>
          {analysis && (
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1.5 font-mono">
                <span style={{ color }}>Stärke: {STRENGTH_LABELS[score]}</span>
                <span className="text-slate-500">{analysis.entropy.toFixed(1)} Bit Entropie</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(score + 1) * 20}%`, background: color }} />
              </div>
            </div>
          )}
        </div>

        {analysis && (
          <div className="flex flex-col gap-5">
            {/* Crypto strength */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">⚡ Kryptografische Stärke</h2>
              <div className="grid grid-cols-3 gap-3 text-center mb-4">
                {[
                  { label: "RTX 4090", icon: "🖥", time: analysis.times.gpu },
                  { label: "8× RTX 4090", icon: "⚡", time: analysis.times.cluster },
                  { label: "Supercomputer", icon: "🏢", time: analysis.times.supercomp },
                ].map((s) => (
                  <div key={s.label} className="bg-slate-800/60 rounded-xl p-3">
                    <div className="text-xl mb-1">{s.icon}</div>
                    <div className="text-xs text-slate-500 mb-1">{s.label}</div>
                    <div className="text-sm font-bold text-white">{s.time}</div>
                  </div>
                ))}
              </div>
              {analysis.z.feedback.warning && (
                <div className="bg-amber-950/30 border border-amber-700/40 rounded-lg p-3 text-amber-300 text-xs font-mono">
                  ⚠ {analysis.z.feedback.warning}
                </div>
              )}
            </div>

            {/* HIBP */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">🔍 Datenleck-Abgleich (HaveIBeenPwned)</h2>
              <p className="text-slate-500 text-xs mb-4">Dein Passwort verlässt deinen Browser nie vollständig (k-Anonymität: nur die ersten 5 SHA-1-Zeichen werden gesendet).</p>
              {hibpCount === null ? (
                <button onClick={checkHibpAsync} disabled={hibpLoading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition text-sm">
                  {hibpLoading ? "Prüfe…" : "Jetzt auf Datenlecks prüfen"}
                </button>
              ) : hibpCount === -1 ? (
                <div className="text-amber-400 text-sm font-mono">Fehler beim Prüfen — bitte später erneut versuchen.</div>
              ) : hibpCount === 0 ? (
                <div className="bg-green-950/40 border border-green-700/40 rounded-xl p-4 text-green-300 text-sm">✓ Nicht in bekannten Datenlecks gefunden.</div>
              ) : (
                <div className="bg-red-950/40 border border-red-700/50 rounded-xl p-4 text-red-300 text-sm">
                  ⚠️ Dieses Passwort wurde <strong className="text-red-200">{hibpCount.toLocaleString()}×</strong> in Datenlecks gefunden! Sofort ändern.
                </div>
              )}
            </div>

            {/* BSI/NIST Compliance */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">📋 Compliance (BSI TR-02102 / NIST)</h2>
              <div className="flex flex-col gap-2">
                {analysis.bsi.map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${item.ok ? "bg-green-900/60 text-green-400" : "bg-red-900/60 text-red-400"}`}>
                      {item.ok ? "✓" : "✗"}
                    </span>
                    <span className="text-slate-400 text-sm">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Passphrase Generator */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">🎲 Sichere Passphrase (NIST-Standard)</h2>
              <div className="flex gap-3">
                <button onClick={generatePassphrase} className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-xl transition text-sm">
                  Passphrase generieren
                </button>
                {passphrase && (
                  <button onClick={copyPp} className={`px-4 py-2.5 font-semibold rounded-xl transition text-sm ${ppCopied ? "bg-green-600 text-white" : "bg-indigo-600 hover:bg-indigo-500 text-white"}`}>
                    {ppCopied ? "✓" : "Kopieren"}
                  </button>
                )}
              </div>
              {passphrase && (
                <div className="mt-3 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 font-mono text-indigo-300 text-sm break-all">{passphrase}</div>
              )}
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-6 text-center">
              <p className="text-slate-300 text-sm mb-4">
                Unsichere Passwörter sind das Einfallstor Nr. 1 für Ransomware. Schützen Sie Ihre Firmen-Infrastruktur mit einer professionellen IAM-Auditierung.
              </p>
              <a href="/kontakt" className="inline-block px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition text-sm">
                Jetzt Sicherheits-Audit buchen →
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
