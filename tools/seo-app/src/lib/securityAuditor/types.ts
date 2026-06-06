export type SecurityLevel = 'critical' | 'warning' | 'secure';

export type SecurityCategory =
  | 'SSL/TLS'
  | 'HTTP-Header'
  | 'Information Disclosure'
  | 'DNS & Reputation';

export interface SecurityCheck {
  id: string;
  category: SecurityCategory;
  title: string;
  status: SecurityLevel;
  value: string | null;
  description: string;
  recommendation: string;
  businessImpact: string;
}

export interface TerminalLine {
  text: string;
  type: 'info' | 'secure' | 'warning' | 'critical' | 'header' | 'divider' | 'final';
}

export interface ScanResult {
  url: string;
  domain: string;
  ip: string | null;
  scannedAt: string;
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  totalChecks: number;
  checks: SecurityCheck[];
  summary: {
    critical: number;
    warnings: number;
    passed: number;
  };
  terminalLines: TerminalLine[];
}
