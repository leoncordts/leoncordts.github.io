"use client";
import { useState, useMemo } from "react";

function ipToInt(ip: string): number {
  const parts = ip.split(".").map(Number);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function intToIp(n: number): string {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
}

function isValidIp(ip: string): boolean {
  const parts = ip.split(".");
  if (parts.length !== 4) return false;
  return parts.every((p) => { const n = parseInt(p); return !isNaN(n) && n >= 0 && n <= 255 && p === n.toString(); });
}

interface SubnetInfo {
  network: string;
  broadcast: string;
  firstHost: string;
  lastHost: string;
  hosts: number;
  mask: string;
  cidr: number;
}

function calcSubnet(ip: string, cidr: number): SubnetInfo | null {
  if (!isValidIp(ip) || cidr < 1 || cidr > 32) return null;
  const ipInt = ipToInt(ip);
  const maskInt = cidr === 32 ? 0xFFFFFFFF : (0xFFFFFFFF << (32 - cidr)) >>> 0;
  const networkInt = (ipInt & maskInt) >>> 0;
  const broadcastInt = (networkInt | (~maskInt >>> 0)) >>> 0;
  const hosts = cidr >= 31 ? Math.max(0, (broadcastInt - networkInt) - 1) : broadcastInt - networkInt - 1;
  return {
    network: intToIp(networkInt),
    broadcast: intToIp(broadcastInt),
    firstHost: cidr >= 31 ? intToIp(networkInt) : intToIp(networkInt + 1),
    lastHost: cidr >= 31 ? intToIp(broadcastInt) : intToIp(broadcastInt - 1),
    hosts: Math.max(0, hosts),
    mask: intToIp(maskInt),
    cidr,
  };
}

function CopyBtn({ value }: { value: string }) {
  const [ok, setOk] = useState(false);
  function copy() { navigator.clipboard.writeText(value); setOk(true); setTimeout(() => setOk(false), 1200); }
  return (
    <button onClick={copy} className={`ml-2 px-2 py-0.5 rounded text-xs font-mono transition ${ok ? "bg-green-900/50 text-green-400 border border-green-700/50" : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200"}`}>
      {ok ? "✓" : "Kopieren"}
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-800/60 last:border-0">
      <span className="text-slate-400 text-sm">{label}</span>
      <div className="flex items-center">
        <span className="font-mono text-slate-100 text-sm">{value}</span>
        <CopyBtn value={value} />
      </div>
    </div>
  );
}

export default function SubnetCalculatorPage() {
  const [ip, setIp] = useState("192.168.1.0");
  const [cidr, setCidr] = useState(24);

  const info = useMemo(() => calcSubnet(ip, cidr), [ip, cidr]);
  const valid = isValidIp(ip);

  return (
    <main className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800/60 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" className="text-indigo-400 text-sm hover:text-indigo-300 transition">← Tools</a>
          <span className="text-slate-700">/</span>
          <span className="text-slate-500 text-sm font-mono">subnet-calculator</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-900/50 border border-indigo-700/50 text-indigo-300 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            CIDR · Bitweise Berechnung · 100% lokal
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            Subnet-<span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Kalkulator</span>
          </h1>
          <p className="text-slate-400">IP-Adresse und CIDR eingeben — alle Netzwerkdaten sofort berechnet.</p>
        </div>

        {/* Inputs */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 mb-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">IP-Adresse</label>
              <input
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="192.168.1.0"
                className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm outline-none transition ${valid ? "border-slate-700 focus:border-indigo-500" : "border-red-700/60"}`}
              />
              {!valid && ip && <p className="text-red-400 text-xs mt-1 font-mono">Ungültige IP-Adresse</p>}
            </div>
            <div className="w-36">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">CIDR Prefix</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-mono text-sm">/</span>
                <input
                  type="number"
                  min={1} max={32}
                  value={cidr}
                  onChange={(e) => setCidr(Math.min(32, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="flex-1 bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-slate-100 font-mono text-sm outline-none transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {info ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Ergebnisse für {ip}/{cidr}</h2>
            <Row label="Subnetzmaske" value={info.mask} />
            <Row label="Netzwerk-Adresse" value={info.network} />
            <Row label="Broadcast-Adresse" value={info.broadcast} />
            <Row label="Erste nutzbare Host-IP" value={info.firstHost} />
            <Row label="Letzte nutzbare Host-IP" value={info.lastHost} />
            <Row label="Nutzbare Hosts" value={info.hosts.toLocaleString("de-DE")} />
          </div>
        ) : (
          valid ? null : (
            <div className="bg-red-950/30 border border-red-800/40 rounded-2xl p-6 text-center text-red-400 text-sm font-mono">
              Bitte eine gültige IP-Adresse eingeben.
            </div>
          )
        )}
      </div>
    </main>
  );
}
