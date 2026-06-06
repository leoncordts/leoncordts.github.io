export type TrafficLight = "green" | "yellow" | "red";

export interface SeoCheck {
  id: string;
  category: string;
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
  checks: SeoCheck[];
  summary: {
    critical: number;
    warnings: number;
    passed: number;
  };
}

export interface BrandingConfig {
  agencyName: string;
  logoUrl: string;
}
