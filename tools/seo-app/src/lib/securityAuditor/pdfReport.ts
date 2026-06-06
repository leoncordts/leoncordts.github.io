import jsPDF from 'jspdf';
import type { ScanResult, SecurityCheck } from './types';

const DARK_BG   = [2, 11, 24]    as [number, number, number];
const PANEL_BG  = [7, 20, 34]    as [number, number, number];
const CYAN      = [0, 212, 255]  as [number, number, number];
const WHITE     = [255, 255, 255] as [number, number, number];
const SLATE400  = [148, 163, 184] as [number, number, number];
const GREEN     = [34, 197, 94]  as [number, number, number];
const YELLOW    = [234, 179, 8]  as [number, number, number];
const RED       = [239, 68, 68]  as [number, number, number];
const SLATE700  = [51, 65, 85]   as [number, number, number];

function statusColor(status: SecurityCheck['status']): [number, number, number] {
  return status === 'secure' ? GREEN : status === 'warning' ? YELLOW : RED;
}

function statusIcon(status: SecurityCheck['status']): string {
  return status === 'secure' ? '✓' : status === 'warning' ? '!' : '✗';
}

function gradeColor(grade: string): [number, number, number] {
  if (grade === 'A+' || grade === 'A') return GREEN;
  if (grade === 'B') return [132, 204, 22];
  if (grade === 'C') return YELLOW;
  if (grade === 'D') return [249, 115, 22];
  return RED;
}

export function generateSecurityPDF(result: ScanResult): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const M = 16;
  const CW = W - 2 * M;

  const bg = () => { doc.setFillColor(...DARK_BG); doc.rect(0, 0, W, 297, 'F'); };
  const setFill = (...rgb: [number, number, number]) => doc.setFillColor(...rgb);
  const setStroke = (...rgb: [number, number, number]) => doc.setDrawColor(...rgb);
  const setColor = (...rgb: [number, number, number]) => doc.setTextColor(...rgb);
  const setFont = (style: 'normal' | 'bold' = 'normal', size = 10) => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
  };

  // ══════════════════════ PAGE 1 ══════════════════════
  bg();

  // Header bar
  setFill(...PANEL_BG);
  doc.rect(0, 0, W, 44, 'F');
  setStroke(...CYAN);
  doc.setLineWidth(0.4);
  doc.line(0, 44, W, 44);

  // Cyan left accent
  setFill(...CYAN);
  doc.rect(0, 0, 3, 44, 'F');

  setColor(...CYAN);
  setFont('bold', 7);
  doc.text('LEON CORDTS — IT-SICHERHEIT & SYSTEMINTEGRATION', M + 4, 10);

  setColor(...WHITE);
  setFont('bold', 18);
  doc.text('CYBER SECURITY AUDIT REPORT', W / 2, 22, { align: 'center' });

  setColor(...SLATE400);
  setFont('normal', 8);
  doc.text(`Erstellt am ${new Date(result.scannedAt).toLocaleString('de-DE')}  ·  leoncordts.de`, W / 2, 30, { align: 'center' });
  doc.text(`Ziel: ${result.url}`, W / 2, 37, { align: 'center' });

  let y = 54;

  // Score section
  setFill(...PANEL_BG);
  doc.roundedRect(M, y, CW, 52, 3, 3, 'F');
  setStroke(...SLATE700);
  doc.setLineWidth(0.3);
  doc.roundedRect(M, y, CW, 52, 3, 3, 'S');

  // Score ring (drawn as concentric arcs approximation using rect bar)
  const scoreCol = gradeColor(result.grade);
  const ringX = M + 10;
  const ringY = y + 8;
  const ringW = 36;
  const ringH = 36;

  setFill(...PANEL_BG);
  doc.roundedRect(ringX, ringY, ringW, ringH, 18, 18, 'F');
  setFill(...scoreCol);
  doc.setLineWidth(3);
  setStroke(...scoreCol);
  doc.setFillColor(...scoreCol);
  doc.circle(ringX + ringW / 2, ringY + ringH / 2, 16, 'S');
  setStroke(...PANEL_BG);
  doc.setLineWidth(4);
  doc.circle(ringX + ringW / 2, ringY + ringH / 2, 10, 'S');

  setColor(...WHITE);
  setFont('bold', 14);
  doc.text(`${result.score}`, ringX + ringW / 2, ringY + ringH / 2 + 1, { align: 'center' });
  setColor(...SLATE400);
  setFont('normal', 7);
  doc.text('/100', ringX + ringW / 2, ringY + ringH / 2 + 6, { align: 'center' });

  // Grade badge
  setFill(...scoreCol);
  doc.roundedRect(ringX + ringW + 4, ringY + 6, 18, 12, 2, 2, 'F');
  setColor(...DARK_BG);
  setFont('bold', 10);
  doc.text(result.grade, ringX + ringW + 13, ringY + 14, { align: 'center' });

  // Stats
  const statsX = ringX + ringW + 28;
  const statItems = [
    { label: 'Kritisch', val: result.summary.critical, color: RED },
    { label: 'Warnungen', val: result.summary.warnings, color: YELLOW },
    { label: 'Bestanden', val: result.summary.passed, color: GREEN },
  ];
  statItems.forEach((s, i) => {
    const sx = statsX + i * 40;
    setColor(...(s.color as [number, number, number]));
    setFont('bold', 16);
    doc.text(`${s.val}`, sx, y + 24, { align: 'left' });
    setColor(...SLATE400);
    setFont('normal', 7);
    doc.text(s.label, sx, y + 30);
  });

  // Domain info
  setColor(...SLATE400);
  setFont('normal', 8);
  doc.text(`Domain: ${result.domain}`, M + 10, y + 42);
  if (result.ip) doc.text(`IP: ${result.ip}`, M + 10, y + 48);
  doc.text(`Checks durchgeführt: ${result.totalChecks}`, statsX, y + 42);

  y += 60;

  // Grouped checks
  const categories = [...new Set(result.checks.map(ch => ch.category))];

  for (const cat of categories) {
    const catChecks = result.checks.filter(ch => ch.category === cat);
    if (y > 260) { doc.addPage(); bg(); y = 20; }

    // Category header
    setFill(...PANEL_BG);
    doc.rect(M, y, CW, 8, 'F');
    setFill(...CYAN);
    doc.rect(M, y, 2, 8, 'F');
    setColor(...CYAN);
    setFont('bold', 8);
    doc.text(cat.toUpperCase(), M + 5, y + 5.5);
    y += 10;

    for (const ch of catChecks) {
      if (y > 268) { doc.addPage(); bg(); y = 20; }
      const col = statusColor(ch.status);
      const icon = statusIcon(ch.status);

      // Row bg
      setFill(...PANEL_BG);
      doc.rect(M, y, CW, 14, 'F');
      setStroke(...SLATE700);
      doc.setLineWidth(0.2);
      doc.rect(M, y, CW, 14, 'S');

      // Status indicator
      setFill(...col);
      doc.rect(M, y, 2, 14, 'F');

      setColor(...col);
      setFont('bold', 9);
      doc.text(icon, M + 5, y + 9);

      setColor(...WHITE);
      setFont('bold', 8);
      doc.text(ch.title, M + 12, y + 5.5);

      setColor(...SLATE400);
      setFont('normal', 7);
      const valText = ch.value ? `→ ${ch.value}` : '';
      if (valText) doc.text(valText.slice(0, 70), M + 12, y + 10);

      // Recommendation
      if (ch.status !== 'secure') {
        setColor(...col);
        setFont('normal', 6.5);
        const recText = `Empfehlung: ${ch.recommendation}`.slice(0, 100);
        doc.text(recText, M + 12, y + 14.5);
        y += 3;
      }

      y += 16;
    }
    y += 4;
  }

  // CTA / Footer on last page
  if (y > 240) { doc.addPage(); bg(); y = 20; }

  setFill(...PANEL_BG);
  doc.roundedRect(M, y, CW, 38, 3, 3, 'F');
  setStroke(...CYAN);
  doc.setLineWidth(0.5);
  doc.roundedRect(M, y, CW, 38, 3, 3, 'S');

  setColor(...CYAN);
  setFont('bold', 10);
  doc.text('⚠  HANDLUNGSEMPFEHLUNG', M + 8, y + 9);

  setColor(...WHITE);
  setFont('normal', 8);
  const ctaText = result.summary.critical > 0
    ? `Es wurden ${result.summary.critical} kritische Sicherheitslücken gefunden, die sofortige Aufmerksamkeit erfordern. Jede Stunde Verzögerung erhöht das Angriffsrisiko.`
    : result.summary.warnings > 0
      ? `${result.summary.warnings} Sicherheitswarnungen wurden identifiziert. Eine professionelle Härtung Ihrer Website schützt Ihr Business und stärkt das Kundenvertrauen.`
      : 'Ihre Website zeigt eine gute Sicherheitsbasis. Ein professionelles Security-Review sichert diesen Status langfristig ab.';
  const ctaLines = doc.splitTextToSize(ctaText, CW - 16);
  doc.text(ctaLines, M + 8, y + 16);

  setColor(...CYAN);
  setFont('bold', 8);
  doc.text('Kontakt:', M + 8, y + 30);
  setColor(...WHITE);
  setFont('normal', 8);
  doc.text('Leon Cordts IT Solutions  |  kontakt@leoncordts.de  |  +49 221 4758054  |  leoncordts.de', M + 28, y + 30);

  // Footer
  const totalPages = (doc as unknown as { internal: { getNumberOfPages(): number } }).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    setColor(...SLATE700);
    setFont('normal', 6.5);
    doc.text(`© ${new Date().getFullYear()} Leon Cordts IT Solutions · leoncordts.de`, M, 291);
    doc.text(`Seite ${i} / ${totalPages}`, W - M, 291, { align: 'right' });
    doc.setLineWidth(0.2);
    setStroke(...SLATE700);
    doc.line(M, 287, W - M, 287);
  }

  doc.save(`Security-Audit_${result.domain}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

