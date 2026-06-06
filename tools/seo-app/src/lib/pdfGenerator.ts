import { jsPDF } from "jspdf";
import type { AuditResult, BrandingConfig, SeoCheck, TrafficLight } from "./seoTypes";

const COLORS = {
  red: [220, 53, 69] as [number, number, number],
  yellow: [255, 163, 0] as [number, number, number],
  green: [40, 167, 69] as [number, number, number],
  darkGray: [18, 18, 30] as [number, number, number],
  lightGray: [245, 245, 250] as [number, number, number],
  impactBg: [255, 248, 230] as [number, number, number],
  midGray: [120, 120, 140] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  accent: [99, 102, 241] as [number, number, number],
  emerald: [16, 185, 129] as [number, number, number],
};

function statusColor(s: TrafficLight): [number, number, number] {
  return COLORS[s];
}

function statusLabel(s: TrafficLight): string {
  return s === "red" ? "KRITISCH" : s === "yellow" ? "WARNUNG" : "OPTIMAL";
}

function drawRoundedRect(
  doc: jsPDF,
  x: number, y: number, w: number, h: number, r: number,
  fill: [number, number, number],
  stroke?: [number, number, number]
) {
  doc.setFillColor(...fill);
  if (stroke) doc.setDrawColor(...stroke);
  doc.roundedRect(x, y, w, h, r, r, stroke ? "FD" : "F");
}

function cardHeight(check: SeoCheck): number {
  const hasImpact = check.status !== "green" && check.businessImpact;
  return hasImpact ? 58 : 38;
}

export function generatePDF(result: AuditResult, branding?: BrandingConfig): Blob {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = 210;
  const pageH = 297;
  const margin = 14;
  const contentW = pageW - margin * 2;
  let y = 0;

  // ── Header ──────────────────────────────────────────────────────────────
  doc.setFillColor(...COLORS.darkGray);
  doc.rect(0, 0, pageW, 56, "F");

  const hasLogo = branding?.logoUrl;
  const logoAreaW = hasLogo ? 45 : 0;

  // Logo-Platzhalter (Base64-Load nicht möglich ohne async — wir nutzen Text-Fallback)
  if (branding?.agencyName) {
    // Agentur-Name als White-Label-Badge
    doc.setFillColor(...COLORS.accent);
    doc.roundedRect(margin, 8, logoAreaW + 30, 8, 2, 2, "F");
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.text(
      branding.agencyName.toUpperCase().slice(0, 28),
      margin + 4,
      13.5
    );
    doc.text("PRÄSENTIERT VON", margin + 4, 10.5);
  } else {
    doc.setTextColor(...COLORS.midGray);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("LOKALER SEO-AUDIT-REPORT", margin, 14);
  }

  doc.setTextColor(...COLORS.white);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("SEO-Analyse", margin, 30);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.midGray);
  const displayUrl = result.url.replace(/^https?:\/\//, "").slice(0, 60);
  doc.text(displayUrl, margin, 38);

  const dateStr = new Date(result.analyzedAt).toLocaleDateString("de-DE", {
    day: "2-digit", month: "long", year: "numeric",
  });
  doc.text(`Analysiert am: ${dateStr}`, margin, 44);

  // Score-Kreis oben rechts
  const scoreX = pageW - margin - 22;
  const scoreY = 28;
  const scoreColor: [number, number, number] =
    result.score >= 70 ? COLORS.green : result.score >= 40 ? COLORS.yellow : COLORS.red;
  doc.setFillColor(...scoreColor);
  doc.circle(scoreX, scoreY, 18, "F");
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  const scoreStr = String(result.score);
  doc.text(scoreStr, scoreX - doc.getTextWidth(scoreStr) / 2, scoreY + 2.5);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("/100", scoreX - 3.5, scoreY + 8);

  y = 64;

  // ── Zusammenfassung ─────────────────────────────────────────────────────
  const summaryItems = [
    { label: "Kritisch", count: result.summary.critical, color: COLORS.red },
    { label: "Warnungen", count: result.summary.warnings, color: COLORS.yellow },
    { label: "Optimal", count: result.summary.passed, color: COLORS.green },
  ];
  const boxW = (contentW - 8) / 3;
  summaryItems.forEach(({ label, count, color }, i) => {
    const bx = margin + i * (boxW + 4);
    drawRoundedRect(doc, bx, y, boxW, 22, 3, color);
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(String(count), bx + boxW / 2 - doc.getTextWidth(String(count)) / 2, y + 12);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(label, bx + boxW / 2 - doc.getTextWidth(label) / 2, y + 18.5);
  });

  y += 30;

  // ── Checks (zweispaltig) ─────────────────────────────────────────────────
  doc.setTextColor(...COLORS.darkGray);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Detaillierte Analyse", margin, y);
  y += 8;

  const colW = (contentW - 6) / 2;
  let leftY = y;
  let rightY = y;
  const leftX = margin;
  const rightX = margin + colW + 6;

  const sorted = [...result.checks].sort((a, b) => {
    const order: Record<TrafficLight, number> = { red: 0, yellow: 1, green: 2 };
    return order[a.status] - order[b.status];
  });

  sorted.forEach((check, idx) => {
    const isLeft = idx % 2 === 0;
    const cx = isLeft ? leftX : rightX;
    const ch = cardHeight(check);

    // Page break check (use the taller column's Y)
    const currentY = isLeft ? leftY : rightY;
    if (currentY + ch > pageH - 22) {
      doc.addPage();
      leftY = 20;
      rightY = 20;
    }

    const cy = isLeft ? leftY : rightY;

    // Card background
    drawRoundedRect(doc, cx, cy, colW, ch, 3, COLORS.lightGray);

    // Status-Pill
    drawRoundedRect(doc, cx + colW - 28, cy + 3, 25, 6, 2, statusColor(check.status));
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(6);
    doc.setFont("helvetica", "bold");
    const label = statusLabel(check.status);
    doc.text(label, cx + colW - 15.5 - doc.getTextWidth(label) / 2, cy + 7);

    // Title
    doc.setTextColor(...COLORS.darkGray);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(doc.splitTextToSize(check.title, colW - 35)[0], cx + 4, cy + 8);

    // Category
    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.midGray);
    doc.text(check.category.toUpperCase(), cx + 4, cy + 13);

    // Description
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.darkGray);
    const descLines = doc.splitTextToSize(check.description, colW - 8);
    doc.text(descLines.slice(0, 2), cx + 4, cy + 19);

    // Value
    if (check.value) {
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(...COLORS.midGray);
      doc.text(`Gefunden: "${check.value.slice(0, 52)}"`, cx + 4, cy + 27);
    }

    // Recommendation
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.accent);
    const recLines = doc.splitTextToSize(`→ ${check.recommendation}`, colW - 8);
    doc.text(recLines[0], cx + 4, cy + 33);

    // Business Impact (nur bei Nicht-Grün)
    if (check.status !== "green" && check.businessImpact) {
      const impactY = cy + 38;
      const impactH = ch - 39;
      drawRoundedRect(doc, cx + 3, impactY, colW - 6, impactH, 2, COLORS.impactBg);
      doc.setFontSize(5.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(120, 80, 0);
      doc.text("GESCHÄFTLICHE AUSWIRKUNG", cx + 6, impactY + 4);
      doc.setFontSize(6);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 50, 0);
      const impactLines = doc.splitTextToSize(check.businessImpact, colW - 12);
      doc.text(impactLines.slice(0, 3), cx + 6, impactY + 8.5);
    }

    if (isLeft) leftY += ch + 4;
    else rightY += ch + 4;
  });

  // ── Footer ───────────────────────────────────────────────────────────────
  const footerText = branding?.agencyName
    ? `Präsentiert von ${branding.agencyName} · Vertraulich`
    : "Erstellt mit Lokaler SEO-Audit-Generator · Alle Rechte vorbehalten";

  // Footer auf letzter Seite
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.midGray);
  doc.text(footerText, pageW / 2, pageH - 8, { align: "center" });

  return doc.output("blob");
}
