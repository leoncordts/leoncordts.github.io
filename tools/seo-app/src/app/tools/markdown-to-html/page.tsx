"use client";

import { useState, useEffect, useCallback } from "react";
import { marked } from "marked";

const EXAMPLE_MARKDOWN = `# Markdown → HTML Konverter

Willkommen! Schreibe hier dein **Markdown** und sieh sofort das gerenderte HTML.

## Features

- Echtzeit-Vorschau
- Sauberes, sanitiertes HTML
- Kopierfunktion für Vorschau & Quellcode

## Code-Beispiel

\`\`\`javascript
function hello(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

## Tabelle

| Spalte 1 | Spalte 2 | Spalte 3 |
|----------|----------|----------|
| Wert A   | Wert B   | Wert C   |
| Wert D   | Wert E   | Wert F   |

## Zitat

> Das ist ein Blockquote. Markdown macht das Formatieren von Texten einfach und lesbar.

---

Viel Spaß beim Konvertieren!
`;

type Tab = "preview" | "html";

export default function MarkdownToHtmlPage() {
  const [markdown, setMarkdown] = useState(EXAMPLE_MARKDOWN);
  const [html, setHtml] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("preview");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const raw = String(marked.parse(markdown));
    if (typeof window !== "undefined") {
      import("dompurify").then((mod) => {
        const DOMPurify = mod.default;
        setHtml(DOMPurify.sanitize(raw));
      });
    } else {
      setHtml(raw);
    }
  }, [markdown]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(html).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [html]);

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-900/25 blur-3xl" />
        <div className="absolute top-1/3 right-0 w-72 h-72 rounded-full bg-purple-900/15 blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 border-b border-slate-800/60 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
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
            <span className="text-slate-600 text-xs">/ Tools / Markdown → HTML</span>
          </a>
          <a
            href="/kontakt"
            className="text-xs px-3 py-1.5 rounded-lg border border-indigo-700/50 text-indigo-300 hover:border-indigo-500 hover:text-indigo-200 transition"
          >
            Kontakt
          </a>
        </div>
      </nav>

      {/* Header */}
      <div className="relative z-10 px-4 pt-10 pb-6 text-center">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-900/50 border border-indigo-700/50 text-indigo-300 text-xs font-medium mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Kostenlos · Kein Account · Echtzeit-Konvertierung
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          Markdown{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            → HTML
          </span>
        </h1>
        <p className="mt-2 text-slate-400 text-sm max-w-lg mx-auto">
          Schreibe Markdown links, sieh das gerenderte HTML und den Quellcode sofort rechts.
        </p>
      </div>

      {/* Split-Screen Editor */}
      <div className="relative z-10 flex-1 px-4 pb-10 max-w-7xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row gap-4" style={{ minHeight: "500px" }}>
          {/* Left: Markdown Input */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Markdown
              </span>
              <span className="text-xs text-slate-600">{markdown.length} Zeichen</span>
            </div>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="flex-1 w-full min-h-96 bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-200 font-mono text-sm resize-none focus:outline-none focus:border-indigo-600/70 focus:ring-1 focus:ring-indigo-600/30 placeholder-slate-600 transition"
              placeholder="Markdown hier eingeben…"
              spellCheck={false}
            />
          </div>

          {/* Right: Preview / HTML Code */}
          <div className="flex-1 flex flex-col">
            {/* Tabs + Copy */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex gap-1">
                {(["preview", "html"] as Tab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      activeTab === tab
                        ? "bg-indigo-600 text-white"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {tab === "preview" ? "Vorschau" : "HTML-Code"}
                  </button>
                ))}
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:border-indigo-600/60 hover:text-indigo-300 transition"
              >
                {copied ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Kopiert!
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Kopieren
                  </>
                )}
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 min-h-96 bg-slate-900 border border-slate-800 rounded-xl overflow-auto">
              {activeTab === "preview" ? (
                <div
                  className="p-6 prose-markdown"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              ) : (
                <pre className="p-4 text-sm text-slate-300 font-mono whitespace-pre-wrap break-all leading-relaxed">
                  {html}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="relative z-10 border-t border-slate-800 py-5 text-center text-slate-600 text-xs">
        <p>leoncordts.de Markdown → HTML · Echtzeit-Konverter · 0 € · Powered by marked & DOMPurify</p>
        <p className="mt-1">
          © {new Date().getFullYear()} Leon Cordts IT Solutions ·{" "}
          <a href="/kontakt" className="hover:text-slate-400 transition">
            Kontakt
          </a>
        </p>
      </footer>

      {/* Prose styles scoped */}
      <style>{`
        .prose-markdown h1 { font-size: 1.875rem; font-weight: 800; color: #f1f5f9; margin-bottom: 0.75rem; margin-top: 1.5rem; }
        .prose-markdown h2 { font-size: 1.375rem; font-weight: 700; color: #e2e8f0; margin-bottom: 0.6rem; margin-top: 1.25rem; border-bottom: 1px solid #1e293b; padding-bottom: 0.25rem; }
        .prose-markdown h3 { font-size: 1.125rem; font-weight: 600; color: #cbd5e1; margin-bottom: 0.4rem; margin-top: 1rem; }
        .prose-markdown p { color: #94a3b8; line-height: 1.75; margin-bottom: 0.75rem; }
        .prose-markdown strong { color: #e2e8f0; font-weight: 600; }
        .prose-markdown em { color: #a5b4fc; font-style: italic; }
        .prose-markdown a { color: #818cf8; text-decoration: underline; }
        .prose-markdown ul { color: #94a3b8; padding-left: 1.5rem; margin-bottom: 0.75rem; list-style-type: disc; }
        .prose-markdown ol { color: #94a3b8; padding-left: 1.5rem; margin-bottom: 0.75rem; list-style-type: decimal; }
        .prose-markdown li { margin-bottom: 0.25rem; line-height: 1.6; }
        .prose-markdown code { background: #0f172a; color: #a5b4fc; font-family: 'Fira Mono', 'Cascadia Code', monospace; font-size: 0.85em; padding: 0.15em 0.4em; border-radius: 4px; border: 1px solid #1e293b; }
        .prose-markdown pre { background: #0f172a; border: 1px solid #1e293b; border-radius: 10px; padding: 1rem; overflow-x: auto; margin-bottom: 1rem; }
        .prose-markdown pre code { background: transparent; border: none; padding: 0; font-size: 0.875em; color: #94a3b8; }
        .prose-markdown blockquote { border-left: 3px solid #4f46e5; padding-left: 1rem; color: #64748b; font-style: italic; margin: 1rem 0; }
        .prose-markdown table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; font-size: 0.875rem; }
        .prose-markdown th { background: #1e293b; color: #e2e8f0; font-weight: 600; padding: 0.5rem 0.75rem; text-align: left; border: 1px solid #334155; }
        .prose-markdown td { color: #94a3b8; padding: 0.5rem 0.75rem; border: 1px solid #1e293b; }
        .prose-markdown tr:nth-child(even) td { background: #0f172a; }
        .prose-markdown hr { border: none; border-top: 1px solid #1e293b; margin: 1.5rem 0; }
        .prose-markdown img { max-width: 100%; border-radius: 8px; }
      `}</style>
    </main>
  );
}
