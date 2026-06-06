"use client";
import { useState } from "react";

interface Tweak {
  id: string;
  name: string;
  description: string;
  script: string;
  risk: "low" | "medium" | "high";
}

interface Category {
  id: string;
  name: string;
  icon: string;
  tweaks: Tweak[];
}

const CATEGORIES: Category[] = [
  {
    id: "bloatware",
    name: "Bloatware entfernen",
    icon: "🗑️",
    tweaks: [
      { id: "candy", name: "Candy Crush & Spieleapps", description: "Entfernt vorinstallierte Spieleapps von Microsoft.", script: "Get-AppxPackage *CandyCrush* | Remove-AppxPackage\nGet-AppxPackage *MarchofEmpires* | Remove-AppxPackage\nGet-AppxPackage *king.com* | Remove-AppxPackage", risk: "low" },
      { id: "xbox", name: "Xbox-Apps", description: "Entfernt Xbox-Begleit-Apps (nicht die Xbox-Systemkomponenten).", script: "Get-AppxPackage *XboxApp* | Remove-AppxPackage\nGet-AppxPackage *XboxGameOverlay* | Remove-AppxPackage\nGet-AppxPackage *XboxIdentityProvider* | Remove-AppxPackage", risk: "low" },
      { id: "teams", name: "Microsoft Teams (vorinstalliert)", description: "Entfernt die vorinstallierte Teams-Version.", script: "Get-AppxPackage *MicrosoftTeams* | Remove-AppxPackage", risk: "low" },
      { id: "skype", name: "Skype (vorinstalliert)", description: "Entfernt die vorinstallierte Skype-App.", script: "Get-AppxPackage *Skype* | Remove-AppxPackage", risk: "low" },
      { id: "onenote", name: "OneNote (Store-Version)", description: "Entfernt OneNote aus dem Store.", script: "Get-AppxPackage *OneNote* | Remove-AppxPackage", risk: "low" },
      { id: "solitaire", name: "Solitaire Collection", description: "Entfernt Microsoft Solitaire.", script: "Get-AppxPackage *Microsoft.MicrosoftSolitaireCollection* | Remove-AppxPackage", risk: "low" },
      { id: "bing-weather", name: "Wetter, Nachrichten, Sport-Apps", description: "Entfernt Bing-basierte Info-Apps.", script: "Get-AppxPackage *BingWeather* | Remove-AppxPackage\nGet-AppxPackage *BingNews* | Remove-AppxPackage\nGet-AppxPackage *BingSports* | Remove-AppxPackage\nGet-AppxPackage *BingFinance* | Remove-AppxPackage", risk: "low" },
    ],
  },
  {
    id: "privacy",
    name: "Privatsphäre & Telemetrie",
    icon: "🔒",
    tweaks: [
      { id: "telemetry", name: "Windows-Telemetrie deaktivieren", description: "Stoppt die Übermittlung von Nutzungsdaten an Microsoft.", script: 'Set-ItemProperty -Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection" -Name "AllowTelemetry" -Value 0 -Force\nsc.exe stop DiagTrack\nsc.exe config DiagTrack start= disabled', risk: "medium" },
      { id: "cortana", name: "Cortana deaktivieren", description: "Deaktiviert Cortana vollständig.", script: 'New-Item -Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\Windows Search" -Force | Out-Null\nSet-ItemProperty -Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\Windows Search" -Name "AllowCortana" -Value 0', risk: "medium" },
      { id: "bing-search", name: "Bing-Suche im Startmenü entfernen", description: "Entfernt Web-Suchergebnisse aus der Windows-Suche.", script: 'Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Search" -Name "BingSearchEnabled" -Value 0\nSet-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Search" -Name "CortanaConsent" -Value 0', risk: "low" },
      { id: "ads", name: "Werbung & Vorschläge deaktivieren", description: "Deaktiviert personalisierte Werbung und App-Vorschläge.", script: 'Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\ContentDeliveryManager" -Name "SystemPaneSuggestionsEnabled" -Value 0\nSet-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\ContentDeliveryManager" -Name "SubscribedContent-338388Enabled" -Value 0', risk: "low" },
      { id: "location", name: "Standortdienste deaktivieren", description: "Deaktiviert den Standortzugriff systemweit.", script: 'Set-ItemProperty -Path "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\CapabilityAccessManager\\ConsentStore\\location" -Name "Value" -Value "Deny"', risk: "medium" },
    ],
  },
  {
    id: "performance",
    name: "Performance & Optimierung",
    icon: "⚡",
    tweaks: [
      { id: "startup", name: "Autostart-Programme deaktivieren", description: "Öffnet den Task-Manager direkt am Autostart-Tab.", script: "Start-Process taskmgr -ArgumentList '/0 /startup'", risk: "low" },
      { id: "visual", name: "Visuelle Effekte reduzieren", description: "Stellt Windows auf beste Performance ein (weniger Animationen).", script: '$path = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\VisualEffects"\nIf(!(Test-Path $path)){New-Item -Path $path -Force|Out-Null}\nSet-ItemProperty -Path $path -Name "VisualFXSetting" -Value 2', risk: "low" },
      { id: "hibernation", name: "Ruhezustand deaktivieren", description: "Spart Speicherplatz (entfernt hiberfil.sys).", script: "powercfg -h off", risk: "low" },
      { id: "superfetch", name: "SysMain (Superfetch) deaktivieren", description: "Bei SSDs nicht benötigt, spart RAM.", script: "sc.exe stop SysMain\nsc.exe config SysMain start= disabled", risk: "medium" },
      { id: "error-reporting", name: "Fehlerberichterstattung deaktivieren", description: "Verhindert automatische Absturzberichte an Microsoft.", script: "sc.exe stop WerSvc\nsc.exe config WerSvc start= disabled", risk: "low" },
    ],
  },
];

function riskColor(risk: Tweak["risk"]) {
  return risk === "low" ? "#22c55e" : risk === "medium" ? "#eab308" : "#ef4444";
}
function riskLabel(risk: Tweak["risk"]) {
  return risk === "low" ? "Sicher" : risk === "medium" ? "Mittel" : "Hoch";
}

export default function WindowsOptimizerPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll(cat: Category) {
    const ids = cat.tweaks.map((t) => t.id);
    const allSelected = ids.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  }

  const script = [
    "# ============================================================",
    "# Windows God-Mode & Bloatware-Killer",
    "# Generiert von leoncordts.de/tools/windows-optimizer",
    "# ACHTUNG: Als Administrator in PowerShell ausführen!",
    "# ============================================================",
    "",
    ...CATEGORIES.flatMap((cat) =>
      cat.tweaks
        .filter((t) => selected.has(t.id))
        .flatMap((t) => [
          `# --- ${t.name} ---`,
          t.script,
          "",
        ])
    ),
  ].join("\n").trim();

  function copy() {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <main className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800/60 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <a href="/tools" className="text-green-400 text-sm hover:text-green-300 transition">← Tools</a>
          <span className="text-slate-700">/</span>
          <span className="text-slate-500 text-sm font-mono">windows-optimizer</span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-900/30 border border-green-700/40 text-green-300 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            PowerShell-Skript-Generator · Kein Backend · Für Windows 10/11
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            Windows <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">God-Mode</span>
          </h1>
          <p className="text-slate-400">Wähle was dich nervt — dein PowerShell-Skript wird in Echtzeit generiert.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Tweaks */}
          <div className="flex flex-col gap-5">
            {CATEGORIES.map((cat) => (
              <div key={cat.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 cursor-pointer" onClick={() => toggleAll(cat)}>
                  <span className="font-bold text-slate-200">{cat.icon} {cat.name}</span>
                  <span className="text-xs text-slate-500 font-mono">{cat.tweaks.filter((t) => selected.has(t.id)).length}/{cat.tweaks.length} ausgewählt</span>
                </div>
                <div className="flex flex-col divide-y divide-slate-800/50">
                  {cat.tweaks.map((tweak) => (
                    <label key={tweak.id} className="flex items-start gap-3 px-5 py-3 cursor-pointer hover:bg-slate-800/30 transition">
                      <input
                        type="checkbox"
                        checked={selected.has(tweak.id)}
                        onChange={() => toggle(tweak.id)}
                        className="mt-0.5 accent-green-500 w-4 h-4 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-slate-200">{tweak.name}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded font-mono" style={{ color: riskColor(tweak.risk), background: `${riskColor(tweak.risk)}18`, border: `1px solid ${riskColor(tweak.risk)}40` }}>
                            {riskLabel(tweak.risk)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{tweak.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Script preview */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-6 self-start">
            {/* Warning */}
            <div className="bg-amber-950/30 border border-amber-700/40 rounded-xl p-4 text-sm text-amber-300 font-mono">
              ⚠️ Skript muss als <strong>Administrator</strong> in der Windows PowerShell ausgeführt werden.
            </div>

            {/* Terminal */}
            <div className="bg-slate-950 border border-green-900/50 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-green-900/30 bg-slate-900/80">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  <span className="text-xs text-slate-500 font-mono ml-2">Windows PowerShell</span>
                </div>
                <button
                  onClick={copy}
                  disabled={selected.size === 0}
                  className={`text-xs px-3 py-1 rounded-lg font-mono transition ${selected.size === 0 ? "text-slate-600 cursor-not-allowed" : copied ? "bg-green-800 text-green-200" : "bg-green-700/50 text-green-300 hover:bg-green-700"}`}
                >
                  {copied ? "✓ Kopiert!" : "Kopieren"}
                </button>
              </div>
              <div className="p-4 font-mono text-xs text-green-400 overflow-auto max-h-[500px] whitespace-pre-wrap min-h-[200px]">
                {selected.size === 0
                  ? <span className="text-slate-600">PS C:\&gt; # Bitte Tweaks auswählen…</span>
                  : script}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-5 text-center">
              <p className="text-slate-400 text-sm mb-3">
                Dir ist das Ausführen von Code zu riskant? Ich bereinige deinen Rechner professionell in Köln und Umgebung.
              </p>
              <a href="/kontakt" className="inline-block px-5 py-2.5 bg-green-700 hover:bg-green-600 text-white font-bold rounded-xl transition text-sm">
                PC-Tuning mit Leon Cordts buchen →
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
