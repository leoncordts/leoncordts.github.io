import * as cheerio from "cheerio";
import type { AuditResult, SeoCheck, TrafficLight } from "./seoTypes";

function check(
  id: string,
  category: string,
  title: string,
  description: string,
  status: TrafficLight,
  value: string | null,
  recommendation: string,
  businessImpact: string
): SeoCheck {
  return { id, category, title, description, status, value, recommendation, businessImpact };
}

export async function analyzePage(url: string): Promise<AuditResult> {
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; SEO-Audit-Bot/1.0)" },
    signal: AbortSignal.timeout(15000),
  });

  const html = await response.text();
  const $ = cheerio.load(html);
  const checks: SeoCheck[] = [];

  // --- Title ---
  const title = $("title").first().text().trim();
  if (!title) {
    checks.push(check("title", "On-Page", "Seitentitel (Title-Tag)",
      "Der <title>-Tag fehlt vollständig.", "red", null,
      "Füge einen einzigartigen Titel mit 50–60 Zeichen hinzu, der das Hauptkeyword enthält.",
      "Ohne Titel rankt Google deine Seite nicht. Potenzielle Kunden sehen stattdessen einen leeren Tab — sie klicken nicht und gehen zur Konkurrenz."
    ));
  } else if (title.length < 30) {
    checks.push(check("title", "On-Page", "Seitentitel (Title-Tag)",
      `Titel zu kurz: "${title}"`, "yellow", title,
      "Der Titel sollte zwischen 50 und 60 Zeichen lang sein.",
      "Ein zu kurzer Titel verschenkt wertvollen Platz in den Google-Suchergebnissen. Mitbewerber mit aussagekräftigeren Titeln gewinnen mehr Klicks — und damit mehr Kunden."
    ));
  } else if (title.length > 60) {
    checks.push(check("title", "On-Page", "Seitentitel (Title-Tag)",
      `Titel zu lang (${title.length} Zeichen): wird in SERPs abgeschnitten.`, "yellow", title,
      "Kürze den Titel auf maximal 60 Zeichen.",
      "Google schneidet den Titel bei 60 Zeichen ab. Der Rest bleibt unsichtbar — Kunden sehen nur eine unvollständige, unprofessionelle Vorschau und klicken seltener."
    ));
  } else {
    checks.push(check("title", "On-Page", "Seitentitel (Title-Tag)",
      "Titel ist optimal gesetzt.", "green", title,
      "Weiter so!",
      "Ein gut optimierter Titel erhöht die Klickrate in den Suchergebnissen direkt — mehr Besucher ohne zusätzliche Werbekosten."
    ));
  }

  // --- Meta Description ---
  const metaDesc = $('meta[name="description"]').attr("content")?.trim() ?? "";
  if (!metaDesc) {
    checks.push(check("meta-desc", "On-Page", "Meta-Beschreibung",
      "Die Meta-Description fehlt.", "red", null,
      "Schreibe eine ansprechende Meta-Description mit 150–160 Zeichen.",
      "Google generiert dann selbst einen Beschreibungstext — oft unvorteilhaft. Kunden lesen keinen überzeugenden Nutzen und klicken auf die besser beschriebene Konkurrenz."
    ));
  } else if (metaDesc.length < 100) {
    checks.push(check("meta-desc", "On-Page", "Meta-Beschreibung",
      `Meta-Description zu kurz (${metaDesc.length} Zeichen).`, "yellow", metaDesc,
      "Erweitere die Beschreibung auf 150–160 Zeichen.",
      "Du verlierst die Chance, Suchende direkt zu überzeugen. Jeder ungenutzte Zeichen in der Beschreibung ist ein verpasstes Verkaufsargument vor dem ersten Klick."
    ));
  } else if (metaDesc.length > 160) {
    checks.push(check("meta-desc", "On-Page", "Meta-Beschreibung",
      `Meta-Description zu lang (${metaDesc.length} Zeichen), wird abgeschnitten.`, "yellow",
      metaDesc.slice(0, 80) + "…",
      "Kürze auf maximal 160 Zeichen.",
      "Der Call-to-Action am Ende deiner Beschreibung wird abgeschnitten und ist für Kunden unsichtbar. Potenzielle Anfragen gehen verloren, weil der entscheidende Satz fehlt."
    ));
  } else {
    checks.push(check("meta-desc", "On-Page", "Meta-Beschreibung",
      "Meta-Description ist optimal.", "green", metaDesc,
      "Weiter so!",
      "Eine präzise Meta-Beschreibung steigert nachweislich die Klickrate um 5–10 % — das bedeutet mehr Besucher ohne höheres Werbebudget."
    ));
  }

  // --- H1 ---
  const h1Tags = $("h1");
  if (h1Tags.length === 0) {
    checks.push(check("h1", "Struktur", "H1-Überschrift",
      "Kein <h1>-Tag gefunden.", "red", null,
      "Jede Seite braucht genau einen H1-Tag mit dem primären Keyword.",
      "Google versteht das Hauptthema deiner Seite nicht. Das Ergebnis: schlechtere Rankings, weniger Sichtbarkeit und weniger Besucher aus deiner Region."
    ));
  } else if (h1Tags.length > 1) {
    checks.push(check("h1", "Struktur", "H1-Überschrift",
      `Mehrere H1-Tags gefunden (${h1Tags.length}x) — verwirrt Suchmaschinen.`, "yellow",
      h1Tags.first().text().trim(),
      "Reduziere auf genau einen H1-Tag pro Seite.",
      "Mehrere H1-Tags senden widersprüchliche Signale an Google. Das verwässert deine Keyword-Relevanz und kostet dich Platzierungen gegenüber Mitbewerbern mit klar strukturierten Seiten."
    ));
  } else {
    checks.push(check("h1", "Struktur", "H1-Überschrift",
      "Genau ein H1-Tag vorhanden.", "green", h1Tags.first().text().trim(),
      "Weiter so!",
      "Eine klare H1-Struktur hilft Google, deine Seite für relevante lokale Suchanfragen besser einzuordnen — und bringt dir mehr qualifizierte Besucher."
    ));
  }

  // --- Images Alt ---
  const images = $("img");
  const imagesWithoutAlt: number[] = [];
  images.each((i, el) => {
    const alt = $(el).attr("alt");
    if (!alt || alt.trim() === "") imagesWithoutAlt.push(i);
  });

  if (images.length === 0) {
    checks.push(check("img-alt", "Barrierefreiheit", "Bild-Alt-Attribute",
      "Keine Bilder auf der Seite gefunden.", "yellow", null,
      "Nutze relevante Bilder mit Alt-Attributen für bessere Rankings.",
      "Seiten ohne Bilder wirken weniger vertrauenswürdig. Kunden springen schneller ab, was die Absprungrate erhöht und dein Ranking weiter verschlechtert."
    ));
  } else if (imagesWithoutAlt.length === 0) {
    checks.push(check("img-alt", "Barrierefreiheit", "Bild-Alt-Attribute",
      `Alle ${images.length} Bilder haben Alt-Attribute.`, "green",
      `${images.length} Bilder ✓`,
      "Weiter so!",
      "Vollständige Alt-Attribute ermöglichen Google, deine Bilder in der Bildersuche zu indexieren — ein zusätzlicher kostenloser Traffic-Kanal."
    ));
  } else {
    const severity = imagesWithoutAlt.length === images.length ? "red" : "yellow";
    checks.push(check("img-alt", "Barrierefreiheit", "Bild-Alt-Attribute",
      `${imagesWithoutAlt.length} von ${images.length} Bildern haben kein Alt-Attribut.`,
      severity, `${imagesWithoutAlt.length}/${images.length} ohne Alt`,
      "Ergänze alle Bilder mit beschreibenden Alt-Attributen (Keyword ggf. einbauen).",
      "Fehlende Alt-Attribute bedeuten unsichtbare Bilder für Suchmaschinen. Du verpasst Besucher aus der Google-Bildersuche — ein Konkurrent mit optimierten Bildern gewinnt diesen Traffic."
    ));
  }

  // --- Canonical ---
  const canonical = $('link[rel="canonical"]').attr("href");
  if (!canonical) {
    checks.push(check("canonical", "Technisch", "Canonical-Tag",
      "Kein Canonical-Tag gefunden — Duplicate-Content-Risiko.", "yellow", null,
      'Setze einen <link rel="canonical"> auf jeder Seite.',
      "Ohne Canonical-Tag kann Google deine Seite als Duplikat einordnen und die Rankings aufteilen. Statt einer starken Seite auf Platz 3 hast du zwei schwache Seiten auf Platz 10 und 12."
    ));
  } else {
    checks.push(check("canonical", "Technisch", "Canonical-Tag",
      "Canonical-Tag korrekt gesetzt.", "green", canonical,
      "Weiter so!",
      "Der Canonical-Tag bündelt deine SEO-Kraft auf eine URL und verhindert, dass Google dein Ranking durch Duplicate-Content-Penalties schwächt."
    ));
  }

  // --- Viewport ---
  const viewport = $('meta[name="viewport"]').attr("content");
  if (!viewport) {
    checks.push(check("viewport", "Mobile", "Viewport Meta-Tag",
      "Kein Viewport-Tag — Seite ist möglicherweise nicht mobiloptimiert.", "red", null,
      'Füge <meta name="viewport" content="width=device-width, initial-scale=1"> hinzu.',
      "Über 60 % aller lokalen Suchanfragen kommen vom Smartphone. Wenn deine Seite auf Mobilgeräten schlecht aussieht, verlierst du direkt mehr als die Hälfte deiner potenziellen Kunden."
    ));
  } else {
    checks.push(check("viewport", "Mobile", "Viewport Meta-Tag",
      "Viewport-Tag korrekt gesetzt.", "green", viewport,
      "Seite ist mobil-ready!",
      "Mobile Optimierung ist ein direkter Google-Rankingfaktor. Du erreichst lokale Kunden, die unterwegs nach deinen Leistungen suchen — genau im richtigen Moment."
    ));
  }

  // --- Structured Data ---
  const structuredData = $('script[type="application/ld+json"]');
  if (structuredData.length === 0) {
    checks.push(check("schema", "Lokal SEO", "Strukturierte Daten (Schema.org)",
      "Kein strukturiertes Daten-Markup gefunden.", "yellow", null,
      "Füge LocalBusiness-Schema hinzu für bessere lokale Sichtbarkeit.",
      "Ohne LocalBusiness-Schema erscheinst du nicht in Google's Knowledge Panel und lokalen Rich-Results. Wettbewerber mit Schema.org-Markup werden prominent oben angezeigt — du wirst übersehen."
    ));
  } else {
    checks.push(check("schema", "Lokal SEO", "Strukturierte Daten (Schema.org)",
      `${structuredData.length} Schema.org-Block(s) gefunden.`, "green",
      `${structuredData.length} Blöcke`,
      "Weiter so!",
      "Strukturierte Daten ermöglichen Google Rich-Results mit Bewertungen, Öffnungszeiten und Adresse direkt in den Suchergebnissen — das steigert die Klickrate erheblich."
    ));
  }

  // --- Open Graph ---
  const ogTitle = $('meta[property="og:title"]').attr("content");
  const ogDesc = $('meta[property="og:description"]').attr("content");
  if (!ogTitle || !ogDesc) {
    checks.push(check("opengraph", "Social Media", "Open Graph Tags",
      "Open-Graph-Tags (og:title / og:description) fehlen.", "yellow", null,
      "Füge Open-Graph-Tags für besseres Social-Sharing hinzu.",
      "Wenn jemand deine Seite auf Facebook oder LinkedIn teilt, erscheint sie ohne Vorschaubild und ohne Beschreibung — ein unprofessioneller Auftritt, der das Vertrauen und die Reichweite kostet."
    ));
  } else {
    checks.push(check("opengraph", "Social Media", "Open Graph Tags",
      "Open-Graph-Tags vorhanden.", "green", ogTitle,
      "Weiter so!",
      "Professionelle Social-Media-Vorschauen erhöhen die Wahrscheinlichkeit, dass geteilte Links angeklickt werden — kostenlose Reichweite durch jeden, der deine Seite teilt."
    ));
  }

  // --- HTTPS ---
  const isHttps = url.startsWith("https://");
  if (!isHttps) {
    checks.push(check("https", "Sicherheit", "HTTPS/SSL",
      "Die Seite verwendet kein HTTPS — kritischer Rankingfaktor.", "red", url,
      "Wechsle sofort zu HTTPS mit einem SSL-Zertifikat.",
      "Browser zeigen 'Nicht sicher' in der Adressleiste an. Das zerstört das Vertrauen sofort — Kunden brechen den Besuch ab, bevor sie auch nur eine Zeile gelesen haben. Zudem rankt Google HTTP-Seiten schlechter."
    ));
  } else {
    checks.push(check("https", "Sicherheit", "HTTPS/SSL",
      "Seite verwendet HTTPS.", "green", "HTTPS ✓",
      "Weiter so!",
      "HTTPS schützt das Vertrauen deiner Besucher und ist ein bestätigter Google-Rankingfaktor. Eine sichere Verbindung ist die Basis für jede weitere SEO-Maßnahme."
    ));
  }

  const weights: Record<TrafficLight, number> = { green: 100, yellow: 50, red: 0 };
  const total = checks.reduce((sum, c) => sum + weights[c.status], 0);
  const score = Math.round(total / checks.length);

  const summary = {
    critical: checks.filter((c) => c.status === "red").length,
    warnings: checks.filter((c) => c.status === "yellow").length,
    passed: checks.filter((c) => c.status === "green").length,
  };

  return { url, analyzedAt: new Date().toISOString(), score, checks, summary };
}
