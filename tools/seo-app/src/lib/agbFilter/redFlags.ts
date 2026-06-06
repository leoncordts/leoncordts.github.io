export type RedFlagCategory = "kosten" | "datenschutz" | "nutzungsrechte";

export interface RedFlag {
  id: string;
  category: RedFlagCategory;
  pattern: RegExp;
  label: string;
  explanation: string;
  severity: "high" | "medium" | "low";
}

export const CATEGORY_META: Record<
  RedFlagCategory,
  { emoji: string; label: string; color: string; bg: string; border: string }
> = {
  kosten: {
    emoji: "🔴",
    label: "Kosten & Abos",
    color: "text-red-400",
    bg: "bg-red-950/40",
    border: "border-red-800/50",
  },
  datenschutz: {
    emoji: "🟠",
    label: "Datenschutz & Datenweitergabe",
    color: "text-orange-400",
    bg: "bg-orange-950/40",
    border: "border-orange-800/50",
  },
  nutzungsrechte: {
    emoji: "🟡",
    label: "Nutzungsrechte & Rechteabtretung",
    color: "text-yellow-400",
    bg: "bg-yellow-950/40",
    border: "border-yellow-800/50",
  },
};

export const RED_FLAGS: RedFlag[] = [
  // ── KOSTEN & ABOS ────────────────────────────────────────────
  {
    id: "auto-renewal",
    category: "kosten",
    pattern: /automatisch(?:e[rns]?)?\s+(?:verlänger|erneu|fortgesetzt)/gi,
    label: "Automatische Verlängerung",
    explanation:
      "Das Abo verlängert sich automatisch, wenn du nicht rechtzeitig kündigst. Oft mit kurzer Kündigungsfrist kombiniert.",
    severity: "high",
  },
  {
    id: "kostenpflichtig",
    category: "kosten",
    pattern: /kostenpflichtig|zahlungspflichtig|entgeltpflichtig/gi,
    label: "Kostenpflichtige Leistung",
    explanation:
      "Ein scheinbar kostenloser Dienst wird nach einer Frist oder bei bestimmten Aktionen kostenpflichtig.",
    severity: "high",
  },
  {
    id: "gebuehren-vorbehalt",
    category: "kosten",
    pattern: /gebühren?\s+(?:vorbehalten?|jederzeit\s+ändern|anpassen)/gi,
    label: "Gebühren-Vorbehalt",
    explanation:
      "Der Anbieter behält sich vor, Preise jederzeit zu ändern — oft ohne individuelle Benachrichtigung.",
    severity: "high",
  },
  {
    id: "abonnement",
    category: "kosten",
    pattern:
      /(?:abonnement|subscription|abo)\s+(?:läuft|gilt|gilt\s+als|wird).{0,60}(?:verlängert|fortgesetzt|erneuert)/gi,
    label: "Abo-Verlängerungsklausel",
    explanation:
      "Klausel zur automatischen Fortführung eines Abonnements. Achte auf die genaue Kündigungsfrist.",
    severity: "high",
  },
  {
    id: "preisaenderung",
    category: "kosten",
    pattern:
      /preis(?:änderung|anpassung|erhöhung)|preise?\s+(?:können|werden)\s+(?:sich\s+)?(?:ändern|erhöhen|angepasst)/gi,
    label: "Preisänderungsvorbehalt",
    explanation:
      "Der Anbieter kann Preise einseitig anpassen. Du hast oft nur ein begrenztes Widerspruchsfenster.",
    severity: "medium",
  },
  {
    id: "kuendigungsfrist",
    category: "kosten",
    pattern:
      /kündigung\s+(?:muss|hat\s+zu|ist\s+zu|erfolgt).{0,80}(?:vor(?:herig)?|frist|woche[n]?|tag[e]?|monat[e]?)\s+(?:schriftlich|einzugehen|zu\s+erfolgen)/gi,
    label: "Strenge Kündigungsfrist",
    explanation:
      "Kurze oder versteckte Kündigungsfristen führen dazu, dass du ungewollt weiterbezahlst.",
    severity: "medium",
  },
  {
    id: "einmalige-zahlung",
    category: "kosten",
    pattern:
      /einmalig(?:e[rns]?)?\s+(?:zahlung|gebühr|entgelt|pauschale|beitrag).{0,60}(?:fällig|erhoben|berechnet)/gi,
    label: "Versteckte Einmalgebühr",
    explanation:
      "Einmalgebühren können im Kleingedruckten versteckt sein und erst bei der Abrechnung auftauchen.",
    severity: "medium",
  },
  {
    id: "zahlung-vorzeitig",
    category: "kosten",
    pattern:
      /vorzeitig(?:e[rns]?)?\s+(?:kündigung|beendigung).{0,80}(?:gebühr|entgelt|kosten|pauschale)/gi,
    label: "Stornogebühr bei vorzeitiger Kündigung",
    explanation:
      "Du zahlst eine Strafe, wenn du den Vertrag vor dem Ende der Laufzeit kündigst.",
    severity: "high",
  },
  {
    id: "silence-consent",
    category: "kosten",
    pattern:
      /(?:gilt\s+als|wird\s+als)\s+(?:angenommen|akzeptiert|genehmigt|zugestimmt).{0,80}(?:widerspruch|ablehnung|keine\s+reaktion)/gi,
    label: "Schweigen als Zustimmung",
    explanation:
      "Wenn du nicht innerhalb einer Frist widersprichst, gilt eine Änderung automatisch als akzeptiert.",
    severity: "high",
  },

  // ── DATENSCHUTZ ───────────────────────────────────────────────
  {
    id: "drittanbieter-weitergabe",
    category: "datenschutz",
    pattern:
      /weitergabe?\s+(?:an\s+)?(?:dritte[n]?|partner(?:unternehmen)?|verbundene\s+unternehmen)/gi,
    label: "Datenweitergabe an Dritte",
    explanation:
      "Deine Daten werden an Dritte weitergegeben — oft für Werbung oder Profilbildung.",
    severity: "high",
  },
  {
    id: "werbezwecke",
    category: "datenschutz",
    pattern: /zu\s+werbezwecken|für\s+(?:marketing|werbung|werbemail)/gi,
    label: "Nutzung zu Werbezwecken",
    explanation:
      "Deine Daten oder dein Verhalten werden für personalisierte Werbung genutzt.",
    severity: "high",
  },
  {
    id: "geraetedaten",
    category: "datenschutz",
    pattern:
      /geräteinformationen?\s+(?:auslesen|erfassen|speichern|übermitteln)|(?:hardware|software|gerät).{0,40}(?:identifikation|fingerprint|kennung)/gi,
    label: "Geräte-Fingerprinting",
    explanation:
      "Dein Gerät wird identifiziert und getrackt — auch ohne Cookies oder Account.",
    severity: "high",
  },
  {
    id: "profiling",
    category: "datenschutz",
    pattern:
      /(?:nutzer)?profil(?:ierung|e)\s+(?:erstell|aufbau|anlegen|um\s+zu\s+verstehen)|verhaltensbasiert/gi,
    label: "Verhaltens-Profiling",
    explanation:
      "Dein Nutzungsverhalten wird zu einem Profil zusammengeführt, das für Targeting genutzt wird.",
    severity: "high",
  },
  {
    id: "standortdaten",
    category: "datenschutz",
    pattern:
      /standortdaten?|gps-daten?|geografisch(?:e[rns]?)?\s+(?:position|standort|ort)|ip-adresse.{0,40}(?:standort|ort|region)/gi,
    label: "Standorterfassung",
    explanation:
      "Dein Standort wird erfasst und gespeichert — oft auch im Hintergrund.",
    severity: "medium",
  },
  {
    id: "drittland-transfer",
    category: "datenschutz",
    pattern:
      /(?:übermittlung|transfer|weitergabe).{0,60}(?:drittland|drittstaaten?|usa|vereinigte\s+staaten|außerhalb\s+der\s+eu|außerhalb\s+des\s+ewr)/gi,
    label: "Datentransfer in Drittländer",
    explanation:
      "Deine Daten werden in Länder außerhalb der EU übermittelt, wo die DSGVO nicht gilt.",
    severity: "high",
  },
  {
    id: "aufbewahrung-lange",
    category: "datenschutz",
    pattern:
      /(?:speicher|aufbewahrung|aufbewahr).{0,60}(?:unbegrenzt|auf\s+unbestimmte\s+zeit|bis\s+auf\s+widerruf|so\s+lange\s+wie\s+nötig)/gi,
    label: "Unbegrenzte Datenspeicherung",
    explanation:
      "Keine klare Löschfrist — deine Daten können dauerhaft gespeichert bleiben.",
    severity: "medium",
  },
  {
    id: "cookies-tracking",
    category: "datenschutz",
    pattern:
      /(?:tracking|analyse|marketing)-?cookies?|cookies?\s+(?:von\s+)?(?:drittanbietern?|partner[n]?|google|facebook|meta)/gi,
    label: "Tracking- & Marketing-Cookies",
    explanation:
      "Cookies von Drittanbietern verfolgen dich über verschiedene Websites hinweg.",
    severity: "medium",
  },
  {
    id: "sozialemedien-share",
    category: "datenschutz",
    pattern:
      /(?:daten|informationen).{0,60}(?:facebook|instagram|google|twitter|meta|tiktok).{0,60}(?:übermittelt|weitergegeben|geteilt)/gi,
    label: "Datenweitergabe an Social-Media-Plattformen",
    explanation:
      "Deine Daten fließen direkt an Social-Media-Konzerne, auch wenn du dort kein Konto hast.",
    severity: "high",
  },
  {
    id: "opt-out-default",
    category: "datenschutz",
    pattern:
      /opt-?out.{0,80}(?:jederzeit|möglich|können\s+sie\s+widersprechen)|widerspruch\s+(?:ist\s+)?jederzeit\s+möglich/gi,
    label: "Opt-Out statt Opt-In",
    explanation:
      "Datenweitergabe ist standardmäßig aktiviert. Du musst aktiv widersprechen — was viele nicht tun.",
    severity: "medium",
  },

  // ── NUTZUNGSRECHTE ────────────────────────────────────────────
  {
    id: "unwiderruflich",
    category: "nutzungsrechte",
    pattern: /unwiderruflich(?:e[rns]?)?|nicht\s+widerrufbar|dauerhaft\s+(?:und\s+)?unwiderruflich/gi,
    label: "Unwiderrufliche Rechteabtretung",
    explanation:
      "Du gibst Rechte ab, die du nicht zurückfordern kannst — selbst nach Kündigung des Accounts.",
    severity: "high",
  },
  {
    id: "exklusives-recht",
    category: "nutzungsrechte",
    pattern: /exklusiv(?:e[rns]?)?\s+(?:recht|lizenz|nutzungsrecht|verwertungsrecht)/gi,
    label: "Exklusivlizenz",
    explanation:
      "Du räumst dem Anbieter das ausschließliche Recht ein — du darfst deine eigenen Inhalte u.U. nicht mehr anderweitig nutzen.",
    severity: "high",
  },
  {
    id: "urheberrecht-abtretung",
    category: "nutzungsrechte",
    pattern:
      /urheberrecht\s+(?:abtreten|übertragen|abtretung|übertragung)|alle\s+(?:geistigen?\s+)?eigentumsrechte/gi,
    label: "Urheberrecht-Abtretung",
    explanation:
      "Du überträgst dein Urheberrecht vollständig. Der Anbieter kann deine Inhalte ohne Einschränkung verwenden.",
    severity: "high",
  },
  {
    id: "weltweite-lizenz",
    category: "nutzungsrechte",
    pattern: /weltweite?\s+(?:und\s+)?(?:unwiderruflich|lizenz|nutzungsrecht)|global\s+(?:und\s+)?kostenlos(?:e[rns]?)?/gi,
    label: "Weltweite kostenlose Lizenz",
    explanation:
      "Der Anbieter darf deine Inhalte weltweit und kostenlos verwenden — für immer.",
    severity: "high",
  },
  {
    id: "unterlizenz",
    category: "nutzungsrechte",
    pattern: /unterlizenz|sublizenz|recht\s+zur\s+weiterlizenzierung|an\s+dritte\s+(?:weiter)?lizenzieren/gi,
    label: "Weiterlizenzierung an Dritte",
    explanation:
      "Der Anbieter darf deine Inhalte an beliebige Dritte weiterlizenzieren.",
    severity: "high",
  },
  {
    id: "inhalt-verwertung",
    category: "nutzungsrechte",
    pattern:
      /(?:hochgeladene[nrs]?|eingestellte[nrs]?|erstellte[nrs]?)\s+inhalte?.{0,80}(?:verwenden|verwerten|vermarkten|nutzen|anzeigen)/gi,
    label: "Kommerzielle Nutzung deiner Inhalte",
    explanation:
      "Deine hochgeladenen Inhalte können kommerziell genutzt werden — ohne deine gesonderte Zustimmung.",
    severity: "medium",
  },
  {
    id: "einseitige-aenderung",
    category: "nutzungsrechte",
    pattern:
      /(?:bedingungen?|agb|nutzungsbedingungen?|richtlinien?)\s+(?:können|werden|dürfen)\s+(?:jederzeit\s+)?(?:geändert|angepasst|aktualisiert)/gi,
    label: "Einseitige AGB-Änderung",
    explanation:
      "Der Anbieter kann die AGB jederzeit ändern. Oft gilt: weiter nutzen = zustimmen.",
    severity: "medium",
  },
  {
    id: "nutzung-nach-loeschung",
    category: "nutzungsrechte",
    pattern:
      /(?:nach|auch\s+nach|selbst\s+nach)\s+(?:löschung|kündigung|beendigung).{0,80}(?:recht|lizenz|daten|inhalte).{0,60}(?:weiter|fortbestehen|fortgeltend|bleiben)/gi,
    label: "Rechte nach Kündigung fortbestehend",
    explanation:
      "Auch nach dem Löschen deines Accounts behält der Anbieter Rechte an deinen Inhalten.",
    severity: "high",
  },
];
