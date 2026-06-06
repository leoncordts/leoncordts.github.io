"use client";
import { useState } from "react";

function csvToJson(csv: string): string {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error("CSV braucht mindestens eine Header-Zeile und eine Daten-Zeile.");
  const headers = parseRow(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const vals = parseRow(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = vals[i] ?? ""; });
    return obj;
  });
  return JSON.stringify(rows, null, 2);
}

function parseRow(line: string): string[] {
  const result: string[] = [];
  let cur = "", inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { inQuote = !inQuote; }
    else if (c === "," && !inQuote) { result.push(cur.trim()); cur = ""; }
    else { cur += c; }
  }
  result.push(cur.trim());
  return result;
}

function jsonToCsv(json: string): string {
  const data: Record<string, unknown>[] = JSON.parse(json);
  if (!Array.isArray(data) || data.length === 0) throw new Error("JSON muss ein Array von Objekten sein.");
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((h) => {
      const v = String(row[h] ?? "");
      return v.includes(",") || v.includes('"') || v.includes("\n") ? `"${v.replace(/"/g, '""')}"` : v;
    }).join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

export default function CsvJsonPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [lastMode, setLastMode] = useState<"csv2json" | "json2csv" | null>(null);
  const [copied, setCopied] = useState(false);

  function run(mode: "csv2json" | "json2csv") {
    setError(""); setLastMode(mode);
    try {
      setOutput(mode === "csv2json" ? csvToJson(input) : jsonToCsv(input));
    } catch (e: unknown) {
      setError((e as Error).message);
      setOutput("");
    }
  }

  function copy() { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1500); }

  function download() {
    const ext = lastMode === "csv2json" ? "json" : "csv";
    const type = ext === "json" ? "application/json" : "text/csv";
    const blob = new Blob([output], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `output.${ext}`; a.click();
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
        .action-btn { border-radius: 0.6rem; padding: 0.7rem 1.25rem; font-family: 'Syne',sans-serif; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; border: 1px solid; }
        .btn-csv { background: rgba(251,146,60,0.15); border-color: rgba(251,146,60,0.35); color: #fb923c; }
        .btn-csv:hover:not(:disabled) { background: rgba(251,146,60,0.3); box-shadow: 0 0 20px rgba(251,146,60,0.2); }
        .btn-json { background: rgba(14,165,233,0.15); border-color: rgba(14,165,233,0.35); color: #38bdf8; }
        .btn-json:hover:not(:disabled) { background: rgba(14,165,233,0.3); box-shadow: 0 0 20px rgba(14,165,233,0.2); }
        .action-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .sm-btn { background: rgba(14,165,233,0.15); border: 1px solid rgba(14,165,233,0.3); color: #38bdf8; border-radius: 0.4rem; padding: 0.35rem 0.8rem; font-size: 0.72rem; font-family: 'JetBrains Mono',monospace; cursor: pointer; transition: all 0.2s; }
        .sm-btn:hover { background: rgba(14,165,233,0.3); }
        .sm-btn.success { background: rgba(34,197,94,0.2); border-color: rgba(34,197,94,0.4); color: #4ade80; }
        .error-box { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.35); border-radius: 0.5rem; padding: 0.65rem 0.9rem; font-family: 'JetBrains Mono',monospace; font-size: 0.76rem; color: #f87171; margin-top: 0.5rem; }
      `}</style>

      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>csv-json-converter</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Web & Developer Tools / Medien & Konverter</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.8rem)", color: "#fff", marginBottom: "0.5rem" }}>CSV ↔ JSON Konverter</h1>
          <p style={{ color: "#94a3b8" }}>Konvertiere CSV zu JSON oder JSON zu CSV — lokal, kein Upload.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.25rem" }}>
          <div className="card p-6">
            <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>Eingabe (CSV oder JSON)</label>
            <textarea rows={18} value={input} onChange={(e) => setInput(e.target.value)} placeholder={"name,age,city\nMax,30,Berlin\nAnna,25,Hamburg"} />
            {error && <div className="error-box">⚠ {error}</div>}
          </div>

          <div className="card p-6">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase" }}>Ausgabe</label>
              {output && (
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button className={`sm-btn ${copied ? "success" : ""}`} onClick={copy}>{copied ? "✓" : "Kopieren"}</button>
                  <button className="sm-btn" onClick={download}>↓ Datei</button>
                </div>
              )}
            </div>
            <textarea rows={18} readOnly value={output} placeholder="Ausgabe erscheint hier…" style={{ cursor: "default" }} />
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button className="action-btn btn-csv" onClick={() => run("csv2json")} disabled={!input.trim()}>CSV → JSON</button>
          <button className="action-btn btn-json" onClick={() => run("json2csv")} disabled={!input.trim()}>JSON → CSV</button>
        </div>
      </main>
    </div>
  );
}
