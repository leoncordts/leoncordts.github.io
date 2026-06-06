import { jsPDF } from "jspdf";
import type { AuditResult, Category, SeoCheck, TrafficLight } from "./types";

const BRAND = {
  name: "leoncordts.de",
  tagline: "Ihr Partner für IT-Support & Web-Optimierung",
  url: "https://leoncordts.de",
  contact: "leoncordts.de/kontakt",
  accent: [99, 102, 241] as [number, number, number],
};

const C = {
  red: [220, 53, 69] as [number, number, number],
  yellow: [217, 119, 6] as [number, number, number],
  green: [22, 163, 74] as [number, number, number],
  dark: [15, 15, 25] as [number, number, number],
  gray: [100, 100, 120] as [number, number, number],
  lightGray: [243, 244, 246] as [number, number, number],
  impactBg: [255, 251, 235] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  accent: BRAND.accent,
  ctaBg: [238, 242, 255] as [number, number, number],
};

function sc(s: TrafficLight): [number, number, number] { return C[s]; }
function sl(s: TrafficLight): string { return s === "red" ? "KRITISCH" : s === "yellow" ? "WARNUNG" : "OPTIMAL"; }

function rr(doc: jsPDF, x: number, y: number, w: number, h: number, r: number, fill: [number, number, number]) {
  doc.setFillColor(...fill);
  doc.roundedRect(x, y, w, h, r, r, "F");
}

function cardH(check: SeoCheck): number {
  return check.status !== "green" && check.businessImpact ? 62 : 40;
}

export function generatePDF(result: AuditResult): Blob {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const PW = 210, PH = 297, M = 14, CW = PW - M * 2;
  let y = 0;

  // ── Seite 1: Header ──────────────────────────────────────────────────────
  doc.setFillColor(...C.dark);
  doc.rect(0, 0, PW, 58, "F");

  // Brand badge
  rr(doc, M, 8, 55, 7, 2, C.accent);
  doc.setTextColor(...C.white);
  doc.setFontSize(6);
  doc.setFont("helvetica", "bold");
  doc.text("EIN KOSTENLOSES TOOL VON", M + 3, 11.5);
  doc.text(BRAND.name.toUpperCase(), M + 3, 14);

  // Titel
  doc.setFontSize(21);
  doc.setFont("helvetica", "bold");
  doc.text("SEO-Tiefenanalyse", M, 30);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.gray);
  doc.text(result.url.replace(/^https?:\/\//, "").slice(0, 62), M, 38);
  doc.text(`${result.totalChecks} Prüfpunkte · Analysiert am ${new Date(result.analyzedAt).toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })}`, M, 44);

  // Score-Kreis
  const sX = PW - M - 22, sY = 29;
  const sColor: [number, number, number] = result.score >= 70 ? C.green : result.score >= 40 ? C.yellow : C.red;
  doc.setFillColor(...sColor);
  doc.circle(sX, sY, 18, "F");
  doc.setTextColor(...C.white);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  const ss = String(result.score);
  doc.text(ss, sX - doc.getTextWidth(ss) / 2, sY + 2.5);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("/100", sX - 3.5, sY + 8.5);

  y = 66;

  // ── Zusammenfassung ───────────────────────────────────────────────────────
  const summaries = [
    { label: "Kritisch", count: result.summary.critical, color: C.red },
    { label: "Warnungen", count: result.summary.warnings, color: C.yellow },
    { label: "Optimal", count: result.summary.passed, color: C.green },
  ];
  const bW = (CW - 8) / 3;
  summaries.forEach(({ label, count, color }, i) => {
    const bx = M + i * (bW + 4);
    rr(doc, bx, y, bW, 22, 3, color);
    doc.setTextColor(...C.white);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(String(count), bx + bW / 2 - doc.getTextWidth(String(count)) / 2, y + 12);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(label, bx + bW / 2 - doc.getTextWidth(label) / 2, y + 18.5);
  });

  y += 30;

  // ── Kategorien-Übersicht ──────────────────────────────────────────────────
  doc.setTextColor(...C.dark);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Ergebnis nach Kategorien", M, y);
  y += 6;

  const categories = [...new Set(result.checks.map((c) => c.category))] as Category[];
  const catW = (CW - 4) / 2;
  let catLeft = y, catRight = y;

  categories.forEach((cat, idx) => {
    const isLeft = idx % 2 === 0;
    const cx = isLeft ? M : M + catW + 4;
    const cy = isLeft ? catLeft : catRight;
    const catChecks = result.checks.filter((c) => c.category === cat);
    const catRed = catChecks.filter((c) => c.status === "red").length;
    const catYellow = catChecks.filter((c) => c.status === "yellow").length;
    const catGreen = catChecks.filter((c) => c.status === "green").length;
    const catScore = Math.round((catGreen * 100 + catYellow * 50) / catChecks.length);
    const catColor: [number, number, number] = catScore >= 70 ? C.green : catScore >= 40 ? C.yellow : C.red;

    rr(doc, cx, cy, catW, 14, 2, C.lightGray);
    doc.setTextColor(...C.dark);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text(cat, cx + 3, cy + 6);
    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.gray);
    doc.text(`${catChecks.length} Checks`, cx + 3, cy + 11);

    // Score-Pill
    rr(doc, cx + catW - 18, cy + 3, 15, 8, 2, catColor);
    doc.setTextColor(...C.white);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    const pct = `${catScore}%`;
    doc.text(pct, cx + catW - 10.5 - doc.getTextWidth(pct) / 2, cy + 8.5);

    // Mini dots
    [catRed, catYellow, catGreen].forEach((n, ni) => {
      const dotColor = [C.red, C.yellow, C.green][ni];
      doc.setFillColor(...dotColor);
      doc.circle(cx + catW - 33 + ni * 7, cy + 7, 2, "F");
      doc.setFontSize(5.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.gray);
      doc.text(String(n), cx + catW - 31 + ni * 7, cy + 7.5);
    });

    if (isLeft) catLeft += 18;
    else catRight += 18;
  });

  y = Math.max(catLeft, catRight) + 6;

  // ── Detaillierte Checks (zweispaltig) ─────────────────────────────────────
  doc.setTextColor(...C.dark);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Detaillierte Analyse — alle " + result.totalChecks + " Prüfpunkte", M, y);
  y += 7;

  const colW = (CW - 6) / 2;
  let lY = y, rY = y;
  const lX = M, rX = M + colW + 6;

  const sorted = [...result.checks].sort((a, b) => {
    const o: Record<TrafficLight, number> = { red: 0, yellow: 1, green: 2 };
    return o[a.status] - o[b.status];
  });

  sorted.forEach((check, idx) => {
    const isLeft = idx % 2 === 0;
    const cx = isLeft ? lX : rX;
    const ch = cardH(check);
    const cy = isLeft ? lY : rY;

    if (cy + ch > PH - 22) {
      doc.addPage();
      // Mini-Header auf neuen Seiten
      doc.setFillColor(...C.dark);
      doc.rect(0, 0, PW, 14, "F");
      doc.setTextColor(...C.white);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text(`${BRAND.name} · SEO-Tiefenanalyse · ${result.url.replace(/^https?:\/\//, "").slice(0, 50)}`, M, 9);
      if (isLeft) { lY = 20; } else { rY = 20; }
    }

    const actualCy = isLeft ? lY : rY;

    rr(doc, cx, actualCy, colW, ch, 3, C.lightGray);

    // Status-Pill
    rr(doc, cx + colW - 29, actualCy + 3, 26, 6, 2, sc(check.status));
    doc.setTextColor(...C.white);
    doc.setFontSize(5.5);
    doc.setFont("helvetica", "bold");
    const label = sl(check.status);
    doc.text(label, cx + colW - 16 - doc.getTextWidth(label) / 2, actualCy + 7);

    // Kategorie-Badge
    doc.setFontSize(5.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.accent);
    doc.text(check.category.toUpperCase(), cx + 3, actualCy + 5.5);

    // Titel
    doc.setTextColor(...C.dark);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text(doc.splitTextToSize(check.title, colW - 35)[0], cx + 3, actualCy + 10.5);

    // Beschreibung
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 80);
    const descLines = doc.splitTextToSize(check.description, colW - 6);
    doc.text(descLines.slice(0, 2), cx + 3, actualCy + 17);

    // Gefundener Wert
    if (check.value) {
      doc.setFontSize(6);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(...C.gray);
      doc.text(`Gefunden: "${check.value.slice(0, 50)}"`, cx + 3, actualCy + 27);
    }

    // Empfehlung
    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.accent);
    doc.text(doc.splitTextToSize(`→ ${check.recommendation}`, colW - 6)[0], cx + 3, actualCy + 33);

    // Business Impact
    if (check.status !== "green" && check.businessImpact) {
      const impY = actualCy + 38;
      const impH = ch - 40;
      rr(doc, cx + 2, impY, colW - 4, impH, 2, C.impactBg);
      doc.setFontSize(5.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(120, 70, 0);
      doc.text("💰 GESCHÄFTLICHE AUSWIRKUNG", cx + 5, impY + 4);
      doc.setFontSize(6);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 45, 0);
      const impLines = doc.splitTextToSize(check.businessImpact, colW - 10);
      doc.text(impLines.slice(0, 3), cx + 5, impY + 9);
    }

    if (isLeft) lY += ch + 4;
    else rY += ch + 4;
  });

  // ── Finale Seite: CTA ─────────────────────────────────────────────────────
  doc.addPage();
  doc.setFillColor(...C.dark);
  doc.rect(0, 0, PW, PH, "F");

  // Großes Branding
  doc.setFillColor(...C.accent);
  doc.circle(PW / 2, 70, 25, "F");
  doc.setTextColor(...C.white);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("LC", PW / 2 - doc.getTextWidth("LC") / 2, 73.5);

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.white);
  doc.text(BRAND.name, PW / 2 - doc.getTextWidth(BRAND.name) / 2, 110);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.gray);
  doc.text(BRAND.tagline, PW / 2 - doc.getTextWidth(BRAND.tagline) / 2, 119);

  // CTA-Box
  const ctaY = 135;
  rr(doc, M, ctaY, CW, 70, 6, [30, 30, 50]);
  doc.setDrawColor(...C.accent);
  doc.roundedRect(M, ctaY, CW, 70, 6, 6, "D");

  doc.setTextColor(...C.accent);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  const ctaHeadline = "NÄCHSTER SCHRITT";
  doc.text(ctaHeadline, PW / 2 - doc.getTextWidth(ctaHeadline) / 2, ctaY + 11);

  if (result.summary.critical > 0 || result.summary.warnings > 0) {
    doc.setTextColor(...C.white);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    const h1 = `${result.summary.critical + result.summary.warnings} Probleme gefunden?`;
    doc.text(h1, PW / 2 - doc.getTextWidth(h1) / 2, ctaY + 24);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.gray);
    const lines = [
      "Lass sie uns gemeinsam beheben!",
      "Buche jetzt ein kostenloses 15-Minuten-Erstgespräch",
      "und erhalte einen konkreten Maßnahmenplan für deine Website.",
    ];
    lines.forEach((l, i) => {
      doc.text(l, PW / 2 - doc.getTextWidth(l) / 2, ctaY + 33 + i * 6);
    });
  } else {
    doc.setTextColor(...C.white);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    const h1 = "Ausgezeichnete SEO! Weiter so.";
    doc.text(h1, PW / 2 - doc.getTextWidth(h1) / 2, ctaY + 24);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.gray);
    const l = "Lass uns gemeinsam das Ranking weiter ausbauen.";
    doc.text(l, PW / 2 - doc.getTextWidth(l) / 2, ctaY + 35);
  }

  // CTA Button
  rr(doc, M + 20, ctaY + 50, CW - 40, 12, 3, C.accent);
  doc.setTextColor(...C.white);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  const btnText = `Kostenloses Erstgespräch buchen: ${BRAND.contact}`;
  doc.text(btnText, PW / 2 - doc.getTextWidth(btnText) / 2, ctaY + 58);

  // Score-Zusammenfassung am Ende
  doc.setTextColor(...C.gray);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const summary = `Ihr SEO-Score: ${result.score}/100 · ${result.summary.critical} Kritisch · ${result.summary.warnings} Warnungen · ${result.summary.passed} Optimal`;
  doc.text(summary, PW / 2 - doc.getTextWidth(summary) / 2, 220);

  // Footer auf CTA-Seite
  doc.setTextColor(60, 60, 80);
  doc.setFontSize(7);
  doc.text(`Ein kostenloses Tool von ${BRAND.name} · ${BRAND.tagline}`, PW / 2, PH - 12, { align: "center" });
  doc.text(BRAND.url, PW / 2, PH - 7, { align: "center" });

  // Footer auf allen anderen Seiten (Post-processing via iterate pages not supported — handled inline)

  return doc.output("blob");
}
