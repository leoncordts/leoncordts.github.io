import type { ReactNode } from 'react';

export const metadata = {
  title: 'Security Auditor | Leon Cordts IT Solutions',
  description: 'Kostenloser Website Security Audit — SSL, HTTP-Header, Information Disclosure, DNS Blacklist in Sekunden.',
};

export default function SecurityAuditorLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
