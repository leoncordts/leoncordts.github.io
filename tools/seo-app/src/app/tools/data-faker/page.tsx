"use client";
import { useState, useCallback } from "react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
  .card { background: linear-gradient(135deg,#071422 0%,#050d1a 100%); border: 1px solid rgba(14,165,233,0.2); border-radius: 1rem; }
  .seg-btn { border-radius: 0.4rem; padding: 0.32rem 0.7rem; font-family: 'JetBrains Mono',monospace; font-size: 0.7rem; cursor: pointer; border: 1px solid rgba(14,165,233,0.22); background: transparent; color: #64748b; transition: all 0.15s; }
  .seg-btn.active { border-color: rgba(0,212,255,0.6); background: rgba(14,165,233,0.1); color: #38bdf8; }
  .field-tag { display: inline-flex; align-items: center; gap: 0.3rem; background: rgba(14,165,233,0.08); border: 1px solid rgba(14,165,233,0.2); border-radius: 0.4rem; padding: 0.25rem 0.55rem; font-family: 'JetBrains Mono',monospace; font-size: 0.7rem; color: #38bdf8; cursor: pointer; transition: all 0.15s; }
  .field-tag:hover { background: rgba(14,165,233,0.15); }
  .field-tag.selected { background: rgba(14,165,233,0.18); border-color: rgba(0,212,255,0.5); color: #7dd3fc; }
  .field-tag .remove { color: #475569; font-size: 0.65rem; transition: color 0.12s; }
  .field-tag .remove:hover { color: #f87171; }
  .output-box { background: rgba(7,20,34,0.9); border: 1px solid rgba(14,165,233,0.15); border-radius: 0.5rem; padding: 0.9rem 1rem; font-family: 'JetBrains Mono',monospace; font-size: 0.77rem; color: #94a3b8; max-height: 320px; overflow-y: auto; white-space: pre; word-break: break-all; line-height: 1.6; }
  .action-btn { background: rgba(14,165,233,0.1); border: 1px solid rgba(14,165,233,0.3); border-radius: 0.45rem; color: #38bdf8; cursor: pointer; padding: 0.45rem 1rem; font-family: 'JetBrains Mono',monospace; font-size: 0.75rem; transition: all 0.15s; }
  .action-btn:hover { background: rgba(14,165,233,0.2); }
  .action-btn.ok { color: #4ade80; border-color: rgba(74,222,128,0.4); }
  .count-input { background: rgba(7,20,34,0.8); border: 1px solid rgba(14,165,233,0.2); border-radius: 0.4rem; color: #e2e8f0; padding: 0.35rem 0.6rem; font-family: 'JetBrains Mono',monospace; font-size: 0.85rem; width: 70px; outline: none; text-align: center; }
`;

/* ── tiny data pools ── */
const FIRST = ["Lena","Max","Emma","Paul","Anna","Felix","Marie","Noah","Sophie","Ben","Mia","Jan","Laura","Tim","Julia"];
const LAST  = ["Müller","Schmidt","Schneider","Fischer","Weber","Meyer","Wagner","Becker","Schulz","Hoffmann"];
const DOMAINS = ["gmail.com","outlook.com","web.de","gmx.de","yahoo.com","proton.me"];
const STREETS = ["Hauptstraße","Bahnhofstraße","Schulstraße","Gartenweg","Lindenallee","Kirchgasse","Marktplatz"];
const CITIES  = ["Berlin","Hamburg","München","Köln","Frankfurt","Stuttgart","Düsseldorf","Leipzig","Bremen"];
const PRODUCTS = ["Laptop","Stuhl","Lampe","Buch","Headphones","Tastatur","Monitor","Rucksack","Kaffee","Kamera"];
const COMPANIES = ["TechCorp GmbH","Digitale Lösungen AG","Webstudio GbR","InnoSoft KG","DataWorks GmbH"];
const COLORS = ["#e74c3c","#3498db","#2ecc71","#f39c12","#9b59b6","#1abc9c","#e67e22","#34495e"];
const TLDS = [".de",".com",".io",".net",".org"];

const r = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
const ri = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const rf = (min: number, max: number, dec = 2) => +(Math.random() * (max - min) + min).toFixed(dec);

const GENERATORS: Record<string, () => string | number | boolean> = {
  id:         () => ri(1, 99999),
  uuid:       () => "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => { const v = Math.random() * 16 | 0; return (c === "x" ? v : (v & 0x3 | 0x8)).toString(16); }),
  firstName:  () => r(FIRST),
  lastName:   () => r(LAST),
  fullName:   () => `${r(FIRST)} ${r(LAST)}`,
  email:      () => `${r(FIRST).toLowerCase()}.${r(LAST).toLowerCase()}@${r(DOMAINS)}`,
  phone:      () => `+49 ${ri(100,999)} ${ri(1000000,9999999)}`,
  age:        () => ri(18, 80),
  birthdate:  () => `${ri(1960,2005)}-${String(ri(1,12)).padStart(2,"0")}-${String(ri(1,28)).padStart(2,"0")}`,
  city:       () => r(CITIES),
  street:     () => `${r(STREETS)} ${ri(1,120)}`,
  zip:        () => String(ri(10000, 99999)),
  country:    () => "Deutschland",
  company:    () => r(COMPANIES),
  product:    () => r(PRODUCTS),
  price:      () => rf(0.99, 999.99),
  quantity:   () => ri(1, 100),
  boolean:    () => Math.random() > 0.5,
  color:      () => r(COLORS),
  url:        () => `https://${r(FIRST).toLowerCase()}${ri(1,99)}${r(TLDS)}`,
  ip:         () => `${ri(1,254)}.${ri(0,255)}.${ri(0,255)}.${ri(1,254)}`,
  createdAt:  () => new Date(Date.now() - ri(0, 365 * 24 * 3600000)).toISOString().slice(0,10),
  score:      () => rf(0, 10, 1),
};

type Format = "json" | "csv" | "sql";

const ALL_FIELDS = Object.keys(GENERATORS);
const DEFAULT_FIELDS = ["id","fullName","email","city","createdAt"];

function generate(fields: string[], count: number, format: Format): string {
  const rows = Array.from({ length: count }, () => {
    const row: Record<string, string | number | boolean> = {};
    fields.forEach(f => { row[f] = GENERATORS[f]?.() ?? ""; });
    return row;
  });

  if (format === "json") return JSON.stringify(rows, null, 2);

  if (format === "csv") {
    const header = fields.join(",");
    const lines = rows.map(r => fields.map(f => {
      const v = String(r[f]);
      return v.includes(",") ? `"${v}"` : v;
    }).join(","));
    return [header, ...lines].join("\n");
  }

  // SQL
  const tbl = "users";
  const cols = fields.join(", ");
  const vals = rows.map(r => {
    const vs = fields.map(f => {
      const v = r[f];
      return typeof v === "number" || typeof v === "boolean" ? String(v) : `'${String(v).replace(/'/g,"''")}'`;
    });
    return `(${vs.join(", ")})`;
  });
  return `INSERT INTO ${tbl} (${cols})\nVALUES\n${vals.join(",\n")};`;
}

export default function DataFakerPage() {
  const [fields, setFields]   = useState<string[]>(DEFAULT_FIELDS);
  const [count, setCount]     = useState(10);
  const [format, setFormat]   = useState<Format>("json");
  const [output, setOutput]   = useState("");
  const [copied, setCopied]   = useState(false);

  const run = useCallback(() => {
    setOutput(generate(fields, count, format));
  }, [fields, count, format]);

  function toggleField(f: string) {
    setFields(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  }

  function copy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function download() {
    const ext = format === "json" ? "json" : format === "csv" ? "csv" : "sql";
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `fake-data.${ext}`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans',sans-serif", minHeight: "100vh" }}>
      <style>{S}</style>

      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>data-faker</span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-6">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Dev Tools</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.6rem)", color: "#fff", marginBottom: "0.3rem" }}>Data Faker</h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Fake-Testdaten als JSON, CSV oder SQL — lokal.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>

          {/* Config row */}
          <div className="card p-4" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase" }}>Zeilen</span>
              <input className="count-input" type="number" min={1} max={500} value={count} onChange={e => setCount(Math.min(500, Math.max(1, +e.target.value)))} />
            </div>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              {(["json","csv","sql"] as Format[]).map(f => (
                <button key={f} className={`seg-btn ${format === f ? "active" : ""}`} onClick={() => setFormat(f)}>{f.toUpperCase()}</button>
              ))}
            </div>
            <button className="action-btn" onClick={run} style={{ marginLeft: "auto" }}>▶ Generieren</button>
          </div>

          {/* Field picker */}
          <div className="card p-4">
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.6rem" }}>Felder wählen</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {ALL_FIELDS.map(f => (
                <span key={f} className={`field-tag ${fields.includes(f) ? "selected" : ""}`} onClick={() => toggleField(f)}>
                  {fields.includes(f) && <span className="remove" onClick={e => { e.stopPropagation(); toggleField(f); }}>✕</span>}
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Output */}
          {output && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase" }}>Ausgabe</span>
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <button className={`action-btn ${copied ? "ok" : ""}`} onClick={copy}>{copied ? "✓ Kopiert" : "Kopieren"}</button>
                  <button className="action-btn" onClick={download}>↓ Download</button>
                </div>
              </div>
              <div className="output-box">{output}</div>
            </div>
          )}

          {!output && (
            <div style={{ textAlign: "center", padding: "2rem", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem", color: "#1e3a5f" }}>
              Felder wählen → Generieren klicken
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
