"use client";
import { useState, useCallback } from "react";

const FIRST_NAMES = ["Emma","Liam","Sophia","Noah","Olivia","Elias","Mia","Felix","Hannah","Leon","Laura","Max","Anna","Finn","Sarah","Jonas","Julia","Tim","Lisa","Paul","Marie","Jan","Lena","Tom","Nina","Erik","Klara","Lukas","Katharina","Moritz","Amelie","Simon","Lea","David","Charlotte","Niklas","Maja","Tobias","Elena","Daniel"];
const LAST_NAMES = ["Müller","Schmidt","Schneider","Fischer","Weber","Meyer","Wagner","Becker","Schulz","Hoffmann","Schäfer","Koch","Bauer","Richter","Klein","Wolf","Schröder","Neumann","Schwarz","Zimmermann","Braun","Krüger","Hofmann","Hartmann","Lange","Schmitt","Werner","Schmitz","Krause","Meier"];
const DOMAINS = ["gmail.com","web.de","gmx.de","outlook.com","icloud.com","yahoo.com","proton.me","t-online.de"];
const JOBS = ["Software Engineer","Product Manager","UX Designer","Data Scientist","DevOps Engineer","Marketing Manager","Sales Director","Backend Developer","Frontend Developer","Scrum Master","Tech Lead","CEO","CTO","Consultant","Project Manager","QA Engineer","System Administrator","Business Analyst"];
const CITIES = ["Berlin","Hamburg","München","Köln","Frankfurt","Stuttgart","Düsseldorf","Leipzig","Dortmund","Essen","Bremen","Dresden","Hannover","Nürnberg","Wien","Zürich","Bern","Basel","Graz","Linz"];
const COUNTRIES = ["Deutschland","Österreich","Schweiz","Deutschland","Deutschland","Deutschland","Deutschland"];
const DEPARTMENTS = ["Engineering","Marketing","Sales","HR","Finance","Product","Operations","Design","Legal","Support"];

function uuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randPhone() {
  return `+49 ${randInt(100, 999)} ${randInt(1000000, 9999999)}`;
}

function randIP() {
  return `${randInt(1, 254)}.${randInt(0, 254)}.${randInt(0, 254)}.${randInt(1, 254)}`;
}

const FIELDS = [
  { key: "id", label: "UUID" },
  { key: "firstName", label: "Vorname" },
  { key: "lastName", label: "Nachname" },
  { key: "email", label: "E-Mail" },
  { key: "phone", label: "Telefon" },
  { key: "job", label: "Job-Titel" },
  { key: "department", label: "Abteilung" },
  { key: "city", label: "Stadt" },
  { key: "country", label: "Land" },
  { key: "age", label: "Alter" },
  { key: "ip", label: "IP-Adresse" },
];

function generateRow(fields: string[]): Record<string, string | number> {
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  const row: Record<string, string | number> = {};
  for (const f of fields) {
    switch (f) {
      case "id": row.id = uuid(); break;
      case "firstName": row.firstName = first; break;
      case "lastName": row.lastName = last; break;
      case "email": row.email = `${first.toLowerCase()}.${last.toLowerCase()}${randInt(1, 99)}@${pick(DOMAINS)}`; break;
      case "phone": row.phone = randPhone(); break;
      case "job": row.job = pick(JOBS); break;
      case "department": row.department = pick(DEPARTMENTS); break;
      case "city": row.city = pick(CITIES); break;
      case "country": row.country = pick(COUNTRIES); break;
      case "age": row.age = randInt(18, 65); break;
      case "ip": row.ip = randIP(); break;
    }
  }
  return row;
}

function toCSV(data: Record<string, string | number>[]): string {
  if (!data.length) return "";
  const keys = Object.keys(data[0]);
  const header = keys.join(",");
  const rows = data.map((r) => keys.map((k) => `"${String(r[k]).replace(/"/g, '""')}"`).join(","));
  return [header, ...rows].join("\n");
}

function download(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function MockDataGeneratorPage() {
  const [count, setCount] = useState(100);
  const [selected, setSelected] = useState<string[]>(["id", "firstName", "lastName", "email"]);
  const [preview, setPreview] = useState<Record<string, string | number>[]>([]);
  const [generated, setGenerated] = useState(false);

  const toggle = useCallback((key: string) => {
    setSelected((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
    setGenerated(false);
  }, []);

  function generate() {
    const n = Math.min(Math.max(count, 1), 10000);
    const data: Record<string, string | number>[] = [];
    for (let i = 0; i < n; i++) data.push(generateRow(selected));
    setPreview(data.slice(0, 10));
    setGenerated(true);
    return data;
  }

  function dlJson() {
    const data = generate();
    download(JSON.stringify(data, null, 2), "mock-data.json", "application/json");
  }

  function dlCsv() {
    const data = generate();
    download(toCSV(data), "mock-data.csv", "text/csv");
  }

  const S = {
    page: { minHeight: "100vh", backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans', sans-serif" } as React.CSSProperties,
    nav: { borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)", padding: "1rem 1.5rem" } as React.CSSProperties,
    card: { background: "linear-gradient(135deg,#071422 0%,#050d1a 100%)", border: "1px solid rgba(14,165,233,0.2)", borderRadius: "1rem", padding: "2rem" } as React.CSSProperties,
    mono: { fontFamily: "'JetBrains Mono',monospace" } as React.CSSProperties,
    label: { fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase" as const, display: "block", marginBottom: "0.5rem" },
  };

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
        .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
        .btn-primary { background: linear-gradient(135deg, rgba(0,212,255,0.15), rgba(14,165,233,0.1)); border: 1px solid rgba(0,212,255,0.4); color: #00d4ff; border-radius: 0.6rem; padding: 0.75rem 1.5rem; font-family: 'JetBrains Mono',monospace; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; }
        .btn-primary:hover { background: linear-gradient(135deg, rgba(0,212,255,0.25), rgba(14,165,233,0.2)); box-shadow: 0 0 20px rgba(0,212,255,0.2); }
        .btn-secondary { background: rgba(14,165,233,0.08); border: 1px solid rgba(14,165,233,0.25); color: #94a3b8; border-radius: 0.6rem; padding: 0.75rem 1.5rem; font-family: 'JetBrains Mono',monospace; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; }
        .btn-secondary:hover { border-color: rgba(0,212,255,0.4); color: #38bdf8; }
        .field-chip { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.75rem; border-radius: 0.4rem; font-family: 'JetBrains Mono',monospace; font-size: 0.75rem; cursor: pointer; border: 1px solid; transition: all 0.15s; user-select: none; }
        .field-chip.on { background: rgba(0,212,255,0.1); border-color: rgba(0,212,255,0.4); color: #00d4ff; }
        .field-chip.off { background: rgba(14,165,233,0.04); border-color: rgba(14,165,233,0.15); color: #475569; }
        .field-chip:hover { opacity: 0.85; }
        .num-input { background: rgba(7,20,34,0.8); border: 1px solid rgba(14,165,233,0.25); border-radius: 0.5rem; color: #e2e8f0; padding: 0.6rem 1rem; font-family: 'JetBrains Mono',monospace; font-size: 1rem; width: 120px; outline: none; }
        .num-input:focus { border-color: rgba(0,212,255,0.5); }
        .preview-table { width: 100%; border-collapse: collapse; font-family: 'JetBrains Mono',monospace; font-size: 0.72rem; }
        .preview-table th { color: #38bdf8; border-bottom: 1px solid rgba(14,165,233,0.2); padding: 0.4rem 0.75rem; text-align: left; white-space: nowrap; }
        .preview-table td { color: #94a3b8; border-bottom: 1px solid rgba(14,165,233,0.07); padding: 0.35rem 0.75rem; white-space: nowrap; max-width: 180px; overflow: hidden; text-overflow: ellipsis; }
        .preview-table tr:last-child td { border-bottom: none; }
      `}</style>

      <nav style={S.nav}>
        <div style={{ maxWidth: "64rem", margin: "0 auto", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <a href="/tools" style={{ color: "#38bdf8", ...S.mono, fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", ...S.mono, fontSize: "0.8rem" }}>mock-data-generator</span>
        </div>
      </nav>

      <main style={{ maxWidth: "64rem", margin: "0 auto", padding: "3rem 1.5rem" }}>
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={S.label}>System & Produktivität</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.8rem)", color: "#fff", marginBottom: "0.5rem" }}>
            Mock Data Generator
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1rem" }}>Generiere realistische Testdaten als JSON oder CSV. Kein API-Request, alles lokal.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.5rem" }}>
          {/* Config */}
          <div style={S.card}>
            <div style={S.label}>Anzahl Datensätze</div>
            <input
              className="num-input"
              type="number"
              min={1}
              max={10000}
              value={count}
              onChange={(e) => { setCount(parseInt(e.target.value) || 1); setGenerated(false); }}
            />
            <p style={{ color: "#475569", fontSize: "0.72rem", marginTop: "0.4rem", ...S.mono }}>max. 10.000</p>

            <div style={{ ...S.label, marginTop: "1.5rem" }}>Felder auswählen</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {FIELDS.map(({ key, label }) => (
                <div
                  key={key}
                  className={`field-chip ${selected.includes(key) ? "on" : "off"}`}
                  onClick={() => toggle(key)}
                >
                  <span>{selected.includes(key) ? "✓" : "+"}</span>
                  {label}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1.5rem" }}>
              <button className="btn-primary" onClick={dlJson} disabled={selected.length === 0}>⬇ JSON herunterladen</button>
              <button className="btn-secondary" onClick={dlCsv} disabled={selected.length === 0}>⬇ CSV herunterladen</button>
            </div>
          </div>

          {/* Preview */}
          <div style={S.card}>
            <div style={S.label}>Vorschau (erste 10 Zeilen)</div>
            {!generated ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "200px", gap: "1rem" }}>
                <div style={{ fontSize: "2.5rem", opacity: 0.3 }}>📋</div>
                <p style={{ color: "#475569", fontSize: "0.85rem", textAlign: "center" }}>Klicke &quot;JSON herunterladen&quot; oder &quot;CSV herunterladen&quot;<br />um Daten zu generieren und eine Vorschau zu sehen.</p>
              </div>
            ) : preview.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table className="preview-table">
                  <thead>
                    <tr>{selected.map((k) => <th key={k}>{FIELDS.find((f) => f.key === k)?.label ?? k}</th>)}</tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i}>{selected.map((k) => <td key={k}>{String(row[k] ?? "")}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
                <p style={{ color: "#334155", fontSize: "0.7rem", marginTop: "0.75rem", ...S.mono }}>
                  Vorschau: 10 von {Math.min(count, 10000)} Datensätzen
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
