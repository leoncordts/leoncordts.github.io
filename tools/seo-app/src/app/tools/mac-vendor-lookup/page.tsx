"use client";
import { useState } from "react";

const OUI_ENTRIES: [string, string][] = [
  ["000000","Xerox"],["00000C","Cisco"],["00000E","Fujitsu"],["000055","AT&T"],
  ["000069","Silicon Graphics"],["000080","Cray Communications"],["000095","Sony"],
  ["0000AA","Xerox"],["0000C0","Western Digital"],["0000DD","Cabletron Systems"],
  ["0000F0","Samsung"],["0000F8","DEC"],["000142","Cisco"],["000502","Apple"],
  ["000508","Apple"],["000A27","Apple"],["000A95","Apple"],["000C29","VMware"],
  ["000D93","Apple"],["000E0C","Huawei"],["0010FA","Apple"],["001124","Apple"],
  ["001321","Asus"],["001451","Apple"],["001549","HP"],["0016CB","Apple"],
  ["001731","Apple"],["00173A","Lenovo"],["001788","Intel"],["001882","Huawei"],
  ["0019E3","Apple"],["001A4B","Dell"],["001B21","Intel"],["001B63","Apple"],
  ["001C57","Cisco"],["001CBF","Lenovo"],["001D09","Dell"],["001D4F","Apple"],
  ["001E10","Huawei"],["001E4F","Dell"],["001E52","Apple"],["001F16","Lenovo"],
  ["001F5B","Apple"],["002155","Cisco"],["002170","Lenovo"],["002241","Apple"],
  ["002264","Lenovo"],["002272","Cisco"],["002481","Samsung"],["002513","Lenovo"],
  ["0026BB","Apple"],["002608","Apple"],["002742","Dell"],["002EAF","Cisco"],
  ["003065","Apple"],["0030F2","Cisco"],["003A9A","Cisco"],["003EE1","Apple"],
  ["005056","VMware"],["006286","Samsung"],["00A0C9","Intel"],["00B0D0","Dell"],
  ["00B315","Huawei"],["00C061","Apple"],["00E0FC","Huawei"],["040CCE","Apple"],
  ["04154B","Apple"],["041E64","Apple"],["049226","Asus"],["083E5D","Asus"],
  ["0C74C2","Apple"],["0C77EF","Apple"],["0C8BFD","Samsung"],["10BFCA","Asus"],
  ["14109F","Apple"],["14DDA9","Asus"],["185E0F","Apple"],["189C5D","Samsung"],
  ["1C1AC0","Apple"],["1C232C","Samsung"],["1C62B8","Samsung"],["1C872C","Asus"],
  ["206A8A","Apple"],["20D390","Samsung"],["28BAB5","Samsung"],["28D244","Intel"],
  ["28E02C","Apple"],["2C1F23","Apple"],["2C44FD","Samsung"],["2C56DC","Asus"],
  ["34363B","Apple"],["38B54D","Apple"],["38D547","Asus"],["38ECE4","Samsung"],
  ["3C0754","Apple"],["3C7954","Samsung"],["3C8BFE","Samsung"],["40167E","Asus"],
  ["40A5EF","Intel"],["40D3AE","Samsung"],["44650D","Samsung"],["4C3275","Apple"],
  ["4C3C16","Samsung"],["4C7953","Intel"],["50C7BF","TP-Link"],["5401B4","Samsung"],
  ["54E6FC","TP-Link"],["54EE75","Intel"],["580001","Apple"],["5CA399","Samsung"],
  ["5CAF06","Samsung"],["5CF6DC","Samsung"],["600084","Samsung"],["6069B2","Samsung"],
  ["60AFBD","Samsung"],["640CC7","Samsung"],["6455A5","TP-Link"],["68EBAE","Samsung"],
  ["6C2F2C","Samsung"],["6C8814","Intel"],["6CB7F4","Samsung"],["6CF049","Samsung"],
  ["70F927","Samsung"],["74D02B","Asus"],["74DADA","TP-Link"],["78D6F0","Samsung"],
  ["7C1C4E","Samsung"],["7C6D62","Apple"],["7CC3A1","Samsung"],["80861B","Intel"],
  ["84255F","Samsung"],["8425DB","Samsung"],["84B153","Apple"],["8C7712","Samsung"],
  ["8C89D1","Intel"],["900628","Samsung"],["906E0B","Samsung"],["906E60","Intel"],
  ["9444A1","Samsung"],["947141","Samsung"],["94D9B3","TP-Link"],["9C3AAF","Samsung"],
  ["9C9905","Samsung"],["9CB70D","Intel"],["A00796","Samsung"],["A0369F","Intel"],
  ["A0A4C5","Intel"],["A0B4A5","Samsung"],["A43185","Samsung"],["A45E60","Apple"],
  ["A8B1D4","Intel"],["A8F274","Samsung"],["AC36DD","Samsung"],["AC3C0B","Apple"],
  ["AC7BA1","Intel"],["B05CAB","Samsung"],["B47443","Samsung"],["B4B676","Intel"],
  ["B4EF39","Samsung"],["B8086E","Intel"],["B857D8","Samsung"],["B8FF61","Apple"],
  ["BCEE7B","Asus"],["C00A95","Samsung"],["C43158","Intel"],["C4731E","Samsung"],
  ["C860EB","Asus"],["C869CD","Apple"],["C87B5B","Samsung"],["CC07E4","Samsung"],
  ["CC3D82","Intel"],["D021A8","Samsung"],["D025E7","Apple"],["D04F7E","Intel"],
  ["D487D8","Samsung"],["D8C4E9","Samsung"],["D850E6","Asus"],["D89695","Apple"],
  ["D891A6","Intel"],["DC2B2A","Apple"],["DCF754","Samsung"],["E0D55E","Intel"],
  ["E4A7C5","Samsung"],["E8039A","Samsung"],["E8B4C8","Intel"],["EC1F72","Samsung"],
  ["F0761C","Intel"],["F01D2D","Samsung"],["F08589","Samsung"],["F0DCE2","Apple"],
  ["F40304","Intel"],["F40F24","Apple"],["F41E4B","Samsung"],["F48779","Intel"],
  ["F49B0A","Samsung"],["F4CE46","Asus"],["F832E4","Asus"],["FC0012","Samsung"],
  ["FC253F","Apple"],["FC77EF","Intel"],["FCC734","Samsung"],
  ["001CF4","Xiaomi"],["0C1DAF","Xiaomi"],["106078","Xiaomi"],["14F65A","Xiaomi"],
  ["182060","Xiaomi"],["20F4EB","Xiaomi"],["281865","Xiaomi"],["3480B3","Xiaomi"],
  ["386C78","Xiaomi"],["4CA28A","Xiaomi"],["58448F","Xiaomi"],["64B473","Xiaomi"],
  ["7CB94B","Xiaomi"],["8CBEBE","Xiaomi"],["9C9979","Xiaomi"],["A086C6","Xiaomi"],
  ["AC2260","Xiaomi"],["B0E235","Xiaomi"],["C46AB7","Xiaomi"],["F48B32","Xiaomi"],
  ["F4F5E8","Xiaomi"],["FC64BA","Xiaomi"],
  ["000856","TP-Link"],["002188","TP-Link"],["60322B","TP-Link"],["A84321","TP-Link"],
  ["B0BE76","TP-Link"],["D46E5C","TP-Link"],["E84DF3","TP-Link"],["EC086B","TP-Link"],
  ["F46D04","TP-Link"],
  ["001B11","LG Electronics"],["001C62","LG Electronics"],["001E75","LG Electronics"],
  ["00214D","LG Electronics"],["0026E2","LG Electronics"],["00E091","LG Electronics"],
];

const OUI: Map<string, string> = new Map(OUI_ENTRIES);

function normalizeMAC(input: string): string {
  return input.replace(/[^0-9a-fA-F]/g, "").toUpperCase();
}

function lookupOUI(mac: string): string | null {
  const clean = normalizeMAC(mac);
  if (clean.length < 6) return null;
  return OUI.get(clean.slice(0, 6)) ?? null;
}

function formatMAC(mac: string): string {
  const clean = normalizeMAC(mac).padEnd(12, "0").slice(0, 12);
  return clean.match(/.{1,2}/g)!.join(":").toUpperCase();
}

export default function MacVendorLookupPage() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const clean = normalizeMAC(input);
  const vendor = clean.length >= 6 ? lookupOUI(input) : null;
  const isComplete = clean.length >= 12;
  const formatted = clean.length >= 6 ? formatMAC(input) : null;

  function copy() {
    if (!formatted) return;
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
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
        .mac-input { background: rgba(7,20,34,0.8); border: 2px solid rgba(14,165,233,0.3); border-radius: 0.75rem; color: #e2e8f0; padding: 1.2rem 1.5rem; font-family: 'JetBrains Mono',monospace; font-size: 1.4rem; width: 100%; outline: none; transition: border-color 0.2s; letter-spacing: 0.1em; }
        .mac-input:focus { border-color: rgba(0,212,255,0.6); box-shadow: 0 0 0 3px rgba(0,212,255,0.08); }
        .mac-input::placeholder { color: #1e3a5f; }
        .result-card { border-radius: 1rem; padding: 2rem; text-align: center; border: 1px solid; transition: all 0.3s; }
        .result-found { background: linear-gradient(135deg, rgba(0,212,255,0.08), rgba(14,165,233,0.04)); border-color: rgba(0,212,255,0.3); }
        .result-unknown { background: rgba(100,116,139,0.05); border-color: rgba(100,116,139,0.2); }
        .copy-btn { background: rgba(14,165,233,0.12); border: 1px solid rgba(14,165,233,0.3); color: #38bdf8; border-radius: 0.4rem; padding: 0.35rem 0.75rem; font-size: 0.75rem; font-family: 'JetBrains Mono',monospace; cursor: pointer; transition: all 0.2s; }
        .copy-btn:hover { background: rgba(14,165,233,0.2); }
        .copy-btn.ok { background: rgba(34,197,94,0.15); border-color: rgba(34,197,94,0.3); color: #4ade80; }
        .example-btn { background: rgba(14,165,233,0.06); border: 1px solid rgba(14,165,233,0.15); border-radius: 0.4rem; padding: 0.4rem 0.75rem; cursor: pointer; transition: all 0.2s; }
        .example-btn:hover { border-color: rgba(14,165,233,0.3); background: rgba(14,165,233,0.1); }
      `}</style>

      <nav style={S.nav}>
        <div style={{ maxWidth: "48rem", margin: "0 auto", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <a href="/tools" style={{ color: "#38bdf8", ...S.mono, fontSize: "0.8rem" }}>
            {"<-"} Tools
          </a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", ...S.mono, fontSize: "0.8rem" }}>mac-vendor-lookup</span>
        </div>
      </nav>

      <main style={{ maxWidth: "48rem", margin: "0 auto", padding: "3rem 1.5rem" }}>
        <div style={{ marginBottom: "2.5rem", textAlign: "center" }}>
          <div style={S.label}>Netzwerk &amp; System Tools</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.8rem)", color: "#fff", marginBottom: "0.5rem" }}>
            MAC Vendor Lookup
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1rem" }}>Hersteller anhand der MAC-Adresse identifizieren. 100% offline.</p>
        </div>

        <div style={S.card}>
          <div style={S.label}>MAC-Adresse eingeben</div>
          <input
            className="mac-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="00:1A:2B:3C:4D:5E"
            spellCheck={false}
            maxLength={20}
          />
          <p style={{ color: "#334155", fontSize: "0.72rem", marginTop: "0.5rem", ...S.mono }}>
            Formate: 00:1A:2B:3C:4D:5E oder 001A2B3C4D5E oder nur die OUI (erste 6 Hex-Zeichen)
          </p>
        </div>

        {clean.length >= 6 && (
          <div style={{ marginTop: "1.5rem" }}>
            <div className={`result-card ${vendor ? "result-found" : "result-unknown"}`}>
              {vendor ? (
                <>
                  <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🏭</div>
                  <div style={{ color: "#64748b", fontSize: "0.75rem", ...S.mono, marginBottom: "0.25rem" }}>HERSTELLER</div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.5rem,4vw,2.2rem)", color: "#00d4ff", marginBottom: "0.5rem" }}>
                    {vendor}
                  </div>
                  {formatted && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", marginTop: "0.75rem" }}>
                      <span style={{ color: "#94a3b8", ...S.mono, fontSize: "0.95rem" }}>{formatted}</span>
                      <button className={`copy-btn ${copied ? "ok" : ""}`} onClick={copy}>{copied ? "OK" : "Kopieren"}</button>
                    </div>
                  )}
                  <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center", gap: "1.5rem" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ color: "#475569", fontSize: "0.7rem", ...S.mono }}>OUI</div>
                      <div style={{ color: "#38bdf8", fontSize: "0.85rem", ...S.mono }}>{clean.slice(0, 6).match(/.{1,2}/g)!.join(":")}</div>
                    </div>
                    {isComplete && (
                      <div style={{ textAlign: "center" }}>
                        <div style={{ color: "#475569", fontSize: "0.7rem", ...S.mono }}>NIC</div>
                        <div style={{ color: "#38bdf8", fontSize: "0.85rem", ...S.mono }}>{clean.slice(6, 12).match(/.{1,2}/g)!.join(":")}</div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>?</div>
                  <div style={{ color: "#64748b", fontSize: "0.75rem", ...S.mono, marginBottom: "0.5rem" }}>HERSTELLER</div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#64748b" }}>
                    Unbekannter Hersteller
                  </div>
                  <p style={{ color: "#475569", fontSize: "0.8rem", marginTop: "0.5rem" }}>
                    OUI <span style={{ color: "#94a3b8", ...S.mono }}>{clean.slice(0, 6).match(/.{1,2}/g)!.join(":")}</span> nicht in der lokalen Datenbank.
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        <div style={{ ...S.card, marginTop: "1.5rem" }}>
          <div style={{ ...S.label, marginBottom: "0.75rem" }}>Beispiele ausprobieren</div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {([ ["000A27","Apple"], ["000C29","VMware"], ["00000C","Cisco"], ["001CF4","Xiaomi"], ["50C7BF","TP-Link"] ] as [string,string][]).map(([oui, label]) => (
              <button key={oui} className="example-btn" onClick={() => setInput(oui)}>
                <span style={{ ...S.mono, fontSize: "0.72rem", color: "#38bdf8" }}>{oui.match(/.{1,2}/g)!.join(":")}</span>
                <span style={{ fontSize: "0.72rem", color: "#475569", marginLeft: "0.5rem" }}>{label}</span>
              </button>
            ))}
          </div>
          <p style={{ color: "#334155", fontSize: "0.72rem", marginTop: "1rem", ...S.mono }}>
            Datenbank: {OUI_ENTRIES.length} OUI-Eintraege
          </p>
        </div>
      </main>
    </div>
  );
}
