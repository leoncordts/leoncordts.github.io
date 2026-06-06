"use client";
import { useState, useCallback } from "react";

function xmlNodeToObj(node: Element): unknown {
  if (node.children.length === 0) {
    return node.textContent ?? "";
  }
  const obj: Record<string, unknown> = {};
  for (const child of Array.from(node.children)) {
    const key = child.tagName;
    const val = xmlNodeToObj(child);
    if (key in obj) {
      if (!Array.isArray(obj[key])) obj[key] = [obj[key]];
      (obj[key] as unknown[]).push(val);
    } else {
      obj[key] = val;
    }
  }
  // include attributes
  for (const attr of Array.from(node.attributes)) {
    obj[`@${attr.name}`] = attr.value;
  }
  return obj;
}

function xmlToJson(xmlStr: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlStr, "application/xml");
  const err = doc.querySelector("parsererror");
  if (err) throw new Error("Ungültiges XML: " + err.textContent?.split("\n")[1]?.trim());
  const root = doc.documentElement;
  const result: Record<string, unknown> = { [root.tagName]: xmlNodeToObj(root) };
  return JSON.stringify(result, null, 2);
}

export default function XmlJsonPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const convert = useCallback((val: string) => {
    setError("");
    if (!val.trim()) { setOutput(""); return; }
    try {
      setOutput(xmlToJson(val));
    } catch (e: unknown) {
      setError((e as Error).message);
      setOutput("");
    }
  }, []);

  function onInput(val: string) {
    setInput(val);
    convert(val);
  }

  function copy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function download() {
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "output.json"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
        .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
        .card { background: linear-gradient(135deg,#071422 0%,#050d1a 100%); border: 1px solid rgba(14,165,233,0.2); border-radius: 1rem; }
        textarea { background: rgba(7,20,34,0.8); border: 1px solid rgba(14,165,233,0.2); border-radius: 0.5rem; color: #e2e8f0; padding: 1rem; font-family: 'JetBrains Mono', monospace; font-size: 0.82rem; width: 100%; outline: none; resize: vertical; transition: border-color 0.2s; line-height: 1.7; }
        textarea:focus { border-color: rgba(0,212,255,0.4); }
        textarea.err { border-color: rgba(239,68,68,0.5) !important; }
        .error-box { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.35); border-radius: 0.5rem; padding: 0.65rem 0.9rem; font-family: 'JetBrains Mono',monospace; font-size: 0.76rem; color: #f87171; margin-top: 0.5rem; }
        .action-btn { background: rgba(14,165,233,0.15); border: 1px solid rgba(14,165,233,0.3); color: #38bdf8; border-radius: 0.4rem; padding: 0.4rem 0.9rem; font-size: 0.75rem; font-family: 'JetBrains Mono',monospace; cursor: pointer; transition: all 0.2s; }
        .action-btn:hover { background: rgba(14,165,233,0.3); }
        .action-btn.success { background: rgba(34,197,94,0.2); border-color: rgba(34,197,94,0.4); color: #4ade80; }
      `}</style>

      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>xml-json-converter</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Web & Developer Tools</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.8rem)", color: "#fff", marginBottom: "0.5rem" }}>XML → JSON Konverter</h1>
          <p style={{ color: "#94a3b8" }}>Konvertiere XML lokal in formatiertes JSON — kein Backend, kein Upload.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          <div className="card p-6">
            <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>XML Eingabe</label>
            <textarea
              rows={20}
              className={error ? "err" : ""}
              value={input}
              onChange={(e) => onInput(e.target.value)}
              placeholder={"<?xml version=\"1.0\"?>\n<person>\n  <name>Max</name>\n  <age>30</age>\n</person>"}
            />
            {error && <div className="error-box">⚠ {error}</div>}
          </div>

          <div className="card p-6">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase" }}>JSON Ausgabe</label>
              {output && (
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button className={`action-btn ${copied ? "success" : ""}`} onClick={copy}>{copied ? "✓" : "Kopieren"}</button>
                  <button className="action-btn" onClick={download}>↓ .json</button>
                </div>
              )}
            </div>
            <textarea rows={20} readOnly value={output} placeholder="JSON erscheint hier…" style={{ cursor: "default" }} />
          </div>
        </div>
      </main>
    </div>
  );
}
