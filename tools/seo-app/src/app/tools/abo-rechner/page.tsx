"use client";

import { useState } from "react";

interface HackStep { step: number; title: string; detail: string; }

interface HackStrategy {
  id: string; label: string; description: string;
  savings_pct: number; monthly_eur_normal: number; monthly_eur_optimized: number;
  steps: HackStep[];
}

interface Service {
  id: string; name: string; icon: string;
  brandColor: string; glowColor: string;
  iconBg: string; iconColor: string; border: string;
  monthly_eur_normal: number; category: string;
  hasHack: boolean; noHackReason?: string; noHackAlternative?: string;
  strategies: HackStrategy[];
}

const SERVICES: Service[] = [
  // VIDEO
  {
    id: "netflix", name: "Netflix", icon: "N",
    brandColor: "#e50914", glowColor: "rgba(229,9,20,0.45)",
    iconBg: "rgba(229,9,20,0.15)", iconColor: "#ff4040", border: "rgba(229,9,20,0.3)",
    monthly_eur_normal: 17.99, category: "video", hasHack: true,
    strategies: [{
      id: "netflix-turkey", label: "Türkei-Konto + Geschenkkarte",
      description: "Konto in der Türkei mit lokaler Geschenkkarte – bis zu 70% günstiger.",
      savings_pct: 70, monthly_eur_normal: 17.99, monthly_eur_optimized: 5.40,
      steps: [
        { step: 1, title: "VPN auf Türkei setzen", detail: "Verbinde dich via VPN mit einem türkischen Server (z.B. Istanbul)." },
        { step: 2, title: "Netflix-Konto erstellen", detail: "Öffne netflix.com im Inkognito-Modus. Neues Konto erstellen – Land wird automatisch Türkei." },
        { step: 3, title: "Geschenkkarte kaufen", detail: "Netflix-Türkei-Geschenkkarte auf Kinguin.net, G2A oder Eneba (Verkäufer >95% positiv)." },
        { step: 4, title: "Karte einlösen", detail: "netflix.com/redeem → Code eingeben (VPN aktiv). Guthaben kommt in türkische Lira." },
        { step: 5, title: "Verlängerung", detail: "Alle 1–3 Monate neue Geschenkkarte kaufen. VPN nur beim Einlösen nötig." },
      ],
    }],
  },
  {
    id: "youtube", name: "YouTube Premium", icon: "▶",
    brandColor: "#ff0000", glowColor: "rgba(255,0,0,0.4)",
    iconBg: "rgba(255,0,0,0.12)", iconColor: "#ff4444", border: "rgba(255,68,68,0.3)",
    monthly_eur_normal: 13.99, category: "video", hasHack: true,
    strategies: [
      {
        id: "yt-vpn", label: "VPN-Hack (Nigeria/Indien)",
        description: "Neues Konto via VPN in Nigeria oder Indien – bis zu 87% günstiger.",
        savings_pct: 87, monthly_eur_normal: 13.99, monthly_eur_optimized: 1.82,
        steps: [
          { step: 1, title: "VPN installieren", detail: "Mullvad VPN oder ProtonVPN – Server Nigeria oder Indien wählen." },
          { step: 2, title: "Neues Google-Konto", detail: "Inkognito öffnen, accounts.google.com, frisches Google-Konto erstellen." },
          { step: 3, title: "Virtuelle Kreditkarte", detail: "Revolut oder N26 (kostenlos). Rechnungsadresse auf Nigeria/Indien setzen." },
          { step: 4, title: "Premium abonnieren", detail: "youtube.com mit aktivem VPN öffnen – lokaler Preis ~1,50–2 €/Monat." },
          { step: 5, title: "VPN-Tipp", detail: "VPN nur beim Verlängern nötig, nicht beim täglichen Nutzen." },
        ],
      },
      {
        id: "yt-family", label: "Familien-Tarif (6 Personen)",
        description: "Familien-Plan mit 5 Freunden – jeder zahlt nur ~3,83 €/Monat.",
        savings_pct: 73, monthly_eur_normal: 13.99, monthly_eur_optimized: 3.83,
        steps: [
          { step: 1, title: "Familien-Tarif buchen", detail: "YouTube Premium Familien: 22,99 €/Monat, bis zu 5 weitere Mitglieder." },
          { step: 2, title: "Mitglieder einladen", detail: "5 Freunde einladen. 22,99 € / 6 = 3,83 €/Person." },
          { step: 3, title: "Zahlung regeln", detail: "Splitwise oder monatliche Überweisung." },
        ],
      },
    ],
  },
  {
    id: "disney", name: "Disney+", icon: "★",
    brandColor: "#1a46cc", glowColor: "rgba(26,70,204,0.5)",
    iconBg: "rgba(99,102,241,0.15)", iconColor: "#818cf8", border: "rgba(99,102,241,0.3)",
    monthly_eur_normal: 8.99, category: "video", hasHack: true,
    strategies: [{
      id: "disney-giftcard", label: "Guthabenkarten (bis 30% Rabatt)",
      description: "Disney+ Geschenkkarten oft 20–30% günstiger im Angebot – kein Monatsabo nötig.",
      savings_pct: 25, monthly_eur_normal: 8.99, monthly_eur_optimized: 6.74,
      steps: [
        { step: 1, title: "Sale-Karte suchen", detail: "Eneba, Kaufland, Rewe, dm – besonders um Black Friday 20–30% Rabatt." },
        { step: 2, title: "Cashback aktivieren", detail: "Shoop.de vor dem Kauf aktivieren (bis 8% extra Cashback)." },
        { step: 3, title: "Code einlösen", detail: "disneyplus.com/redeem → Code eingeben." },
        { step: 4, title: "Monatlich kündigen", detail: "Disney+ kündigen wenn keine neuen Staffeln laufen – nur aktiv halten wenn nötig." },
      ],
    }],
  },
  {
    id: "amazon-prime", name: "Amazon Prime", icon: "📦",
    brandColor: "#ff9900", glowColor: "rgba(255,153,0,0.45)",
    iconBg: "rgba(255,153,0,0.12)", iconColor: "#fbbf24", border: "rgba(255,153,0,0.3)",
    monthly_eur_normal: 8.99, category: "video", hasHack: true,
    strategies: [{
      id: "prime-student", label: "Student-Tarif (50% Rabatt)",
      description: "Amazon Prime Student: 4,49 €/Monat – 6 Monate gratis Probephase.",
      savings_pct: 50, monthly_eur_normal: 8.99, monthly_eur_optimized: 4.49,
      steps: [
        { step: 1, title: "Studenten-E-Mail", detail: "Du brauchst eine .edu oder Uni-E-Mail (z.B. @stud.uni-berlin.de)." },
        { step: 2, title: "Prime Student aktivieren", detail: "amazon.de/primestudent → '6 Monate gratis testen' → Status verifizieren." },
        { step: 3, title: "Verlängerung", detail: "Danach 4,49 €/Monat statt 8,99 €. Bis zu 4 Jahre möglich." },
      ],
    }],
  },
  {
    id: "dazn", name: "DAZN", icon: "⚽",
    brandColor: "#f5c518", glowColor: "rgba(245,197,24,0.4)",
    iconBg: "rgba(245,197,24,0.1)", iconColor: "#facc15", border: "rgba(250,204,21,0.25)",
    monthly_eur_normal: 29.99, category: "video", hasHack: true,
    strategies: [{
      id: "dazn-giftcard", label: "Guthabenkarten (Aldi/Amazon Sale)",
      description: "DAZN-Guthabenkarten bei Aldi-Sale – bis zu 35% Rabatt statt Monatsabo.",
      savings_pct: 35, monthly_eur_normal: 29.99, monthly_eur_optimized: 19.49,
      steps: [
        { step: 1, title: "Sale-Datum abwarten", detail: "Aldi (Nord/Süd) verkauft DAZN-Karten mehrmals jährlich mit 30–40% Rabatt." },
        { step: 2, title: "Auf Vorrat kaufen", detail: "Gleich 3–6 Monate kaufen wenn der Rabatt aktiv ist." },
        { step: 3, title: "Karten stapeln", detail: "dazn.com → Einstellungen → Gutschein → Codes stapeln sich als Guthaben." },
        { step: 4, title: "Monatsabo kündigen", detail: "Nur noch per Guthabenkarte zahlen, nie mehr monatlich." },
      ],
    }],
  },
  {
    id: "wow", name: "WOW (Sky)", icon: "📡",
    brandColor: "#0ea5e9", glowColor: "rgba(14,165,233,0.45)",
    iconBg: "rgba(14,165,233,0.12)", iconColor: "#38bdf8", border: "rgba(56,189,248,0.25)",
    monthly_eur_normal: 14.99, category: "video", hasHack: true,
    strategies: [{
      id: "wow-retention", label: "Kündigungs-Loop (50% Rückholangebot)",
      description: "Simulierte Kündigung triggert fast immer 50% Rabatt-Rückholangebot von WOW/Sky.",
      savings_pct: 50, monthly_eur_normal: 14.99, monthly_eur_optimized: 7.49,
      steps: [
        { step: 1, title: "WOW-Konto öffnen", detail: "wowtv.de → Mein Konto → Abo verwalten → Kündigen. Noch nicht final." },
        { step: 2, title: "Kündigungsflow", detail: "Grund 'Zu teuer' wählen. WOW macht dabei ein Gegenangebot." },
        { step: 3, title: "Angebot annehmen", detail: "50% Rabatt für 3–6 Monate. Ablaufdatum notieren und Loop danach wiederholen." },
      ],
    }],
  },
  {
    id: "appletv", name: "Apple TV+", icon: "🍎",
    brandColor: "#94a3b8", glowColor: "rgba(148,163,184,0.4)",
    iconBg: "rgba(255,255,255,0.06)", iconColor: "#94a3b8", border: "rgba(148,163,184,0.2)",
    monthly_eur_normal: 9.99, category: "video", hasHack: true,
    strategies: [{
      id: "appletv-device", label: "Geräte-Hopping (3 Monate gratis)",
      description: "Jeder neue Apple-Gerätekauf schaltet 3 Monate Apple TV+ gratis frei – auch gebraucht.",
      savings_pct: 25, monthly_eur_normal: 9.99, monthly_eur_optimized: 7.49,
      steps: [
        { step: 1, title: "Gebrauchtes Apple-Gerät", detail: "Refurbishtes iPhone/iPad/Mac bei Apple oder Back Market kaufen." },
        { step: 2, title: "Trial aktivieren", detail: "Nach erstem Login erscheint das Angebot automatisch im App Store." },
        { step: 3, title: "Loop wiederholen", detail: "Bei regelmäßigen Gerätewechseln Apple TV+ fast gratis nutzen." },
      ],
    }],
  },
  {
    id: "crunchyroll", name: "Crunchyroll", icon: "🍜",
    brandColor: "#f78401", glowColor: "rgba(247,132,1,0.45)",
    iconBg: "rgba(247,132,1,0.12)", iconColor: "#fb923c", border: "rgba(247,132,1,0.25)",
    monthly_eur_normal: 7.99, category: "video", hasHack: true,
    strategies: [{
      id: "crunchyroll-vpn", label: "AppStore Türkei/Brasilien",
      description: "Crunchyroll-Abo über türkischen App Store kaufen – bis zu 65% günstiger.",
      savings_pct: 65, monthly_eur_normal: 7.99, monthly_eur_optimized: 2.80,
      steps: [
        { step: 1, title: "VPN auf Türkei", detail: "Mullvad, ProtonVPN oder NordVPN mit türkischem Server verbinden." },
        { step: 2, title: "Neue Apple/Google-ID", detail: "Neue ID mit türkischer Adresse erstellen (z.B. Istanbul, Beşiktaş)." },
        { step: 3, title: "Guthaben aufladen", detail: "Türkische App Store Geschenkkarte auf Eneba.com kaufen und aufladen." },
        { step: 4, title: "Crunchyroll abonnieren", detail: "App Store mit türkischer ID öffnen – Preis in TRY deutlich niedriger." },
      ],
    }],
  },
  // AUDIO
  {
    id: "spotify", name: "Spotify", icon: "🎵",
    brandColor: "#1db954", glowColor: "rgba(29,185,84,0.45)",
    iconBg: "rgba(29,185,84,0.12)", iconColor: "#22c55e", border: "rgba(29,185,84,0.3)",
    monthly_eur_normal: 10.99, category: "audio", hasHack: true,
    strategies: [
      {
        id: "spotify-family", label: "Familien-Plan (6 Personen)",
        description: "Spotify Premium Familie für 17,99 €/Monat – jeder zahlt nur ~3 €/Monat.",
        savings_pct: 73, monthly_eur_normal: 10.99, monthly_eur_optimized: 3.00,
        steps: [
          { step: 1, title: "Familien-Plan buchen", detail: "Spotify Premium Familie: 17,99 €/Monat für bis zu 6 Mitglieder." },
          { step: 2, title: "Mitglieder einladen", detail: "spotify.com/family → Mitglied hinzufügen. Alle tragen dieselbe Heimadresse ein." },
          { step: 3, title: "Kosten aufteilen", detail: "17,99 € / 6 = ~3 €/Person. Splitwise für monatliche Erinnerungen nutzen." },
        ],
      },
      {
        id: "spotify-prepaid", label: "12-Monats-Prepaid-Karte",
        description: "Jahres-Geschenkkarte statt Monatsabo – spart ~20%.",
        savings_pct: 20, monthly_eur_normal: 10.99, monthly_eur_optimized: 8.74,
        steps: [
          { step: 1, title: "Jahres-Karte kaufen", detail: "Amazon, MediaMarkt oder Eneba – oft 10–20% Rabatt bei Sales." },
          { step: 2, title: "Cashback aktivieren", detail: "Shoop.de oder Igraal.com vor dem Kauf (3–8% zurück)." },
          { step: 3, title: "Code einlösen", detail: "spotify.com/redeem → Code eingeben." },
        ],
      },
    ],
  },
  {
    id: "audible", name: "Audible", icon: "🎧",
    brandColor: "#f59e0b", glowColor: "rgba(245,158,11,0.45)",
    iconBg: "rgba(245,158,11,0.12)", iconColor: "#fbbf24", border: "rgba(245,158,11,0.25)",
    monthly_eur_normal: 9.99, category: "audio", hasHack: true,
    strategies: [{
      id: "audible-retention", label: "Kündigungs-Loop (3 Monate für 4,95 €)",
      description: "Simulierte Kündigung triggert fast immer 3–6 Monate für 4,95 €/Monat.",
      savings_pct: 50, monthly_eur_normal: 9.99, monthly_eur_optimized: 4.95,
      steps: [
        { step: 1, title: "Kündigung einleiten", detail: "audible.de → Konto → Mitgliedschaft verwalten → Mitgliedschaft kündigen." },
        { step: 2, title: "Grund: Zu teuer", detail: "Kündigungsgrund 'Zu teuer' wählen – Rückholangebot erscheint fast immer." },
        { step: 3, title: "Angebot annehmen", detail: "3–6 Monate für 4,95 €/Monat oder 2 Credits gratis. Annehmen und Loop wiederholen." },
      ],
    }],
  },
  // SOFTWARE & TOOLS
  {
    id: "adobe", name: "Adobe CC", icon: "✏️",
    brandColor: "#ff3d00", glowColor: "rgba(255,61,0,0.45)",
    iconBg: "rgba(255,61,0,0.12)", iconColor: "#f97316", border: "rgba(255,61,0,0.25)",
    monthly_eur_normal: 54.99, category: "software", hasHack: true,
    strategies: [{
      id: "adobe-retention", label: "Retention-Loop (50% Rabatt)",
      description: "Simulierte Kündigung triggert 50% Rabatt für 3–6 Monate automatisch.",
      savings_pct: 50, monthly_eur_normal: 54.99, monthly_eur_optimized: 27.49,
      steps: [
        { step: 1, title: "Adobe Dashboard", detail: "account.adobe.com → Abo verwalten → Abo kündigen. Noch NICHT final bestätigen." },
        { step: 2, title: "Grund: Zu teuer", detail: "Durch alle Screens klicken – Angebot erscheint auf dem vorletzten Screen." },
        { step: 3, title: "50% Rabatt annehmen", detail: "Kündigung wird abgebrochen, Rabatt sofort aktiv." },
        { step: 4, title: "Loop wiederholen", detail: "Bei Ablauf erneut wiederholen – Adobe gibt den Rabatt häufig erneut." },
      ],
    }],
  },
  {
    id: "microsoft365", name: "Microsoft 365", icon: "💼",
    brandColor: "#0078d4", glowColor: "rgba(0,120,212,0.45)",
    iconBg: "rgba(0,120,212,0.12)", iconColor: "#38bdf8", border: "rgba(0,120,212,0.25)",
    monthly_eur_normal: 7.00, category: "software", hasHack: true,
    strategies: [{
      id: "m365-family", label: "Family-Plan (6 Personen)",
      description: "Microsoft 365 Family via Reseller-Key – jeder zahlt nur ~1,39 €/Monat.",
      savings_pct: 80, monthly_eur_normal: 7.00, monthly_eur_optimized: 1.39,
      steps: [
        { step: 1, title: "Family-Key kaufen", detail: "Amazon oder MMOGA: Microsoft 365 Family Jahreskey für ~50–60 € (für 6 Personen)." },
        { step: 2, title: "Mitglieder einladen", detail: "microsoft365.com → Dein Abonnement → Person hinzufügen." },
        { step: 3, title: "Kosten aufteilen", detail: "50 € / 6 / 12 = ~0,69 €/Person/Monat." },
      ],
    }],
  },
  {
    id: "canva", name: "Canva Pro", icon: "🎨",
    brandColor: "#00c896", glowColor: "rgba(0,200,150,0.45)",
    iconBg: "rgba(0,200,150,0.12)", iconColor: "#34d399", border: "rgba(0,200,150,0.25)",
    monthly_eur_normal: 14.99, category: "software", hasHack: true,
    strategies: [{
      id: "canva-education", label: "Canva for Education (gratis)",
      description: "Lehrer, Dozenten und Schüler bekommen Canva Pro komplett kostenlos.",
      savings_pct: 100, monthly_eur_normal: 14.99, monthly_eur_optimized: 0.00,
      steps: [
        { step: 1, title: "Berechtigung prüfen", detail: "Lehrer, Dozent, Student oder Schüler? Dann berechtigt für Canva for Education." },
        { step: 2, title: "Antrag stellen", detail: "canva.com/education → Als Lehrkraft oder Student registrieren." },
        { step: 3, title: "Nachweis vorlegen", detail: "Schul-/Uni-E-Mail oder Foto des Ausweises/Lehrerbescheids einreichen." },
        { step: 4, title: "Aktivierung", detail: "Canva Pro kostenlos – für die gesamte Bildungskarriere." },
      ],
    }],
  },
  {
    id: "duolingo", name: "Duolingo Plus", icon: "🦉",
    brandColor: "#58cc02", glowColor: "rgba(88,204,2,0.45)",
    iconBg: "rgba(88,204,2,0.12)", iconColor: "#86efac", border: "rgba(88,204,2,0.25)",
    monthly_eur_normal: 6.99, category: "software", hasHack: true,
    strategies: [{
      id: "duolingo-family", label: "Family-Plan (6 Personen)",
      description: "Duolingo Family Plan für ~9,99 €/Monat – jeder zahlt nur ~1,67 €/Monat.",
      savings_pct: 76, monthly_eur_normal: 6.99, monthly_eur_optimized: 1.67,
      steps: [
        { step: 1, title: "Family Plan buchen", detail: "duolingo.com → Profil → Duolingo Family (~9,99 €/Monat für 6 Personen)." },
        { step: 2, title: "Mitglieder einladen", detail: "Bis zu 5 Freunde per E-Mail oder Nutzername einladen." },
        { step: 3, title: "Kosten aufteilen", detail: "9,99 € / 6 = ~1,67 €/Person. Jeder eigener Account mit eigenem Fortschritt." },
      ],
    }],
  },
  {
    id: "google-one", name: "Google One", icon: "☁",
    brandColor: "#4285f4", glowColor: "rgba(66,133,244,0.45)",
    iconBg: "rgba(66,133,244,0.12)", iconColor: "#60a5fa", border: "rgba(66,133,244,0.25)",
    monthly_eur_normal: 2.99, category: "software", hasHack: true,
    strategies: [{
      id: "google-one-yearly", label: "Jahresabo + Google Play Türkei",
      description: "Jahresabo spart 16%. Zusätzlich: Google Play Store Türkei oft günstiger per In-App-Kauf.",
      savings_pct: 30, monthly_eur_normal: 2.99, monthly_eur_optimized: 2.09,
      steps: [
        { step: 1, title: "Auf Jahresabo umstellen", detail: "one.google.com → Plan ändern → Jahresabo wählen. Direkt 16% sparen." },
        { step: 2, title: "Google Play Türkei prüfen", detail: "Auf Android: VPN auf Türkei setzen, Google Play Store öffnen. Viele Google-Dienste lassen sich hier günstiger buchen." },
        { step: 3, title: "Google One Family nutzen", detail: "Google One lässt sich mit bis zu 5 Familienmitgliedern teilen – Speicher gemeinsam nutzen ohne Extra-Kosten." },
      ],
    }],
  },
  {
    id: "icloud", name: "iCloud+", icon: "☁",
    brandColor: "#94a3b8", glowColor: "rgba(148,163,184,0.3)",
    iconBg: "rgba(148,163,184,0.08)", iconColor: "#64748b", border: "rgba(148,163,184,0.15)",
    monthly_eur_normal: 2.99, category: "software", hasHack: false,
    noHackReason: "Apple sperrt Länderkonten für iCloud rigoros – VPN-Tricks werden sofort erkannt und blockiert.",
    noHackAlternative: "Apple One Bundle prüfen: enthält iCloud 50GB + Music + TV+ + Arcade für 19,95 €/Mo – günstiger als Einzeln.",
    strategies: [],
  },
  // AI
  {
    id: "chatgpt", name: "ChatGPT Plus", icon: "🤖",
    brandColor: "#10b981", glowColor: "rgba(16,185,129,0.35)",
    iconBg: "rgba(16,185,129,0.08)", iconColor: "#34d399", border: "rgba(52,211,153,0.15)",
    monthly_eur_normal: 20.00, category: "ai", hasHack: false,
    noHackReason: "OpenAI blockiert VPN-Tricks rigoros. Konten werden bei Verdacht auf Länder-Hacks sofort gesperrt.",
    noHackAlternative: "OpenAI API (pay-as-you-go) über Open-Source-Frontends wie LibreChat nutzen – für 90% der Nutzer massiv günstiger als das fixe Abo.",
    strategies: [],
  },
  {
    id: "claude-pro", name: "Claude Pro", icon: "✦",
    brandColor: "#d97706", glowColor: "rgba(217,119,6,0.35)",
    iconBg: "rgba(217,119,6,0.08)", iconColor: "#f59e0b", border: "rgba(245,158,11,0.15)",
    monthly_eur_normal: 22.61, category: "ai", hasHack: false,
    noHackReason: "Kein VPN-Hack möglich – Anthropic prüft Zahlungsmethoden und Kontoherkunft rigoros.",
    noHackAlternative: "Anthropic API (Pay-as-you-go) über Open-Source-Frontends wie LibreChat oder AnythingLLM nutzen. Für Gelegenheitsnutzer oft 80–90% günstiger als das fixe Abo.",
    strategies: [],
  },
  {
    id: "gemini", name: "Gemini Advanced", icon: "💫",
    brandColor: "#4f46e5", glowColor: "rgba(79,70,229,0.45)",
    iconBg: "rgba(79,70,229,0.12)", iconColor: "#818cf8", border: "rgba(79,70,229,0.25)",
    monthly_eur_normal: 21.99, category: "ai", hasHack: true,
    strategies: [{
      id: "gemini-family", label: "Google Familienfreigabe (5 Personen)",
      description: "Gemini Advanced (Google One AI Premium) legal mit bis zu 5 Familienmitgliedern teilen.",
      savings_pct: 83, monthly_eur_normal: 21.99, monthly_eur_optimized: 3.67,
      steps: [
        { step: 1, title: "Google One AI Premium buchen", detail: "Buche Google One AI Premium (21,99 €/Monat) – enthält Gemini Advanced + 2TB Speicher." },
        { step: 2, title: "Familienfreigabe aktivieren", detail: "Google One App → Familienfreigabe → Bis zu 5 Mitglieder einladen (per Google-Konto)." },
        { step: 3, title: "Kosten aufteilen", detail: "21,99 € / 6 Personen = ~3,67 €/Person/Monat. Alle erhalten Gemini Advanced Zugang." },
        { step: 4, title: "Bonus", detail: "2TB Google Drive Speicher wird ebenfalls mit allen Familienmitgliedern geteilt." },
      ],
    }],
  },
  {
    id: "midjourney", name: "Midjourney", icon: "🖼️",
    brandColor: "#7c3aed", glowColor: "rgba(124,58,237,0.45)",
    iconBg: "rgba(124,58,237,0.12)", iconColor: "#a78bfa", border: "rgba(167,139,250,0.25)",
    monthly_eur_normal: 9.27, category: "ai", hasHack: true,
    strategies: [{
      id: "midjourney-yearly", label: "Jahresabo (-20%)",
      description: "Midjourney Jahresabo statt monatlich – direkt 20% sparen ohne Tricks.",
      savings_pct: 20, monthly_eur_normal: 9.27, monthly_eur_optimized: 7.41,
      steps: [
        { step: 1, title: "Auf Jahresabo umstellen", detail: "midjourney.com → Manage Sub → Billing Interval auf 'Yearly' umstellen." },
        { step: 2, title: "Sofortige Ersparnis", detail: "20% Rabatt wird direkt beim nächsten Abrechnungszyklus angewendet." },
        { step: 3, title: "Plan-Tipp", detail: "Basic Plan (10 $/Monat jährlich) reicht für Gelegenheitsnutzer. Für mehr Generierungen: Standard Plan." },
      ],
    }],
  },
  {
    id: "perplexity", name: "Perplexity Pro", icon: "🔍",
    brandColor: "#06b6d4", glowColor: "rgba(6,182,212,0.45)",
    iconBg: "rgba(6,182,212,0.12)", iconColor: "#22d3ee", border: "rgba(6,182,212,0.25)",
    monthly_eur_normal: 18.54, category: "ai", hasHack: true,
    strategies: [{
      id: "perplexity-affiliate", label: "Affiliate-Codes + Jahresabo",
      description: "Affiliate-Codes geben oft 50% auf den ersten Monat – Jahresabo spart 17%.",
      savings_pct: 17, monthly_eur_normal: 18.54, monthly_eur_optimized: 15.39,
      steps: [
        { step: 1, title: "Affiliate-Code suchen", detail: "Google 'Perplexity Pro Rabattcode' oder auf Reddit/YouTube suchen – fast immer 50% auf den ersten Monat verfügbar." },
        { step: 2, title: "Jahresabo wählen", detail: "perplexity.ai → Settings → Subscription → Yearly wählen. Direkt 17% günstiger." },
        { step: 3, title: "Kombination nutzen", detail: "Affiliate-Code beim ersten Monat + danach auf Jahresabo umstellen für maximale Ersparnis." },
      ],
    }],
  },
  // GAMING
  {
    id: "playstation", name: "PlayStation Plus", icon: "🎮",
    brandColor: "#003791", glowColor: "rgba(74,143,231,0.45)",
    iconBg: "rgba(0,55,145,0.15)", iconColor: "#60a5fa", border: "rgba(74,143,231,0.25)",
    monthly_eur_normal: 8.99, category: "gaming", hasHack: true,
    strategies: [{
      id: "ps-keys", label: "Jahres-Keys bei Eneba/CDKeys",
      description: "PlayStation Plus Jahres-Keys über Reseller – bis zu 40% günstiger.",
      savings_pct: 40, monthly_eur_normal: 8.99, monthly_eur_optimized: 5.39,
      steps: [
        { step: 1, title: "Preis vergleichen", detail: "Eneba.com, CDKeys.com und DLCompare.de für PS Plus Jahrespakete prüfen." },
        { step: 2, title: "Key einlösen", detail: "PlayStation Store → Code einlösen. Laufzeit verlängert sich automatisch." },
        { step: 3, title: "Sale-Timing", detail: "Days of Play (Juni) und Black Friday (November) direkt bei Sony: 30–50% Rabatt." },
      ],
    }],
  },
  {
    id: "xbox", name: "Xbox Game Pass", icon: "🎮",
    brandColor: "#107c10", glowColor: "rgba(16,124,16,0.45)",
    iconBg: "rgba(16,124,16,0.12)", iconColor: "#4ade80", border: "rgba(16,124,16,0.25)",
    monthly_eur_normal: 14.99, category: "gaming", hasHack: true,
    strategies: [{
      id: "xbox-rewards", label: "Microsoft Rewards (100% gratis)",
      description: "Mit Microsoft Rewards-Punkten Game Pass komplett kostenlos verlängern.",
      savings_pct: 100, monthly_eur_normal: 14.99, monthly_eur_optimized: 0.00,
      steps: [
        { step: 1, title: "Microsoft Rewards aktivieren", detail: "rewards.microsoft.com – Punkte für Bing-Suchen, Xbox-Quests und Einkäufe." },
        { step: 2, title: "Punkte sammeln", detail: "Bing als Standard-Suchmaschine (5 Punkte/Suche) + täglich Xbox-Quests abschließen." },
        { step: 3, title: "Punkte einlösen", detail: "Rewards Store: Game Pass Ultimate 1 Monat für 6.500–7.000 Punkte." },
      ],
    }],
  },
  {
    id: "nintendo", name: "Nintendo Online", icon: "🕹️",
    brandColor: "#e60012", glowColor: "rgba(230,0,18,0.45)",
    iconBg: "rgba(230,0,18,0.12)", iconColor: "#f87171", border: "rgba(230,0,18,0.25)",
    monthly_eur_normal: 3.99, category: "gaming", hasHack: true,
    strategies: [{
      id: "nintendo-family", label: "Familienabo (8 Personen)",
      description: "Nintendo Switch Online Familienabo – jeder zahlt nur ~0,37 €/Monat.",
      savings_pct: 91, monthly_eur_normal: 3.99, monthly_eur_optimized: 0.37,
      steps: [
        { step: 1, title: "Familienabo kaufen", detail: "nintendo.com: Switch Online Familienabo 34,99 €/Jahr für bis zu 8 Accounts. Oder Eneba/CDKeys für ~25 €." },
        { step: 2, title: "Mitglieder einladen", detail: "nintendo.com → Familienmitgliedschaft verwalten → Einladung senden." },
        { step: 3, title: "Kosten aufteilen", detail: "34,99 € / 8 / 12 = ~0,37 €/Person/Monat." },
      ],
    }],
  },
];

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
    setTimeout(() => document.getElementById("result-section")?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const handleReset = () => {
    setPhase("input");
    setSelected(new Set());
    setActiveGuide(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main style={{ minHeight: "100vh", background: "#020b18", color: "#e2e8f0", fontFamily: "'DM Sans', sans-serif", paddingBottom: selected.size > 0 && phase === "input" ? 100 : 0 }}>
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

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "52px 24px 40px" }}>

        {/* ── PHASE 1: INPUT ─── */}
        <div>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(34,197,94,0.09)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 20, padding: "5px 14px", marginBottom: 22 }}>
              <span style={{ fontSize: 11, color: "#4ade80", fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.12em" }}>SMART HACKS · 24 DIENSTE</span>
            </div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(26px,5vw,48px)", fontWeight: 800, color: "#fff", margin: "0 0 14px", lineHeight: 1.12 }}>
              Wie viel zahlst du <span style={{ color: "#ef4444" }}>zu viel</span><br />für deine Abos?
            </h1>
            <p style={{ fontSize: 16, color: "#64748b", maxWidth: 500, margin: "0 auto" }}>
              Klicke auf deine aktiven Abonnements. Wir zeigen dir dann, was du wirklich zahlen müsstest.
            </p>
          </div>

          {/* Flat responsive grid — all services, no category headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))", gap: 14 }}>
            {SERVICES.map((svc) => {
              const isSelected = selected.has(svc.id);
              return (
                <button
                  key={svc.id}
                  onClick={() => toggleService(svc.id)}
                  disabled={phase === "result"}
                  style={{
                    background: isSelected ? `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.6))` : "rgba(255,255,255,0.025)",
                    border: `2px solid ${isSelected ? svc.brandColor : "rgba(255,255,255,0.07)"}`,
                    borderRadius: 18,
                    padding: "22px 18px 20px",
                    cursor: phase === "result" ? "default" : "pointer",
                    textAlign: "center",
                    transition: "all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
                    position: "relative",
                    transform: isSelected ? "translateY(-5px)" : "translateY(0)",
                    boxShadow: isSelected
                      ? `0 0 0 1px ${svc.brandColor}40, 0 8px 32px ${svc.glowColor}, 0 2px 8px rgba(0,0,0,0.5)`
                      : "0 1px 3px rgba(0,0,0,0.3)",
                  }}
                >
                  {/* Check badge */}
                  {isSelected && (
                    <div style={{ position: "absolute", top: 10, right: 10, width: 20, height: 20, background: svc.brandColor, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 800, boxShadow: `0 0 10px ${svc.glowColor}` }}>✓</div>
                  )}
                  {/* Icon */}
                  <div style={{ width: 54, height: 54, background: svc.iconBg, border: `1px solid ${isSelected ? svc.brandColor + "60" : svc.border}`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, margin: "0 auto 14px", transition: "all 0.2s" }}>
                    {svc.icon}
                  </div>
                  {/* Name */}
                  <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, color: isSelected ? "#fff" : "#94a3b8", margin: "0 0 5px", lineHeight: 1.3 }}>{svc.name}</p>
                  {/* Price */}
                  <p style={{ fontSize: 12, color: isSelected ? svc.iconColor : "#334155", margin: 0, fontFamily: "monospace", fontWeight: 600 }}>{formatEur(svc.monthly_eur_normal)}/Mo</p>
                  {/* No-hack badge */}
                  {!svc.hasHack && (
                    <div style={{ marginTop: 8, display: "inline-block", background: "rgba(100,116,139,0.15)", border: "1px solid rgba(100,116,139,0.2)", borderRadius: 20, padding: "2px 8px" }}>
                      <span style={{ fontSize: 9, color: "#475569", fontFamily: "monospace", letterSpacing: "0.05em" }}>kein hack</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Empty prompt */}
          {selected.size === 0 && (
            <p style={{ textAlign: "center", color: "#1e293b", fontSize: 14, marginTop: 32 }}>Klicke auf deine Abonnements ↑</p>
          )}
        </div>

        {/* ── PHASE 2: RESULT ─── */}
        {phase === "result" && (
          <div id="result-section" style={{ marginTop: 80 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 48 }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
              <span style={{ fontSize: 11, fontFamily: "monospace", color: "#4ade80", letterSpacing: "0.15em", textTransform: "uppercase" }}>Dein Ergebnis</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
            </div>

            {/* Vorher / Nachher */}
            <div style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 22, padding: "36px 32px", marginBottom: 36, display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: 32, flexWrap: "wrap", alignItems: "flex-end" }}>
                <div>
                  <p style={{ fontSize: 11, fontFamily: "monospace", color: "#64748b", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 6px" }}>Aktuelle Kosten</p>
                  <p style={{ fontSize: 38, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#ef4444", margin: 0 }}>{formatEur(totalNormal)}<span style={{ fontSize: 16, fontWeight: 500, color: "#64748b" }}>/Mo</span></p>
                </div>
                <div style={{ color: "#1e293b", fontSize: 24, paddingBottom: 4 }}>→</div>
                <div>
                  <p style={{ fontSize: 11, fontFamily: "monospace", color: "#4ade80", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 6px" }}>Optimierte Kosten</p>
                  <p style={{ fontSize: 38, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#4ade80", margin: 0 }}>{formatEur(totalOptimized)}<span style={{ fontSize: 16, fontWeight: 500, color: "#64748b" }}>/Mo</span></p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 11, fontFamily: "monospace", color: "#facc15", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 6px" }}>Du sparst jährlich</p>
                <p style={{ fontSize: 44, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#facc15", margin: "0 0 4px" }}>{formatEur(savedYear)}</p>
                <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>{overallPct}% weniger als bisher</p>
              </div>
            </div>

            <h2 style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: "0.14em", color: "#64748b", textTransform: "uppercase", margin: "0 0 18px" }}>Deine smarten Hacks</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 52 }}>
              {selectedServices.map((svc) => {
                const strat = bestStrategy(svc);
                const isOpen = activeGuide === svc.id;

                if (!svc.hasHack || !strat) {
                  return (
                    <div key={svc.id} style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(148,163,184,0.12)", borderRadius: 16, padding: "18px 22px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                        <div style={{ width: 36, height: 36, background: svc.iconBg, border: `1px solid ${svc.border}`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{svc.icon}</div>
                        <div>
                          <p style={{ margin: "0 0 3px", fontWeight: 700, fontSize: 15, color: "#94a3b8", fontFamily: "'Syne', sans-serif" }}>{svc.name}</p>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(71,85,105,0.2)", border: "1px solid rgba(71,85,105,0.3)", borderRadius: 20, padding: "2px 10px" }}>
                            <span style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>⚠ Kein Hack verfügbar</span>
                          </div>
                        </div>
                      </div>
                      <p style={{ margin: "0 0 6px", fontSize: 13, color: "#475569", lineHeight: 1.6, paddingLeft: 48 }}>{svc.noHackReason}</p>
                      {svc.noHackAlternative && (
                        <p style={{ margin: 0, fontSize: 13, color: "#38bdf8", lineHeight: 1.6, paddingLeft: 48 }}>💡 {svc.noHackAlternative}</p>
                      )}
                    </div>
                  );
                }

                const savingPerYear = (svc.monthly_eur_normal - strat.monthly_eur_optimized) * 12;
                return (
                  <div key={svc.id} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${isOpen ? svc.brandColor + "50" : svc.border}`, borderRadius: 16, overflow: "hidden", transition: "border-color 0.2s", boxShadow: isOpen ? `0 0 20px ${svc.glowColor}` : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", flexWrap: "wrap", gap: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 38, height: 38, background: svc.iconBg, border: `1px solid ${svc.border}`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{svc.icon}</div>
                        <div>
                          <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 15, color: "#fff", fontFamily: "'Syne', sans-serif" }}>{svc.name}</p>
                          <p style={{ margin: 0, fontSize: 12, color: svc.iconColor, fontFamily: "monospace" }}>{strat.label}</p>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
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
                        <button onClick={() => setActiveGuide(isOpen ? null : svc.id)} style={{ background: isOpen ? svc.iconBg : "rgba(255,255,255,0.04)", border: `1px solid ${isOpen ? svc.brandColor + "50" : "rgba(255,255,255,0.08)"}`, borderRadius: 8, padding: "7px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600, color: isOpen ? svc.iconColor : "#64748b", whiteSpace: "nowrap" }}>
                          {isOpen ? "Anleitung ▲" : "Anleitung ▼"}
                        </button>
                      </div>
                    </div>
                    <div style={{ padding: "0 22px 14px", paddingLeft: 72 }}>
                      <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{strat.description}</p>
                    </div>
                    {isOpen && (
                      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "16px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
                        <p style={{ margin: "0 0 8px", fontSize: 11, fontFamily: "monospace", color: svc.iconColor, letterSpacing: "0.12em", textTransform: "uppercase" }}>Schritt-für-Schritt-Anleitung</p>
                        {strat.steps.map((s) => (
                          <div key={s.step} style={{ display: "flex", gap: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 10, padding: "12px 14px" }}>
                            <div style={{ width: 22, height: 22, background: svc.iconBg, border: `1px solid ${svc.border}`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: svc.iconColor, fontFamily: "monospace", flexShrink: 0 }}>{s.step}</div>
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
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.65, margin: 0 }}>Effiziente Kostenoptimierung spart nicht nur privat, sondern auch Ihrem Unternehmen bares Geld. Ich analysiere Ihre Software-Lizenzen und Cloud-Infrastrukturen auf versteckte Einsparpotenziale.</p>
              </div>
              <a href="https://leoncordts.github.io/#kontakt" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg,#00d4ff,#0099cc)", color: "#020b18", fontWeight: 700, fontSize: 14, padding: "14px 26px", borderRadius: 10, textDecoration: "none", whiteSpace: "nowrap", boxShadow: "0 0 28px rgba(0,212,255,0.25)", flexShrink: 0 }}>
                Jetzt unverbindlich anfragen →
              </a>
            </div>

            <div style={{ textAlign: "center" }}>
              <button onClick={handleReset} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "10px 22px", cursor: "pointer", fontSize: 13, color: "#475569" }}>← Neue Berechnung starten</button>
            </div>
          </div>
        )}
      </div>

      {/* ── STICKY ACTION BAR ─── */}
      {selected.size > 0 && phase === "input" && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", background: "linear-gradient(to top, rgba(2,11,24,0.97), rgba(2,11,24,0.88))", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "14px 24px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <p style={{ margin: "0 0 2px", fontSize: 13, color: "#64748b" }}>
                <span style={{ color: "#fff", fontWeight: 700 }}>{selected.size} Abo{selected.size > 1 ? "s" : ""}</span> ausgewählt
              </p>
              <p style={{ margin: 0, fontFamily: "monospace", fontSize: 14 }}>
                <span style={{ color: "#ef4444", fontWeight: 700 }}>{formatEur(totalNormal)}/Monat</span>
                <span style={{ color: "#475569" }}> · du zahlst gerade</span>
              </p>
            </div>
            <button
              onClick={handleCalculate}
              style={{ background: "linear-gradient(135deg,#4ade80,#22c55e)", border: "none", borderRadius: 12, padding: "13px 32px", fontSize: 15, fontWeight: 700, color: "#020b18", cursor: "pointer", boxShadow: "0 0 32px rgba(34,197,94,0.4)", fontFamily: "'Syne', sans-serif", whiteSpace: "nowrap" }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.03)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              Sparpotenzial berechnen 🚀
            </button>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>
    </main>
  );
}
