"use client";

import { useState, useEffect, useCallback } from "react";

// Figlet loaded dynamically to avoid SSR/build issues
type FigletModule = {
  text: (
    input: string,
    options: { font: string },
    callback: (err: Error | null, result?: string) => void
  ) => void;
  parseFont: (name: string, font: unknown) => void;
};

const FONTS = ["Standard", "Slant", "Ghost"] as const;
type Font = (typeof FONTS)[number];

const FONT_IMPORT: Record<Font, () => Promise<unknown>> = {
  Standard: () =>
    import("figlet/importable-fonts/Standard.js" as never).then(
      (m) => (m as { default: unknown }).default ?? m
    ),
  Slant: () =>
    import("figlet/importable-fonts/Slant.js" as never).then(
      (m) => (m as { default: unknown }).default ?? m
    ),
  Ghost: () =>
    import("figlet/importable-fonts/Ghost.js" as never).then(
      (m) => (m as { default: unknown }).default ?? m
    ),
};

export default function AsciiArtGeneratorPage() {
  const [input, setInput] = useState("Hello");
  const [font, setFont] = useState<Font>("Standard");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [figletReady, setFigletReady] = useState(false);
  const [figletRef, setFigletRef] = useState<FigletModule | null>(null);
  const [loadedFonts, setLoadedFonts] = useState<Set<Font>>(new Set());

  // Load figlet on mount
  useEffect(() => {
    import("figlet").then((mod) => {
      const fig = (mod.default ?? mod) as FigletModule;
      setFigletRef(fig);
      setFigletReady(true);
    });
  }, []);

  const ensureFont = useCallback(
    async (f: Font): Promise<void> => {
      if (!figletRef) return;
      if (loadedFonts.has(f)) return;
      const fontData = await FONT_IMPORT[f]();
      figletRef.parseFont(f, fontData);
      setLoadedFonts((prev) => new Set([...prev, f]));
    },
    [figletRef, loadedFonts]
  );

  const generate = useCallback(async () => {
    if (!figletRef || !figletReady) return;
    if (!input.trim()) {
      setOutput("");
      return;
    }
    try {
      await ensureFont(font);
      figletRef.text(input, { font }, (err, result) => {
        if (err) {
          setError("Fehler beim Generieren: " + err.message);
          return;
        }
        setOutput(result ?? "");
        setError(null);
      });
    } catch (e) {
      setError("Font konnte nicht geladen werden.");
      console.error(e);
    }
  }, [figletRef, figletReady, input, font, ensureFont]);

  // Re-generate when input or font changes
  useEffect(() => {
    if (figletReady) {
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [figletReady, input, font]);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "#020b18",
        color: "#cbd5e1",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
        .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
        .card { background: linear-gradient(135deg,#071422 0%,#050d1a 100%); border: 1px solid rgba(14,165,233,0.2); border-radius: 1rem; }
        .input-field { background: rgba(7,20,34,0.8); border: 1px solid rgba(14,165,233,0.25); border-radius: 0.5rem; color: #e2e8f0; padding: 0.75rem 1rem; font-family: 'JetBrains Mono', monospace; font-size: 1rem; width: 100%; outline: none; transition: border-color 0.2s; }
        .input-field:focus { border-color: rgba(0,212,255,0.5); box-shadow: 0 0 0 2px rgba(0,212,255,0.1); }
        .select-field { background: rgba(7,20,34,0.8); border: 1px solid rgba(14,165,233,0.25); border-radius: 0.5rem; color: #e2e8f0; padding: 0.65rem 1rem; font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; outline: none; cursor: pointer; transition: border-color 0.2s; }
        .select-field:focus { border-color: rgba(0,212,255,0.5); }
        .copy-btn { background: rgba(14,165,233,0.15); border: 1px solid rgba(14,165,233,0.3); color: #38bdf8; border-radius: 0.4rem; padding: 0.4rem 0.9rem; font-size: 0.8rem; font-family: 'JetBrains Mono', monospace; cursor: pointer; transition: all 0.2s; }
        .copy-btn:hover { background: rgba(14,165,233,0.3); border-color: rgba(0,212,255,0.5); }
        .copy-btn.success { background: rgba(34,197,94,0.2); border-color: rgba(34,197,94,0.4); color: #4ade80; }
      `}</style>

      {/* Nav */}
      <nav
        style={{
          borderBottom: "1px solid rgba(14,165,233,0.1)",
          backgroundColor: "rgba(5,13,26,0.95)",
          backdropFilter: "blur(12px)",
        }}
        className="px-6 py-4"
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://leoncordts.github.io/favicon-32x32.png"
              alt="leoncordts.de"
              className="w-6 h-6 rounded"
            />
            <a
              href="https://leoncordts.de"
              style={{
                color: "#38bdf8",
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: "0.8rem",
              }}
            >
              leoncordts.de
            </a>
            <span style={{ color: "#1e3a5f" }}>/</span>
            <a
              href="/tools"
              style={{
                color: "#38bdf8",
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: "0.8rem",
              }}
            >
              Tools
            </a>
            <span style={{ color: "#1e3a5f" }}>/</span>
            <span
              style={{
                color: "#94a3b8",
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: "0.8rem",
              }}
            >
              ASCII Art Generator
            </span>
          </div>
          <a
            href="/kontakt"
            className="text-xs px-3 py-1.5 rounded-lg border border-indigo-700/50 text-indigo-300 hover:border-indigo-500 hover:text-indigo-200 transition"
          >
            Kontakt
          </a>
        </div>
      </nav>

      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-900/25 blur-3xl" />
        <div className="absolute top-1/3 right-0 w-72 h-72 rounded-full bg-cyan-900/15 blur-3xl" />
      </div>

      <main className="relative max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <div
            style={{
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: "0.7rem",
              color: "#38bdf8",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: "0.75rem",
            }}
          >
            Web &amp; Developer Tools
          </div>
          <h1
            className="glow-text"
            style={{
              fontFamily: "'Syne',sans-serif",
              fontWeight: 800,
              fontSize: "clamp(1.8rem,5vw,2.8rem)",
              color: "#fff",
              marginBottom: "0.5rem",
            }}
          >
            ASCII Art Generator
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1rem" }}>
            Verwandle beliebigen Text in ASCII Art — mit verschiedenen Fonts, sofort im Browser.
          </p>
        </div>

        {/* Controls */}
        <div className="card p-6 mb-4">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: "1rem",
              alignItems: "end",
            }}
          >
            {/* Text input */}
            <div>
              <label
                style={{
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: "0.72rem",
                  color: "#38bdf8",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: "0.5rem",
                }}
              >
                Text eingeben
              </label>
              <input
                className="input-field"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Text eingeben..."
                maxLength={80}
                spellCheck={false}
              />
            </div>

            {/* Font select */}
            <div>
              <label
                style={{
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: "0.72rem",
                  color: "#38bdf8",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: "0.5rem",
                }}
              >
                Font
              </label>
              <select
                className="select-field"
                value={font}
                onChange={(e) => setFont(e.target.value as Font)}
              >
                {FONTS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!figletReady && (
            <p
              style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: "0.75rem",
                color: "#64748b",
                marginTop: "0.75rem",
              }}
            >
              Lade figlet...
            </p>
          )}
        </div>

        {/* Output */}
        <div className="card p-6">
          {/* Header row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "0.75rem",
            }}
          >
            <span
              style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: "0.72rem",
                color: "#38bdf8",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Output
            </span>
            <button
              className={`copy-btn${copied ? " success" : ""}`}
              onClick={handleCopy}
              disabled={!output}
            >
              {copied ? "Kopiert!" : "Kopieren"}
            </button>
          </div>

          {error && (
            <p
              style={{
                color: "#f87171",
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: "0.8rem",
                marginBottom: "0.5rem",
              }}
            >
              {error}
            </p>
          )}

          <pre
            style={{
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: "clamp(0.5rem, 1.5vw, 0.85rem)",
              color: "#e2e8f0",
              backgroundColor: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(14,165,233,0.15)",
              borderRadius: "0.5rem",
              padding: "1.25rem",
              overflowX: "auto",
              minHeight: "160px",
              whiteSpace: "pre",
              lineHeight: 1.2,
            }}
          >
            {output || (
              <span style={{ color: "#334155" }}>
                Gib oben Text ein, um ASCII Art zu generieren...
              </span>
            )}
          </pre>
        </div>
      </main>

      <footer
        className="relative border-t py-5 text-center text-xs"
        style={{ borderColor: "rgba(14,165,233,0.1)", color: "#475569" }}
      >
        <p>leoncordts.de ASCII Art Generator · Powered by figlet.js</p>
        <p className="mt-1">
          &copy; {new Date().getFullYear()} Leon Cordts IT Solutions &middot;{" "}
          <a href="/kontakt" className="hover:text-slate-400 transition">
            Kontakt
          </a>
        </p>
      </footer>
    </div>
  );
}
