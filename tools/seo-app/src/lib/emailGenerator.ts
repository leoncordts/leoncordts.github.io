import type { AuditResult, SeoCheck } from "./seoTypes";

function extractDomain(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
}

function extractBusinessName(url: string): string {
  const domain = extractDomain(url);
  const parts = domain.replace(/^www\./, "").split(".");
  const name = parts[0];
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function generateOutreachEmail(
  result: AuditResult,
  agencyName: string
): string {
  const domain = extractDomain(result.url);
  const businessName = extractBusinessName(result.url);

  const passed = result.checks.filter((c) => c.status === "green");
  const critical = result.checks.filter((c) => c.status === "red");
  const warnings = result.checks.filter((c) => c.status === "yellow");
  const topIssues: SeoCheck[] = [...critical, ...warnings].slice(0, 3);

  const positivePoints = passed.slice(0, 2).map((c) => `• ${c.title}`).join("\n");

  const issueLines = topIssues
    .map((c) => {
      const severity = c.status === "red" ? "kritisch" : "verbesserungswürdig";
      return `• ${c.title} (${severity}): ${c.businessImpact}`;
    })
    .join("\n\n");

  const scoreComment =
    result.score >= 80
      ? `Ihr SEO-Score von ${result.score}/100 ist bereits stark — mit gezielten Optimierungen können Sie die letzten Prozentpunkte herausholen.`
      : result.score >= 50
      ? `Ihr aktueller SEO-Score liegt bei ${result.score}/100 — es gibt konkrete, schnell umsetzbare Maßnahmen, um diesen deutlich zu verbessern.`
      : `Ihr SEO-Score von nur ${result.score}/100 zeigt, dass hier dringender Handlungsbedarf besteht — und gleichzeitig enormes Wachstumspotenzial.`;

  const greeting =
    topIssues.length === 0
      ? `Ihre Website ${domain} macht bereits vieles richtig!`
      : `ich habe Ihre Website ${domain} analysiert und möchte Ihnen kurz zeigen, wo Sie mit wenig Aufwand mehr Kunden online gewinnen können.`;

  return `Betreff: Kostenlose SEO-Analyse für ${domain} – ${result.score}/100 Punkte

Guten Tag,

${greeting}

${scoreComment}

✅ Was bereits gut funktioniert:
${positivePoints || "• Ihre Seite ist technisch erreichbar und wird von Google indexiert."}

${topIssues.length > 0 ? `⚠️ Die wichtigsten Optimierungspotenziale:

${issueLines}

Diese Punkte lassen sich mit professioneller Unterstützung schnell und nachhaltig beheben.` : "Herzlichen Glückwunsch — Ihre Seite ist technisch hervorragend aufgestellt!"}

Ich würde mich freuen, Ihnen in einem kostenlosen 20-minütigen Beratungsgespräch zu zeigen, wie wir diese Potenziale konkret für Ihr Unternehmen nutzen können — ohne technisches Vorwissen Ihrerseits.

Hätten Sie diese oder nächste Woche kurz Zeit für ein kurzes Gespräch?

Mit freundlichen Grüßen,

${agencyName}

---
Diese Analyse wurde mit dem Lokalen SEO-Audit-Generator erstellt.
Analysiert am: ${new Date(result.analyzedAt).toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })}`;
}
