"use client";
import { useState, useCallback } from "react";

// Compact OUI database — most common vendors (deduplicated)
const OUI_RAW: [string, string][] = [
  ["000000", "Xerox"],
  ["000001", "Xerox"],
  ["00000C", "Cisco"],
  ["00000E", "Fujitsu"],
  ["00000F", "NeXT"],
  "000010": "Sytek",
  "000020": "DIAB",
  "000022": "Visual Technology",
  "000029": "IMC",
  "00002A": "TRW",
  "000037": "Oxford Metrics",
  "00003C": "Auspex Systems",
  "000044": "Castelle",
  "000046": "ISC-Bunker Ramo",
  "000048": "Seagate Technology",
  "00004C": "NEC",
  "00004E": "Ampex",
  "000051": "Hob Electronic",
  "000055": "AT&T",
  "00005A": "SK-Data",
  "00005E": "IANA",
  "00005F": "Sumitomo",
  "000061": "Gateway Communications",
  "000062": "Bulletin",
  "000065": "Network General",
  "000069": "Silicon Graphics",
  "00006B": "MIPS",
  "000077": "MIPS",
  "000079": "Netronix",
  "00007A": "Ardent",
  "00007B": "Research Machines",
  "00007D": "Cray Research",
  "00007F": "Linotype",
  "000080": "Cray Communications",
  "000086": "Megahertz",
  "000089": "Cayman Systems",
  "00008A": "Datapoint",
  "00008E": "Solbourne",
  "000093": "Proteon",
  "000094": "Asante Technologies",
  "000095": "Sony",
  "000097": "Epoch",
  "00009F": "Ameriquest Technologies",
  "0000A0": "Sanyo Electronics",
  "0000A2": "Bay Networks",
  "0000A3": "Network Application Technology",
  "0000A4": "Acorn",
  "0000A6": "Network General",
  "0000A7": "Network Computing Devices",
  "0000A9": "Network Systems",
  "0000AA": "Xerox",
  "0000AC": "Apollo",
  "0000AE": "Dalanet",
  "0000B0": "RND",
  "0000B3": "Cimlinc",
  "0000B7": "Dove",
  "0000BC": "Allen-Bradley",
  "0000C0": "Western Digital",
  "0000C5": "Farallon",
  "0000C6": "HP Intelligent Networks",
  "0000C8": "Altos Computer Systems",
  "0000C9": "Emulex",
  "0000D0": "Develcon Electronics",
  "0000D1": "Adaptec",
  "0000D7": "Dartmouth College",
  "0000D8": "Novell",
  "0000DD": "Cabletron Systems",
  "0000DE": "Unison-Tymlabs",
  "0000E2": "Acer",
  "0000E3": "Interlan",
  "0000E6": "Apricot",
  "0000E8": "Accton Technology",
  "0000EE": "Network Designers",
  "0000EF": "Alantec",
  "0000F0": "Samsung",
  "0000F3": "Gandalf",
  "0000F4": "Allied Telesis",
  "0000F6": "Whittaker-Xyplex",
  "0000F8": "DEC",
  "0000FB": "Rechner zur Kommunikation",
  "0000FD": "High Level Hardware",
  "000102": "BBN",
  "000143": "IEEE 802.1 Testing",
  "000163": "Sievert Larson",
  "0001E3": "Siemens Nixdorf",
  "000347": "AboCom Systems",
  "00044B": "Toshiba America",
  "000461": "Motorola",
  "00047D": "Motorola",
  "0004E2": "Toshiba",
  "000502": "Apple",
  "000508": "Apple",
  "000A27": "Apple",
  "000A95": "Apple",
  "000D93": "Apple",
  "0010FA": "Apple",
  "0011CB": "Apple",
  "001124": "Apple",
  "001451": "Apple",
  "0016CB": "Apple",
  "001731": "Apple",
  "0019E3": "Apple",
  "001B63": "Apple",
  "001D4F": "Apple",
  "001E52": "Apple",
  "001EC2": "Apple",
  "001F5B": "Apple",
  "001FF3": "Apple",
  "002241": "Apple",
  "0023DF": "Apple",
  "002500": "Apple",
  "002608": "Apple",
  "0026BB": "Apple",
  "003065": "Apple",
  "003EE1": "Apple",
  "006171": "Apple",
  "009EC8": "Apple",
  "00A040": "Apple",
  "00A095": "Apple",
  "00C061": "Apple",
  "040CCE": "Apple",
  "04154B": "Apple",
  "041E64": "Apple",
  "0C74C2": "Apple",
  "0C77EF": "Apple",
  "14109F": "Apple",
  "185E0F": "Apple",
  "1C1AC0": "Apple",
  "206A8A": "Apple",
  "28E02C": "Apple",
  "2C1F23": "Apple",
  "34363B": "Apple",
  "38B54D": "Apple",
  "3C0754": "Apple",
  "4C3275": "Apple",
  "580001": "Apple",
  "6C40088": "Apple",
  "7831C1": "Apple",
  "7C6D62": "Apple",
  "84B153": "Apple",
  "A45E60": "Apple",
  "AC3C0B": "Apple",
  "B8FF61": "Apple",
  "C869CD": "Apple",
  "D025E7": "Apple",
  "D89695": "Apple",
  "DC2B2A": "Apple",
  "F0DCE2": "Apple",
  "F40F24": "Apple",
  "FC253F": "Apple",
  "002272": "Cisco",
  "0030F2": "Cisco",
  "000142": "Cisco",
  "001B2B": "Cisco",
  "001C57": "Cisco",
  "001E49": "Cisco",
  "002155": "Cisco",
  "0023BE": "Cisco",
  "0024F7": "Cisco",
  "002EAF": "Cisco",
  "003A9A": "Cisco",
  "005056": "VMware",
  "000C29": "VMware",
  "000D56": "Dell",
  "00188B": "Dell",
  "001143": "Dell",
  "001560": "Dell",
  "001A4B": "Dell",
  "001D09": "Dell",
  "001E4F": "Dell",
  "00219B": "Dell",
  "002269": "Dell",
  "0023AE": "Dell",
  "002564": "Dell",
  "002742": "Dell",
  "00B0D0": "Dell",
  "00065B": "Dell",
  "002481": "Samsung",
  "002567": "Samsung",
  "0026E8": "Samsung",
  "002839": "Samsung",
  "002DA1": "Samsung",
  "0031F3": "Samsung",
  "00325C": "Samsung",
  "0037E9": "Samsung",
  "003DE3": "Samsung",
  "0047D9": "Samsung",
  "0049C1": "Samsung",
  "004E01": "Samsung",
  "005080": "Samsung",
  "00545B": "Samsung",
  "005A14": "Samsung",
  "005E6C": "Samsung",
  "006286": "Samsung",
  "006DB5": "Samsung",
  "0074E1": "Samsung",
  "008701": "Samsung",
  "009D6B": "Samsung",
  "00A047": "Samsung",
  "00B357": "Samsung",
  "00C08B": "Samsung",
  "00C78F": "Samsung",
  "00D02E": "Samsung",
  "00D09E": "Samsung",
  "00E3B2": "Samsung",
  "00F46F": "Samsung",
  "00F7C2": "Samsung",
  "0C8BFD": "Samsung",
  "1072C7": "Samsung",
  "149182": "Samsung",
  "189C5D": "Samsung",
  "1C232C": "Samsung",
  "1C62B8": "Samsung",
  "1C66AA": "Samsung",
  "20D390": "Samsung",
  "28BAB5": "Samsung",
  "2C4401": "Samsung",
  "2C44FD": "Samsung",
  "3047B6": "Samsung",
  "38ECE4": "Samsung",
  "3C7954": "Samsung",
  "3C8BFE": "Samsung",
  "40D3AE": "Samsung",
  "44650D": "Samsung",
  "488095": "Samsung",
  "4C3C16": "Samsung",
  "5401B4": "Samsung",
  "5CA399": "Samsung",
  "5CAF06": "Samsung",
  "5CF6DC": "Samsung",
  "600084": "Samsung",
  "6006B7": "Samsung",
  "6069B2": "Samsung",
  "60AFBD": "Samsung",
  "640CC7": "Samsung",
  "68EBAE": "Samsung",
  "6C2F2C": "Samsung",
  "6CB7F4": "Samsung",
  "6CF049": "Samsung",
  "70F927": "Samsung",
  "78D6F0": "Samsung",
  "7C1C4E": "Samsung",
  "7CC3A1": "Samsung",
  "84255F": "Samsung",
  "8425DB": "Samsung",
  "8C7712": "Samsung",
  "8C771F": "Samsung",
  "900628": "Samsung",
  "9000DB": "Samsung",
  "906E0B": "Samsung",
  "9444A1": "Samsung",
  "947141": "Samsung",
  "9C3AAF": "Samsung",
  "9C9905": "Samsung",
  "A00796": "Samsung",
  "A0B4A5": "Samsung",
  "A0CBFD": "Samsung",
  "A43185": "Samsung",
  "A8F274": "Samsung",
  "AC36DD": "Samsung",
  "B063B6": "Samsung",
  "B05CAB": "Samsung",
  "B47443": "Samsung",
  "B4EF39": "Samsung",
  "B857D8": "Samsung",
  "C00A95": "Samsung",
  "C4731E": "Samsung",
  "C87B5B": "Samsung",
  "CC07E4": "Samsung",
  "D021A8": "Samsung",
  "D487D8": "Samsung",
  "D8C4E9": "Samsung",
  "DCF754": "Samsung",
  "E8039A": "Samsung",
  "E4A7C5": "Samsung",
  "EC1F72": "Samsung",
  "F01D2D": "Samsung",
  "F08589": "Samsung",
  "F41E4B": "Samsung",
  "F49B0A": "Samsung",
  "FC0012": "Samsung",
  "FCC734": "Samsung",
  "001788": "Intel",
  "001B21": "Intel",
  "001C23": "Intel",
  "001DE0": "Intel",
  "001E64": "Intel",
  "001E67": "Intel",
  "002168": "Intel",
  "0021F7": "Intel",
  "002219": "Intel",
  "00247B": "Intel",
  "00247D": "Intel",
  "002489": "Intel",
  "0024D6": "Intel",
  "0024D7": "Intel",
  "0026C6": "Intel",
  "0026C7": "Intel",
  "002777": "Intel",
  "00A0C9": "Intel",
  "000BDB": "Intel",
  "000E0C": "Huawei",
  "000E35": "Huawei",
  "001882": "Huawei",
  "0019C6": "Huawei",
  "001AA0": "Huawei",
  "001E10": "Huawei",
  "001F64": "Huawei",
  "00212F": "Huawei",
  "0022A1": "Huawei",
  "00259E": "Huawei",
  "002739": "Huawei",
  "003215": "Huawei",
  "003418": "Huawei",
  "0034FE": "Huawei",
  "003A73": "Huawei",
  "004BA4": "Huawei",
  "005A13": "Huawei",
  "00664B": "Huawei",
  "006B8E": "Huawei",
  "009062": "Huawei",
  "00A024": "Huawei",
  "00B315": "Huawei",
  "00E0FC": "Huawei",
  "001F6C": "Intel",
  "002B67": "Intel",
  "046C59": "Intel",
  "10023B": "Intel",
  "1065BF": "Intel",
  "18037F": "Intel",
  "246E96": "Intel",
  "28D244": "Intel",
  "40A5EF": "Intel",
  "48D224": "Intel",
  "4C7953": "Intel",
  "4CE676": "Intel",
  "54EE75": "Intel",
  "60576E": "Intel",
  "60A44C": "Intel",
  "6805CA": "Intel",
  "6C8814": "Intel",
  "78928C": "Intel",
  "788CB5": "Intel",
  "7C7A91": "Intel",
  "80861B": "Intel",
  "8C89D1": "Intel",
  "906E60": "Intel",
  "9CB70D": "Intel",
  "A0369F": "Intel",
  "A0A4C5": "Intel",
  "A4C3F0": "Intel",
  "A8B1D4": "Intel",
  "AC7BA1": "Intel",
  "B4B676": "Intel",
  "B8086E": "Intel",
  "B892BB": "Intel",
  "C43158": "Intel",
  "CC3D82": "Intel",
  "D04F7E": "Intel",
  "D891A6": "Intel",
  "DC531D": "Intel",
  "E0D55E": "Intel",
  "E8B4C8": "Intel",
  "F0761C": "Intel",
  "F40304": "Intel",
  "F48779": "Intel",
  "FC77EF": "Intel",
  "001B11": "LG Electronics",
  "00E091": "LG Electronics",
  "001C62": "LG Electronics",
  "001E75": "LG Electronics",
  "00214D": "LG Electronics",
  "0026E2": "LG Electronics",
  "001CF4": "Xiaomi",
  "0C1DAF": "Xiaomi",
  "106078": "Xiaomi",
  "14F65A": "Xiaomi",
  "182060": "Xiaomi",
  "20F4EB": "Xiaomi",
  "281865": "Xiaomi",
  "3480B3": "Xiaomi",
  "386C78": "Xiaomi",
  "4CA28A": "Xiaomi",
  "58448F": "Xiaomi",
  "64B473": "Xiaomi",
  "7851D7": "Xiaomi",
  "7CB94B": "Xiaomi",
  "8CBEBE": "Xiaomi",
  "98FAE3": "Xiaomi",
  "9C9979": "Xiaomi",
  "A086C6": "Xiaomi",
  "AC2260": "Xiaomi",
  "B0E235": "Xiaomi",
  "C46AB7": "Xiaomi",
  "F48B32": "Xiaomi",
  "F4F5E8": "Xiaomi",
  "FC64BA": "Xiaomi",
  "000856": "TP-Link",
  "002188": "TP-Link",
  "0023CD": "TP-Link",
  "50C7BF": "TP-Link",
  "54E6FC": "TP-Link",
  "60322B": "TP-Link",
  "6455A5": "TP-Link",
  "74DADA": "TP-Link",
  "94D9B3": "TP-Link",
  "A42BB0": "TP-Link",
  "A84321": "TP-Link",
  "B0BE76": "TP-Link",
  "C025E9": "TP-Link",
  "D46E5C": "TP-Link",
  "E84DF3": "TP-Link",
  "EC086B": "TP-Link",
  "F46D04": "TP-Link",
  "001018": "Broadcom",
  "001040": "Broadcom",
  "001058": "Broadcom",
  "001060": "Broadcom",
  "001062": "Broadcom",
  "001064": "Broadcom",
  "001174": "Broadcom",
  "00A0CC": "Lite-On",
  "00A0D2": "Allied Telesyn",
  "00B0AE": "Cisco",
  "00C0A4": "Computerm",
  "00C0DD": "QMS",
  "00D0BA": "BreezeCOM",
  "0800C7": "Xircom",
  "0800D0": "Pixel Computer",
  "080020": "Sun Microsystems",
  "08002B": "DEC",
  "08006E": "3Com",
  "08007C": "Vitalink",
  "080086": "Imagen",
  "0800A7": "NovAtel",
  "0800B7": "Motorola",
  "1C4D70": "Motorola",
  "001E2A": "Motorola",
  "000F76": "Motorola",
  "001B76": "Motorola",
  "0021A8": "Motorola",
  "001CCB": "Lenovo",
  "002513": "Lenovo",
  "00173A": "Lenovo",
  "001CBF": "Lenovo",
  "001F16": "Lenovo",
  "002170": "Lenovo",
  "00224E": "Lenovo",
  "002399": "Lenovo",
  "003CFC": "HP",
  "0011E3": "HP",
  "001438": "HP",
  "001549": "HP",
  "0016B9": "HP",
  "0018FE": "HP",
  "001E0B": "HP",
  "001F29": "HP",
  "002048": "HP",
  "00215A": "HP",
  "002265": "HP",
  "001321": "Asus",
  "049226": "Asus",
  "083E5D": "Asus",
  "10BFCA": "Asus",
  "14DDA9": "Asus",
  "1C872C": "Asus",
  "2C56DC": "Asus",
  "38D547": "Asus",
  "40167E": "Asus",
  "4C34886": "Asus",
  "70F1A1": "Asus",
  "74D02B": "Asus",
  "90E6BA": "Asus",
  "9C5C8E": "Asus",
  "A8F7E0": "Asus",
  "B06EBF": "Asus",
  "BC AE C5": "Asus",
  "BCEE7B": "Asus",
  "C860EB": "Asus",
  "D850E6": "Asus",
  "F4CE46": "Asus",
  "F832E4": "Asus",
};

function normalizeMAC(input: string): string {
  return input.replace(/[^0-9a-fA-F]/g, "").toUpperCase();
}

function lookupOUI(mac: string): string | null {
  const clean = normalizeMAC(mac);
  if (clean.length < 6) return null;
  const oui = clean.slice(0, 6);
  return OUI[oui] ?? null;
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
        .result-unknown { background: linear-gradient(135deg, rgba(100,116,139,0.08), rgba(100,116,139,0.04)); border-color: rgba(100,116,139,0.2); }
        .copy-btn { background: rgba(14,165,233,0.12); border: 1px solid rgba(14,165,233,0.3); color: #38bdf8; border-radius: 0.4rem; padding: 0.35rem 0.75rem; font-size: 0.75rem; font-family: 'JetBrains Mono',monospace; cursor: pointer; transition: all 0.2s; }
        .copy-btn:hover { background: rgba(14,165,233,0.2); }
        .copy-btn.ok { background: rgba(34,197,94,0.15); border-color: rgba(34,197,94,0.3); color: #4ade80; }
      `}</style>

      <nav style={S.nav}>
        <div style={{ maxWidth: "48rem", margin: "0 auto", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <a href="/tools" style={{ color: "#38bdf8", ...S.mono, fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", ...S.mono, fontSize: "0.8rem" }}>mac-vendor-lookup</span>
        </div>
      </nav>

      <main style={{ maxWidth: "48rem", margin: "0 auto", padding: "3rem 1.5rem" }}>
        <div style={{ marginBottom: "2.5rem", textAlign: "center" }}>
          <div style={S.label}>Netzwerk & System Tools</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.8rem)", color: "#fff", marginBottom: "0.5rem" }}>
            MAC Vendor Lookup
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1rem" }}>Hersteller anhand der MAC-Adresse identifizieren. 100% offline — lokale OUI-Datenbank.</p>
        </div>

        {/* Input */}
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
            Formate: 00:1A:2B:3C:4D:5E · 00-1A-2B-3C-4D-5E · 001A2B3C4D5E · OUI reicht (erste 6 Zeichen)
          </p>
        </div>

        {/* Result */}
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
                      <button className={`copy-btn ${copied ? "ok" : ""}`} onClick={copy}>{copied ? "✓" : "Kopieren"}</button>
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
                  <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>❓</div>
                  <div style={{ color: "#64748b", fontSize: "0.75rem", ...S.mono, marginBottom: "0.5rem" }}>HERSTELLER</div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "#64748b" }}>
                    Unbekannter Hersteller
                  </div>
                  <p style={{ color: "#475569", fontSize: "0.8rem", marginTop: "0.5rem" }}>
                    OUI <span style={{ color: "#94a3b8", ...S.mono }}>{clean.slice(0, 6).match(/.{1,2}/g)!.join(":")}</span> nicht in der lokalen Datenbank gefunden.
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Info */}
        <div style={{ ...S.card, marginTop: "1.5rem" }}>
          <div style={S.label}>Was ist eine MAC-Adresse?</div>
          <p style={{ color: "#64748b", fontSize: "0.85rem", lineHeight: 1.7 }}>
            Eine MAC-Adresse (Media Access Control) ist eine eindeutige Hardware-Kennung eines Netzwerkgeräts. Die ersten 3 Bytes (OUI) identifizieren den Hersteller — die letzten 3 Bytes sind gerätespezifisch.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem", flexWrap: "wrap" }}>
            {[["00:1A:2B:XX:XX:XX", "Apple"], ["00:50:56:XX:XX:XX", "VMware"], ["00:00:0C:XX:XX:XX", "Cisco"]].map(([mac, vendor]) => (
              <button
                key={mac}
                onClick={() => setInput(mac.replace(/:XX/g, ""))}
                style={{ background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.15)", borderRadius: "0.4rem", padding: "0.4rem 0.75rem", color: "#64748b", cursor: "pointer", transition: "all 0.2s" }}
              >
                <span style={{ ...S.mono, fontSize: "0.72rem", color: "#38bdf8" }}>{mac.slice(0, 8)}</span>
                <span style={{ fontSize: "0.72rem", color: "#475569", marginLeft: "0.5rem" }}>{vendor}</span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
