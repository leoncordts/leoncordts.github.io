export type TrafficLight = "green" | "yellow" | "red";

export const CATEGORIES = [
  "Meta-Tags",
  "Open Graph",
  "Struktur",
  "Technik & Sicherheit",
  "Barrierefreiheit & Mobil",
  "Technische SEO",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface SeoCheck {
  id: string;
  category: Category;
  title: string;
  description: string;
  status: TrafficLight;
  value: string | null;
  recommendation: string;
  businessImpact: string;
}

export interface AuditResult {
  url: string;
  analyzedAt: string;
  score: number;
  totalChecks: number;
  checks: SeoCheck[];
  summary: {
    critical: number;
    warnings: number;
    passed: number;
  };
}
