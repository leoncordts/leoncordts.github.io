"use client";
import { useState, useCallback } from "react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
  .md-textarea { background: rgba(7,20,34,0.9); border: none; outline: none; color: #cbd5e1; font-family: 'JetBrains Mono',monospace; font-size: 0.85rem; line-height: 1.7; resize: none; width: 100%; height: 100%; padding: 1.25rem; box-sizing: border-box; }
  .md-preview { padding: 1.25rem; font-family: 'DM Sans',sans-serif; font-size: 0.9rem; line-height: 1.75; color: #cbd5e1; overflow-y: auto; height: 100%; box-sizing: border-box; }
  .md-preview h1 { font-family: 'Syne',sans-serif; font-size: 1.7rem; font-weight: 800; color: #fff; margin: 0.5rem 0 0.75rem; border-bottom: 1px solid rgba(14,165,233,0.2); padding-bottom: 0.4rem; }
  .md-preview h2 { font-family: 'Syne',sans-serif; font-size: 1.3rem; font-weight: 700; color: #e2e8f0; margin: 1.2rem 0 0.5rem; }
  .md-preview h3 { font-size: 1.05rem; font-weight: 600; color: #cbd5e1; margin: 1rem 0 0.4rem; }
  .md-preview p  { margin: 0.6rem 0; }
  .md-preview ul, .md-preview ol { padding-left: 1.5rem; margin: 0.5rem 0; }
  .md-preview li { margin: 0.2rem 0; }
  .md-preview code { background: rgba(14,165,233,0.1); border: 1px solid rgba(14,165,233,0.2); border-radius: 0.25rem; padding: 0.1em 0.4em; font-family: 'JetBrains Mono',monospace; font-size: 0.82rem; color: #38bdf8; }
  .md-preview pre { background: rgba(7,20,34,0.9); border: 1px solid rgba(14,165,233,0.18); border-radius: 0.6rem; padding: 1rem; overflow-x: auto; margin: 0.75rem 0; }
  .md-preview pre code { background: none; border: none; padding: 0; color: #94a3b8; }
  .md-preview blockquote { border-left: 3px solid #38bdf8; margin: 0.75rem 0; padding: 0.4rem 0.9rem; color: #64748b; background: rgba(14,165,233,0.04); border-radius: 0 0.4rem 0.4rem 0; }
  .md-preview a { color: #38bdf8; text-decoration: underline; }
  .md-preview strong { color: #e2e8f0; font-weight: 600; }
  .md-preview em { color: #94a3b8; }
  .md-preview hr { border: none; border-top: 1px solid rgba(14,165,233,0.15); margin: 1rem 0; }
  .md-preview table { border-collapse: collapse; width: 100%; margin: 0.75rem 0; font-size: 0.85rem; }
  .md-preview th { border: 1px solid rgba(14,165,233,0.2); padding: 0.4rem 0.7rem; background: rgba(14,165,233,0.08); color: #38bdf8; text-align: left; font-family: 'JetBrains Mono',monospace; font-size: 0.78rem; }
  .md-preview td { border: 1px solid rgba(14,165,233,0.12); padding: 0.4rem 0.7rem; }
  .toolbar-btn { background: transparent; border: 1px solid rgba(14,165,233,0.2); border-radius: 0.35rem; color: #64748b; cursor: pointer; font-family: 'JetBrains Mono',monospace; font-size: 0.7rem; padding: 0.3rem 0.55rem; transition: all 0.15s; }
  .toolbar-btn:hover { color: #38bdf8; border-color: rgba(0,212,255,0.4); }
  .toolbar-btn.active { color: #38bdf8; border-color: rgba(0,212,255,0.5); background: rgba(14,165,233,0.08); }
  .copy-btn { background: rgba(14,165,233,0.1); border: 1px solid rgba(14,165,233,0.3); border-radius: 0.4rem; color: #38bdf8; cursor: pointer; padding: 0.3rem 0.75rem; font-family: 'JetBrains Mono',monospace; font-size: 0.7rem; transition: all 0.15s; }
  .copy-btn:hover { background: rgba(14,165,233,0.2); }
  .copy-btn.ok { color: #4ade80; border-color: rgba(74,222,128,0.4); }
`;

const DEMO = `# Markdown Editor

Schreibe hier **Markdown** und sieh die Vorschau live.

## Features

- **Fett**, *kursiv*, ~~durchgestrichen~~
- \`inline code\` und Codeblöcke
- Listen, Tabellen, Blockquotes
- Links und Überschriften

## Beispiel-Code

\`\`\`js
const greet = name => \`Hallo, \${name}!\`;
console.log(greet("Welt"));
\`\`\`

## Tabelle

| Spalte 1 | Spalte 2 | Spalte 3 |
|----------|----------|----------|
| Wert A   | Wert B   | Wert C   |
| 42       | true     | #38bdf8  |

> "Einfachheit ist die höchste Stufe der Vollendung." — Leonardo da Vinci

---

Alles läuft **lokal** im Browser – nichts wird gespeichert.
`;

/* Minimal Markdown → HTML renderer (no deps) */
function mdToHtml(md: string): string {
  let h = md
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Fenced code blocks
  h = h.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
    `<pre><code class="lang-${lang}">${code.trimEnd()}</code></pre>`);

  // Tables
  h = h.replace(/^\|(.+)\|\s*\n\|[-| :]+\|\s*\n((?:\|.+\|\s*\n?)*)/gm, (_, header, rows) => {
    const th = header.split("|").map((c: string) => `<th>${c.trim()}</th>`).join("");
    const trs = rows.trim().split("\n").map((r: string) =>
      "<tr>" + r.replace(/^\||\|$/g,"").split("|").map((c: string) => `<td>${c.trim()}</td>`).join("") + "</tr>"
    ).join("");
    return `<table><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>`;
  });

  // Headings
  h = h.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  h = h.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  h = h.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Blockquote
  h = h.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>");

  // HR
  h = h.replace(/^---$/gm, "<hr />");

  // Unordered list
  h = h.replace(/(^[\-\*] .+\n?)+/gm, m => {
    const items = m.trim().split("\n").map(l => `<li>${l.replace(/^[\-\*] /, "")}</li>`).join("");
    return `<ul>${items}</ul>`;
  });

  // Ordered list
  h = h.replace(/(^\d+\. .+\n?)+/gm, m => {
    const items = m.trim().split("\n").map(l => `<li>${l.replace(/^\d+\. /, "")}</li>`).join("");
    return `<ol>${items}</ol>`;
  });

  // Inline: bold, italic, strikethrough, code, link
  h = h.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  h = h.replace(/\*(.+?)\*/g, "<em>$1</em>");
  h = h.replace(/~~(.+?)~~/g, "<del>$1</del>");
  h = h.replace(/`([^`]+)`/g, "<code>$1</code>");
  h = h.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  // Paragraphs (wrap non-tag lines)
  h = h.replace(/^(?!<[a-z]|$)(.+)$/gm, "<p>$1</p>");

  return h;
}

export default function MarkdownEditorPage() {
  const [md, setMd]       = useState(DEMO);
  const [view, setView]   = useState<"split"|"edit"|"preview">("split");
  const [copied, setCopied] = useState(false);

  const html = useCallback(() => mdToHtml(md), [md])();

  function copyHtml() {
    navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const showEdit    = view === "split" || view === "edit";
  const showPreview = view === "split" || view === "preview";

  return (
    <div style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans',sans-serif", height: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{S}</style>

      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)", flexShrink: 0 }} className="px-6 py-3">
        <div className="max-w-full mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
            <span style={{ color: "#1e3a5f" }}>/</span>
            <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>markdown-editor</span>
          </div>
          <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
            {(["split","edit","preview"] as const).map(v => (
              <button key={v} className={`toolbar-btn ${view === v ? "active" : ""}`} onClick={() => setView(v)}>{v}</button>
            ))}
            <button className={`copy-btn ${copied ? "ok" : ""}`} onClick={copyHtml}>
              {copied ? "✓ HTML" : "HTML kopieren"}
            </button>
          </div>
        </div>
      </nav>

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: showEdit && showPreview ? "1fr 1fr" : "1fr", overflow: "hidden" }}>
        {showEdit && (
          <div style={{ borderRight: showPreview ? "1px solid rgba(14,165,233,0.12)" : "none", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "0.4rem 1rem", borderBottom: "1px solid rgba(14,165,233,0.08)", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65rem", color: "#38bdf8", letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0 }}>
              Markdown
            </div>
            <textarea className="md-textarea" value={md} onChange={e => setMd(e.target.value)} spellCheck={false} />
          </div>
        )}
        {showPreview && (
          <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "0.4rem 1rem", borderBottom: "1px solid rgba(14,165,233,0.08)", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65rem", color: "#38bdf8", letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0 }}>
              Vorschau
            </div>
            <div className="md-preview" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        )}
      </div>
    </div>
  );
}
