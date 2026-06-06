"use client";

import { useState } from "react";

interface HackStep {
  step: number;
  title: string;
  detail: string;
}

interface HackStrategy {
  id: string;
  label: string;
  description: string;
  savings_pct: number;
  monthly_eur_normal: number;
  monthly_eur_optimized: number;
  steps: HackStep[];
}

interface Service {
  id: string;
  name: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  border: string;
  monthly_eur_normal: number;
  strategies: HackStrategy[];
}

const SERVICES: Service[] = [
  {
    id: "youtube",
    name: "YouTube Premium",
    icon: "▶",
    iconBg: "rgba(255,0,0,0.12)",
    iconColor: "#ff4444",
    border: "rgba(255,68,68,0.2)",
    monthly_eur_normal: 13.99,
    strategies: [
      {
        id: "yt-vpn-nigeria",
        label: "VPN-Hack (Nigeria/Indien)",
        description: "Erstelle ein neues Konto über VPN in Nigeria oder Indien – bis zu 87% günstiger über eine virtuelle Kreditkarte.",
        savings_pct: 87,
        monthly_eur_normal: 13.99,
        monthly_eur_optimized: 1.82,
        steps: [
          { step: 1, title: "VPN installieren", detail: "Lade Mullvad VPN oder ProtonVPN herunter. Verbinde dich mit einem Server in Nigeria oder Indien." },
          { step: 2, title: "Neues Google-Konto erstellen", detail: "Öffne incognito, gehe zu accounts.google.com und erstelle ein frisches Google-Konto." },
          { step: 3, title: "Virtuelle Kreditkarte besorgen", detail: "Erstelle eine virtuelle Karte bei Revolut oder N26 (kostenlos). Rechnungsadresse auf Nigeria/Indien setzen." },
          { step: 4, title: "YouTube Premium abonnieren", detail: "Öffne youtube.com während VPN aktiv ist. Du siehst jetzt den lokalen Preis (~1,50–2 €/Monat). Kaufe mit deiner virtuellen Karte." },
          { step: 5, title: "VPN-Tipp", detail: "VPN muss nur beim Verlängern aktiv sein, nicht beim täglichen Nutzen." },
        ],
      },
      {
        id: "yt-family",
        label: "Familien-Tarif splitten",
        description: "Teile einen Familien-Plan mit 5 Freunden – jeder zahlt nur ~3,83 €/Monat.",
        savings_pct: 73,
        monthly_eur_normal: 13.99,
        monthly_eur_optimized: 3.83,
        steps: [
          { step: 1, title: "Familien-Tarif buchen", detail: "Buche YouTube Premium Familien für 22,99 €/Monat. Damit kannst du bis zu 5 weitere Mitglieder einladen." },
          { step: 2, title: "Mitglieder rekrutieren", detail: "Finde 5 vertrauenswürdige Freunde oder Familienmitglieder." },
          { step: 3, title: "Kosten aufteilen", detail: "22,99 € / 6 Personen = ~3,83 €/Person. Nutze Splitwise für monatliche Erinnerungen." },
          { step: 4, title: "Zahlung organisieren", detail: "PayPal.Me oder IBAN-Lastschrift empfohlen." },
        ],
      },
    ],
  },
  {
    id: "netflix",
    name: "Netflix",
    icon: "N",
    iconBg: "rgba(229,9,20,0.12)",
    iconColor: "#e50914",
    border: "rgba(229,9,20,0.2)",
    monthly_eur_normal: 17.99,
    strategies: [
      {
        id: "netflix-turkey",
        label: "Türkei-Konto + Geschenkkarte",
        description: "Netflix-Konto in der Türkei mit lokaler Geschenkkarte erstellen – spart bis zu 70% gegenüber dem DE-Preis.",
        savings_pct: 70,
        monthly_eur_normal: 17.99,
        monthly_eur_optimized: 5.40,
        steps: [
          { step: 1, title: "VPN auf Türkei setzen", detail: "Verbinde dich via VPN mit einem türkischen Server (z. B. Istanbul). NordVPN und ExpressVPN haben stabile TR-Server." },
          { step: 2, title: "Netflix-Konto erstellen", detail: "Öffne netflix.com im incognito-Modus. Erstelle ein neues Konto – das Registrierungsland wird automatisch als Türkei erfasst." },
          { step: 3, title: "Geschenkkarte kaufen", detail: "Kaufe eine Netflix-Türkei-Geschenkkarte auf Kinguin.net, G2A oder Eneba. Achte auf Bewertungen >95% positiv." },
          { step: 4, title: "Karte einlösen", detail: "Gehe zu netflix.com/redeem und gib den Code ein (VPN weiterhin aktiv). Guthaben wird in türkische Lira (TRY) gutgeschrieben." },
          { step: 5, title: "Verlängerung", detail: "Kaufe alle 1–3 Monate neue Geschenkkarten. VPN ist nur beim Einlösen nötig." },
        ],
      },
      {
        id: "netflix-brazil",
        label: "Brasilien-Konto",
        description: "Brasilianische Netflix-Preise sind ~60% günstiger – mit Wise-Karte als Zahlungsmethode.",
        savings_pct: 60,
        monthly_eur_normal: 17.99,
        monthly_eur_optimized: 7.20,
        steps: [
          { step: 1, title: "VPN auf Brasilien setzen", detail: "Verbinde dich mit einem brasilianischen VPN-Server (São Paulo ist am stabilsten)." },
          { step: 2, title: "Konto erstellen", detail: "Erstelle ein neues Netflix-Konto im incognito-Modus mit brasilianischer IP." },
          { step: 3, title: "Wise-Karte besorgen", detail: "Erstelle eine kostenlose Wise-Karte. Lade BRL (brasilianische Real) auf die Karte." },
          { step: 4, title: "Abonnieren", detail: "Wähle den Standard-Plan in BRL. Aktuell ~40 BRL/Monat, ca. 7–8 € Gegenwert." },
        ],
      },
    ],
  },
  {
    id: "spotify",
    name: "Spotify",
    icon: "♫",
    iconBg: "rgba(29,185,84,0.12)",
    iconColor: "#1db954",
    border: "rgba(29,185,84,0.2)",
    monthly_eur_normal: 10.99,
    strategies: [
      {
        id: "spotify-prepaid",
        label: "12-Monats-Prepaid-Karte",
        description: "Kaufe eine Jahres-Geschenkkarte statt Monatsabo – spart ~20% plus kein Abo-Stress.",
        savings_pct: 20,
        monthly_eur_normal: 10.99,
        monthly_eur_optimized: 8.74,
        steps: [
          { step: 1, title: "Jahres-Karte kaufen", detail: "Kaufe eine Spotify 12-Monats-Karte bei Amazon, MediaMarkt oder Eneba. Oft gibt es 10–20% Rabatt bei Sales." },
          { step: 2, title: "Cashback aktivieren", detail: "Aktiviere Shoop.de oder Igraal.com-Cashback vor dem Kauf. Zusätzlich 3–8% zurück möglich." },
          { step: 3, title: "Code einlösen", detail: "Gehe zu spotify.com/redeem und gib deinen Code ein. Guthaben wird als Prepaid-Zeit gutgeschrieben." },
          { step: 4, title: "Auto-Verlängerung deaktivieren", detail: "Gehe zu Kontoeinstellungen → Abo → Auto-Erneuerung ausschalten." },
        ],
      },
      {
        id: "spotify-family",
        label: "Familien-Plan splitten",
        description: "Spotify Premium Familie (6 Pers.) für 17,99 €: jeder zahlt nur ~3 €/Monat.",
        savings_pct: 73,
        monthly_eur_normal: 10.99,
        monthly_eur_optimized: 3.00,
        steps: [
          { step: 1, title: "Familien-Plan buchen", detail: "Buche Spotify Premium Familie für 17,99 €/Monat. Bis zu 6 Mitglieder möglich." },
          { step: 2, title: "Mitglieder einladen", detail: "Gehe zu spotify.com/family, klicke 'Mitglied hinzufügen'. Alle tragen dieselbe Heimadresse ein." },
          { step: 3, title: "Kosten aufteilen", detail: "17,99 € / 6 = ~3 €/Person. Nutze Splitwise für automatische monatliche Erinnerungen." },
        ],
      },
    ],
  },
  {
    id: "adobe",
    name: "Adobe Creative Cloud",
    icon: "Ai",
    iconBg: "rgba(255,0,0,0.12)",
    iconColor: "#ff3d00",
    border: "rgba(255,61,0,0.2)",
    monthly_eur_normal: 54.99,
    strategies: [
      {
        id: "adobe-retention",
        label: "Retention-Loop (50% Rabatt)",
        description: "Simulierte Kündigung im Adobe-Dashboard triggert automatisch 50% Rabatt für 3–6 Monate.",
        savings_pct: 50,
        monthly_eur_normal: 54.99,
        monthly_eur_optimized: 27.49,
        steps: [
          { step: 1, title: "Adobe Dashboard öffnen", detail: "Gehe zu account.adobe.com. Klicke auf 'Abo verwalten' → 'Abo kündigen'. Noch NICHT final bestätigen." },
          { step: 2, title: "Kündigungsflow durchlaufen", detail: "Adobe fragt nach dem Grund. Wähle 'Zu teuer'. Klicke weiter durch alle Screens." },
          { step: 3, title: "Auf das Angebot warten", detail: "Auf dem vorletzten Screen erscheint typischerweise: '50% Rabatt für die nächsten 3 Monate'." },
          { step: 4, title: "Angebot annehmen", detail: "Klicke 'Angebot annehmen'. Die Kündigung wird abgebrochen, du sparst sofort." },
          { step: 5, title: "Loop wiederholen", detail: "Wenn der Rabatt ausläuft, wiederhole den Vorgang. Adobe gibt diesen Rabatt häufig erneut." },
        ],
      },
    ],
  },
];

function formatEur(val: number) {
  return val.toFixed(2).replace(".", ",") + " €";
}

type Phase = "input" | "result";

export default function AboRechnerPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [phase, setPhase] = useState<Phase>("input");
  const [activeGuide, setActiveGuide] = useState<string | null>(null);

  const toggleService = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectedServices = SERVICES.filter((s) => selected.has(s.id));

  const bestStrategy = (svc: Service) =>
    svc.strategies.reduce((a, b) => (a.savings_pct > b.savings_pct ? a : b));

  const totalNormal = selectedServices.reduce((s, svc) => s + svc.monthly_eur_normal, 0);
  const totalOptimized = selectedServices.reduce(
    (s, svc) => s + bestStrategy(svc).monthly_eur_optimized,
    0
  );
  const savedMonth = totalNormal - totalOptimized;
  const savedYear = savedMonth * 12;
  const overallPct = totalNormal > 0 ? Math.round((savedMonth / totalNormal) * 100) : 0;

  const handleCalculate = () => {
    setPhase("result");
    setTimeout(() => {
      document.getElementById("result-section")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const handleReset = () => {
    setPhase("input");
    setSelected(new Set());
    setActiveGuide(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#020b18",
        color: "#e2e8f0",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Nav */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "18px 0" }}>
        <div
          style={{
            maxWidth: 1000,
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div
              style={{
                width: 30,
                height: 30,
                background: "linear-gradient(135deg,#00d4ff,#0099cc)",
                borderRadius: 7,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 13,
                color: "#020b18",
              }}
            >
              LC
            </div>
            <span
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                fontSize: 15,
                color: "#fff",
              }}
            >
              Leon Cordts
            </span>
          </a>
          <a
            href="https://leoncordts.github.io/tools"
            style={{ fontSize: 13, color: "#475569", textDecoration: "none" }}
          >
            ← Alle Tools
          </a>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "52px 24px 80px" }}>
        {/* ── PHASE 1: INPUT ─────────────────────────────────────────── */}
        <div>
          {/* Hero */}
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(34,197,94,0.09)",
                border: "1px solid rgba(34,197,94,0.25)",
                borderRadius: 20,
                padding: "5px 14px",
                marginBottom: 22,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: "#4ade80",
                  fontFamily: "monospace",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                }}
              >
                SMART HACKS
              </span>
            </div>
            <h1
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "clamp(26px,5vw,46px)",
                fontWeight: 800,
                color: "#fff",
                margin: "0 0 14px",
                lineHeight: 1.15,
              }}
            >
              Wie viel zahlst du{" "}
              <span style={{ color: "#ef4444" }}>zu viel</span>
              <br />
              für deine Abos?
            </h1>
            <p style={{ fontSize: 16, color: "#64748b", maxWidth: 480, margin: "0 auto" }}>
              Wähle deine aktiven Abonnements aus und finde heraus, was du wirklich zahlen müsstest.
            </p>
          </div>

          {/* Service tiles */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 14,
              marginBottom: 40,
            }}
          >
            {SERVICES.map((svc) => {
              const isSelected = selected.has(svc.id);
              return (
                <button
                  key={svc.id}
                  onClick={() => toggleService(svc.id)}
                  style={{
                    background: isSelected
                      ? "rgba(34,197,94,0.09)"
                      : "rgba(255,255,255,0.02)",
                    border: `2px solid ${
                      isSelected ? "rgba(34,197,94,0.5)" : "rgba(255,255,255,0.07)"
                    }`,
                    borderRadius: 16,
                    padding: "24px 20px",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 0.18s",
                    position: "relative",
                  }}
                >
                  {isSelected && (
                    <div
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        width: 20,
                        height: 20,
                        background: "#4ade80",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        color: "#020b18",
                        fontWeight: 800,
                      }}
                    >
                      ✓
                    </div>
                  )}
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      background: svc.iconBg,
                      border: `1px solid ${svc.border}`,
                      borderRadius: 14,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                      fontSize: 18,
                      color: svc.iconColor,
                      margin: "0 auto 14px",
                    }}
                  >
                    {svc.icon}
                  </div>
                  <p
                    style={{
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 700,
                      fontSize: 15,
                      color: isSelected ? "#fff" : "#cbd5e1",
                      margin: "0 0 6px",
                    }}
                  >
                    {svc.name}
                  </p>
                  <p
                    style={{
                      fontSize: 13,
                      color: isSelected ? "#94a3b8" : "#475569",
                      margin: 0,
                      fontFamily: "monospace",
                    }}
                  >
                    {formatEur(svc.monthly_eur_normal)}/Mo
                  </p>
                </button>
              );
            })}
          </div>

          {/* CTA Button */}
          <div style={{ textAlign: "center" }}>
            {selected.size === 0 ? (
              <p style={{ color: "#334155", fontSize: 14 }}>
                Wähle mindestens ein Abo aus ↑
              </p>
            ) : (
              <div>
                <p style={{ color: "#64748b", fontSize: 13, marginBottom: 16 }}>
                  {selected.size} Abo{selected.size > 1 ? "s" : ""} ausgewählt &middot;{" "}
                  <span style={{ color: "#ef4444", fontFamily: "monospace", fontWeight: 700 }}>
                    {formatEur(totalNormal)}/Monat
                  </span>
                </p>
                <button
                  onClick={handleCalculate}
                  style={{
                    background: "linear-gradient(135deg,#4ade80,#22c55e)",
                    border: "none",
                    borderRadius: 14,
                    padding: "16px 40px",
                    fontSize: 17,
                    fontWeight: 700,
                    color: "#020b18",
                    cursor: "pointer",
                    boxShadow: "0 0 40px rgba(34,197,94,0.35), 0 4px 20px rgba(0,0,0,0.4)",
                    fontFamily: "'Syne', sans-serif",
                    transition: "transform 0.15s, box-shadow 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 0 55px rgba(34,197,94,0.5), 0 6px 28px rgba(0,0,0,0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 0 40px rgba(34,197,94,0.35), 0 4px 20px rgba(0,0,0,0.4)";
                  }}
                >
                  Mein Sparpotenzial berechnen 🚀
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── PHASE 2: RESULT ────────────────────────────────────────── */}
        {phase === "result" && (
          <div id="result-section" style={{ marginTop: 80 }}>
            {/* Divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 48,
              }}
            >
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "monospace",
                  color: "#4ade80",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                }}
              >
                Dein Ergebnis
              </span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
            </div>

            {/* Vorher / Nachher hero */}
            <div
              style={{
                background:
                  "linear-gradient(135deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20,
                padding: "36px 32px",
                marginBottom: 36,
                display: "flex",
                flexWrap: "wrap",
                gap: 24,
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
                <div>
                  <p
                    style={{
                      fontSize: 11,
                      fontFamily: "monospace",
                      color: "#64748b",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      margin: "0 0 6px",
                    }}
                  >
                    Aktuelle Kosten
                  </p>
                  <p
                    style={{
                      fontSize: 36,
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 800,
                      color: "#ef4444",
                      margin: 0,
                    }}
                  >
                    {formatEur(totalNormal)}
                    <span style={{ fontSize: 16, fontWeight: 500, color: "#64748b" }}>
                      /Mo
                    </span>
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    color: "#334155",
                    fontSize: 24,
                    fontWeight: 300,
                  }}
                >
                  →
                </div>
                <div>
                  <p
                    style={{
                      fontSize: 11,
                      fontFamily: "monospace",
                      color: "#4ade80",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      margin: "0 0 6px",
                    }}
                  >
                    Optimierte Kosten
                  </p>
                  <p
                    style={{
                      fontSize: 36,
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 800,
                      color: "#4ade80",
                      margin: 0,
                    }}
                  >
                    {formatEur(totalOptimized)}
                    <span style={{ fontSize: 16, fontWeight: 500, color: "#64748b" }}>
                      /Mo
                    </span>
                  </p>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <p
                  style={{
                    fontSize: 11,
                    fontFamily: "monospace",
                    color: "#facc15",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    margin: "0 0 6px",
                  }}
                >
                  Du sparst jährlich
                </p>
                <p
                  style={{
                    fontSize: 42,
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 800,
                    color: "#facc15",
                    margin: "0 0 4px",
                  }}
                >
                  {formatEur(savedYear)}
                </p>
                <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
                  {overallPct}% weniger als bisher
                </p>
              </div>
            </div>

            {/* Hack cards */}
            <h2
              style={{
                fontFamily: "monospace",
                fontSize: 11,
                letterSpacing: "0.14em",
                color: "#64748b",
                textTransform: "uppercase",
                margin: "0 0 20px",
              }}
            >
              Deine smarten Hacks
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 52 }}>
              {selectedServices.map((svc) => {
                const strat = bestStrategy(svc);
                const savingPerYear =
                  (svc.monthly_eur_normal - strat.monthly_eur_optimized) * 12;
                const isOpen = activeGuide === svc.id;
                return (
                  <div
                    key={svc.id}
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: `1px solid ${isOpen ? "rgba(34,197,94,0.35)" : svc.border}`,
                      borderRadius: 16,
                      overflow: "hidden",
                      transition: "border-color 0.2s",
                    }}
                  >
                    {/* Card header */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "20px 24px",
                        flexWrap: "wrap",
                        gap: 16,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            background: svc.iconBg,
                            border: `1px solid ${svc.border}`,
                            borderRadius: 10,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 900,
                            fontSize: 15,
                            color: svc.iconColor,
                            flexShrink: 0,
                          }}
                        >
                          {svc.icon}
                        </div>
                        <div>
                          <p
                            style={{
                              margin: "0 0 2px",
                              fontWeight: 700,
                              fontSize: 16,
                              color: "#fff",
                              fontFamily: "'Syne', sans-serif",
                            }}
                          >
                            {svc.name}
                          </p>
                          <p
                            style={{
                              margin: 0,
                              fontSize: 13,
                              color: "#4ade80",
                              fontFamily: "monospace",
                            }}
                          >
                            {strat.label}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                        <div style={{ textAlign: "right" }}>
                          <p
                            style={{
                              margin: "0 0 2px",
                              fontSize: 11,
                              color: "#475569",
                              fontFamily: "monospace",
                            }}
                          >
                            VORHER → NACHHER
                          </p>
                          <p style={{ margin: 0, fontFamily: "monospace", fontSize: 14 }}>
                            <span style={{ color: "#ef4444" }}>
                              {formatEur(svc.monthly_eur_normal)}
                            </span>
                            <span style={{ color: "#334155" }}> → </span>
                            <span style={{ color: "#4ade80" }}>
                              {formatEur(strat.monthly_eur_optimized)}
                            </span>
                            <span style={{ color: "#64748b" }}>/Mo</span>
                          </p>
                        </div>
                        <div
                          style={{
                            background: "rgba(250,204,21,0.1)",
                            border: "1px solid rgba(250,204,21,0.25)",
                            borderRadius: 10,
                            padding: "8px 14px",
                            textAlign: "center",
                          }}
                        >
                          <p
                            style={{
                              margin: "0 0 2px",
                              fontSize: 10,
                              color: "#facc15",
                              fontFamily: "monospace",
                            }}
                          >
                            /JAHR
                          </p>
                          <p
                            style={{
                              margin: 0,
                              fontSize: 18,
                              fontWeight: 800,
                              color: "#facc15",
                              fontFamily: "'Syne', sans-serif",
                            }}
                          >
                            +{formatEur(savingPerYear)}
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveGuide(isOpen ? null : svc.id)}
                          style={{
                            background: isOpen
                              ? "rgba(34,197,94,0.15)"
                              : "rgba(255,255,255,0.04)",
                            border: `1px solid ${
                              isOpen ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.08)"
                            }`,
                            borderRadius: 8,
                            padding: "8px 14px",
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 600,
                            color: isOpen ? "#4ade80" : "#64748b",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {isOpen ? "Anleitung ▲" : "Anleitung ▼"}
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    <div
                      style={{
                        padding: "0 24px 16px",
                        paddingLeft: 78,
                      }}
                    >
                      <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
                        {strat.description}
                      </p>
                    </div>

                    {/* Step-by-step guide (collapsible) */}
                    {isOpen && (
                      <div
                        style={{
                          borderTop: "1px solid rgba(255,255,255,0.06)",
                          padding: "20px 24px",
                          display: "flex",
                          flexDirection: "column",
                          gap: 10,
                        }}
                      >
                        <p
                          style={{
                            margin: "0 0 12px",
                            fontSize: 11,
                            fontFamily: "monospace",
                            color: "#4ade80",
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                          }}
                        >
                          Schritt-für-Schritt-Anleitung
                        </p>
                        {strat.steps.map((s) => (
                          <div
                            key={s.step}
                            style={{
                              display: "flex",
                              gap: 14,
                              background: "rgba(255,255,255,0.02)",
                              border: "1px solid rgba(255,255,255,0.05)",
                              borderRadius: 10,
                              padding: "14px 16px",
                            }}
                          >
                            <div
                              style={{
                                width: 24,
                                height: 24,
                                background: "rgba(34,197,94,0.12)",
                                border: "1px solid rgba(34,197,94,0.3)",
                                borderRadius: 6,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 11,
                                fontWeight: 700,
                                color: "#4ade80",
                                fontFamily: "monospace",
                                flexShrink: 0,
                              }}
                            >
                              {s.step}
                            </div>
                            <div>
                              <p
                                style={{
                                  margin: "0 0 4px",
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: "#e2e8f0",
                                }}
                              >
                                {s.title}
                              </p>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 13,
                                  color: "#64748b",
                                  lineHeight: 1.65,
                                }}
                              >
                                {s.detail}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* B2B CTA */}
            <div
              style={{
                background:
                  "linear-gradient(135deg,rgba(0,212,255,0.07),rgba(0,153,204,0.03))",
                border: "1px solid rgba(0,212,255,0.18)",
                borderRadius: 20,
                padding: "32px 28px",
                marginBottom: 36,
                display: "flex",
                flexWrap: "wrap",
                gap: 24,
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ flex: 1, minWidth: 260 }}>
                <p
                  style={{
                    fontSize: 11,
                    fontFamily: "monospace",
                    color: "#00d4ff",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    margin: "0 0 10px",
                  }}
                >
                  Für Unternehmen
                </p>
                <h3
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#fff",
                    margin: "0 0 10px",
                  }}
                >
                  IT-Kostenoptimierung für Ihr Unternehmen
                </h3>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.65, margin: 0 }}>
                  Effiziente Kostenoptimierung spart nicht nur privat, sondern auch Ihrem Unternehmen bares Geld. Ich analysiere Ihre Software-Lizenzen und Cloud-Infrastrukturen auf versteckte Einsparpotenziale.
                </p>
              </div>
              <a
                href="https://leoncordts.github.io/#kontakt"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "linear-gradient(135deg,#00d4ff,#0099cc)",
                  color: "#020b18",
                  fontWeight: 700,
                  fontSize: 14,
                  padding: "14px 26px",
                  borderRadius: 10,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  boxShadow: "0 0 28px rgba(0,212,255,0.25)",
                  flexShrink: 0,
                }}
              >
                Jetzt unverbindlich anfragen →
              </a>
            </div>

            {/* Reset */}
            <div style={{ textAlign: "center" }}>
              <button
                onClick={handleReset}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  padding: "10px 22px",
                  cursor: "pointer",
                  fontSize: 13,
                  color: "#475569",
                }}
              >
                ← Neue Berechnung starten
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>
    </main>
  );
}
