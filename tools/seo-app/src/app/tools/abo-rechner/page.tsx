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
  category: "video" | "audio" | "software" | "ai" | "gaming";
  hasHack: boolean;
  noHackReason?: string;
  noHackAlternative?: string;
  strategies: HackStrategy[];
}

const SERVICES: Service[] = [
  // ── VIDEO ──────────────────────────────────────────────────────────────
  {
    id: "youtube",
    name: "YouTube Premium",
    icon: "▶",
    iconBg: "rgba(255,0,0,0.12)",
    iconColor: "#ff4444",
    border: "rgba(255,68,68,0.2)",
    monthly_eur_normal: 13.99,
    category: "video",
    hasHack: true,
    strategies: [
      {
        id: "yt-vpn-nigeria",
        label: "VPN-Hack (Nigeria/Indien)",
        description: "Neues Konto via VPN in Nigeria oder Indien – bis zu 87% günstiger mit virtueller Kreditkarte.",
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
        description: "Familien-Plan mit 5 Freunden teilen – jeder zahlt nur ~3,83 €/Monat.",
        savings_pct: 73,
        monthly_eur_normal: 13.99,
        monthly_eur_optimized: 3.83,
        steps: [
          { step: 1, title: "Familien-Tarif buchen", detail: "Buche YouTube Premium Familien für 22,99 €/Monat. Bis zu 5 weitere Mitglieder einladen." },
          { step: 2, title: "Mitglieder rekrutieren", detail: "Finde 5 vertrauenswürdige Freunde oder Familienmitglieder." },
          { step: 3, title: "Kosten aufteilen", detail: "22,99 € / 6 Personen = ~3,83 €/Person. Nutze Splitwise für monatliche Erinnerungen." },
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
    category: "video",
    hasHack: true,
    strategies: [
      {
        id: "netflix-turkey",
        label: "Türkei-Konto + Geschenkkarte",
        description: "Netflix-Konto in der Türkei mit lokaler Geschenkkarte – spart bis zu 70% gegenüber dem DE-Preis.",
        savings_pct: 70,
        monthly_eur_normal: 17.99,
        monthly_eur_optimized: 5.40,
        steps: [
          { step: 1, title: "VPN auf Türkei setzen", detail: "Verbinde dich via VPN mit einem türkischen Server (z.B. Istanbul)." },
          { step: 2, title: "Netflix-Konto erstellen", detail: "Öffne netflix.com im Inkognito-Modus. Erstelle ein neues Konto – Land wird automatisch als Türkei erfasst." },
          { step: 3, title: "Geschenkkarte kaufen", detail: "Kaufe eine Netflix-Türkei-Geschenkkarte auf Kinguin.net, G2A oder Eneba (Verkäufer >95% positiv)." },
          { step: 4, title: "Karte einlösen", detail: "Gehe zu netflix.com/redeem und gib den Code ein (VPN aktiv lassen). Guthaben kommt in türkische Lira (TRY)." },
          { step: 5, title: "Verlängerung", detail: "Kaufe alle 1–3 Monate neue Geschenkkarten. VPN nur beim Einlösen nötig." },
        ],
      },
    ],
  },
  {
    id: "disney",
    name: "Disney+",
    icon: "✦",
    iconBg: "rgba(17,10,134,0.2)",
    iconColor: "#6366f1",
    border: "rgba(99,102,241,0.2)",
    monthly_eur_normal: 8.99,
    category: "video",
    hasHack: true,
    strategies: [
      {
        id: "disney-giftcard",
        label: "Guthabenkarten (Eneba/Supermarkt)",
        description: "Disney+ Geschenkkarten oft 20–30% günstiger im Angebot – kein Monatsabo nötig.",
        savings_pct: 25,
        monthly_eur_normal: 8.99,
        monthly_eur_optimized: 6.74,
        steps: [
          { step: 1, title: "Guthabenkarte suchen", detail: "Prüfe Eneba, Eneba.com, Kaufland, Rewe oder dm – besonders um Black Friday gibt es 20–30% Rabatt." },
          { step: 2, title: "Cashback aktivieren", detail: "Aktiviere vor dem Kauf Cashback via Shoop.de (bis 8% extra)." },
          { step: 3, title: "Code einlösen", detail: "Gehe zu disneyplus.com/redeem und gib den Code ein. Guthaben läuft automatisch ab." },
          { step: 4, title: "Abo pausieren", detail: "Wenn kein aktuelles Guthaben: Disney+ lässt sich monatlich kündigen – nur aktiv halten wenn neue Staffeln laufen." },
        ],
      },
      {
        id: "disney-telekom",
        label: "Telekom MagentaTV Kombi",
        description: "Telekom-Kunden bekommen Disney+ oft 6–12 Monate gratis im MagentaTV-Paket inklusive.",
        savings_pct: 50,
        monthly_eur_normal: 8.99,
        monthly_eur_optimized: 4.50,
        steps: [
          { step: 1, title: "Tarif prüfen", detail: "Prüfe auf telekom.de ob dein aktueller Tarif Disney+ enthält oder ob ein Upgrade lohnt." },
          { step: 2, title: "Aktionsangebot aktivieren", detail: "Telekom bietet regelmäßig 6–12 Monate Disney+ gratis bei MagentaTV/Magenta1-Kombiangeboten." },
          { step: 3, title: "Code abholen", detail: "Code kommt per E-Mail – einlösen unter disneyplus.com/redeem." },
        ],
      },
    ],
  },
  {
    id: "amazon-prime",
    name: "Amazon Prime",
    icon: "a",
    iconBg: "rgba(255,153,0,0.12)",
    iconColor: "#ff9900",
    border: "rgba(255,153,0,0.2)",
    monthly_eur_normal: 8.99,
    category: "video",
    hasHack: true,
    strategies: [
      {
        id: "prime-student",
        label: "Student-Tarif (50% Rabatt)",
        description: "Amazon Prime Student kostet nur 4,49 €/Monat – 6 Monate gratis Probephase inklusive.",
        savings_pct: 50,
        monthly_eur_normal: 8.99,
        monthly_eur_optimized: 4.49,
        steps: [
          { step: 1, title: "Studenten-E-Mail prüfen", detail: "Du brauchst eine .edu oder Uni-E-Mail-Adresse (z.B. @stud.uni-berlin.de)." },
          { step: 2, title: "Prime Student aktivieren", detail: "Gehe zu amazon.de/primestudent. Klicke '6 Monate gratis testen'. Verifiziere deinen Studenten-Status." },
          { step: 3, title: "Verlängerung", detail: "Nach 6 Monaten: 4,49 €/Monat statt 8,99 €. Bis zu 4 Jahre möglich (Nachweis jährlich erneuern)." },
        ],
      },
      {
        id: "prime-household",
        label: "Haushalt-Trick (Vorteile teilen)",
        description: "Prime-Vorteile per Amazon Household mit einer 2. Person im Haushalt kostenlos teilen.",
        savings_pct: 50,
        monthly_eur_normal: 8.99,
        monthly_eur_optimized: 4.50,
        steps: [
          { step: 1, title: "Amazon Household einrichten", detail: "Gehe zu amazon.de/myh/manage. Füge eine zweite erwachsene Person hinzu." },
          { step: 2, title: "Vorteile teilen", detail: "Beide Personen teilen Prime-Vorteile: Lieferung, Prime Video, Prime Music – nur ein Konto zahlt." },
          { step: 3, title: "Kosten halbieren", detail: "8,99 € / 2 Personen = 4,50 €/Person/Monat. Zahlung per Splitwise oder Überweisung regeln." },
        ],
      },
    ],
  },
  {
    id: "dazn",
    name: "DAZN",
    icon: "D",
    iconBg: "rgba(255,255,255,0.06)",
    iconColor: "#facc15",
    border: "rgba(250,204,21,0.2)",
    monthly_eur_normal: 29.99,
    category: "video",
    hasHack: true,
    strategies: [
      {
        id: "dazn-giftcard",
        label: "Guthabenkarten (Aldi/Amazon Sale)",
        description: "DAZN-Guthabenkarten statt Monatsabo – Aldi verkauft regelmäßig mit 30–40% Rabatt.",
        savings_pct: 35,
        monthly_eur_normal: 29.99,
        monthly_eur_optimized: 19.49,
        steps: [
          { step: 1, title: "Sale-Datum abwarten", detail: "Aldi (Nord/Süd) verkauft DAZN-Karten mehrmals jährlich mit 30–40% Rabatt. Amazon Sale (Prime Day, Black Friday) ebenfalls nutzen." },
          { step: 2, title: "Mehrere Karten kaufen", detail: "Kaufe gleich 3–6 Monate auf Vorrat wenn der Rabatt aktiv ist." },
          { step: 3, title: "Karten einlösen", detail: "Gehe zu dazn.com → Einstellungen → Gutschein einlösen. Codes stapeln sich als Guthaben." },
          { step: 4, title: "Monatsabo kündigen", detail: "Lösche die automatische Verlängerung. Zahle ausschließlich per Guthabenkarte." },
        ],
      },
    ],
  },
  {
    id: "wow",
    name: "WOW (Sky)",
    icon: "W",
    iconBg: "rgba(14,165,233,0.12)",
    iconColor: "#38bdf8",
    border: "rgba(56,189,248,0.2)",
    monthly_eur_normal: 14.99,
    category: "video",
    hasHack: true,
    strategies: [
      {
        id: "wow-retention",
        label: "Kündigungs-Loop (50% Rückholangebot)",
        description: "Simulierte Kündigung triggert fast immer ein 50% Rabatt-Rückholangebot von WOW/Sky.",
        savings_pct: 50,
        monthly_eur_normal: 14.99,
        monthly_eur_optimized: 7.49,
        steps: [
          { step: 1, title: "WOW-Konto öffnen", detail: "Gehe zu wowtv.de → Mein Konto → Abo verwalten → Kündigen. Noch nicht final bestätigen." },
          { step: 2, title: "Kündigungsflow durchlaufen", detail: "Wähle als Grund 'Zu teuer'. WOW fragt mehrfach nach und macht dabei ein Gegenangebot." },
          { step: 3, title: "Auf das Angebot warten", detail: "Typisches Angebot: 50% Rabatt für 3–6 Monate oder ein spezielles Rückholangebot per E-Mail." },
          { step: 4, title: "Angebot annehmen", detail: "Nimm das Angebot an – Kündigung wird storniert. Notiere das Ablaufdatum und wiederhole danach den Loop." },
        ],
      },
    ],
  },
  {
    id: "appletv",
    name: "Apple TV+",
    icon: "⌘",
    iconBg: "rgba(255,255,255,0.06)",
    iconColor: "#94a3b8",
    border: "rgba(148,163,184,0.2)",
    monthly_eur_normal: 9.99,
    category: "video",
    hasHack: true,
    strategies: [
      {
        id: "appletv-device",
        label: "Geräte-Hopping (3 Monate gratis)",
        description: "Jeder neue Apple-Gerätekauf schaltet 3 Monate Apple TV+ gratis frei – auch gebraucht.",
        savings_pct: 25,
        monthly_eur_normal: 9.99,
        monthly_eur_optimized: 7.49,
        steps: [
          { step: 1, title: "Gebrauchtes Apple-Gerät kaufen", detail: "Kaufe ein refurbishtes iPhone/iPad/Mac bei Apple oder Back Market. Viele Geräte aktivieren den 3-Monate-Trial erneut." },
          { step: 2, title: "Trial aktivieren", detail: "Nach erstem Login mit deiner Apple ID erscheint das Angebot im App Store automatisch." },
          { step: 3, title: "Loop wiederholen", detail: "Wenn du regelmäßig Geräte tauschst/kaufst, kannst du Apple TV+ durch aufeinanderfolgende Trials nahezu gratis nutzen." },
        ],
      },
      {
        id: "appletv-appleone",
        label: "Apple One Bundle",
        description: "Apple One Individual (19,95 €/Mo) enthält TV+, Music, Arcade, iCloud 50GB – günstiger als Einzeln.",
        savings_pct: 20,
        monthly_eur_normal: 9.99,
        monthly_eur_optimized: 7.99,
        steps: [
          { step: 1, title: "Apple One prüfen", detail: "Rechne nach ob du Apple Music (10,99 €) + iCloud (2,99 €) + Apple TV+ (9,99 €) ohnehin zahlst. Zusammen 23,97 € vs. Apple One für 19,95 €." },
          { step: 2, title: "Apple One buchen", detail: "Gehe auf apple.com/de/apple-one. Wähle Individual (1 Person) oder Family (bis 6 Personen)." },
        ],
      },
    ],
  },
  {
    id: "crunchyroll",
    name: "Crunchyroll",
    icon: "CR",
    iconBg: "rgba(247,132,1,0.12)",
    iconColor: "#f78401",
    border: "rgba(247,132,1,0.2)",
    monthly_eur_normal: 7.99,
    category: "video",
    hasHack: true,
    strategies: [
      {
        id: "crunchyroll-vpn",
        label: "VPN-Kauf via AppStore Türkei/Brasilien",
        description: "Crunchyroll-Abo über türkischen oder brasilianischen App Store kaufen – bis zu 70% günstiger.",
        savings_pct: 65,
        monthly_eur_normal: 7.99,
        monthly_eur_optimized: 2.80,
        steps: [
          { step: 1, title: "VPN auf Türkei setzen", detail: "Verbinde dich via VPN mit der Türkei (Mullvad, ProtonVPN oder NordVPN)." },
          { step: 2, title: "Neue Apple/Google-ID erstellen", detail: "Erstelle eine neue Apple ID oder Google-Account mit türkischer Adresse. Nutze für die Adresse einen echten türkischen Straßennamen (z.B. Istanbul, Beşiktaş)." },
          { step: 3, title: "Guthaben aufladen", detail: "Kaufe eine türkische App Store Geschenkkarte auf Eneba.com. Lade sie auf deine neue ID." },
          { step: 4, title: "Crunchyroll abonnieren", detail: "Öffne Crunchyroll im App Store mit türkischer ID. Abonniere Fan oder Mega Fan – der Preis ist in TRY deutlich niedriger." },
        ],
      },
    ],
  },
  // ── AUDIO ──────────────────────────────────────────────────────────────
  {
    id: "spotify",
    name: "Spotify",
    icon: "♫",
    iconBg: "rgba(29,185,84,0.12)",
    iconColor: "#1db954",
    border: "rgba(29,185,84,0.2)",
    monthly_eur_normal: 10.99,
    category: "audio",
    hasHack: true,
    strategies: [
      {
        id: "spotify-prepaid",
        label: "12-Monats-Prepaid-Karte",
        description: "Jahres-Geschenkkarte statt Monatsabo – spart ~20% plus kein Abo-Stress.",
        savings_pct: 20,
        monthly_eur_normal: 10.99,
        monthly_eur_optimized: 8.74,
        steps: [
          { step: 1, title: "Jahres-Karte kaufen", detail: "Kaufe eine Spotify 12-Monats-Karte bei Amazon, MediaMarkt oder Eneba. Oft 10–20% Rabatt bei Sales." },
          { step: 2, title: "Cashback aktivieren", detail: "Aktiviere Shoop.de oder Igraal.com-Cashback vor dem Kauf. Zusätzlich 3–8% zurück." },
          { step: 3, title: "Code einlösen", detail: "Gehe zu spotify.com/redeem und gib deinen Code ein." },
          { step: 4, title: "Auto-Verlängerung deaktivieren", detail: "Kontoeinstellungen → Abo → Auto-Erneuerung ausschalten." },
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
          { step: 2, title: "Mitglieder einladen", detail: "Gehe zu spotify.com/family. Alle Mitglieder tragen dieselbe Heimadresse ein." },
          { step: 3, title: "Kosten aufteilen", detail: "17,99 € / 6 = ~3 €/Person. Splitwise für monatliche Erinnerungen nutzen." },
        ],
      },
    ],
  },
  {
    id: "audible",
    name: "Audible",
    icon: "A",
    iconBg: "rgba(255,153,0,0.12)",
    iconColor: "#ff9900",
    border: "rgba(255,153,0,0.2)",
    monthly_eur_normal: 9.99,
    category: "audio",
    hasHack: true,
    strategies: [
      {
        id: "audible-retention",
        label: "Kündigungs-Loop (3 Monate für 4,95 €)",
        description: "Simulierte Kündigung triggert fast immer 3–6 Monate für 4,95 €/Monat statt 9,99 €.",
        savings_pct: 50,
        monthly_eur_normal: 9.99,
        monthly_eur_optimized: 4.95,
        steps: [
          { step: 1, title: "Kündigung einleiten", detail: "Gehe zu audible.de → Konto → Mitgliedschaft verwalten → Mitgliedschaft kündigen." },
          { step: 2, title: "Grund: Zu teuer", detail: "Wähle als Kündigungsgrund 'Zu teuer'. Audible zeigt daraufhin fast immer ein Rückholangebot." },
          { step: 3, title: "Angebot annehmen", detail: "Typisches Angebot: 3–6 Monate für 4,95 €/Monat. Manchmal auch 2 Credits gratis. Annehmen!" },
          { step: 4, title: "Loop wiederholen", detail: "Nach Ablauf des Angebots den Vorgang wiederholen. Klappt bei Audible besonders zuverlässig." },
        ],
      },
    ],
  },
  // ── SOFTWARE / PRODUKTIVITÄT ────────────────────────────────────────────
  {
    id: "microsoft365",
    name: "Microsoft 365",
    icon: "M",
    iconBg: "rgba(0,120,212,0.12)",
    iconColor: "#0078d4",
    border: "rgba(0,120,212,0.2)",
    monthly_eur_normal: 7.00,
    category: "software",
    hasHack: true,
    strategies: [
      {
        id: "m365-keys",
        label: "Jahres-Keys bei Resellern",
        description: "Microsoft 365 Personal Jahres-Keys bei Amazon oder MMOGA kaufen – bis zu 60% günstiger als direkt.",
        savings_pct: 55,
        monthly_eur_normal: 7.00,
        monthly_eur_optimized: 3.15,
        steps: [
          { step: 1, title: "Key-Preis vergleichen", detail: "Prüfe amazon.de (Sofort-Download) und mmoga.de. Typische Preise: 20–30 € für 12 Monate statt 69,99 € direkt bei Microsoft." },
          { step: 2, title: "Seriösen Anbieter wählen", detail: "Nur Anbieter mit 4+ Sternen und 1000+ Bewertungen. Amazon-Eigenverkauf ist sicher." },
          { step: 3, title: "Key einlösen", detail: "Gehe zu microsoft.com/redeem und gib deinen Code ein. Läuft automatisch an deinem Konto." },
        ],
      },
      {
        id: "m365-family",
        label: "Family-Plan mit 6 Personen",
        description: "Microsoft 365 Family (6 Pers.) für ~8,33 €/Monat: jeder zahlt nur ~1,39 €/Monat.",
        savings_pct: 80,
        monthly_eur_normal: 7.00,
        monthly_eur_optimized: 1.39,
        steps: [
          { step: 1, title: "Family-Plan kaufen", detail: "Kaufe Microsoft 365 Family (Jahreskey) auf Amazon für ~50–60 €. Für bis zu 6 Personen." },
          { step: 2, title: "Mitglieder einladen", detail: "Gehe zu microsoft365.com → Dein Abonnement → Person hinzufügen. Per E-Mail-Einladung." },
          { step: 3, title: "Kosten aufteilen", detail: "50 € / 6 Personen / 12 Monate = ~0,69 €/Person/Monat. Oder nach Komfort aufteilen." },
        ],
      },
    ],
  },
  {
    id: "canva",
    name: "Canva Pro",
    icon: "C",
    iconBg: "rgba(0,200,150,0.12)",
    iconColor: "#00c896",
    border: "rgba(0,200,150,0.2)",
    monthly_eur_normal: 14.99,
    category: "software",
    hasHack: true,
    strategies: [
      {
        id: "canva-teams",
        label: "Canva for Teams splitten",
        description: "Canva for Teams (5 Pers.) für 29,99 €/Monat: jeder zahlt nur ~6 €/Monat statt 14,99 €.",
        savings_pct: 60,
        monthly_eur_normal: 14.99,
        monthly_eur_optimized: 6.00,
        steps: [
          { step: 1, title: "Teams-Plan buchen", detail: "Buche Canva for Teams auf canva.com/teams für 29,99 €/Monat (5 Plätze inklusive)." },
          { step: 2, title: "Mitglieder einladen", detail: "Gehe zu canva.com/your-account/teams und lade 4 Freunde per E-Mail ein." },
          { step: 3, title: "Kosten aufteilen", detail: "29,99 € / 5 Personen = ~6 €/Person. Splitwise oder Banküberweisung monatlich." },
        ],
      },
      {
        id: "canva-education",
        label: "Canva for Education (gratis)",
        description: "Lehrer und Schüler bekommen Canva Pro komplett kostenlos – auch für Dozenten an Unis.",
        savings_pct: 100,
        monthly_eur_normal: 14.99,
        monthly_eur_optimized: 0.00,
        steps: [
          { step: 1, title: "Berechtigung prüfen", detail: "Bist du Lehrer, Dozent, Student oder Schüler? Dann bist du berechtigt für Canva for Education (K-12) oder Canva for Campus." },
          { step: 2, title: "Antrag stellen", detail: "Gehe zu canva.com/education und klicke 'Als Lehrkraft registrieren' oder 'Als Student registrieren'." },
          { step: 3, title: "Nachweis vorlegen", detail: "Verifiziere dich mit deiner Schul-/Uni-E-Mail oder einem Foto deines Ausweises/Lehrerbescheids." },
          { step: 4, title: "Aktivierung", detail: "Canva Pro wird kostenlos freigeschaltet – für die gesamte Dauer deiner Bildungskarriere." },
        ],
      },
    ],
  },
  {
    id: "duolingo",
    name: "Duolingo Plus",
    icon: "🦉",
    iconBg: "rgba(88,204,2,0.12)",
    iconColor: "#58cc02",
    border: "rgba(88,204,2,0.2)",
    monthly_eur_normal: 6.99,
    category: "software",
    hasHack: true,
    strategies: [
      {
        id: "duolingo-family",
        label: "Family-Plan mit 5 Freunden",
        description: "Duolingo Family Plan (6 Pers.) für 9,99 €/Monat – jeder zahlt nur ~1,67 €/Monat.",
        savings_pct: 76,
        monthly_eur_normal: 6.99,
        monthly_eur_optimized: 1.67,
        steps: [
          { step: 1, title: "Family Plan buchen", detail: "Gehe zu duolingo.com/learn → Profil → Duolingo Family. Aktuell ca. 9,99 €/Monat für bis zu 6 Personen." },
          { step: 2, title: "Mitglieder einladen", detail: "Sende Einladungen an bis zu 5 Freunde/Familienmitglieder per E-Mail oder Duolingo-Nutzername." },
          { step: 3, title: "Kosten aufteilen", detail: "9,99 € / 6 = ~1,67 €/Person. Jeder nutzt sein eigenes Konto mit eigenem Lernfortschritt." },
        ],
      },
    ],
  },
  {
    id: "icloud",
    name: "iCloud+",
    icon: "☁",
    iconBg: "rgba(148,163,184,0.08)",
    iconColor: "#64748b",
    border: "rgba(148,163,184,0.15)",
    monthly_eur_normal: 2.99,
    category: "software",
    hasHack: false,
    noHackReason: "Apple sperrt Länderkonten für iCloud rigoros – VPN-Tricks werden sofort erkannt und blockiert.",
    noHackAlternative: "Alternative: Apple One Bundle prüfen (enthält iCloud 50GB + Music + TV+ + Arcade für 19,95 €/Mo).",
    strategies: [],
  },
  // ── AI ─────────────────────────────────────────────────────────────────
  {
    id: "adobe",
    name: "Adobe Creative Cloud",
    icon: "Ai",
    iconBg: "rgba(255,0,0,0.12)",
    iconColor: "#ff3d00",
    border: "rgba(255,61,0,0.2)",
    monthly_eur_normal: 54.99,
    category: "software",
    hasHack: true,
    strategies: [
      {
        id: "adobe-retention",
        label: "Retention-Loop (50% Rabatt)",
        description: "Simulierte Kündigung im Adobe-Dashboard triggert automatisch 50% Rabatt für 3–6 Monate.",
        savings_pct: 50,
        monthly_eur_normal: 54.99,
        monthly_eur_optimized: 27.49,
        steps: [
          { step: 1, title: "Adobe Dashboard öffnen", detail: "Gehe zu account.adobe.com → Abo verwalten → Abo kündigen. Noch NICHT final bestätigen." },
          { step: 2, title: "Kündigungsflow durchlaufen", detail: "Wähle 'Zu teuer' als Grund. Klicke weiter durch alle Screens." },
          { step: 3, title: "Auf das Angebot warten", detail: "Auf dem vorletzten Screen erscheint typischerweise: '50% Rabatt für die nächsten 3 Monate'." },
          { step: 4, title: "Angebot annehmen", detail: "Klicke 'Angebot annehmen'. Die Kündigung wird abgebrochen, du sparst sofort." },
          { step: 5, title: "Loop wiederholen", detail: "Wenn der Rabatt ausläuft, wiederhole den Vorgang. Adobe gibt diesen Rabatt häufig erneut." },
        ],
      },
    ],
  },
  {
    id: "chatgpt",
    name: "ChatGPT Plus",
    icon: "✦",
    iconBg: "rgba(16,185,129,0.08)",
    iconColor: "#34d399",
    border: "rgba(52,211,153,0.15)",
    monthly_eur_normal: 20.00,
    category: "ai",
    hasHack: false,
    noHackReason: "OpenAI blockiert VPN-Tricks und Länder-Hacks rigoros. Konten werden bei Verdacht sofort gesperrt.",
    noHackAlternative: "Alternative für Gelegenheitsnutzer: OpenAI API (pay-as-you-go) statt Abo – nur für tatsächlich genutzte Tokens zahlen.",
    strategies: [],
  },
  // ── GAMING ─────────────────────────────────────────────────────────────
  {
    id: "playstation",
    name: "PlayStation Plus",
    icon: "PS",
    iconBg: "rgba(0,55,145,0.15)",
    iconColor: "#4a8fe7",
    border: "rgba(74,143,231,0.2)",
    monthly_eur_normal: 8.99,
    category: "gaming",
    hasHack: true,
    strategies: [
      {
        id: "ps-keys",
        label: "Jahres-Keys bei Eneba/CDKeys",
        description: "PlayStation Plus Jahres-Keys auf Reseller-Plattformen kaufen – bis zu 40% günstiger.",
        savings_pct: 40,
        monthly_eur_normal: 8.99,
        monthly_eur_optimized: 5.39,
        steps: [
          { step: 1, title: "Preis vergleichen", detail: "Prüfe Eneba.com, CDKeys.com und DLCompare.de für PS Plus Essential/Extra/Premium Jahreskarten." },
          { step: 2, title: "Seriösen Verkäufer wählen", detail: "Nur Anbieter mit 4+ Sternen und vielen Bewertungen. CDKeys ist besonders bekannt und zuverlässig." },
          { step: 3, title: "Key einlösen", detail: "Gehe auf PlayStation Store → Code einlösen. Laufzeit verlängert sich automatisch." },
          { step: 4, title: "Sale-Timing", detail: "Days of Play (Juni) und Black Friday (November) bieten regelmäßig 30–50% direkt bei Sony." },
        ],
      },
    ],
  },
  {
    id: "xbox",
    name: "Xbox Game Pass",
    icon: "X",
    iconBg: "rgba(16,124,16,0.12)",
    iconColor: "#107c10",
    border: "rgba(16,124,16,0.2)",
    monthly_eur_normal: 14.99,
    category: "gaming",
    hasHack: true,
    strategies: [
      {
        id: "xbox-reseller",
        label: "Globale Keys via Reseller",
        description: "Xbox Game Pass Ultimate Jahres-Keys über globale Reseller kaufen – bis zu 40% günstiger.",
        savings_pct: 40,
        monthly_eur_normal: 14.99,
        monthly_eur_optimized: 8.99,
        steps: [
          { step: 1, title: "Key-Preis prüfen", detail: "Prüfe Eneba.com, CDKeys.com und G2A. Xbox Game Pass Ultimate Jahreskarten oft für 100–120 € statt 179 €." },
          { step: 2, title: "Region beachten", detail: "Manche Keys sind regionsgebunden (EU/UK). 'Global' oder 'EU' Keys sind am sichersten." },
          { step: 3, title: "Key einlösen", detail: "Gehe zu microsoft.com/redeem oder Xbox-App → Code einlösen." },
        ],
      },
      {
        id: "xbox-rewards",
        label: "Microsoft Rewards (100% gratis)",
        description: "Mit Microsoft Rewards-Punkten Game Pass komplett kostenlos verlängern.",
        savings_pct: 100,
        monthly_eur_normal: 14.99,
        monthly_eur_optimized: 0.00,
        steps: [
          { step: 1, title: "Microsoft Rewards aktivieren", detail: "Gehe zu rewards.microsoft.com und melde dich an. Punkte gibt es für Bing-Suchen, Xbox-Quests und Einkäufe." },
          { step: 2, title: "Punkte sammeln", detail: "Nutze Bing als Standard-Suchmaschine (5 Punkte/Suche). Schließe täglich Xbox-Quests ab. Plane ~3–6 Monate für genug Punkte ein." },
          { step: 3, title: "Punkte einlösen", detail: "Im Rewards Store: Game Pass Ultimate 1 Monat für 6.500–7.000 Punkte einlösen." },
        ],
      },
    ],
  },
  {
    id: "nintendo",
    name: "Nintendo Switch Online",
    icon: "N",
    iconBg: "rgba(230,0,18,0.12)",
    iconColor: "#e60012",
    border: "rgba(230,0,18,0.2)",
    monthly_eur_normal: 3.99,
    category: "gaming",
    hasHack: true,
    strategies: [
      {
        id: "nintendo-family",
        label: "Familienabo mit 8 Personen",
        description: "Nintendo Switch Online Familienabo (8 Pers.) für 34,99 €/Jahr – jeder zahlt nur ~0,37 €/Monat.",
        savings_pct: 91,
        monthly_eur_normal: 3.99,
        monthly_eur_optimized: 0.37,
        steps: [
          { step: 1, title: "Familienabo buchen", detail: "Kaufe Nintendo Switch Online Familienabo auf nintendo.com für 34,99 €/Jahr (bis zu 8 Nintendo-Accounts)." },
          { step: 2, title: "Mitglieder einladen", detail: "Gehe zu nintendo.com/switch/online → Familienmitgliedschaft verwalten → Einladung senden." },
          { step: 3, title: "Kosten aufteilen", detail: "34,99 € / 8 / 12 = ~0,37 €/Person/Monat. Jeder hat sein eigenes Konto mit Spielständen und Online-Zugang." },
          { step: 4, title: "Jahres-Keys nutzen", detail: "Kaufe den Jahres-Key auch auf Eneba oder CDKeys für ~25–28 € (statt 34,99 €) und teile dann auf." },
        ],
      },
    ],
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  video: "Video & Streaming",
  audio: "Audio & Musik",
  software: "Software & Tools",
  ai: "KI & AI",
  gaming: "Gaming",
};

function formatEur(val: number) {
  return val.toFixed(2).replace(".", ",") + " €";
}

function bestStrategy(svc: Service): HackStrategy | null {
  if (!svc.hasHack || svc.strategies.length === 0) return null;
  return svc.strategies.reduce((a, b) => (a.savings_pct > b.savings_pct ? a : b));
}

type Phase = "input" | "result";

export default function AboRechnerPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [phase, setPhase] = useState<Phase>("input");
  const [activeGuide, setActiveGuide] = useState<string | null>(null);

  const toggleService = (id: string) => {
    if (phase === "result") return;
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectedServices = SERVICES.filter((s) => selected.has(s.id));

  const totalNormal = selectedServices.reduce((s, svc) => s + svc.monthly_eur_normal, 0);
  const totalOptimized = selectedServices.reduce((s, svc) => {
    const strat = bestStrategy(svc);
    return s + (strat ? strat.monthly_eur_optimized : svc.monthly_eur_normal);
  }, 0);
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

  const categories = Array.from(new Set(SERVICES.map((s) => s.category)));

  return (
    <main style={{ minHeight: "100vh", background: "#020b18", color: "#e2e8f0", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Nav */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "18px 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 30, height: 30, background: "linear-gradient(135deg,#00d4ff,#0099cc)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: "#020b18" }}>LC</div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: "#fff" }}>Leon Cordts</span>
          </a>
          <a href="https://leoncordts.github.io/tools" style={{ fontSize: 13, color: "#475569", textDecoration: "none" }}>← Alle Tools</a>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "52px 24px 80px" }}>

        {/* ── PHASE 1: INPUT ───────────────────────────────────────────── */}
        <div>
          {/* Hero */}
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(34,197,94,0.09)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 20, padding: "5px 14px", marginBottom: 22 }}>
              <span style={{ fontSize: 11, color: "#4ade80", fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.12em" }}>SMART HACKS · 19 DIENSTE</span>
            </div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(26px,5vw,46px)", fontWeight: 800, color: "#fff", margin: "0 0 14px", lineHeight: 1.15 }}>
              Wie viel zahlst du <span style={{ color: "#ef4444" }}>zu viel</span><br />für deine Abos?
            </h1>
            <p style={{ fontSize: 16, color: "#64748b", maxWidth: 500, margin: "0 auto" }}>
              Wähle deine aktiven Abonnements aus und finde heraus, was du wirklich zahlen müsstest.
            </p>
          </div>

          {/* Service tiles grouped by category */}
          {categories.map((cat) => {
            const svcs = SERVICES.filter((s) => s.category === cat);
            return (
              <div key={cat} style={{ marginBottom: 36 }}>
                <p style={{ fontSize: 11, fontFamily: "monospace", color: "#475569", letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 14px" }}>
                  {CATEGORY_LABELS[cat]}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(165px, 1fr))", gap: 10 }}>
                  {svcs.map((svc) => {
                    const isSelected = selected.has(svc.id);
                    return (
                      <button
                        key={svc.id}
                        onClick={() => toggleService(svc.id)}
                        disabled={phase === "result"}
                        style={{
                          background: isSelected ? "rgba(34,197,94,0.09)" : "rgba(255,255,255,0.02)",
                          border: `2px solid ${isSelected ? "rgba(34,197,94,0.5)" : "rgba(255,255,255,0.07)"}`,
                          borderRadius: 14,
                          padding: "20px 16px",
                          cursor: phase === "result" ? "default" : "pointer",
                          textAlign: "center",
                          transition: "all 0.18s",
                          position: "relative",
                        }}
                      >
                        {isSelected && (
                          <div style={{ position: "absolute", top: 8, right: 8, width: 18, height: 18, background: "#4ade80", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#020b18", fontWeight: 800 }}>✓</div>
                        )}
                        <div style={{ width: 44, height: 44, background: svc.iconBg, border: `1px solid ${svc.border}`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 15, color: svc.iconColor, margin: "0 auto 12px" }}>
                          {svc.icon}
                        </div>
                        <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, color: isSelected ? "#fff" : "#cbd5e1", margin: "0 0 4px", lineHeight: 1.3 }}>{svc.name}</p>
                        <p style={{ fontSize: 12, color: isSelected ? "#94a3b8" : "#475569", margin: 0, fontFamily: "monospace" }}>
                          {formatEur(svc.monthly_eur_normal)}/Mo
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* CTA */}
          <div style={{ textAlign: "center", marginTop: 16 }}>
            {selected.size === 0 ? (
              <p style={{ color: "#334155", fontSize: 14 }}>Wähle mindestens ein Abo aus ↑</p>
            ) : phase === "input" ? (
              <div>
                <p style={{ color: "#64748b", fontSize: 13, marginBottom: 16 }}>
                  {selected.size} Abo{selected.size > 1 ? "s" : ""} ausgewählt &middot;{" "}
                  <span style={{ color: "#ef4444", fontFamily: "monospace", fontWeight: 700 }}>{formatEur(totalNormal)}/Monat</span>
                </p>
                <button
                  onClick={handleCalculate}
                  style={{ background: "linear-gradient(135deg,#4ade80,#22c55e)", border: "none", borderRadius: 14, padding: "16px 40px", fontSize: 17, fontWeight: 700, color: "#020b18", cursor: "pointer", boxShadow: "0 0 40px rgba(34,197,94,0.35), 0 4px 20px rgba(0,0,0,0.4)", fontFamily: "'Syne', sans-serif" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  Mein Sparpotenzial berechnen 🚀
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* ── PHASE 2: RESULT ──────────────────────────────────────────── */}
        {phase === "result" && (
          <div id="result-section" style={{ marginTop: 80 }}>
            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 48 }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
              <span style={{ fontSize: 11, fontFamily: "monospace", color: "#4ade80", letterSpacing: "0.15em", textTransform: "uppercase" }}>Dein Ergebnis</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
            </div>

            {/* Vorher / Nachher hero */}
            <div style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "36px 32px", marginBottom: 36, display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: 32, flexWrap: "wrap", alignItems: "flex-end" }}>
                <div>
                  <p style={{ fontSize: 11, fontFamily: "monospace", color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 6px" }}>Aktuelle Kosten</p>
                  <p style={{ fontSize: 36, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#ef4444", margin: 0 }}>
                    {formatEur(totalNormal)}<span style={{ fontSize: 16, fontWeight: 500, color: "#64748b" }}>/Mo</span>
                  </p>
                </div>
                <div style={{ color: "#334155", fontSize: 24, fontWeight: 300, paddingBottom: 4 }}>→</div>
                <div>
                  <p style={{ fontSize: 11, fontFamily: "monospace", color: "#4ade80", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 6px" }}>Optimierte Kosten</p>
                  <p style={{ fontSize: 36, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#4ade80", margin: 0 }}>
                    {formatEur(totalOptimized)}<span style={{ fontSize: 16, fontWeight: 500, color: "#64748b" }}>/Mo</span>
                  </p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 11, fontFamily: "monospace", color: "#facc15", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 6px" }}>Du sparst jährlich</p>
                <p style={{ fontSize: 42, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#facc15", margin: "0 0 4px" }}>{formatEur(savedYear)}</p>
                <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>{overallPct}% weniger als bisher</p>
              </div>
            </div>

            {/* Hack cards */}
            <h2 style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: "0.14em", color: "#64748b", textTransform: "uppercase", margin: "0 0 20px" }}>
              Deine smarten Hacks
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 52 }}>
              {selectedServices.map((svc) => {
                const strat = bestStrategy(svc);
                const isOpen = activeGuide === svc.id;

                // ── No-hack card ──
                if (!svc.hasHack || !strat) {
                  return (
                    <div key={svc.id} style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(148,163,184,0.15)", borderRadius: 16, padding: "20px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
                        <div style={{ width: 38, height: 38, background: svc.iconBg, border: `1px solid ${svc.border}`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, color: svc.iconColor, flexShrink: 0 }}>{svc.icon}</div>
                        <div>
                          <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 15, color: "#cbd5e1", fontFamily: "'Syne', sans-serif" }}>{svc.name}</p>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(100,116,139,0.15)", border: "1px solid rgba(100,116,139,0.25)", borderRadius: 20, padding: "2px 10px" }}>
                            <span style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>Aktuell leider kein Hack verfügbar</span>
                          </div>
                        </div>
                      </div>
                      <p style={{ margin: "0 0 6px", fontSize: 13, color: "#475569", lineHeight: 1.6, paddingLeft: 52 }}>{svc.noHackReason}</p>
                      {svc.noHackAlternative && (
                        <p style={{ margin: 0, fontSize: 13, color: "#00d4ff", lineHeight: 1.6, paddingLeft: 52 }}>💡 {svc.noHackAlternative}</p>
                      )}
                    </div>
                  );
                }

                // ── Hack card ──
                const savingPerYear = (svc.monthly_eur_normal - strat.monthly_eur_optimized) * 12;
                return (
                  <div key={svc.id} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${isOpen ? "rgba(34,197,94,0.35)" : svc.border}`, borderRadius: 16, overflow: "hidden", transition: "border-color 0.2s" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", flexWrap: "wrap", gap: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 38, height: 38, background: svc.iconBg, border: `1px solid ${svc.border}`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, color: svc.iconColor, flexShrink: 0 }}>{svc.icon}</div>
                        <div>
                          <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 15, color: "#fff", fontFamily: "'Syne', sans-serif" }}>{svc.name}</p>
                          <p style={{ margin: 0, fontSize: 12, color: "#4ade80", fontFamily: "monospace" }}>{strat.label}</p>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ margin: "0 0 2px", fontSize: 10, color: "#475569", fontFamily: "monospace" }}>VORHER → NACHHER</p>
                          <p style={{ margin: 0, fontFamily: "monospace", fontSize: 13 }}>
                            <span style={{ color: "#ef4444" }}>{formatEur(svc.monthly_eur_normal)}</span>
                            <span style={{ color: "#334155" }}> → </span>
                            <span style={{ color: "#4ade80" }}>{formatEur(strat.monthly_eur_optimized)}</span>
                            <span style={{ color: "#64748b" }}>/Mo</span>
                          </p>
                        </div>
                        <div style={{ background: "rgba(250,204,21,0.1)", border: "1px solid rgba(250,204,21,0.25)", borderRadius: 10, padding: "7px 12px", textAlign: "center" }}>
                          <p style={{ margin: "0 0 1px", fontSize: 10, color: "#facc15", fontFamily: "monospace" }}>/JAHR</p>
                          <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#facc15", fontFamily: "'Syne', sans-serif" }}>+{formatEur(savingPerYear)}</p>
                        </div>
                        <button
                          onClick={() => setActiveGuide(isOpen ? null : svc.id)}
                          style={{ background: isOpen ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${isOpen ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.08)"}`, borderRadius: 8, padding: "7px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600, color: isOpen ? "#4ade80" : "#64748b", whiteSpace: "nowrap" }}
                        >
                          {isOpen ? "Anleitung ▲" : "Anleitung ▼"}
                        </button>
                      </div>
                    </div>
                    <div style={{ padding: "0 22px 14px", paddingLeft: 72 }}>
                      <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{strat.description}</p>
                    </div>
                    {isOpen && (
                      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "18px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
                        <p style={{ margin: "0 0 10px", fontSize: 11, fontFamily: "monospace", color: "#4ade80", letterSpacing: "0.12em", textTransform: "uppercase" }}>Schritt-für-Schritt-Anleitung</p>
                        {strat.steps.map((s) => (
                          <div key={s.step} style={{ display: "flex", gap: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, padding: "12px 14px" }}>
                            <div style={{ width: 22, height: 22, background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#4ade80", fontFamily: "monospace", flexShrink: 0 }}>{s.step}</div>
                            <div>
                              <p style={{ margin: "0 0 3px", fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{s.title}</p>
                              <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.65 }}>{s.detail}</p>
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
            <div style={{ background: "linear-gradient(135deg,rgba(0,212,255,0.07),rgba(0,153,204,0.03))", border: "1px solid rgba(0,212,255,0.18)", borderRadius: 20, padding: "32px 28px", marginBottom: 36, display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <p style={{ fontSize: 11, fontFamily: "monospace", color: "#00d4ff", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 10px" }}>Für Unternehmen</p>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: "#fff", margin: "0 0 10px" }}>IT-Kostenoptimierung für Ihr Unternehmen</h3>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.65, margin: 0 }}>
                  Effiziente Kostenoptimierung spart nicht nur privat, sondern auch Ihrem Unternehmen bares Geld. Ich analysiere Ihre Software-Lizenzen und Cloud-Infrastrukturen auf versteckte Einsparpotenziale.
                </p>
              </div>
              <a href="https://leoncordts.github.io/#kontakt" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg,#00d4ff,#0099cc)", color: "#020b18", fontWeight: 700, fontSize: 14, padding: "14px 26px", borderRadius: 10, textDecoration: "none", whiteSpace: "nowrap", boxShadow: "0 0 28px rgba(0,212,255,0.25)", flexShrink: 0 }}>
                Jetzt unverbindlich anfragen →
              </a>
            </div>

            {/* Reset */}
            <div style={{ textAlign: "center" }}>
              <button onClick={handleReset} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "10px 22px", cursor: "pointer", fontSize: 13, color: "#475569" }}>
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
