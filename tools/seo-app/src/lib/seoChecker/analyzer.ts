import * as cheerio from "cheerio";
import type { AuditResult, Category, SeoCheck, TrafficLight } from "./types";

function c(
  id: string, category: Category, title: string, description: string,
  status: TrafficLight, value: string | null,
  recommendation: string, businessImpact: string
): SeoCheck {
  return { id, category, title, description, status, value, recommendation, businessImpact };
}

function approxPixelWidth(text: string): number {
  // Rough approximation: avg character in Google SERP title font ≈ 5.5px at 20px size
  let w = 0;
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code < 32) continue;
    if ("ilIj1!|:;,.'\"`".includes(ch)) w += 3.5;
    else if ("mwMW".includes(ch)) w += 8.5;
    else if ("frtFI".includes(ch)) w += 5;
    else w += 6;
  }
  return Math.round(w);
}

async function fetchRobotsTxt(baseUrl: string): Promise<string | null> {
  try {
    const res = await fetch(`${baseUrl}/robots.txt`, {
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; SEO-Audit-Bot/1.0)" },
    });
    if (res.ok) return await res.text();
    return null;
  } catch {
    return null;
  }
}

export async function analyzePage(url: string): Promise<AuditResult> {
  const baseUrl = new URL(url).origin;
  const isHttps = url.startsWith("https://");

  const [response, robotsTxt] = await Promise.all([
    fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; SEO-Audit-Bot/1.0)" },
      signal: AbortSignal.timeout(15000),
    }),
    fetchRobotsTxt(baseUrl),
  ]);

  const html = await response.text();
  const $ = cheerio.load(html);
  const checks: SeoCheck[] = [];

  // ══════════════════════════════════════════════════
  // KATEGORIE 1: META-TAGS (6 Checks)
  // ══════════════════════════════════════════════════

  // 1. Title-Präsenz
  const titleText = $("title").first().text().trim();
  if (!titleText) {
    checks.push(c("title-exists", "Meta-Tags", "Title-Tag vorhanden",
      "Kein <title>-Tag gefunden.", "red", null,
      "Füge sofort einen <title>-Tag hinzu.",
      "Ohne Title-Tag ist die Seite für Google unsichtbar. Du verlierst jeden organischen Besucher an Konkurrenten."
    ));
  } else {
    checks.push(c("title-exists", "Meta-Tags", "Title-Tag vorhanden",
      "Title-Tag ist vorhanden.", "green", titleText.slice(0, 70),
      "Weiter so!",
      "Ein vorhandener Title-Tag ist die Grundlage jeder Google-Platzierung."
    ));
  }

  // 2. Title-Länge (Zeichen)
  if (titleText) {
    if (titleText.length < 30) {
      checks.push(c("title-length", "Meta-Tags", "Title-Länge (Zeichen)",
        `Zu kurz: ${titleText.length} Zeichen (Optimal: 50–60).`, "yellow", `${titleText.length} Zeichen`,
        "Erweitere den Titel auf 50–60 Zeichen.",
        "Verschenkter Platz in den Suchergebnissen. Klickstärkere Mitbewerber gewinnen deinen Traffic."
      ));
    } else if (titleText.length > 60) {
      checks.push(c("title-length", "Meta-Tags", "Title-Länge (Zeichen)",
        `Zu lang: ${titleText.length} Zeichen — wird abgeschnitten (Limit: ~60).`, "yellow", `${titleText.length} Zeichen`,
        "Kürze den Titel auf maximal 60 Zeichen.",
        "Google zeigt nur den Anfang des Titels. Der Rest deiner Botschaft bleibt für Kunden unsichtbar."
      ));
    } else {
      checks.push(c("title-length", "Meta-Tags", "Title-Länge (Zeichen)",
        `Optimale Länge: ${titleText.length} Zeichen.`, "green", `${titleText.length} Zeichen`,
        "Weiter so!", "Perfekte Zeichenanzahl für maximale Sichtbarkeit in den SERPs."
      ));
    }

    // 3. Title-Pixelbreite
    const px = approxPixelWidth(titleText);
    if (px > 600) {
      checks.push(c("title-pixel", "Meta-Tags", "Title-Pixelbreite (Google-SERP)",
        `Geschätzte Pixelbreite: ~${px}px — wird bei ~580px abgeschnitten.`, "yellow", `~${px}px`,
        "Kürze den Titel, sodass er unter 580px Pixelbreite bleibt.",
        "Sonderzeichen und breite Buchstaben (M, W) kosten extra Platz. Kunden lesen einen unvollständigen Titel und klicken weniger."
      ));
    } else {
      checks.push(c("title-pixel", "Meta-Tags", "Title-Pixelbreite (Google-SERP)",
        `Geschätzte Pixelbreite: ~${px}px — passt in die Google-Vorschau.`, "green", `~${px}px`,
        "Weiter so!", "Der Titel wird vollständig in Google angezeigt — maximale Wirkung auf die Klickrate."
      ));
    }
  } else {
    checks.push(c("title-length", "Meta-Tags", "Title-Länge (Zeichen)", "Kein Title vorhanden.", "red", null, "Title-Tag hinzufügen.", "Ohne Title kein Ranking."));
    checks.push(c("title-pixel", "Meta-Tags", "Title-Pixelbreite (Google-SERP)", "Kein Title vorhanden.", "red", null, "Title-Tag hinzufügen.", "Ohne Title kein Ranking."));
  }

  // 4. Meta-Description-Präsenz
  const metaDesc = $('meta[name="description"]').attr("content")?.trim() ?? "";
  if (!metaDesc) {
    checks.push(c("meta-desc-exists", "Meta-Tags", "Meta-Description vorhanden",
      "Keine Meta-Description gefunden.", "red", null,
      "Schreibe eine Meta-Description mit 150–160 Zeichen.",
      "Google generiert selbst einen Text — oft unvorteilhaft. Du verlierst die Kontrolle über dein erstes Verkaufsargument."
    ));
  } else {
    checks.push(c("meta-desc-exists", "Meta-Tags", "Meta-Description vorhanden",
      "Meta-Description ist gesetzt.", "green", metaDesc.slice(0, 80) + (metaDesc.length > 80 ? "…" : ""),
      "Weiter so!", "Du kontrollierst deinen ersten Eindruck in den Suchergebnissen."
    ));
  }

  // 5. Meta-Description-Länge
  if (metaDesc) {
    if (metaDesc.length < 100) {
      checks.push(c("meta-desc-length", "Meta-Tags", "Meta-Description-Länge",
        `Zu kurz: ${metaDesc.length} Zeichen (Optimal: 150–160).`, "yellow", `${metaDesc.length} Zeichen`,
        "Erweitere die Description auf 150–160 Zeichen.",
        "Jeder ungenutzte Zeichen ist ein verpasstes Verkaufsargument vor dem ersten Klick."
      ));
    } else if (metaDesc.length > 160) {
      checks.push(c("meta-desc-length", "Meta-Tags", "Meta-Description-Länge",
        `Zu lang: ${metaDesc.length} Zeichen — wird bei ~160 Zeichen abgeschnitten.`, "yellow", `${metaDesc.length} Zeichen`,
        "Kürze auf maximal 160 Zeichen.",
        "Der Call-to-Action am Ende deiner Description wird unsichtbar — potenzielle Kunden verpassen deinen Aufruf zum Handeln."
      ));
    } else {
      checks.push(c("meta-desc-length", "Meta-Tags", "Meta-Description-Länge",
        `Optimale Länge: ${metaDesc.length} Zeichen.`, "green", `${metaDesc.length} Zeichen`,
        "Weiter so!", "Maximale Überzeugungskraft in den Google-Suchergebnissen."
      ));
    }
  } else {
    checks.push(c("meta-desc-length", "Meta-Tags", "Meta-Description-Länge", "Keine Description vorhanden.", "red", null, "Meta-Description hinzufügen.", "Direkter Umsatzverlust durch fehlende Klicks."));
  }

  // 6. Canonical-Tag
  const canonical = $('link[rel="canonical"]').attr("href");
  if (!canonical) {
    checks.push(c("canonical", "Meta-Tags", "Canonical-Tag",
      "Kein Canonical-Tag — Duplicate-Content-Risiko.", "yellow", null,
      'Setze <link rel="canonical" href="…"> auf jeder Seite.',
      "Ohne Canonical kann Google dein Ranking aufteilen — zwei schwache statt einer starken Seite."
    ));
  } else {
    checks.push(c("canonical", "Meta-Tags", "Canonical-Tag",
      "Canonical-Tag korrekt gesetzt.", "green", canonical.slice(0, 70),
      "Weiter so!", "Du bündelst deine SEO-Stärke auf eine URL — kein Ranking-Verlust durch Duplicate Content."
    ));
  }

  // ══════════════════════════════════════════════════
  // KATEGORIE 2: OPEN GRAPH (3 Checks)
  // ══════════════════════════════════════════════════

  // 7. OG-Title
  const ogTitle = $('meta[property="og:title"]').attr("content");
  if (!ogTitle) {
    checks.push(c("og-title", "Open Graph", "OG-Title (og:title)",
      "og:title fehlt — unprofessionelle Social-Media-Vorschau.", "yellow", null,
      "Füge <meta property=\"og:title\" content=\"…\"> hinzu.",
      "Jedes geteilte Link auf Facebook/LinkedIn erscheint ohne Titel — Klickrate bricht ein, Reichweite geht verloren."
    ));
  } else {
    checks.push(c("og-title", "Open Graph", "OG-Title (og:title)",
      "og:title vorhanden.", "green", ogTitle.slice(0, 60),
      "Weiter so!", "Professionelle Vorschau beim Teilen steigert die Klickrate auf Social Media."
    ));
  }

  // 8. OG-Description
  const ogDesc = $('meta[property="og:description"]').attr("content");
  if (!ogDesc) {
    checks.push(c("og-desc", "Open Graph", "OG-Description (og:description)",
      "og:description fehlt.", "yellow", null,
      "Füge <meta property=\"og:description\" content=\"…\"> hinzu.",
      "Geteilte Links ohne Beschreibung wirken unprofessionell — Vertrauen und Klicks gehen verloren."
    ));
  } else {
    checks.push(c("og-desc", "Open Graph", "OG-Description (og:description)",
      "og:description vorhanden.", "green", ogDesc.slice(0, 60),
      "Weiter so!", "Vollständige Social-Media-Karte maximiert Engagement und Reichweite."
    ));
  }

  // 9. OG-Image
  const ogImage = $('meta[property="og:image"]').attr("content");
  if (!ogImage) {
    checks.push(c("og-image", "Open Graph", "OG-Bild (og:image)",
      "og:image fehlt — kein Vorschaubild beim Teilen.", "yellow", null,
      "Füge <meta property=\"og:image\" content=\"URL-zum-Bild\"> hinzu (1200×630px empfohlen).",
      "Links ohne Vorschaubild erzielen bis zu 3x weniger Klicks auf Social Media — enormer Traffic-Verlust."
    ));
  } else {
    checks.push(c("og-image", "Open Graph", "OG-Bild (og:image)",
      "og:image vorhanden.", "green", ogImage.slice(0, 70),
      "Weiter so!", "Bildvorschau steigert die Klickrate auf Social Media nachweislich um bis zu 300%."
    ));
  }

  // ══════════════════════════════════════════════════
  // KATEGORIE 3: STRUKTUR (4 Checks)
  // ══════════════════════════════════════════════════

  // 10. H1-Anzahl
  const h1Tags = $("h1");
  if (h1Tags.length === 0) {
    checks.push(c("h1-count", "Struktur", "H1-Überschrift (Anzahl)",
      "Kein <h1>-Tag gefunden.", "red", "0x H1",
      "Füge genau einen H1-Tag mit dem Haupt-Keyword hinzu.",
      "Google versteht das Seitenthema nicht — schlechte Rankings, weniger regionale Sichtbarkeit."
    ));
  } else if (h1Tags.length > 1) {
    checks.push(c("h1-count", "Struktur", "H1-Überschrift (Anzahl)",
      `${h1Tags.length}x H1-Tags — nur einer erlaubt.`, "yellow", `${h1Tags.length}x H1`,
      "Reduziere auf genau einen H1 pro Seite.",
      "Mehrere H1-Tags verwässern die Keyword-Relevanz — Mitbewerber mit klarer Struktur ranken besser."
    ));
  } else {
    checks.push(c("h1-count", "Struktur", "H1-Überschrift (Anzahl)",
      "Genau ein H1-Tag vorhanden.", "green", h1Tags.first().text().trim().slice(0, 60),
      "Weiter so!", "Klare H1-Struktur gibt Google das richtige Keyword-Signal."
    ));
  }

  // 11. H2-Präsenz
  const h2Tags = $("h2");
  if (h2Tags.length === 0) {
    checks.push(c("h2-presence", "Struktur", "H2-Zwischenüberschriften",
      "Keine <h2>-Tags gefunden.", "yellow", "0x H2",
      "Strukturiere den Inhalt mit H2-Überschriften für Unterthemen.",
      "Seiten ohne Zwischenüberschriften sind schwerer zu lesen und zu indexieren — schlechtere Rankings für Long-Tail-Keywords."
    ));
  } else {
    checks.push(c("h2-presence", "Struktur", "H2-Zwischenüberschriften",
      `${h2Tags.length} H2-Überschrift(en) vorhanden.`, "green", `${h2Tags.length}x H2`,
      "Weiter so!", "Gute Inhaltsstruktur hilft Google, alle Teilthemen deiner Seite zu verstehen."
    ));
  }

  // 12. Überschriften-Hierarchie
  const h3Tags = $("h3");
  const h4Tags = $("h4");
  const hierarchyBroken = (h3Tags.length > 0 && h2Tags.length === 0) || (h4Tags.length > 0 && h3Tags.length === 0);
  if (hierarchyBroken) {
    checks.push(c("heading-hierarchy", "Struktur", "Überschriften-Hierarchie",
      "Hierarchiefehler: H3/H4 ohne übergeordnete H2/H3.", "yellow",
      `H1:${h1Tags.length} H2:${h2Tags.length} H3:${h3Tags.length} H4:${h4Tags.length}`,
      "Halte die Hierarchie ein: H1 → H2 → H3 → H4.",
      "Fehlende Hierarchie-Ebenen verwirren Suchmaschinen und führen zu schlechterer Inhalts-Indexierung."
    ));
  } else {
    checks.push(c("heading-hierarchy", "Struktur", "Überschriften-Hierarchie",
      "Überschriften-Hierarchie ist korrekt.", "green",
      `H1:${h1Tags.length} H2:${h2Tags.length} H3:${h3Tags.length} H4:${h4Tags.length}`,
      "Weiter so!", "Korrekte Hierarchie verbessert Lesbarkeit und semantische Strukturierung."
    ));
  }

  // 13. Text-zu-HTML-Ratio
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const ratio = html.length > 0 ? (bodyText.length / html.length) * 100 : 0;
  if (ratio < 10) {
    checks.push(c("text-ratio", "Struktur", "Text-zu-HTML-Verhältnis",
      `Nur ${ratio.toFixed(1)}% reiner Text im HTML (Empfehlung: >10%).`, "yellow", `${ratio.toFixed(1)}%`,
      "Reduziere Inline-Scripts/Styles, füge mehr Textinhalt hinzu.",
      "Zu wenig Text im Verhältnis zum Code-Gerüst signalisiert dünnen Inhalt — Google rankt solche Seiten schlechter."
    ));
  } else {
    checks.push(c("text-ratio", "Struktur", "Text-zu-HTML-Verhältnis",
      `Text-Anteil: ${ratio.toFixed(1)}% — gut strukturierter Inhalt.`, "green", `${ratio.toFixed(1)}%`,
      "Weiter so!", "Solider Textanteil zeigt Google: Diese Seite hat echten Mehrwert für Besucher."
    ));
  }

  // ══════════════════════════════════════════════════
  // KATEGORIE 4: TECHNIK & SICHERHEIT (4 Checks)
  // ══════════════════════════════════════════════════

  // 14. HTTPS
  if (!isHttps) {
    checks.push(c("https", "Technik & Sicherheit", "HTTPS / SSL-Zertifikat",
      "Seite läuft über unsicheres HTTP.", "red", "HTTP (unsicher)",
      "Wechsle sofort zu HTTPS — SSL-Zertifikate sind heute kostenlos (Let's Encrypt).",
      "Browser warnen vor 'Nicht sicher'. Kunden verlassen die Seite sofort — Vertrauen und Umsatz gehen verloren."
    ));
  } else {
    checks.push(c("https", "Technik & Sicherheit", "HTTPS / SSL-Zertifikat",
      "Seite ist sicher über HTTPS erreichbar.", "green", "HTTPS ✓",
      "Weiter so!", "HTTPS ist bestätigter Google-Rankingfaktor und schützt das Vertrauen deiner Kunden."
    ));
  }

  // 15. Robots.txt
  if (!robotsTxt) {
    checks.push(c("robots-txt", "Technik & Sicherheit", "robots.txt vorhanden",
      "Keine robots.txt unter /robots.txt gefunden.", "yellow", null,
      "Erstelle eine /robots.txt — mindestens mit 'User-agent: * \\nAllow: /'.",
      "Ohne robots.txt kann Google unkontrolliert Bereiche crawlen, die nicht indexiert werden sollten."
    ));
  } else {
    checks.push(c("robots-txt", "Technik & Sicherheit", "robots.txt vorhanden",
      "robots.txt ist erreichbar.", "green", "/robots.txt ✓",
      "Weiter so!", "Du kontrollierst, wie Google deine Seite crawlt — wichtig für effizientes Crawl-Budget."
    ));
  }

  // 16. Sitemap in Robots.txt
  if (!robotsTxt) {
    checks.push(c("sitemap-in-robots", "Technik & Sicherheit", "Sitemap-Link in robots.txt",
      "robots.txt nicht vorhanden — Sitemap-Check nicht möglich.", "yellow", null,
      "Erstelle robots.txt und füge Sitemap-URL ein.",
      "Google findet deine Sitemap nur durch explizite Angabe — langsamer und weniger vollständiges Indexieren."
    ));
  } else if (!robotsTxt.toLowerCase().includes("sitemap:")) {
    checks.push(c("sitemap-in-robots", "Technik & Sicherheit", "Sitemap-Link in robots.txt",
      "Kein Sitemap-Eintrag in robots.txt gefunden.", "yellow", "Kein Sitemap-Eintrag",
      "Füge 'Sitemap: https://deine-domain.de/sitemap.xml' zur robots.txt hinzu.",
      "Google muss deine Sitemap selbst finden — das verzögert das Indexieren neuer Seiten."
    ));
  } else {
    const sitemapLine = robotsTxt.split("\n").find((l) => l.toLowerCase().startsWith("sitemap:"))?.trim();
    checks.push(c("sitemap-in-robots", "Technik & Sicherheit", "Sitemap-Link in robots.txt",
      "Sitemap-URL ist in robots.txt eingetragen.", "green", sitemapLine?.slice(0, 60) ?? "Sitemap ✓",
      "Weiter so!", "Google wird direkt zur Sitemap geführt — schnelleres und vollständiges Indexieren."
    ));
  }

  // 17. Robots-Meta (noindex check)
  const robotsMeta = $('meta[name="robots"]').attr("content")?.toLowerCase() ?? "";
  if (robotsMeta.includes("noindex")) {
    checks.push(c("robots-meta", "Technik & Sicherheit", "Robots-Meta (noindex)",
      "KRITISCH: Seite ist mit 'noindex' markiert — wird von Google NICHT indexiert!", "red",
      robotsMeta,
      "Entferne 'noindex' aus dem Robots-Meta-Tag sofort!",
      "Diese Seite ist für Google unsichtbar. Kein organischer Traffic möglich — totaler Sichtbarkeitsverlust."
    ));
  } else {
    checks.push(c("robots-meta", "Technik & Sicherheit", "Robots-Meta (noindex)",
      "Seite ist für Google-Indexierung freigegeben.", "green",
      robotsMeta || "Kein Robots-Meta (Standard: index)",
      "Weiter so!", "Google kann die Seite normal indexieren und in den Suchergebnissen anzeigen."
    ));
  }

  // ══════════════════════════════════════════════════
  // KATEGORIE 5: BARRIEREFREIHEIT & MOBIL (4 Checks)
  // ══════════════════════════════════════════════════

  // 18. Viewport
  const viewport = $('meta[name="viewport"]').attr("content");
  if (!viewport) {
    checks.push(c("viewport", "Barrierefreiheit & Mobil", "Viewport-Meta-Tag",
      "Kein Viewport-Tag — möglicherweise nicht mobiloptimiert.", "red", null,
      'Füge <meta name="viewport" content="width=device-width, initial-scale=1"> hinzu.',
      "60%+ aller lokalen Suchanfragen kommen vom Smartphone. Schlechte Mobile-UX = mehr als die Hälfte aller Kunden verloren."
    ));
  } else {
    checks.push(c("viewport", "Barrierefreiheit & Mobil", "Viewport-Meta-Tag",
      "Viewport-Tag gesetzt — Seite ist mobiloptimiert.", "green", viewport,
      "Weiter so!", "Mobile-Optimierung ist direkter Google-Rankingfaktor seit dem Mobile-First-Index."
    ));
  }

  // 19. Bilder ohne Alt-Attribute
  const allImages = $("img");
  const imgsWithoutAlt = allImages.toArray().filter((el) => {
    const alt = $(el).attr("alt");
    return alt === undefined || alt === null || alt.trim() === "";
  });
  if (allImages.length === 0) {
    checks.push(c("img-alt", "Barrierefreiheit & Mobil", "Bilder-Alt-Attribute",
      "Keine Bilder auf der Seite gefunden.", "yellow", "0 Bilder",
      "Füge relevante Bilder mit Alt-Attributen hinzu.",
      "Seiten ohne Bilder wirken weniger vertrauenswürdig — höhere Absprungrate, schlechteres Ranking."
    ));
  } else if (imgsWithoutAlt.length === 0) {
    checks.push(c("img-alt", "Barrierefreiheit & Mobil", "Bilder-Alt-Attribute",
      `Alle ${allImages.length} Bilder haben Alt-Attribute.`, "green", `${allImages.length}/0 ohne Alt`,
      "Weiter so!", "Vollständige Alt-Attribute ermöglichen Google-Bildersuche als zusätzlichen Traffic-Kanal."
    ));
  } else {
    const severity: TrafficLight = imgsWithoutAlt.length === allImages.length ? "red" : "yellow";
    checks.push(c("img-alt", "Barrierefreiheit & Mobil", "Bilder-Alt-Attribute",
      `${imgsWithoutAlt.length} von ${allImages.length} Bildern fehlt das Alt-Attribut.`, severity,
      `${imgsWithoutAlt.length}/${allImages.length} ohne Alt`,
      "Ergänze alle Bilder mit beschreibenden Alt-Texten (Keywords einbauen).",
      "Du verpasst Google-Bildsuche-Traffic — jedes Bild ohne Alt ist eine verlorene Ranking-Chance."
    ));
  }

  // 20. Favicon
  const favicon = $('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').first();
  if (!favicon.length) {
    checks.push(c("favicon", "Barrierefreiheit & Mobil", "Favicon vorhanden",
      "Kein Favicon-Link im HTML gefunden.", "yellow", null,
      "Füge <link rel=\"icon\" href=\"/favicon.ico\"> im <head> hinzu.",
      "Fehlende Favicons wirken unprofessionell — Kunden vertrauen Seiten ohne Logo-Erkennbarkeit weniger."
    ));
  } else {
    checks.push(c("favicon", "Barrierefreiheit & Mobil", "Favicon vorhanden",
      "Favicon ist definiert.", "green", favicon.attr("href")?.slice(0, 60) ?? "Favicon ✓",
      "Weiter so!", "Favicons stärken die Markenwiederkennung im Browser-Tab und in den Lesezeichen."
    ));
  }

  // 21. Sprach-Attribut (lang)
  const langAttr = $("html").attr("lang");
  if (!langAttr) {
    checks.push(c("lang-attr", "Barrierefreiheit & Mobil", "HTML lang-Attribut",
      "Kein lang-Attribut im <html>-Tag gesetzt.", "yellow", null,
      'Füge lang="de" (oder passende Sprache) zum <html>-Tag hinzu.',
      "Google kann die Sprache deiner Seite nicht eindeutig erkennen — Nachteile bei lokaler Sprachsuche."
    ));
  } else {
    checks.push(c("lang-attr", "Barrierefreiheit & Mobil", "HTML lang-Attribut",
      `Sprache korrekt deklariert: lang="${langAttr}"`, "green", `lang="${langAttr}"`,
      "Weiter so!", "Korrekte Sprachdeklaration hilft Google, deine Seite den richtigen Nutzern anzuzeigen."
    ));
  }

  // ══════════════════════════════════════════════════
  // KATEGORIE 6: TECHNISCHE SEO (6 Checks)
  // ══════════════════════════════════════════════════

  // 22. Charset
  const charset = $("meta[charset]").attr("charset") ?? $('meta[http-equiv="Content-Type"]').attr("content");
  if (!charset) {
    checks.push(c("charset", "Technische SEO", "Charset-Deklaration",
      "Keine Zeichenkodierung (charset) im HTML deklariert.", "yellow", null,
      'Füge <meta charset="UTF-8"> als erstes Element im <head> hinzu.',
      "Falsch kodierte Sonderzeichen (ä, ö, ü) können Seiten unlesbar machen — schlechte UX, hohe Absprungrate."
    ));
  } else {
    checks.push(c("charset", "Technische SEO", "Charset-Deklaration",
      "Zeichenkodierung ist korrekt deklariert.", "green", charset,
      "Weiter so!", "Korrekte Zeichenkodierung verhindert Darstellungsfehler — besonders wichtig für deutsche Umlaute."
    ));
  }

  // 23. Twitter-Card
  const twitterCard = $('meta[name="twitter:card"]').attr("content");
  if (!twitterCard) {
    checks.push(c("twitter-card", "Technische SEO", "Twitter/X Card Tags",
      "Keine Twitter-Card-Tags gefunden.", "yellow", null,
      'Füge <meta name="twitter:card" content="summary_large_image"> und weitere Twitter-Tags hinzu.',
      "Geteilte Links auf Twitter/X erscheinen ohne ansprechende Vorschau — geringere Sichtbarkeit und weniger Klicks."
    ));
  } else {
    checks.push(c("twitter-card", "Technische SEO", "Twitter/X Card Tags",
      "Twitter-Card-Tags vorhanden.", "green", twitterCard,
      "Weiter so!", "Professionelle Twitter-Vorschauen steigern Engagement und Social-Media-Traffic."
    ));
  }

  // 24. Schema.org LocalBusiness
  const schemaBlocks = $('script[type="application/ld+json"]');
  let hasLocalBusiness = false;
  schemaBlocks.each((_, el) => {
    try {
      const json = JSON.parse($(el).html() ?? "{}") as Record<string, unknown>;
      const type = json["@type"];
      if (typeof type === "string" && (type.includes("LocalBusiness") || type.includes("Organization"))) {
        hasLocalBusiness = true;
      }
    } catch { /* ignore parse errors */ }
  });

  if (schemaBlocks.length === 0) {
    checks.push(c("schema-local", "Technische SEO", "Schema.org LocalBusiness",
      "Kein strukturiertes Daten-Markup (Schema.org) gefunden.", "yellow", null,
      "Füge LocalBusiness-Schema als <script type=\"application/ld+json\"> hinzu.",
      "Ohne Schema.org erscheinst du nicht in Googles Knowledge Panel — Mitbewerber mit Schema.org werden prominent ganz oben angezeigt."
    ));
  } else if (!hasLocalBusiness) {
    checks.push(c("schema-local", "Technische SEO", "Schema.org LocalBusiness",
      `${schemaBlocks.length} Schema-Block(s) vorhanden, aber kein LocalBusiness/Organization-Typ.`, "yellow",
      `${schemaBlocks.length} Blöcke`,
      "Ergänze den LocalBusiness- oder Organization-Typ für lokale SEO.",
      "Allgemeine Schema-Daten reichen für lokale Suche nicht. LocalBusiness-Schema ist entscheidend für Google Maps-Integration."
    ));
  } else {
    checks.push(c("schema-local", "Technische SEO", "Schema.org LocalBusiness",
      "LocalBusiness/Organization-Schema ist vorhanden.", "green", `${schemaBlocks.length} Block(s)`,
      "Weiter so!", "LocalBusiness-Schema ermöglicht Rich-Results mit Adresse, Öffnungszeiten und Bewertungen direkt in Google."
    ));
  }

  // 25. Inline-CSS (zu viele style-Attribute)
  const inlineStyles = $("[style]").length;
  if (inlineStyles > 20) {
    checks.push(c("inline-css", "Technische SEO", "Inline-CSS (style-Attribute)",
      `${inlineStyles} Elemente mit Inline-style-Attributen — erschwert Wartung und Performance.`, "yellow",
      `${inlineStyles} Inline-Styles`,
      "Lagere Inline-Styles in externe CSS-Dateien oder CSS-Klassen aus.",
      "Übermäßige Inline-Styles behindern Browser-Caching und erhöhen die Ladezeit — schlechtere Core Web Vitals = schlechteres Ranking."
    ));
  } else {
    checks.push(c("inline-css", "Technische SEO", "Inline-CSS (style-Attribute)",
      `Nur ${inlineStyles} Inline-Styles — sauber strukturiertes CSS.`, "green", `${inlineStyles} Inline-Styles`,
      "Weiter so!", "Saubere CSS-Trennung verbessert Ladezeiten und Core Web Vitals."
    ));
  }

  // 26. Keywords-Meta (informativ)
  const keywordsMeta = $('meta[name="keywords"]').attr("content");
  if (!keywordsMeta) {
    checks.push(c("keywords-meta", "Technische SEO", "Keywords-Meta (informativ)",
      "Kein Keywords-Meta vorhanden (von Google ignoriert, aber branchen­üblich).", "green", "Nicht gesetzt",
      "Keywords-Meta wird von Google ignoriert — fokussiere dich auf Content statt diesen Tag.",
      "Neutral: Fehlende Keywords-Meta hat keinen direkten Einfluss auf Google-Rankings."
    ));
  } else {
    checks.push(c("keywords-meta", "Technische SEO", "Keywords-Meta (informativ)",
      "Keywords-Meta gesetzt (wird von Google nicht gewertet).", "green", keywordsMeta.slice(0, 60),
      "Hinweis: Google ignoriert diesen Tag — setze Prioritäten anders.",
      "Neutral: Keywords-Meta hat keinen Einfluss auf Google-Rankings."
    ));
  }

  // 27. Author-Meta
  const authorMeta = $('meta[name="author"]').attr("content");
  if (!authorMeta) {
    checks.push(c("author-meta", "Technische SEO", "Author-Meta",
      "Kein Author-Meta-Tag gesetzt.", "yellow", null,
      'Füge <meta name="author" content="Dein Name / Unternehmen"> hinzu.',
      "Author-Signale stärken E-E-A-T (Expertise, Erfahrung, Autorität, Vertrauenswürdigkeit) — wichtiger Google-Qualitätsfaktor."
    ));
  } else {
    checks.push(c("author-meta", "Technische SEO", "Author-Meta",
      "Author-Meta-Tag gesetzt.", "green", authorMeta,
      "Weiter so!", "Author-Informationen stärken das E-E-A-T-Signal — Google wertet vertrauenswürdige Autoren höher."
    ));
  }

  // Score berechnen (gewichtet: red=0, yellow=50, green=100)
  const weights: Record<TrafficLight, number> = { green: 100, yellow: 50, red: 0 };
  const score = Math.round(
    checks.reduce((s, c) => s + weights[c.status], 0) / checks.length
  );

  return {
    url,
    analyzedAt: new Date().toISOString(),
    score,
    totalChecks: checks.length,
    checks,
    summary: {
      critical: checks.filter((c) => c.status === "red").length,
      warnings: checks.filter((c) => c.status === "yellow").length,
      passed: checks.filter((c) => c.status === "green").length,
    },
  };
}
