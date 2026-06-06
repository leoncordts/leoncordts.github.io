"use client";
import { useState, useEffect } from "react";

interface IpData {
  ip: string;
  city?: string;
  country_name?: string;
  org?: string;
  timezone?: string;
}

interface SystemInfo {
  os: string;
  browser: string;
  screen: string;
  timezone: string;
  language: string;
  cores: number;
  online: boolean;
}

function detectOS(): string {
  const ua = navigator.userAgent;
  if (/Windows NT 10/.test(ua)) return "Windows 10/11";
  if (/Windows NT/.test(ua)) return "Windows";
  if (/Mac OS X/.test(ua)) return "macOS";
  if (/iPhone|iPad/.test(ua)) return "iOS";
  if (/Android/.test(ua)) return "Android";
  if (/Linux/.test(ua)) return "Linux";
  return "Unbekannt";
}

function detectBrowser(): string {
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return "Microsoft Edge";
  if (/OPR\/|Opera/.test(ua)) return "Opera";
  if (/Chrome\//.test(ua)) return "Google Chrome";
  if (/Firefox\//.test(ua)) return "Mozilla Firefox";
  if (/Safari\//.test(ua)) return "Safari";
  return "Unbekannt";
}

function getSystemInfo(): SystemInfo {
  return {
    os: detectOS(),
    browser: detectBrowser(),
    screen: `${screen.width} × ${screen.height} px`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language || "Unbekannt",
    cores: navigator.hardwareConcurrency || 0,
    online: navigator.onLine,
  };
}

function InfoCard({ icon, label, value }: { icon: string; label: string; value: string | number | boolean }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-xs text-slate-500 uppercase tracking-wider font-mono mb-1">{label}</div>
      <div className="text-slate-100 font-semibold text-sm break-all">{String(value)}</div>
    </div>
  );
}

export default function IpScannerPage() {
  const [ipData, setIpData] = useState<IpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [sysInfo, setSysInfo] = useState<SystemInfo | null>(null);

  useEffect(() => {
    setSysInfo(getSystemInfo());
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((d) => setIpData(d))
      .catch(() => {
        // fallback to ipify
        return fetch("https://api.ipify.org?format=json")
          .then((r) => r.json())
          .then((d) => setIpData({ ip: d.ip }))
          .catch(() => setError("IP konnte nicht abgerufen werden"));
      })
      .finally(() => setLoading(false));
  }, []);

  function copy() {
    if (!ipData?.ip) return;
    navigator.clipboard.writeText(ipData.ip);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <main className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800/60 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <a href="/tools" className="text-indigo-400 text-sm hover:text-indigo-300 transition">← Tools</a>
          <span className="text-slate-700">/</span>
          <span className="text-slate-500 text-sm font-mono">ip-scanner</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-900/50 border border-indigo-700/50 text-indigo-300 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Hacker-Dashboard · Kein Tracking · Kostenlos
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            IP & <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">System Scanner</span>
          </h1>
          <p className="text-slate-400">Deine öffentliche IP und Systemdaten auf einen Blick.</p>
        </div>

        {/* IP Display */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 mb-6 text-center">
          {loading ? (
            <div className="animate-pulse">
              <div className="h-16 bg-slate-800 rounded-xl mx-auto w-64 mb-4" />
              <div className="h-4 bg-slate-800 rounded w-32 mx-auto" />
            </div>
          ) : error ? (
            <p className="text-red-400 font-mono">{error}</p>
          ) : ipData ? (
            <>
              <div className="font-mono text-5xl sm:text-6xl font-black text-white tracking-tight mb-4 select-all">{ipData.ip}</div>
              {(ipData.city || ipData.country_name) && (
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-indigo-900/50 border border-indigo-700/40 text-indigo-300 rounded-full text-sm font-mono">
                    📍 {[ipData.city, ipData.country_name].filter(Boolean).join(", ")}
                  </span>
                  {ipData.org && (
                    <span className="px-3 py-1 bg-slate-800 border border-slate-700 text-slate-400 rounded-full text-sm font-mono">
                      {ipData.org.split(" ").slice(1, 3).join(" ")}
                    </span>
                  )}
                </div>
              )}
              <button
                onClick={copy}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition ${copied ? "bg-green-700 text-green-100" : "bg-indigo-600 hover:bg-indigo-500 text-white"}`}
              >
                {copied ? "✓ Kopiert!" : "IP kopieren"}
              </button>
            </>
          ) : null}
        </div>

        {/* System info */}
        {sysInfo && (
          <div>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 font-mono">Browser & System</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <InfoCard icon="💻" label="Betriebssystem" value={sysInfo.os} />
              <InfoCard icon="🌐" label="Browser" value={sysInfo.browser} />
              <InfoCard icon="🖥️" label="Auflösung" value={sysInfo.screen} />
              <InfoCard icon="🕐" label="Zeitzone" value={sysInfo.timezone} />
              <InfoCard icon="🗣️" label="Sprache" value={sysInfo.language} />
              <InfoCard icon="⚙️" label="CPU-Kerne" value={sysInfo.cores || "Unbekannt"} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
