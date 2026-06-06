'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { ScanResult, TerminalLine, SecurityCheck } from '@/lib/securityAuditor/types';

// ── Helpers ────────────────────────────────────────────────────────────────
type Phase = 'idle' | 'loading' | 'animating' | 'done';

const LINE_COLORS: Record<TerminalLine['type'], string> = {
  info:    'text-slate-400',
  secure:  'text-green-400',
  warning: 'text-yellow-400',
  critical:'text-red-400',
  header:  'text-cyan-400',
  divider: 'text-blue-300',
  final:   'text-white font-bold',
};

const LINE_DELAY: Record<TerminalLine['type'], number> = {
  info:    55,
  secure:  55,
  warning: 70,
  critical:90,
  header:  140,
  divider: 200,
  final:   300,
};

// ── Sub-components ─────────────────────────────────────────────────────────
function ScoreRing({ score, grade }: { score: number; grade: string }) {
  const [animated, setAnimated] = useState(false);
  const radius = 60;
  const circ = 2 * Math.PI * radius;
  const offset = animated ? circ - (score / 100) * circ : circ;
  const col = score >= 70 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444';

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg viewBox="0 0 160 160" className="w-44 h-44" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="80" cy="80" r={radius} fill="none" stroke="#071422" strokeWidth="14" />
        <circle cx="80" cy="80" r={radius} fill="none" stroke={col} strokeWidth="14"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 12px ${col}90)`, transition: 'stroke-dashoffset 1.8s cubic-bezier(0.34,1.56,0.64,1)' }} />
      </svg>
      <div className="absolute text-center" style={{ transform: 'rotate(0deg)' }}>
        <div className="font-mono font-bold text-4xl text-white leading-none" style={{ textShadow: `0 0 24px ${col}80` }}>{score}</div>
        <div className="font-mono text-[10px] text-slate-500 mt-0.5">/100</div>
        <div className="font-mono font-bold text-lg mt-1" style={{ color: col }}>{grade}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: SecurityCheck['status'] }) {
  const map = {
    secure:   { label: 'SICHER',    cls: 'bg-green-500/15 text-green-400 border-green-500/30' },
    warning:  { label: 'WARNUNG',   cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
    critical: { label: 'KRITISCH',  cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
  } as const;
  const { label, cls } = map[status];
  return (
    <span className={`shrink-0 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full border tracking-wider ${cls}`}>
      {label}
    </span>
  );
}

function CheckCard({ ch }: { ch: SecurityCheck }) {
  const [open, setOpen] = useState(false);
  const borderCol = ch.status === 'secure' ? 'border-green-500/20' : ch.status === 'warning' ? 'border-yellow-500/20' : 'border-red-500/30';
  const icon = ch.status === 'secure' ? '✓' : ch.status === 'warning' ? '⚠' : '✗';
  const iconCol = ch.status === 'secure' ? 'text-green-400' : ch.status === 'warning' ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className={`rounded-xl border bg-[#071422] ${borderCol} transition-all duration-200 hover:border-opacity-50`}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-4 text-left">
        <span className={`font-mono font-bold text-sm shrink-0 ${iconCol}`}>{icon}</span>
        <span className="text-sm text-slate-200 flex-1 leading-snug">{ch.title}</span>
        {ch.value && (
          <span className="font-mono text-[10px] text-slate-500 shrink-0 hidden sm:block truncate max-w-[120px]">{ch.value}</span>
        )}
        <StatusBadge status={ch.status} />
        <span className={`ml-1 text-slate-600 transition-transform duration-200 text-xs shrink-0 ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-2 border-t border-white/5 pt-3">
          <p className="text-xs text-slate-400 leading-relaxed">{ch.description}</p>
          {ch.status !== 'secure' && (
            <>
              <div className="flex items-start gap-2">
                <span className="font-mono text-[10px] text-cyan-400 shrink-0 mt-0.5">EMPFEHLUNG</span>
                <p className="text-xs text-slate-300 leading-relaxed">{ch.recommendation}</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-[10px] text-orange-400 shrink-0 mt-0.5">IMPACT</span>
                <p className="text-xs text-slate-400 leading-relaxed">{ch.businessImpact}</p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function SecurityAuditorPage() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [displayed, setDisplayed] = useState<TerminalLine[]>([]);
  const [error, setError] = useState('');
  const termRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-scroll terminal
  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
  }, [displayed]);

  // Animate terminal lines
  useEffect(() => {
    if (phase !== 'animating' || !result) return;
    let i = 0;
    const next = () => {
      if (i >= result.terminalLines.length) { setPhase('done'); return; }
      const line = result.terminalLines[i];
      setDisplayed(prev => [...prev, line]);
      i++;
      animRef.current = setTimeout(next, LINE_DELAY[line.type]);
    };
    next();
    return () => { if (animRef.current) clearTimeout(animRef.current); };
  }, [phase, result]);

  const runScan = useCallback(async () => {
    if (!url.trim()) return;
    setError('');
    setResult(null);
    setDisplayed([]);
    setPhase('loading');
    try {
      const res = await fetch('/api/tools/security-auditor/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Scan fehlgeschlagen');
      setResult(data);
      setPhase('animating');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unbekannter Fehler');
      setPhase('idle');
    }
  }, [url]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') runScan();
  };

  const exportPDF = async () => {
    if (!result) return;
    const { generateSecurityPDF } = await import('@/lib/securityAuditor/pdfReport');
    generateSecurityPDF(result);
  };

  const reset = () => {
    setPhase('idle');
    setResult(null);
    setDisplayed([]);
    setUrl('');
    setError('');
  };

  const scoreCol = result
    ? result.score >= 70 ? '#22c55e' : result.score >= 50 ? '#eab308' : '#ef4444'
    : '#00d4ff';

  const categories = result
    ? [...new Set(result.checks.map(ch => ch.category))]
    : [];

  return (
    <div className="min-h-screen bg-[#020b18] text-slate-300" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050d1a]/95 backdrop-blur border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto" style={{ filter: 'drop-shadow(0 0 6px rgba(0,212,255,0.4))' }} />
            <span className="font-bold text-white text-sm hidden sm:block" style={{ fontFamily: "'Syne', sans-serif" }}>Leon Cordts – IT Solutions</span>
          </a>
          <div className="flex items-center gap-5">
            <a href="/#leistungen" className="text-sm text-slate-400 hover:text-white transition-colors">Leistungen</a>
            <a href="/tools/" className="text-sm text-cyan-400 hover:text-white transition-colors">Tools</a>
            <a href="/#kontakt" className="px-4 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] text-white hover:to-[#00d4ff] transition-all"
              style={{ boxShadow: '0 0 16px rgba(14,165,233,0.35)' }}>
              Kontakt
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero / Form ── */}
      <section className="relative pt-28 pb-12 px-6 overflow-hidden"
        style={{ background: 'linear-gradient(180deg,#020b18 0%,#050d1a 100%)' }}>
        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(14,165,233,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(14,165,233,0.04) 1px,transparent 1px)',
          backgroundSize: '48px 48px',
        }} />
        {/* Orbs */}
        <div className="absolute top-16 -left-32 w-96 h-96 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle,#ef4444,transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute top-24 -right-24 w-80 h-80 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle,#0ea5e9,transparent 70%)', filter: 'blur(80px)' }} />

        <div className="max-w-3xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-mono tracking-widest"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            SECURITY AUDIT SYSTEM v2.0 — AKTIV
          </div>
          <h1 className="font-bold text-4xl sm:text-5xl text-white mb-4 leading-tight"
            style={{ fontFamily: "'Syne', sans-serif", textShadow: '0 0 40px rgba(239,68,68,0.3)' }}>
            Website<span style={{ color: '#00d4ff' }}> Security</span> Auditor
          </h1>
          <p className="text-slate-400 text-base sm:text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            Tiefer Sicherheits-Scan in Sekunden — SSL/TLS, HTTP-Header, Information Disclosure, DNS Blacklists.<br />
            <span className="text-slate-500 text-sm">Passiv &amp; legal. Keine Installation. 100% kostenlos.</span>
          </p>

          {/* URL Input */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <input
              type="text" value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="beispiel.de oder https://beispiel.de"
              disabled={phase === 'loading' || phase === 'animating'}
              className="flex-1 rounded-xl px-5 py-3.5 text-sm outline-none transition-all duration-200"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                background: '#071422',
                border: '1px solid rgba(14,165,233,0.25)',
                color: '#e2e8f0',
                boxShadow: 'inset 0 0 0 0 transparent',
              }}
              onFocus={e => { e.target.style.border = '1px solid rgba(0,212,255,0.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,212,255,0.08)'; }}
              onBlur={e => { e.target.style.border = '1px solid rgba(14,165,233,0.25)'; e.target.style.boxShadow = 'none'; }}
            />
            <button
              onClick={runScan}
              disabled={!url.trim() || phase === 'loading' || phase === 'animating'}
              className="px-6 py-3.5 rounded-xl font-bold text-sm text-[#020b18] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              style={{
                fontFamily: "'Syne', sans-serif",
                background: phase === 'loading' || phase === 'animating'
                  ? 'rgba(0,212,255,0.4)'
                  : 'linear-gradient(135deg,#0284c7,#00d4ff)',
                boxShadow: '0 0 24px rgba(0,212,255,0.35)',
              }}>
              {phase === 'loading' ? '⟳  Scanning...' : phase === 'animating' ? '⟳  Analysiere...' : '▶  Scan starten'}
            </button>
          </div>

          {error && (
            <p className="mt-4 text-red-400 text-sm font-mono">✗ {error}</p>
          )}

          {/* Feature tags */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {['SSL/TLS-Tiefenprüfung','HTTP-Security-Header','Information Disclosure','DNS Blacklist Check','Security Score','PDF-Report'].map(tag => (
              <span key={tag} className="font-mono text-[10px] px-3 py-1 rounded-full tracking-wide"
                style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)', color: '#38bdf8' }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Terminal ── */}
      {(phase === 'loading' || phase === 'animating' || phase === 'done') && (
        <section className="px-6 pb-6">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(14,165,233,0.2)', boxShadow: '0 0 40px rgba(0,212,255,0.06)' }}>
              {/* Terminal bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-[#071422] border-b border-white/5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
                <span className="font-mono text-xs text-slate-500 ml-3">security-audit@leon-cordts ~ terminal</span>
                {phase === 'loading' && (
                  <span className="ml-auto font-mono text-xs text-cyan-400 animate-pulse">● Verbinde...</span>
                )}
                {phase === 'animating' && (
                  <span className="ml-auto font-mono text-xs text-yellow-400 animate-pulse">● Scanning...</span>
                )}
                {phase === 'done' && (
                  <span className="ml-auto font-mono text-xs text-green-400">● Abgeschlossen</span>
                )}
              </div>
              {/* Terminal body */}
              <div ref={termRef}
                className="p-4 overflow-y-auto space-y-0.5"
                style={{ background: '#030c17', minHeight: '220px', maxHeight: '420px', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', lineHeight: '1.6' }}>
                {phase === 'loading' && displayed.length === 0 && (
                  <div className="text-cyan-400 animate-pulse">
                    {'> '}Initiating secure connection to target...
                    <span className="inline-block w-2 h-3 bg-cyan-400 ml-1 animate-pulse" style={{ verticalAlign: 'text-bottom' }} />
                  </div>
                )}
                {displayed.map((line, i) => (
                  <div key={i} className={LINE_COLORS[line.type]}>
                    {line.text || ' '}
                  </div>
                ))}
                {phase === 'animating' && (
                  <div className="text-slate-500 animate-pulse">
                    <span className="inline-block w-2 h-3 bg-slate-500" style={{ verticalAlign: 'text-bottom' }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Results Dashboard ── */}
      {phase === 'done' && result && (
        <section className="px-6 pb-12">
          <div className="max-w-5xl mx-auto space-y-8">

            {/* Score overview */}
            <div className="rounded-2xl p-6 sm:p-8"
              style={{ background: 'linear-gradient(135deg,#071422,#050d1a)', border: '1px solid rgba(14,165,233,0.15)', boxShadow: '0 8px 48px rgba(0,212,255,0.06)' }}>
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <ScoreRing score={result.score} grade={result.grade} />
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="font-bold text-2xl text-white mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
                    Security Score: <span style={{ color: scoreCol }}>{result.score}/100</span>
                  </h2>
                  <p className="text-slate-400 text-sm mb-5">{result.domain} · {result.ip ?? 'IP unbekannt'} · {new Date(result.scannedAt).toLocaleString('de-DE')}</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Kritisch', val: result.summary.critical, col: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)' },
                      { label: 'Warnungen', val: result.summary.warnings, col: '#eab308', bg: 'rgba(234,179,8,0.08)', border: 'rgba(234,179,8,0.25)' },
                      { label: 'Bestanden', val: result.summary.passed, col: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.25)' },
                    ].map(s => (
                      <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                        <div className="font-bold text-3xl" style={{ color: s.col, fontFamily: "'Syne', sans-serif" }}>{s.val}</div>
                        <div className="font-mono text-[10px] text-slate-500 mt-1 tracking-wide">{s.label.toUpperCase()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Actions */}
              <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-white/5">
                <button onClick={exportPDF}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-[#020b18] transition-all"
                  style={{ background: 'linear-gradient(135deg,#0284c7,#00d4ff)', boxShadow: '0 0 20px rgba(0,212,255,0.3)', fontFamily: "'Syne', sans-serif" }}>
                  ↓ PDF-Report herunterladen
                </button>
                <button onClick={reset}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  ↺ Neuer Scan
                </button>
              </div>
            </div>

            {/* Checks grouped by category */}
            {categories.map(cat => (
              <div key={cat}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg,rgba(0,212,255,0.3),transparent)' }} />
                  <span className="font-mono text-xs tracking-widest uppercase text-cyan-400">{cat}</span>
                  <div className="h-px flex-1" style={{ background: 'linear-gradient(270deg,rgba(0,212,255,0.3),transparent)' }} />
                </div>
                <div className="space-y-2">
                  {result.checks.filter(ch => ch.category === cat).map(ch => (
                    <CheckCard key={ch.id} ch={ch} />
                  ))}
                </div>
              </div>
            ))}

            {/* CTA */}
            {result.summary.critical > 0 || result.summary.warnings > 0 ? (
              <div className="rounded-2xl p-7 sm:p-9 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg,#1c0606,#120303)', border: '1px solid rgba(239,68,68,0.35)', boxShadow: '0 0 60px rgba(239,68,68,0.08)' }}>
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 pointer-events-none"
                  style={{ background: 'radial-gradient(circle,#ef4444,transparent 70%)', filter: 'blur(60px)', transform: 'translate(30%,-30%)' }} />
                <div className="relative z-10">
                  <div className="font-mono text-xs text-red-400 tracking-widest uppercase mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                    SICHERHEITSALARM — HANDLUNG ERFORDERLICH
                  </div>
                  <h3 className="font-bold text-2xl text-white mb-3" style={{ fontFamily: "'Syne', sans-serif" }}>
                    {result.summary.critical} kritische Lücken gefährden dein Business.
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-2xl">
                    Jede offene Sicherheitslücke ist ein offenes Eingangstor für Angreifer. Cyberkriminelle scannen automatisch Millionen von Websites täglich — deine Domain könnte bereits auf ihren Listen stehen. Lass Leon Cordts diese Lücken professionell schließen, bevor es zu spät ist.
                  </p>
                  <a href="/#kontakt"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm text-white transition-all"
                    style={{ fontFamily: "'Syne', sans-serif", background: 'linear-gradient(135deg,#dc2626,#ef4444)', boxShadow: '0 0 28px rgba(239,68,68,0.4)' }}>
                    ⚡ Express Security-Check buchen
                  </a>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl p-7 sm:p-9 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg,#061c10,#030c17)', border: '1px solid rgba(34,197,94,0.25)', boxShadow: '0 0 40px rgba(34,197,94,0.05)' }}>
                <div className="font-mono text-xs text-green-400 tracking-widest uppercase mb-3">
                  ✓ SECURITY-BASELINE ERFÜLLT
                </div>
                <h3 className="font-bold text-2xl text-white mb-3" style={{ fontFamily: "'Syne', sans-serif" }}>
                  Gute Sicherheitsbasis — weiter so!
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-5 max-w-2xl">
                  Deine Website besteht die grundlegenden Sicherheitschecks. Professionelle IT-Security geht jedoch tiefer: Penetrationstest, Schwachstellenanalyse und laufendes Monitoring sichern deinen Erfolg langfristig.
                </p>
                <a href="/#kontakt"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-[#020b18] transition-all"
                  style={{ fontFamily: "'Syne', sans-serif", background: 'linear-gradient(135deg,#16a34a,#22c55e)', boxShadow: '0 0 20px rgba(34,197,94,0.3)' }}>
                  Security dauerhaft absichern →
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Features (when idle) ── */}
      {phase === 'idle' && (
        <section className="px-6 pb-16">
          <div className="max-w-5xl mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
              {[
                { icon: '🔒', title: 'SSL/TLS-Prüfung', desc: 'Zertifikat, Ablaufdatum, HTTPS-Redirect' },
                { icon: '🛡️', title: 'HTTP-Header', desc: 'HSTS, CSP, X-Frame, XCTO, Referrer-Policy' },
                { icon: '🔍', title: 'Information Disclosure', desc: '.env, .git, phpinfo, wp-config, Backups' },
                { icon: '🌐', title: 'DNS & Reputation', desc: 'Spamhaus, SpamCop, IP-Blacklist-Check' },
              ].map(f => (
                <div key={f.title} className="rounded-xl p-5"
                  style={{ background: '#071422', border: '1px solid rgba(14,165,233,0.15)' }}>
                  <div className="text-2xl mb-3">{f.icon}</div>
                  <div className="font-bold text-white text-sm mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>{f.title}</div>
                  <div className="text-slate-500 text-xs leading-relaxed">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-mono text-xs text-slate-600">© {new Date().getFullYear()} Leon Cordts IT Solutions · leoncordts.de</span>
          <div className="flex gap-4">
            <a href="/tools/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Alle Tools</a>
            <a href="/#kontakt" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Kontakt</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
