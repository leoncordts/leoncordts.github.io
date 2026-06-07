"use client";
import { useState, useMemo } from "react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
  .search-input { background: rgba(7,20,34,0.8); border: 1px solid rgba(14,165,233,0.2); border-radius: 0.6rem; color: #e2e8f0; padding: 0.75rem 1.1rem; font-family: 'JetBrains Mono',monospace; font-size: 0.9rem; width: 100%; outline: none; transition: border-color 0.2s; }
  .search-input:focus { border-color: rgba(0,212,255,0.45); }
  .filter-btn { border-radius: 0.45rem; padding: 0.4rem 1rem; font-family: 'JetBrains Mono',monospace; font-size: 0.72rem; cursor: pointer; border: 1px solid rgba(14,165,233,0.2); background: transparent; color: #64748b; transition: all 0.2s; white-space: nowrap; }
  .filter-btn:hover { border-color: rgba(14,165,233,0.4); color: #38bdf8; }
  .filter-btn.active { background: rgba(14,165,233,0.1); border-color: rgba(14,165,233,0.5); color: #38bdf8; }
  .code-card { background: linear-gradient(135deg,#071422 0%,#050d1a 100%); border: 1px solid rgba(14,165,233,0.12); border-radius: 0.75rem; padding: 1rem 1.2rem; transition: border-color 0.2s, transform 0.15s; cursor: default; }
  .code-card:hover { border-color: rgba(14,165,233,0.3); transform: translateY(-1px); }
  .code-num { font-family: 'JetBrains Mono',monospace; font-size: 1.4rem; font-weight: 700; letter-spacing: 0.04em; }
  .code-name { font-family: 'Syne',sans-serif; font-weight: 700; font-size: 0.95rem; color: #e2e8f0; margin: 0.2rem 0 0.4rem; }
  .code-desc { font-size: 0.82rem; color: #94a3b8; line-height: 1.5; }
  .badge { display: inline-block; font-family: 'JetBrains Mono',monospace; font-size: 0.6rem; font-weight: 600; padding: 0.2rem 0.5rem; border-radius: 0.3rem; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 0.5rem; }
`;

type Code = { code: number; name: string; desc: string; use?: string };
type Group = { label: string; color: string; bg: string; codes: Code[] };

const GROUPS: Group[] = [
  {
    label: "1xx Informational",
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.1)",
    codes: [
      { code: 100, name: "Continue", desc: "Der Server hat den Anfrageanfang empfangen. Der Client soll weitersenden." },
      { code: 101, name: "Switching Protocols", desc: "Der Server wechselt auf Anfrage des Clients das Protokoll (z.B. zu WebSockets)." },
      { code: 102, name: "Processing", desc: "Der Server verarbeitet die Anfrage, hat aber noch keine Antwort." },
      { code: 103, name: "Early Hints", desc: "Erlaubt dem Browser, Ressourcen schon vor der finalen Antwort vorzuladen." },
    ],
  },
  {
    label: "2xx Success",
    color: "#4ade80",
    bg: "rgba(34,197,94,0.1)",
    codes: [
      { code: 200, name: "OK", desc: "Standardantwort für erfolgreiche HTTP-Anfragen.", use: "GET, POST, PUT, DELETE" },
      { code: 201, name: "Created", desc: "Anfrage war erfolgreich und eine neue Ressource wurde erstellt.", use: "POST, PUT" },
      { code: 202, name: "Accepted", desc: "Anfrage wurde akzeptiert, aber noch nicht verarbeitet.", use: "Async-Operationen" },
      { code: 204, name: "No Content", desc: "Erfolg ohne Antwortinhalt — typisch nach DELETE.", use: "DELETE, PUT" },
      { code: 206, name: "Partial Content", desc: "Nur ein Teil der Ressource wird zurückgegeben (Range-Header).", use: "Streaming, Download-Resume" },
    ],
  },
  {
    label: "3xx Redirection",
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.1)",
    codes: [
      { code: 301, name: "Moved Permanently", desc: "Ressource wurde dauerhaft an eine neue URL verschoben.", use: "SEO-Weiterleitungen" },
      { code: 302, name: "Found", desc: "Ressource ist temporär unter einer anderen URL erreichbar.", use: "Temp. Weiterleitung" },
      { code: 303, name: "See Other", desc: "Nach POST: Client soll eine andere URL per GET abrufen.", use: "Post/Redirect/Get-Pattern" },
      { code: 304, name: "Not Modified", desc: "Ressource hat sich nicht geändert — Browser soll Cache nutzen.", use: "HTTP-Caching" },
      { code: 307, name: "Temporary Redirect", desc: "Temporäre Weiterleitung, Methode bleibt erhalten.", use: "API-Weiterleitungen" },
      { code: 308, name: "Permanent Redirect", desc: "Dauerhafte Weiterleitung, Methode und Body bleiben erhalten.", use: "API-Migrations" },
    ],
  },
  {
    label: "4xx Client Errors",
    color: "#f87171",
    bg: "rgba(239,68,68,0.1)",
    codes: [
      { code: 400, name: "Bad Request", desc: "Die Anfrage ist syntaktisch falsch oder kann nicht verarbeitet werden.", use: "Validierungsfehler" },
      { code: 401, name: "Unauthorized", desc: "Authentifizierung ist erforderlich (aber noch nicht erfolgt).", use: "JWT, Basic Auth" },
      { code: 403, name: "Forbidden", desc: "Zugriff verweigert — trotz Authentifizierung keine Berechtigung.", use: "RBAC, ACL" },
      { code: 404, name: "Not Found", desc: "Die angeforderte Ressource existiert nicht.", use: "Falsche URL, gelöschte Ressource" },
      { code: 405, name: "Method Not Allowed", desc: "HTTP-Methode ist für diese URL nicht erlaubt.", use: "REST-API-Fehler" },
      { code: 408, name: "Request Timeout", desc: "Der Client hat zu lange gebraucht, um die Anfrage zu senden.", use: "Netzwerkprobleme" },
      { code: 409, name: "Conflict", desc: "Anfrage kollidiert mit dem aktuellen Zustand der Ressource.", use: "Duplicate, Optimistic Locking" },
      { code: 410, name: "Gone", desc: "Ressource wurde dauerhaft entfernt und ist nicht mehr verfügbar.", use: "Gelöschte Inhalte" },
      { code: 413, name: "Content Too Large", desc: "Request-Body übersteigt das erlaubte Maximum.", use: "File-Upload-Limits" },
      { code: 415, name: "Unsupported Media Type", desc: "Content-Type des Requests wird vom Server nicht unterstützt.", use: "Falsche Encoding" },
      { code: 422, name: "Unprocessable Entity", desc: "Anfrage ist syntaktisch korrekt, aber semantisch fehlerhaft.", use: "Validierungsfehler (REST)" },
      { code: 429, name: "Too Many Requests", desc: "Rate-Limit überschritten — der Client sendet zu viele Anfragen.", use: "API-Rate-Limiting" },
    ],
  },
  {
    label: "5xx Server Errors",
    color: "#c084fc",
    bg: "rgba(192,132,252,0.1)",
    codes: [
      { code: 500, name: "Internal Server Error", desc: "Allgemeiner Serverfehler ohne spezifische Ursache.", use: "Unbehandelte Exceptions" },
      { code: 501, name: "Not Implemented", desc: "Der Server unterstützt die angeforderte Methode nicht.", use: "Nicht implementierte Features" },
      { code: 502, name: "Bad Gateway", desc: "Upstream-Server hat eine ungültige Antwort geliefert.", use: "Reverse Proxy, Load Balancer" },
      { code: 503, name: "Service Unavailable", desc: "Server ist überlastet oder wartet. Meist temporär.", use: "Deployments, Maintenance" },
      { code: 504, name: "Gateway Timeout", desc: "Upstream-Server hat nicht rechtzeitig geantwortet.", use: "Slow Backend, DB-Timeout" },
      { code: 508, name: "Loop Detected", desc: "Unendliche Weiterleitungsschleife erkannt.", use: "WebDAV, Redirect-Loops" },
    ],
  },
];

export default function HttpStatusCodesPage() {
  const [search, setSearch] = useState("");
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return GROUPS.map(g => ({
      ...g,
      codes: g.codes.filter(c =>
        (!activeGroup || g.label === activeGroup) &&
        (!q || String(c.code).includes(q) || c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q))
      ),
    })).filter(g => g.codes.length > 0);
  }, [search, activeGroup]);

  const totalShown = filtered.reduce((s, g) => s + g.codes.length, 0);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{S}</style>
      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>http-status-codes</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Web &amp; Developer Tools</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.8rem)", color: "#fff", marginBottom: "0.5rem" }}>HTTP Status Codes</h1>
          <p style={{ color: "#94a3b8" }}>Alle HTTP-Statuscodes mit Erklärung und Verwendungszweck — durchsuchbar, offline.</p>
        </div>

        {/* Search + Filters */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <input
            className="search-input"
            placeholder="Code oder Name suchen… z.B. 404, redirect, auth"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
            <button className={`filter-btn ${!activeGroup ? "active" : ""}`} onClick={() => setActiveGroup(null)}>Alle</button>
            {GROUPS.map(g => (
              <button key={g.label} className={`filter-btn ${activeGroup === g.label ? "active" : ""}`} onClick={() => setActiveGroup(activeGroup === g.label ? null : g.label)}>
                {g.label.split(" ")[0]}
              </button>
            ))}
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#334155", marginLeft: "auto" }}>{totalShown} Codes</span>
          </div>
        </div>

        {/* Code cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {filtered.map(g => (
            <div key={g.label}>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: g.color, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem", borderBottom: `1px solid ${g.bg.replace("0.1","0.2")}`, paddingBottom: "0.4rem" }}>
                {g.label}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.75rem" }}>
                {g.codes.map(c => (
                  <div key={c.code} className="code-card">
                    <div className="badge" style={{ background: g.bg, color: g.color }}>{c.code >= 500 ? "5xx" : c.code >= 400 ? "4xx" : c.code >= 300 ? "3xx" : c.code >= 200 ? "2xx" : "1xx"}</div>
                    <div className="code-num" style={{ color: g.color }}>{c.code}</div>
                    <div className="code-name">{c.name}</div>
                    <div className="code-desc">{c.desc}</div>
                    {c.use && <div style={{ marginTop: "0.4rem", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.68rem", color: "#475569" }}>Typisch: {c.use}</div>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
