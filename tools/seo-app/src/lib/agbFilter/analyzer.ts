import { RED_FLAGS, type RedFlagCategory } from "./redFlags";

export interface MatchResult {
  flagId: string;
  category: RedFlagCategory;
  label: string;
  explanation: string;
  severity: "high" | "medium" | "low";
  matchedText: string;
  context: string;
  position: number;
}

export interface AnalysisResult {
  totalMatches: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  matches: MatchResult[];
  riskScore: number;
  riskLabel: "Niedrig" | "Mittel" | "Hoch" | "Kritisch";
}

function extractSentence(text: string, index: number, matchLength: number): string {
  const sentenceStart = Math.max(0, text.lastIndexOf(".", index - 1) + 1);
  const sentenceEnd = text.indexOf(".", index + matchLength);
  const end = sentenceEnd === -1 ? Math.min(text.length, index + matchLength + 120) : sentenceEnd + 1;
  return text.slice(sentenceStart, end).trim();
}

export function analyzeText(rawText: string): AnalysisResult {
  const text = rawText.replace(/\s+/g, " ").trim();
  const seen = new Set<string>();
  const matches: MatchResult[] = [];

  for (const flag of RED_FLAGS) {
    const regex = new RegExp(flag.pattern.source, flag.pattern.flags.includes("g") ? flag.pattern.flags : flag.pattern.flags + "g");
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const dedupeKey = `${flag.id}:${match.index}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      const context = extractSentence(text, match.index, match[0].length);

      // Avoid near-duplicate contexts for the same flag
      const contextKey = `${flag.id}:${context.slice(0, 60)}`;
      if (seen.has(contextKey)) continue;
      seen.add(contextKey);

      matches.push({
        flagId: flag.id,
        category: flag.category,
        label: flag.label,
        explanation: flag.explanation,
        severity: flag.severity,
        matchedText: match[0],
        context,
        position: match.index,
      });
    }
  }

  matches.sort((a, b) => {
    const sev = { high: 0, medium: 1, low: 2 };
    return sev[a.severity] - sev[b.severity] || a.position - b.position;
  });

  const highCount = matches.filter((m) => m.severity === "high").length;
  const mediumCount = matches.filter((m) => m.severity === "medium").length;
  const lowCount = matches.filter((m) => m.severity === "low").length;

  const rawScore = highCount * 3 + mediumCount * 1.5 + lowCount * 0.5;
  const riskScore = Math.min(100, Math.round(rawScore * 6.25));

  let riskLabel: AnalysisResult["riskLabel"];
  if (riskScore <= 15) riskLabel = "Niedrig";
  else if (riskScore <= 40) riskLabel = "Mittel";
  else if (riskScore <= 70) riskLabel = "Hoch";
  else riskLabel = "Kritisch";

  return {
    totalMatches: matches.length,
    highCount,
    mediumCount,
    lowCount,
    matches,
    riskScore,
    riskLabel,
  };
}
