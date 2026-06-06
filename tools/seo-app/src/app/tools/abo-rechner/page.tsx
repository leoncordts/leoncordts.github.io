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
  color: string;
  bg: string;
  border: string;
  strategies: HackStrategy[];
}

const SERVICES: Service[] = [
  {
    id: "youtube",
    name: "YouTube Premium",
    icon: "▶",
    color: "#FF0000",
    bg: "rgba(255,0,0,0.08)",
    border: "rgba(255,0,0,0.25)",
    strategies: [
      {
        id: "yt-vpn-nigeria",
        label: "VPN-Hack (Nigeria/Indien)",
        description: "Erstelle ein neues Konto über VPN in Nigeria oder Indien – bis zu 87% günstiger.",
        savings_pct: 87,
        monthly_eur_normal: 13.99,
        monthly_eur_optimized: 1.82,
        steps: [
          { step: 1, title: "VPN installieren", detail: "Lade Mullvad VPN oder ProtonVPN herunter. Beide bieten Trial-Phasen. Verbinde dich mit einem Server in Nigeria oder Indien." },
          { step: 2, title: "Neues Google-Konto erstellen", detail: "Öffne incognito, gehe zu accounts.google.com und erstelle ein frisches Google-Konto. Nutze eine temporäre E-Mail (z. B. guerrillamail.com) als Recovery." },
          { step: 3, title: "Virtuelle Kreditkarte besorgen", detail: "Erstelle eine virtuelle Karte bei Revolut oder N26 (kostenlos). Wichtig: Die Rechnungsadresse muss auf Nigeria/Indien gesetzt sein – das geht im Kartenbereich der App." },
          { step: 4, title: "YouTube Premium abonnieren", detail: "Öffne youtube.com während VPN aktiv ist, gehe zu Premium. Du siehst jetzt den lokalen Preis (~1,50–2 €/Monat). Kaufe mit deiner virtuellen Karte." },
          { step: 5, title: "Konto sichern", detail: "Deaktiviere Auto-Erneuerung NICHT – aber habe die virtuelle Karte stets aufgeladen. VPN muss nur beim Verlängern aktiv sein, nicht beim täglichen Nutzen." },
        ],
      },
      {
        id: "yt-family",
        label: "Familien-Tarif splitten",
        description: "Teile einen Familien-Plan mit 5 Freunden – jeder zahlt nur ~2,33 €/Monat.",
        savings_pct: 83,
        monthly_eur_normal: 13.99,
        monthly_eur_optimized: 2.33,
        steps: [
          { step: 1, title: "Familien-Tarif buchen", detail: "Buche YouTube Premium Familien für 22,99 €/Monat. Damit kannst du bis zu 5 weitere Mitglieder einladen." },
          { step: 2, title: "Mitglieder rekrutieren", detail: "Finde 5 vertrauenswürdige Freunde oder Familienmitglieder. Nutze Gruppen-Chats, um Zahlungsmodalitäten zu klären." },
          { step: 3, title: "Kosten aufteilen", detail: "22,99 € / 6 Personen = ~3,83 €/Person. Wer den Plan verwaltet (du), kannst auf 2,33 € rabattieren indem du die Verwaltungsgebühr trägst." },
          { step: 4, title: "Zahlung organisieren", detail: "Nutze Splitwise oder eine WhatsApp-Gruppe für monatliche Erinnerungen. PayPal.Me oder IBAN-Lastschrift empfohlen." },
        ],
      },
    ],
  },
  {
    id: "netflix",
    name: "Netflix",
    icon: "N",
    color: "#E50914",
    bg: "rgba(229,9,20,0.08)",
    border: "rgba(229,9,20,0.25)",
    strategies: [
      {
        id: "netflix-turkey",
        label: "Türkei-Konto + Geschenkkarte",
        description: "Netflix-Konto in der Türkei mit lokaler Geschenkkarte – spart ~70% gegenüber DE-Preis.",
        savings_pct: 70,
        monthly_eur_normal: 17.99,
        monthly_eur_optimized: 5.40,
        steps: [
          { step: 1, title: "VPN auf Türkei setzen", detail: "Verbinde dich via VPN mit einem türkischen Server (z. B. Istanbul). NordVPN und ExpressVPN haben stabile TR-Server." },
          { step: 2, title: "Netflix-Konto erstellen", detail: "Öffne netflix.com im incognito-Modus. Erstelle ein neues Konto mit einer neuen E-Mail. Das Registrierungsland wird automatisch als Türkei erfasst." },
          { step: 3, title: "Geschenkkarte kaufen", detail: "Kaufe eine Netflix-Türkei-Geschenkkarte auf Kinguin.net, G2A oder Eneba (Preisvergleich lohnt). Achte auf Bewertungen des Verkäufers (>95% positiv)." },
          { step: 4, title: "Karte einlösen", detail: "Gehe zu netflix.com/redeem und gib den Code ein (weiterhin VPN aktiv). Das Guthaben wird in türkische Lira (TRY) gutgeschrieben." },
          { step: 5, title: "Laufende Verlängerung", detail: "Kaufe alle 1–3 Monate neue Geschenkkarten. VPN ist nur beim Einlösen nötig. Kaufe immer bei den selben verifizierten Händlern." },
        ],
      },
      {
        id: "netflix-brazil",
        label: "Brasilien-Konto",
        description: "Brasilianische Preise sind ~60% günstiger – mit lokaler Zahlungsmethode.",
        savings_pct: 60,
        monthly_eur_normal: 17.99,
        monthly_eur_optimized: 7.20,
        steps: [
          { step: 1, title: "VPN auf Brasilien setzen", detail: "Verbinde dich mit einem brasilianischen VPN-Server (São Paulo ist am stabilsten)." },
          { step: 2, title: "Konto erstellen", detail: "Erstelle ein neues Netflix-Konto im incognito-Modus mit brasilianischer IP." },
          { step: 3, title: "Zahlungsmethode", detail: "Nutze eine Wise-Karte (internationales Girokonto, kostenlos). Lade BRL (brasilianische Real) auf die Karte, um lokale Zahlungsgebühren zu minimieren." },
          { step: 4, title: "Abonnieren", detail: "Wähle den Standard-Plan in BRL. Der aktuelle Preis liegt bei ~40 BRL/Monat, ca. 7–8 € Gegenwert." },
        ],
      },
    ],
  },
  {
    id: "spotify",
    name: "Spotify",
    icon: "♫",
    color: "#1DB954",
    bg: "rgba(29,185,84,0.08)",
    border: "rgba(29,185,84,0.25)",
    strategies: [
      {
        id: "spotify-prepaid",
        label: "12-Monats-Prepaid-Karte",
        description: "Kaufe eine Jahres-Geschenkkarte statt Monatsabo – spart ~20% plus kein Abo-Stress.",
        savings_pct: 20,
        monthly_eur_normal: 10.99,
        monthly_eur_optimized: 8.74,
        steps: [
          { step: 1, title: "Jahres-Karte kaufen", detail: "Kaufe eine Spotify 12-Monats-Karte bei Amazon, MediaMarkt oder Eneba. Oft gibt es 10–20% Rabatt bei Sales oder durch Cashback-Portale." },
          { step: 2, title: "Cashback aktivieren", detail: "Aktiviere Shoop.de oder Igraal.com-Cashback bevor du kaufst. Zusätzlich 3–8% zurück möglich." },
          { step: 3, title: "Code einlösen", detail: "Gehe zu spotify.com/redeem und gib deinen Code ein. Das Guthaben wird als Prepaid-Zeit gutgeschrieben." },
          { step: 4, title: "Auto-Verlängerung deaktivieren", detail: "Gehe zu Kontoeinstellungen → Abo → Auto-Erneuerung ausschalten. Kaufe nächste Karte manuell vor Ablauf." },
        ],
      },
      {
        id: "spotify-duo",
        label: "Duo/Familien-Plan splitten",
        description: "Spotify Duo (2 Personen) für 14,99 €: jeder zahlt nur 7,50 €. Familie (6 Pers): ~3,33 €/Person.",
        savings_pct: 70,
        monthly_eur_normal: 10.99,
        monthly_eur_optimized: 3.33,
        steps: [
          { step: 1, title: "Familien-Plan buchen", detail: "Buche Spotify Premium Familie für 17,99 €/Monat. Bis zu 6 Mitglieder möglich." },
          { step: 2, title: "Mitglieder einladen", detail: "Gehe zu spotify.com/family, klicke 'Mitglied hinzufügen'. Alle müssen dieselbe Heimadresse angeben (Spotify prüft GPS/IP sporadisch)." },
          { step: 3, title: "Kosten aufteilen", detail: "17,99 € / 6 = ~3 €/Person. Nutze Splitwise für automatische monatliche Erinnerungen." },
          { step: 4, title: "Adress-Check umgehen", detail: "Spotify prüft ab und zu die Adresse. Trage alle Mitglieder mit deiner Adresse ein, oder nutze eine gemeinsame Postanschrift (z.B. Büro, Vereinsadresse)." },
        ],
      },
    ],
  },
  {
    id: "adobe",
    name: "Adobe Creative Cloud",
    icon: "Ai",
    color: "#FF0000",
    bg: "rgba(255,0,0,0.08)",
    border: "rgba(255,0,0,0.3)",
    strategies: [
      {
        id: "adobe-retention",
        label: "Retention-Loop (50% Rabatt)",
        description: "Simulierte Kündigung triggert automatisch 50% Rabatt für 3–6 Monate von Adobe.",
        savings_pct: 50,
        monthly_eur_normal: 54.99,
        monthly_eur_optimized: 27.49,
        steps: [
          { step: 1, title: "Adobe Dashboard öffnen", detail: "Gehe zu account.adobe.com. Klicke auf 'Abo verwalten' → 'Abo kündigen'. Noch NICHT final bestätigen." },
          { step: 2, title: "Kündigungsflow durchlaufen", detail: "Adobe fragt nach dem Grund. Wähle 'Zu teuer' oder 'Brauche es nicht mehr'. Klicke weiter durch alle Screens." },
          { step: 3, title: "Auf das Angebot warten", detail: "Auf dem vorletzten Screen erscheint typischerweise ein Angebot: '50% Rabatt für die nächsten 3 Monate' oder ähnliches." },
          { step: 4, title: "Angebot annehmen", detail: "Klicke 'Angebot annehmen'. Die Kündigung wird abgebrochen, du sparst sofort. Notiere das Ablaufdatum des Rabatts." },
          { step: 5, title: "Loop wiederholen", detail: "Wenn der Rabatt ausläuft, wiederhole den Vorgang. Adobe gibt diesen Rabatt häufig erneut. Manche Nutzer bekommen ihn 2–3x hintereinander." },
          { step: 6, title: "Alternative: Education-Tarif", detail: "Falls du Student/Lehrer bist oder jemanden kennst: Adobe Education kostet ~20 €/Monat für alle Apps. Einfach Bildungsnachweis vorlegen." },
        ],
      },
    ],
  },
];

function formatEur(val: number) {
  return val.toFixed(2).replace(".", ",") + " €";
}

export default function AboRechnerPage() {
  const [selectedServices, setSelectedServices] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"dashboard" | "guide">("dashboard");

  const toggleStrategy = (serviceId: string, strategyId: string) => {
    setSelectedServices((prev) => {
      if (prev[serviceId] === strategyId) {
        const next = { ...prev };
        delete next[serviceId];
        return next;
      }
      return { ...prev, [serviceId]: strategyId };
    });
  };

  const selectedEntries = Object.entries(selectedServices)
    .map(([svcId, stratId]) => {
      const svc = SERVICES.find((s) => s.id === svcId)!;
      const strat = svc.strategies.find((s) => s.id === stratId)!;
      return { svc, strat };
    })
    .filter(Boolean);

  const totalNormal = selectedEntries.reduce((s, e) => s + e.strat.monthly_eur_normal, 0);
  const totalOptimized = selectedEntries.reduce((s, e) => s + e.strat.monthly_eur_optimized, 0);
  const totalSavingMonth = totalNormal - totalOptimized;
  const totalSavingYear = totalSavingMonth * 12;
  const overallPct = totalNormal > 0 ? Math.round((totalSavingMonth / totalNormal) * 100) : 0;

  const hasSelection = selectedEntries.length > 0;

  return (
    <main style={{ minHeight: "100vh", background: "#020b18", color: "#e2e8f0", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "20px 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#00d4ff,#0099cc)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#020b18" }}>LC</div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, color: "#fff" }}>Leon Cordts</span>
          </a>
          <a href="/tools" style={{ fontSize: 13, color: "#64748b", textDecoration: "none" }}>← Alle Tools</a>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 20, padding: "6px 16px", marginBottom: 20 }}>
            <span style={{ fontSize: 12, color: "#4ade80", fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.1em" }}>SMART HACKS</span>
          </div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(28px,5vw,48px)", fontWeight: 800, color: "#fff", margin: "0 0 16px" }}>
            Internationaler<br />
            <span style={{ color: "#4ade80" }}>Subscription-Optimizer</span>
          </h1>
          <p style={{ fontSize: 16, color: "#94a3b8", maxWidth: 560, margin: "0 auto" }}>
            Wähle deine Abos aus und berechne sofort, wie viel du mit cleveren Hacks pro Jahr sparst.
          </p>
        </div>

        {/* Service Selector */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: "0.15em", color: "#64748b", textTransform: "uppercase", marginBottom: 20 }}>
            01 — Wähle deine Abos &amp; Strategie
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(480px, 1fr))", gap: 20 }}>
            {SERVICES.map((svc) => (
              <div key={svc.id} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${svc.border}`, borderRadius: 16, padding: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 40, height: 40, background: svc.bg, border: `1px solid ${svc.border}`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 16, color: svc.color }}>
                    {svc.icon}
                  </div>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: "#fff" }}>{svc.name}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {svc.strategies.map((strat) => {
                    const isSelected = selectedServices[svc.id] === strat.id;
                    return (
                      <button
                        key={strat.id}
                        onClick={() => toggleStrategy(svc.id, strat.id)}
                        style={{
                          background: isSelected ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.03)",
                          border: `1px solid ${isSelected ? "rgba(34,197,94,0.5)" : "rgba(255,255,255,0.08)"}`,
                          borderRadius: 10,
                          padding: "12px 16px",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "all 0.2s",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: isSelected ? "#4ade80" : "#e2e8f0" }}>{strat.label}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#4ade80", fontFamily: "monospace", marginLeft: 12, flexShrink: 0 }}>−{strat.savings_pct}%</span>
                        </div>
                        <p style={{ fontSize: 12, color: "#64748b", margin: 0, lineHeight: 1.5 }}>{strat.description}</p>
                        <div style={{ marginTop: 8, display: "flex", gap: 16 }}>
                          <span style={{ fontSize: 11, color: "#475569", fontFamily: "monospace" }}>Normal: {formatEur(strat.monthly_eur_normal)}/Mo</span>
                          <span style={{ fontSize: 11, color: "#4ade80", fontFamily: "monospace" }}>Optimiert: {formatEur(strat.monthly_eur_optimized)}/Mo</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        {hasSelection && (
          <div>
            <h2 style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: "0.15em", color: "#64748b", textTransform: "uppercase", marginBottom: 20 }}>
              02 — Dein Spar-Potenzial
            </h2>

            {/* Summary Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
              {[
                { label: "Monatlich vorher", value: formatEur(totalNormal), sub: "aktuell", color: "#ef4444" },
                { label: "Monatlich nachher", value: formatEur(totalOptimized), sub: "optimiert", color: "#4ade80" },
                { label: "Ersparnis/Monat", value: formatEur(totalSavingMonth), sub: `${overallPct}% gespart`, color: "#4ade80" },
                { label: "Ersparnis/Jahr", value: formatEur(totalSavingYear), sub: "bares Geld zurück", color: "#facc15" },
              ].map((card) => (
                <div key={card.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20 }}>
                  <p style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 8px" }}>{card.label}</p>
                  <p style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: card.color, margin: "0 0 4px" }}>{card.value}</p>
                  <p style={{ fontSize: 12, color: "#475569", margin: 0 }}>{card.sub}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: 4, width: "fit-content" }}>
              {(["dashboard", "guide"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                    background: activeTab === tab ? "rgba(34,197,94,0.15)" : "transparent",
                    color: activeTab === tab ? "#4ade80" : "#64748b",
                    transition: "all 0.2s",
                  }}
                >
                  {tab === "dashboard" ? "📊 Übersicht" : "📋 Smarte Spar-Anleitung"}
                </button>
              ))}
            </div>

            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {selectedEntries.map(({ svc, strat }) => (
                  <div key={svc.id} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${svc.border}`, borderRadius: 14, padding: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 36, background: svc.bg, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, color: svc.color }}>{svc.icon}</div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, color: "#fff", fontSize: 15 }}>{svc.name}</p>
                        <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>{strat.label}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 24 }}>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ margin: 0, fontSize: 11, color: "#475569", fontFamily: "monospace" }}>VORHER</p>
                        <p style={{ margin: 0, fontSize: 16, color: "#ef4444", fontWeight: 700, fontFamily: "monospace" }}>{formatEur(strat.monthly_eur_normal)}/Mo</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ margin: 0, fontSize: 11, color: "#4ade80", fontFamily: "monospace" }}>NACHHER</p>
                        <p style={{ margin: 0, fontSize: 16, color: "#4ade80", fontWeight: 700, fontFamily: "monospace" }}>{formatEur(strat.monthly_eur_optimized)}/Mo</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ margin: 0, fontSize: 11, color: "#facc15", fontFamily: "monospace" }}>JÄHRLICH</p>
                        <p style={{ margin: 0, fontSize: 16, color: "#facc15", fontWeight: 700, fontFamily: "monospace" }}>+{formatEur((strat.monthly_eur_normal - strat.monthly_eur_optimized) * 12)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Guide Tab */}
            {activeTab === "guide" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                {selectedEntries.map(({ svc, strat }) => (
                  <div key={svc.id}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                      <div style={{ width: 32, height: 32, background: svc.bg, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 13, color: svc.color }}>{svc.icon}</div>
                      <div>
                        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: "#fff" }}>{svc.name}</span>
                        <span style={{ fontSize: 12, color: "#4ade80", marginLeft: 10, fontFamily: "monospace" }}>{strat.label}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingLeft: 16, borderLeft: `2px solid ${svc.border}` }}>
                      {strat.steps.map((s) => (
                        <div key={s.step} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 18 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                            <div style={{ width: 24, height: 24, background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#4ade80", fontFamily: "monospace", flexShrink: 0 }}>{s.step}</div>
                            <span style={{ fontWeight: 600, fontSize: 14, color: "#e2e8f0" }}>{s.title}</span>
                          </div>
                          <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", lineHeight: 1.65, paddingLeft: 34 }}>{s.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* B2B CTA */}
            <div style={{ marginTop: 56, background: "linear-gradient(135deg,rgba(0,212,255,0.08),rgba(0,153,204,0.04))", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 20, padding: 36 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 280 }}>
                  <p style={{ fontSize: 11, fontFamily: "monospace", color: "#00d4ff", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 12px" }}>Für Unternehmen</p>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: "#fff", margin: "0 0 12px" }}>IT-Kostenoptimierung für Ihr Unternehmen</h3>
                  <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.7, margin: 0 }}>
                    Effiziente Kostenoptimierung funktioniert nicht nur privat, sondern spart auch Ihrem Unternehmen bares Geld. Ich analysiere Ihre geschäftlichen Software-Lizenzen und Cloud-Infrastrukturen auf versteckte Einsparpotenziale.
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
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
                      padding: "14px 28px",
                      borderRadius: 10,
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                      boxShadow: "0 0 30px rgba(0,212,255,0.3)",
                    }}
                  >
                    Jetzt unverbindlich anfragen →
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!hasSelection && (
          <div style={{ textAlign: "center", padding: "48px 24px", color: "#475569" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>☝️</div>
            <p style={{ fontSize: 15 }}>Wähle oben mindestens ein Abo + Strategie aus, um dein Spar-Potenzial zu berechnen.</p>
          </div>
        )}
      </div>

      {/* Font imports */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>
    </main>
  );
}
