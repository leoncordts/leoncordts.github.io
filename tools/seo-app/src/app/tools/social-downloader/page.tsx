'use client';

import { useState, useCallback, useRef } from 'react';

// ── Platform detection ──────────────────────────────────────────────────────
type Platform = 'tiktok' | 'instagram' | 'twitter' | 'facebook';

interface PlatformConfig {
  id: Platform;
  label: string;
  icon: string;           // FontAwesome class
  color: string;          // brand color
  glow: string;           // glow rgba
  bg: string;             // card bg
  border: string;
  detected: string;       // detection message
  getUrl: (url: string) => string;
}

const PLATFORMS: PlatformConfig[] = [
  {
    id: 'tiktok',
    label: 'TikTok',
    icon: 'fa-brands fa-tiktok',
    color: '#ee1d52',
    glow: 'rgba(238,29,82,0.35)',
    bg: 'rgba(238,29,82,0.08)',
    border: 'rgba(238,29,82,0.3)',
    detected: 'TikTok-Video erkannt',
    getUrl: (url) => `https://snaptik.app/?url=${encodeURIComponent(url)}`,
  },
  {
    id: 'instagram',
    label: 'Instagram',
    icon: 'fa-brands fa-instagram',
    color: '#e1306c',
    glow: 'rgba(225,48,108,0.35)',
    bg: 'rgba(225,48,108,0.08)',
    border: 'rgba(225,48,108,0.3)',
    detected: 'Instagram-Video erkannt',
    getUrl: (url) => `https://snapinsta.app/?url=${encodeURIComponent(url)}`,
  },
  {
    id: 'twitter',
    label: 'X / Twitter',
    icon: 'fa-brands fa-x-twitter',
    color: '#e7e9ea',
    glow: 'rgba(231,233,234,0.2)',
    bg: 'rgba(231,233,234,0.06)',
    border: 'rgba(231,233,234,0.2)',
    detected: 'X / Twitter-Video erkannt',
    getUrl: (url) => `https://ssstwitter.com/?url=${encodeURIComponent(url)}`,
  },
  {
    id: 'facebook',
    label: 'Facebook',
    icon: 'fa-brands fa-facebook',
    color: '#1877f2',
    glow: 'rgba(24,119,242,0.35)',
    bg: 'rgba(24,119,242,0.08)',
    border: 'rgba(24,119,242,0.3)',
    detected: 'Facebook-Video erkannt',
    getUrl: (url) => `https://fdown.net/?url=${encodeURIComponent(url)}`,
  },
];

function detectPlatform(url: string): Platform | null {
  if (/tiktok\.com|vm\.tiktok\.com/i.test(url)) return 'tiktok';
  if (/instagram\.com|instagr\.am/i.test(url)) return 'instagram';
  if (/twitter\.com|x\.com|t\.co/i.test(url)) return 'twitter';
  if (/facebook\.com|fb\.watch|fb\.com/i.test(url)) return 'facebook';
  return null;
}

// ── Component ───────────────────────────────────────────────────────────────
export default function SocialDownloaderPage() {
  const [url, setUrl] = useState('');
  const [detected, setDetected] = useState<Platform | null>(null);
  const [animating, setAnimating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const analyse = useCallback((value: string) => {
    const platform = detectPlatform(value.trim());
    if (platform && platform !== detected) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 600);
    }
    setDetected(platform);
  }, [detected]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    analyse(e.target.value);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text');
    setTimeout(() => analyse(pasted), 0);
  };

  const handleClear = () => {
    setUrl('');
    setDetected(null);
    inputRef.current?.focus();
  };

  const cfg = detected ? PLATFORMS.find(p => p.id === detected)! : null;
  const downloadUrl = cfg ? cfg.getUrl(url) : '#';

  return (
    <div className="min-h-screen bg-[#020b18] text-slate-300" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Inline styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@400;500&display=swap');
        @keyframes pulseGlow { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes slideUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes detectPop { 0%{transform:scale(0.88);opacity:0} 60%{transform:scale(1.04)} 100%{transform:scale(1);opacity:1} }
        .anim-slide-up { animation: slideUp 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .anim-detect   { animation: detectPop 0.55s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .platform-card { transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease; }
        .platform-card.active { transform: translateY(-4px); }
        .dl-btn { transition: box-shadow 0.2s ease, transform 0.15s ease; }
        .dl-btn:hover { transform: translateY(-2px); }
        .dl-btn:active { transform: translateY(0); }
      `}</style>

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050d1a]/95 backdrop-blur border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto"
              style={{ filter: 'drop-shadow(0 0 6px rgba(0,212,255,0.4))' }} />
            <span className="font-bold text-white text-sm hidden sm:block"
              style={{ fontFamily: "'Syne', sans-serif" }}>Leon Cordts – IT Solutions</span>
          </a>
          <div className="flex items-center gap-5">
            <a href="/#leistungen" className="text-sm text-slate-400 hover:text-white transition-colors">Leistungen</a>
            <a href="/tools/" className="text-sm text-cyan-400 hover:text-white transition-colors">Tools</a>
            <a href="/#kontakt"
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] text-white hover:to-[#00d4ff] transition-all"
              style={{ boxShadow: '0 0 16px rgba(14,165,233,0.35)' }}>
              Kontakt
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-28 pb-10 px-6 overflow-hidden">
        {/* Radial spotlight */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(14,165,233,0.07) 0%, transparent 70%)',
        }} />
        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(14,165,233,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(14,165,233,0.04) 1px,transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

        <div className="max-w-2xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 text-xs font-mono tracking-widest"
            style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.2)', color: '#38bdf8' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            100% Kostenlos · Kein Account nötig
          </div>

          <h1 className="font-bold text-4xl sm:text-5xl text-white mb-3 leading-tight"
            style={{ fontFamily: "'Syne', sans-serif", textShadow: '0 0 60px rgba(14,165,233,0.25)' }}>
            Social Media<br /><span style={{ color: '#00d4ff' }}>Downloader</span>
          </h1>
          <p className="text-slate-400 text-base mb-8 max-w-lg mx-auto leading-relaxed">
            Videos von TikTok, Instagram, X und Facebook in Sekunden herunterladen — ohne Wasserzeichen, ohne Anmeldung.
          </p>
        </div>
      </section>

      {/* ── Main Tool ── */}
      <section className="px-6 pb-10">
        <div className="max-w-2xl mx-auto space-y-5">

          {/* Input */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden transition-all duration-300"
              style={{
                background: '#071422',
                border: cfg ? `1.5px solid ${cfg.border}` : '1.5px solid rgba(14,165,233,0.2)',
                boxShadow: cfg ? `0 0 32px ${cfg.glow}` : '0 0 0 transparent',
              }}>
              {/* Platform color strip */}
              {cfg && (
                <div className="absolute top-0 left-0 right-0 h-0.5 transition-all duration-500"
                  style={{ background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)` }} />
              )}

              <div className="flex items-center gap-3 p-2 pl-4">
                {/* Platform icon or default */}
                {cfg ? (
                  <i className={`${cfg.icon} text-xl shrink-0`} style={{ color: cfg.color }} />
                ) : (
                  <i className="fa-solid fa-link text-slate-600 shrink-0" />
                )}

                <input
                  ref={inputRef}
                  type="text"
                  value={url}
                  onChange={handleChange}
                  onPaste={handlePaste}
                  placeholder="Video-Link hier einfügen (TikTok, Instagram, X, Facebook)..."
                  className="flex-1 bg-transparent outline-none text-sm text-slate-200 placeholder-slate-600 py-3"
                  style={{ fontFamily: "'JetBrains Mono', monospace", minWidth: 0 }}
                  autoComplete="off"
                  spellCheck={false}
                />

                {url && (
                  <button onClick={handleClear}
                    className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all text-xs">
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Detection badge + Download button */}
          {detected && cfg && url.trim() && (
            <div className={`space-y-4 ${animating ? 'anim-detect' : 'anim-slide-up'}`}>
              {/* Detected badge */}
              <div className="flex items-center justify-center gap-3 py-3 rounded-xl"
                style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                <i className={`${cfg.icon} text-lg`} style={{ color: cfg.color }} />
                <span className="font-mono text-sm font-bold" style={{ color: cfg.color }}>
                  ✓ {cfg.detected}
                </span>
              </div>

              {/* Download button */}
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="dl-btn flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-bold text-base text-white"
                style={{
                  fontFamily: "'Syne', sans-serif",
                  background: `linear-gradient(135deg, ${cfg.color}dd, ${cfg.color})`,
                  boxShadow: `0 0 32px ${cfg.glow}, 0 4px 20px rgba(0,0,0,0.3)`,
                }}>
                <i className="fa-solid fa-cloud-arrow-down text-xl" />
                Video jetzt herunterladen
                <i className="fa-solid fa-arrow-up-right-from-square text-sm opacity-70" />
              </a>

              <p className="text-center font-mono text-[11px] text-slate-600">
                Du wirst zu einem sicheren Dritt-Anbieter weitergeleitet · Kein Datenspeichern
              </p>
            </div>
          )}

          {/* Hint when no URL */}
          {!url && (
            <p className="text-center font-mono text-xs text-slate-600">
              ↑ Einfach den Link aus der App kopieren und hier einfügen
            </p>
          )}

          {/* Invalid URL hint */}
          {url.trim() && !detected && (
            <div className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm text-slate-500"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <i className="fa-solid fa-circle-question text-slate-600" />
              Plattform nicht erkannt — unterstützt: TikTok, Instagram, X, Facebook
            </div>
          )}

          {/* Platform icons */}
          <div className="grid grid-cols-4 gap-3 pt-2">
            {PLATFORMS.map(p => (
              <div key={p.id}
                className={`platform-card rounded-xl py-4 flex flex-col items-center gap-2 cursor-default select-none ${detected === p.id ? 'active' : ''}`}
                style={{
                  background: detected === p.id ? p.bg : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${detected === p.id ? p.border : 'rgba(255,255,255,0.06)'}`,
                  boxShadow: detected === p.id ? `0 0 20px ${p.glow}` : 'none',
                }}>
                <i className={`${p.icon} text-2xl`}
                  style={{ color: detected === p.id ? p.color : '#475569' }} />
                <span className="font-mono text-[10px] tracking-wide"
                  style={{ color: detected === p.id ? p.color : '#475569' }}>
                  {p.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-2xl mx-auto px-6">
        <div style={{ height: '1px', background: 'linear-gradient(90deg,transparent,rgba(14,165,233,0.3) 30%,rgba(0,212,255,0.4) 50%,rgba(14,165,233,0.3) 70%,transparent)' }} />
      </div>

      {/* ── CTA (Lead Magnet) ── */}
      <section className="px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl p-7 sm:p-9 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#071422,#050d1a)', border: '1px solid rgba(14,165,233,0.18)', boxShadow: '0 8px 48px rgba(0,212,255,0.05)' }}>
            {/* Orb */}
            <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full pointer-events-none opacity-10"
              style={{ background: 'radial-gradient(circle,#0ea5e9,transparent 70%)', filter: 'blur(60px)', transform: 'translate(30%,30%)' }} />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ background: 'linear-gradient(135deg,rgba(14,165,233,0.2),rgba(0,212,255,0.08))', border: '1px solid rgba(14,165,233,0.3)', color: '#38bdf8' }}>
                  <i className="fa-solid fa-hard-drive" />
                </div>
                <div className="font-mono text-[11px] text-cyan-400 tracking-widest uppercase">
                  Speicher-Lösung von Leon Cordts · Köln
                </div>
              </div>

              <h3 className="font-bold text-xl sm:text-2xl text-white mb-3 leading-snug"
                style={{ fontFamily: "'Syne', sans-serif" }}>
                Dein Handy-Speicher platzt aus allen Nähten?
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Kein Cloud-Abo mehr, keine monatlichen Kosten und 100&nbsp;% Kontrolle über deine Fotos und Videos. Ich richte dir in K&ouml;ln eine <strong className="text-white">private, hochsichere Cloud (NAS)</strong> bei dir zu Hause ein — einmalig eingerichtet, lebenslang deine Daten.
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {['Keine Abo-Kosten', '100% deine Daten', 'Köln & Umgebung', 'Einmalige Einrichtung'].map(tag => (
                  <span key={tag} className="font-mono text-[10px] px-3 py-1 rounded-full tracking-wide"
                    style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)', color: '#38bdf8' }}>
                    {tag}
                  </span>
                ))}
              </div>

              <a href="/#kontakt"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-[#020b18] transition-all"
                style={{
                  fontFamily: "'Syne', sans-serif",
                  background: 'linear-gradient(135deg,#0284c7,#00d4ff)',
                  boxShadow: '0 0 24px rgba(0,212,255,0.35)',
                }}>
                <i className="fa-solid fa-calendar-check" />
                Jetzt Termin vereinbaren
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="px-6 pb-12">
        <div className="max-w-2xl mx-auto">
          <p className="font-mono text-xs text-slate-600 text-center tracking-widest uppercase mb-6">So funktioniert&apos;s</p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { step: '01', icon: 'fa-solid fa-copy', label: 'Link kopieren', desc: 'App öffnen, Video antippen, Link teilen/kopieren' },
              { step: '02', icon: 'fa-solid fa-paste', label: 'Hier einfügen', desc: 'Link in das Feld oben einfügen — Plattform wird erkannt' },
              { step: '03', icon: 'fa-solid fa-cloud-arrow-down', label: 'Herunterladen', desc: 'Download-Button klicken — Video speichern' },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg mx-auto mb-3"
                  style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.18)', color: '#38bdf8' }}>
                  <i className={s.icon} />
                </div>
                <div className="font-mono text-[10px] text-slate-600 mb-1">{s.step}</div>
                <div className="font-bold text-white text-sm mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>{s.label}</div>
                <div className="text-slate-500 text-xs leading-relaxed">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-mono text-xs text-slate-600">
            © {new Date().getFullYear()} Leon Cordts IT Solutions · leoncordts.de
          </span>
          <div className="flex gap-4">
            <a href="/tools/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Alle Tools</a>
            <a href="/#kontakt" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Kontakt</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
