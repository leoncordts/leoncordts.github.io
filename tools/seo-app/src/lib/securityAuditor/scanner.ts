import tls from 'node:tls';
import dns from 'node:dns/promises';
import type { SecurityCheck, ScanResult, TerminalLine } from './types';

function c(
  id: string, category: SecurityCheck['category'], title: string,
  status: SecurityCheck['status'], value: string | null,
  description: string, recommendation: string, businessImpact: string
): SecurityCheck {
  return { id, category, title, status, value, description, recommendation, businessImpact };
}

function getSSLInfo(hostname: string): Promise<{ valid: boolean; daysLeft: number; issuer: string } | null> {
  return new Promise((resolve) => {
    let done = false;
    const finish = (v: { valid: boolean; daysLeft: number; issuer: string } | null) => {
      if (done) return;
      done = true;
      resolve(v);
    };
    try {
      const socket = tls.connect(
        { host: hostname, port: 443, servername: hostname, rejectUnauthorized: false },
        () => {
          try {
            const cert = socket.getPeerCertificate();
            socket.destroy();
            if (!cert?.valid_to) { finish(null); return; }
            const daysLeft = Math.floor((new Date(cert.valid_to).getTime() - Date.now()) / 86_400_000);
            const o = cert.issuer?.O; const cn = cert.issuer?.CN;
            const issuer = (Array.isArray(o) ? o[0] : o) || (Array.isArray(cn) ? cn[0] : cn) || 'Unknown CA';
            finish({ valid: daysLeft > 0, daysLeft, issuer });
          } catch { socket.destroy(); finish(null); }
        }
      );
      socket.on('error', () => finish(null));
      socket.setTimeout(8000, () => { try { socket.destroy(); } catch { /* ignore */ } finish(null); });
    } catch { finish(null); }
  });
}

async function checkPathExposed(baseUrl: string, path: string): Promise<{ status: number; accessible: boolean }> {
  try {
    const res = await fetch(`${baseUrl}${path}`, {
      signal: AbortSignal.timeout(6000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SecurityAudit-Bot/1.0)' },
      redirect: 'follow',
    });
    return { status: res.status, accessible: res.status === 200 };
  } catch {
    return { status: 0, accessible: false };
  }
}

async function fetchHeaders(url: string): Promise<Headers | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SecurityAudit-Bot/1.0)' },
    });
    return res.headers;
  } catch { return null; }
}

async function checkHttpsRedirect(domain: string): Promise<boolean> {
  try {
    const res = await fetch(`http://${domain}`, {
      signal: AbortSignal.timeout(6000),
      redirect: 'manual',
    });
    const loc = res.headers.get('location') ?? '';
    return [301, 302, 307, 308].includes(res.status) && loc.startsWith('https://');
  } catch { return false; }
}

async function resolveDomainIP(domain: string): Promise<string | null> {
  try { return (await dns.resolve4(domain))[0] ?? null; } catch { return null; }
}

async function checkDNSBL(ip: string, server: string): Promise<boolean> {
  try {
    const reversed = ip.split('.').reverse().join('.');
    await dns.resolve4(`${reversed}.${server}`);
    return true;
  } catch { return false; }
}

function getGrade(score: number): ScanResult['grade'] {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}

const SENSITIVE_PATHS = [
  { path: '/.env',          id: 'disc-env',      name: '.env (Umgebungsvariablen)' },
  { path: '/.git/HEAD',     id: 'disc-git',      name: '.git Repository'           },
  { path: '/phpinfo.php',   id: 'disc-phpinfo',  name: 'phpinfo.php'               },
  { path: '/wp-config.php', id: 'disc-wpconfig', name: 'WordPress-Konfiguration'   },
  { path: '/backup.sql',    id: 'disc-backup',   name: 'Datenbank-Backup (.sql)'   },
];

const SECURITY_HEADERS = [
  {
    id: 'header-hsts', name: 'Strict-Transport-Security', severity: 'critical' as const,
    display: 'HSTS (HTTP Strict Transport Security)',
    rec: 'Füge "Strict-Transport-Security: max-age=31536000; includeSubDomains" hinzu.',
    impact: 'SSL-Stripping-Angriffe möglich: Angreifer können Nutzer auf unsichere HTTP-Verbindungen umleiten.',
  },
  {
    id: 'header-csp', name: 'Content-Security-Policy', severity: 'warning' as const,
    display: 'Content-Security-Policy (XSS-Schutz)',
    rec: 'Implementiere eine CSP, die erlaubte Quellen für Skripte und Styles definiert.',
    impact: 'XSS-Angriffe können Kundendaten stehlen oder die Seite zur Malware-Verbreitung missbrauchen.',
  },
  {
    id: 'header-xfo', name: 'X-Frame-Options', severity: 'warning' as const,
    display: 'X-Frame-Options (Clickjacking-Schutz)',
    rec: 'Füge "X-Frame-Options: DENY" oder "SAMEORIGIN" hinzu.',
    impact: 'Angreifer können deine Seite in unsichtbare iFrames einbetten und Klicks abfangen.',
  },
  {
    id: 'header-xcto', name: 'X-Content-Type-Options', severity: 'warning' as const,
    display: 'X-Content-Type-Options (MIME-Schutz)',
    rec: 'Füge "X-Content-Type-Options: nosniff" hinzu.',
    impact: 'Browser könnten Dateien falsch interpretieren und schädlichen Code ausführen (MIME-Sniffing).',
  },
  {
    id: 'header-rp', name: 'Referrer-Policy', severity: 'warning' as const,
    display: 'Referrer-Policy',
    rec: 'Setze "Referrer-Policy: strict-origin-when-cross-origin" oder "no-referrer".',
    impact: 'Sensible URL-Parameter können an Drittanbieter weitergegeben werden — Datenschutzrisiko.',
  },
  {
    id: 'header-pp', name: 'Permissions-Policy', severity: 'warning' as const,
    display: 'Permissions-Policy (Feature-Kontrolle)',
    rec: 'Füge eine Permissions-Policy hinzu, die unnötige Browser-APIs deaktiviert.',
    impact: 'Eingebettete Skripte könnten Kamera, Mikrofon oder Standort-APIs missbrauchen.',
  },
];

export async function auditDomain(rawUrl: string): Promise<ScanResult> {
  let url = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
  const parsed = new URL(url);
  const domain = parsed.hostname;
  const baseUrl = `${parsed.protocol}//${domain}`;
  const isHttps = url.startsWith('https://');

  // Run all independent checks in parallel
  const [ip, sslInfo, headers, httpsRedirect, ...disclosureResults] = await Promise.all([
    resolveDomainIP(domain),
    getSSLInfo(domain),
    fetchHeaders(url),
    checkHttpsRedirect(domain),
    ...SENSITIVE_PATHS.map(p => checkPathExposed(baseUrl, p.path).then(r => ({ ...p, ...r }))),
  ] as const);

  const resolvedIP = ip as string | null;

  // DNSBL needs IP — run after
  const [spamhaus, spamcop] = resolvedIP
    ? await Promise.all([checkDNSBL(resolvedIP, 'zen.spamhaus.org'), checkDNSBL(resolvedIP, 'bl.spamcop.net')])
    : [false, false];

  const checks: SecurityCheck[] = [];
  const tl: TerminalLine[] = [];
  const line = (text: string, type: TerminalLine['type'] = 'info') => tl.push({ text, type });

  // ── Terminal intro ──────────────────────────────────────────────
  line(`root@audit-bot:~$ ./security-scan --target ${domain} --deep --all-checks`, 'header');
  line('', 'info');
  line(`[INIT] Initiating deep security scan for ${domain}`, 'info');
  line(`[INIT] Scan profile: FULL | Checks: SSL · Headers · Disclosure · DNSBL`, 'info');

  // ── DNS ────────────────────────────────────────────────────────
  line('', 'info');
  line(`[DNS]  Resolving domain...`, 'header');
  if (resolvedIP) {
    line(`[DNS]  ✓ ${domain} → ${resolvedIP}`, 'secure');
  } else {
    line(`[DNS]  ✗ Domain konnte nicht aufgelöst werden`, 'critical');
  }

  // ── SSL/TLS ────────────────────────────────────────────────────
  line('', 'info');
  line(`[SSL]  Connecting to ${domain}:443...`, 'header');

  if (!isHttps) {
    checks.push(c('ssl-https', 'SSL/TLS', 'HTTPS-Protokoll', 'critical', 'HTTP (unverschlüsselt)',
      'Website läuft über unverschlüsseltes HTTP.',
      'Wechsle sofort zu HTTPS — SSL-Zertifikate sind kostenlos (Let\'s Encrypt).',
      'Kundendaten werden im Klartext übertragen. Browser warnen aktiv vor "Nicht sicher".'));
    line('[SSL]  ✗ CRITICAL: Site läuft über HTTP — keine Verschlüsselung!', 'critical');
  } else {
    checks.push(c('ssl-https', 'SSL/TLS', 'HTTPS-Protokoll', 'secure', 'HTTPS aktiv',
      'Website läuft sicher über HTTPS.', 'Weiter so!',
      'Verschlüsselte Verbindung schützt Kundendaten und ist Google-Rankingfaktor.'));
    line('[SSL]  ✓ HTTPS aktiv — Verbindung verschlüsselt', 'secure');
  }

  if (httpsRedirect) {
    checks.push(c('ssl-redirect', 'SSL/TLS', 'HTTP→HTTPS Weiterleitung', 'secure', '301 Redirect aktiv',
      'HTTP-Traffic wird automatisch zu HTTPS weitergeleitet.', 'Weiter so!',
      'Verhindert unverschlüsselte Zugriffe — MITM-Angriffe werden abgeblockt.'));
    line('[SSL]  ✓ HTTP→HTTPS Redirect konfiguriert (301)', 'secure');
  } else {
    checks.push(c('ssl-redirect', 'SSL/TLS', 'HTTP→HTTPS Weiterleitung', 'warning', 'Kein HTTP-Redirect',
      'HTTP-Traffic wird nicht zu HTTPS weitergeleitet.',
      'Konfiguriere eine 301-Weiterleitung von HTTP zu HTTPS im Webserver.',
      'Nutzer können versehentlich unverschlüsselt zugreifen — Man-in-the-Middle-Angriffe möglich.'));
    line('[SSL]  ⚠ WARNING: Kein HTTP→HTTPS Redirect konfiguriert', 'warning');
  }

  if (sslInfo) {
    if (!sslInfo.valid) {
      checks.push(c('ssl-expiry', 'SSL/TLS', 'SSL-Zertifikat Ablaufdatum', 'critical', 'ABGELAUFEN',
        'Das SSL-Zertifikat ist abgelaufen!', 'Erneuere das SSL-Zertifikat sofort.',
        'Browser blockieren den Zugang komplett — 100% der Besucher sehen eine Sicherheitswarnung.'));
      line('[SSL]  ✗ CRITICAL: Zertifikat ABGELAUFEN — Besucher sehen Sicherheitswarnung!', 'critical');
    } else if (sslInfo.daysLeft < 14) {
      checks.push(c('ssl-expiry', 'SSL/TLS', 'SSL-Zertifikat Ablaufdatum', 'critical', `Läuft in ${sslInfo.daysLeft} Tagen ab`,
        `Zertifikat läuft in ${sslInfo.daysLeft} Tagen ab — kritisch!`, 'Erneuere das Zertifikat sofort.',
        'In wenigen Tagen sehen alle Besucher eine Sicherheitswarnung — totaler Traffic-Verlust.'));
      line(`[SSL]  ✗ CRITICAL: Zertifikat läuft in ${sslInfo.daysLeft} Tagen ab!`, 'critical');
    } else if (sslInfo.daysLeft < 30) {
      checks.push(c('ssl-expiry', 'SSL/TLS', 'SSL-Zertifikat Ablaufdatum', 'warning', `Läuft in ${sslInfo.daysLeft} Tagen ab`,
        `Zertifikat läuft in ${sslInfo.daysLeft} Tagen ab.`, 'Plane die Zertifikatserneuerung jetzt.',
        'Zertifikatsablauf führt zu Browser-Warnungen und Traffic-Verlust.'));
      line(`[SSL]  ⚠ WARNING: Zertifikat läuft in ${sslInfo.daysLeft} Tagen ab`, 'warning');
    } else {
      checks.push(c('ssl-expiry', 'SSL/TLS', 'SSL-Zertifikat Ablaufdatum', 'secure', `Gültig (${sslInfo.daysLeft} Tage)`,
        `Zertifikat läuft erst in ${sslInfo.daysLeft} Tagen ab.`, 'Weiter so!',
        'Gültiges Zertifikat gewährleistet sicheren Datentransfer und Nutzervertrauen.'));
      line(`[SSL]  ✓ Zertifikat gültig — ${sslInfo.daysLeft} Tage verbleibend (${sslInfo.issuer})`, 'secure');
    }
  } else {
    checks.push(c('ssl-expiry', 'SSL/TLS', 'SSL-Zertifikat', 'critical', 'Nicht abrufbar',
      'SSL-Zertifikat konnte nicht abgerufen werden.', 'Überprüfe das SSL-Zertifikat.',
      'Kein Zertifikat bedeutet keine sichere Verbindung für Kunden.'));
    line('[SSL]  ✗ CRITICAL: Kein gültiges SSL-Zertifikat gefunden', 'critical');
  }

  // ── HTTP Headers ──────────────────────────────────────────────
  line('', 'info');
  line('[HTTP] Analysiere Security-Header...', 'header');

  for (const h of SECURITY_HEADERS) {
    const val = headers?.get(h.name) ?? null;
    if (!val) {
      checks.push(c(h.id, 'HTTP-Header', h.display, h.severity, 'Fehlt',
        `Header "${h.name}" ist nicht gesetzt.`, h.rec, h.impact));
      line(`[HTTP] ${h.severity === 'critical' ? '✗ CRITICAL' : '⚠ WARNING'}: ${h.name} fehlt`,
        h.severity === 'critical' ? 'critical' : 'warning');
    } else {
      checks.push(c(h.id, 'HTTP-Header', h.display, 'secure',
        val.length > 60 ? val.slice(0, 57) + '…' : val,
        `Header "${h.name}" korrekt gesetzt.`, 'Weiter so!',
        'Header schützt gegen die entsprechende Angriffsmethode.'));
      line(`[HTTP] ✓ ${h.name} gesetzt`, 'secure');
    }
  }

  // Server version disclosure
  const serverVal = headers?.get('server') ?? headers?.get('x-powered-by') ?? null;
  if (serverVal && /\d/.test(serverVal)) {
    checks.push(c('header-server', 'HTTP-Header', 'Server-Version Disclosure', 'warning', serverVal,
      `Server gibt Versionsinformationen preis: "${serverVal}".`,
      'Entferne oder verschleiere den Server-Header im Webserver.',
      'Versionsnummern erlauben Angreifern, bekannte CVEs gezielt auszunutzen.'));
    line(`[HTTP] ⚠ WARNING: Server-Header gibt Version preis: "${serverVal}"`, 'warning');
  } else {
    checks.push(c('header-server', 'HTTP-Header', 'Server-Version Disclosure', 'secure',
      serverVal ?? 'Nicht gesetzt',
      'Server-Header gibt keine Versionsinformationen preis.', 'Weiter so!',
      'Keine unnötigen Fingerprinting-Infos für Angreifer.'));
    line('[HTTP] ✓ Kein Versions-Fingerprinting im Server-Header', 'secure');
  }

  // ── Information Disclosure ────────────────────────────────────
  line('', 'info');
  line('[DISC] Scanne exponierte Dateien und Pfade...', 'header');

  for (const result of disclosureResults as Array<typeof SENSITIVE_PATHS[0] & { status: number; accessible: boolean }>) {
    if (result.accessible) {
      checks.push(c(result.id, 'Information Disclosure', result.name, 'critical',
        `HTTP 200 — EXPONIERT!`,
        `Kritisch: "${result.path}" ist öffentlich zugänglich (HTTP 200).`,
        `Blockiere sofort den Zugriff auf "${result.path}" via .htaccess oder Webserver-Konfiguration.`,
        'Sensible Daten (Passwörter, API-Keys, Datenbankzugangsdaten) sind öffentlich zugänglich!'));
      line(`[DISC] ✗ CRITICAL: ${result.path} ist öffentlich zugänglich! (HTTP 200)`, 'critical');
    } else {
      checks.push(c(result.id, 'Information Disclosure', result.name, 'secure',
        `Nicht zugänglich (HTTP ${result.status || 'blocked'})`,
        `"${result.path}" ist nicht öffentlich zugänglich.`, 'Weiter so!',
        'Sensible Dateien sind nicht exponiert.'));
      line(`[DISC] ✓ ${result.path} nicht zugänglich`, 'secure');
    }
  }

  // ── DNS & Reputation ──────────────────────────────────────────
  line('', 'info');
  line('[DNSBL] Prüfe IP-Reputation in globalen Blacklists...', 'header');

  if (resolvedIP) {
    if (spamhaus) {
      checks.push(c('dnsbl-spamhaus', 'DNS & Reputation', 'Spamhaus ZEN Blacklist', 'critical',
        `${resolvedIP} — GELISTET`,
        `IP ${resolvedIP} ist in der Spamhaus ZEN Blacklist.`,
        'Kontaktiere deinen Hosting-Anbieter und beantrage die Entfernung aus der Blacklist.',
        'E-Mails werden von den meisten Mailservern geblockt — Kundenkommunikation unmöglich.'));
      line(`[DNSBL] ✗ CRITICAL: ${resolvedIP} ist in Spamhaus ZEN gelistet!`, 'critical');
    } else {
      checks.push(c('dnsbl-spamhaus', 'DNS & Reputation', 'Spamhaus ZEN Blacklist', 'secure',
        `${resolvedIP} — Sauber`,
        'IP ist nicht in der Spamhaus ZEN Blacklist.', 'Weiter so!',
        'Gute IP-Reputation gewährleistet E-Mail-Zustellbarkeit.'));
      line(`[DNSBL] ✓ ${resolvedIP} nicht in Spamhaus ZEN`, 'secure');
    }
    if (spamcop) {
      checks.push(c('dnsbl-spamcop', 'DNS & Reputation', 'SpamCop Blacklist', 'critical',
        `${resolvedIP} — GELISTET`,
        `IP ${resolvedIP} ist in der SpamCop Blacklist.`,
        'Prüfe auf kompromittierte E-Mail-Konten und kontaktiere SpamCop.',
        'E-Mail-Kommunikation mit Kunden wird geblockt — direkter Geschäftsschaden.'));
      line(`[DNSBL] ✗ CRITICAL: ${resolvedIP} ist in SpamCop gelistet!`, 'critical');
    } else {
      checks.push(c('dnsbl-spamcop', 'DNS & Reputation', 'SpamCop Blacklist', 'secure',
        `${resolvedIP} — Sauber`,
        'IP ist nicht in der SpamCop Blacklist.', 'Weiter so!',
        'Saubere IP-Reputation sichert Geschäftskommunikation.'));
      line(`[DNSBL] ✓ ${resolvedIP} nicht in SpamCop`, 'secure');
    }
  } else {
    for (const id of ['dnsbl-spamhaus', 'dnsbl-spamcop'] as const) {
      const names = { 'dnsbl-spamhaus': 'Spamhaus ZEN Blacklist', 'dnsbl-spamcop': 'SpamCop Blacklist' };
      checks.push(c(id, 'DNS & Reputation', names[id], 'warning', 'IP nicht auflösbar',
        'Domain konnte nicht aufgelöst werden — DNSBL-Check nicht möglich.',
        'Prüfe die DNS-Konfiguration der Domain.',
        'DNS-Probleme verhindern die Zustellbarkeit von E-Mails.'));
    }
    line('[DNSBL] ⚠ WARNING: IP konnte nicht aufgelöst werden — DNSBL übersprungen', 'warning');
  }

  // ── Score & Summary ────────────────────────────────────────────
  const weights = { secure: 100, warning: 50, critical: 0 } as const;
  const score = Math.round(checks.reduce((s, ch) => s + weights[ch.status], 0) / checks.length);
  const grade = getGrade(score);
  const critical = checks.filter(ch => ch.status === 'critical').length;
  const warnings = checks.filter(ch => ch.status === 'warning').length;
  const passed = checks.filter(ch => ch.status === 'secure').length;

  line('', 'info');
  line('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'divider');
  line(`  SCAN COMPLETE  |  Score: ${score}/100  |  Grade: ${grade}  |  ${critical}✗  ${warnings}⚠  ${passed}✓`, 'final');
  line('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'divider');

  return {
    url, domain, ip: resolvedIP,
    scannedAt: new Date().toISOString(),
    score, grade,
    totalChecks: checks.length,
    checks,
    summary: { critical, warnings, passed },
    terminalLines: tl,
  };
}
