"use client";
import { useState } from "react";

type Compat = "green" | "yellow" | "red";

interface Hub { id: string; name: string; icon: string; }
interface Device { id: string; name: string; icon: string; }
interface CompatEntry { status: Compat; reason: string; }

const HUBS: Hub[] = [
  { id: "alexa", name: "Amazon Echo / Alexa", icon: "🔵" },
  { id: "alexa-zigbee", name: "Amazon Echo (mit Zigbee-Hub)", icon: "🔵" },
  { id: "homekit", name: "Apple HomeKit / HomePod", icon: "🍎" },
  { id: "google", name: "Google Home / Nest", icon: "🟡" },
  { id: "hue", name: "Philips Hue Bridge", icon: "💡" },
  { id: "fritzbox", name: "AVM FritzBox (DECT)", icon: "📡" },
  { id: "homematic", name: "Homematic IP", icon: "🏠" },
];

const DEVICES: Device[] = [
  { id: "matter-wifi", name: "Matter (WLAN)", icon: "✳️" },
  { id: "matter-thread", name: "Matter über Thread", icon: "🧵" },
  { id: "zigbee", name: "Zigbee 3.0", icon: "⚡" },
  { id: "tuya-wlan", name: "Tuya / WLAN-Gerät", icon: "📶" },
  { id: "zwave", name: "Z-Wave", icon: "🌀" },
  { id: "dect-ule", name: "DECT ULE (Fritz!DECT)", icon: "📞" },
  { id: "bluetooth", name: "Bluetooth / BLE", icon: "📘" },
  { id: "hue-native", name: "Philips Hue (nativ)", icon: "💡" },
];

// Hub × Device compatibility matrix
const MATRIX: Record<string, Record<string, CompatEntry>> = {
  alexa: {
    "matter-wifi": { status: "green", reason: "Amazon Echo unterstützt Matter nativ über WLAN." },
    "matter-thread": { status: "yellow", reason: "Thread-Geräte benötigen einen kompatiblen Thread-Borderrouter (z.B. Echo 4. Gen. oder HomePod mini als Brücke)." },
    zigbee: { status: "red", reason: "Echo ohne Zigbee-Hub hat keinen Zigbee-Empfänger. Gerät mit Zigbee-Hub wählen!" },
    "tuya-wlan": { status: "yellow", reason: "Viele Tuya-Geräte lassen sich über die Tuya Smart-App mit Alexa koppeln, aber nicht direkt." },
    zwave: { status: "red", reason: "Alexa unterstützt Z-Wave nicht ohne externer Bridge (z.B. Aeotec SmartThings)." },
    "dect-ule": { status: "red", reason: "DECT ULE ist ein FritzBox-proprietärer Standard. Nicht kompatibel mit Alexa." },
    bluetooth: { status: "yellow", reason: "Einige Bluetooth-Geräte können über die Alexa-App verbunden werden, aber Funktionsumfang ist begrenzt." },
    "hue-native": { status: "yellow", reason: "Hue-Geräte funktionieren mit Alexa, benötigen aber eine Philips Hue Bridge." },
  },
  "alexa-zigbee": {
    "matter-wifi": { status: "green", reason: "Echo mit Zigbee-Hub unterstützt Matter nativ." },
    "matter-thread": { status: "yellow", reason: "Thread benötigt kompatiblen Borderrouter. Echo mit Zigbee-Hub fungiert nicht automatisch als Thread-Router." },
    zigbee: { status: "green", reason: "Echo mit integriertem Zigbee-Hub verbindet Zigbee 3.0-Geräte direkt." },
    "tuya-wlan": { status: "yellow", reason: "Tuya-Geräte verbinden sich über die Cloud-App, nicht direkt per Zigbee." },
    zwave: { status: "red", reason: "Z-Wave wird auch mit Zigbee-Hub nicht unterstützt." },
    "dect-ule": { status: "red", reason: "DECT ULE ist FritzBox-proprietär." },
    bluetooth: { status: "yellow", reason: "Begrenzte Bluetooth-Unterstützung über die Alexa-App." },
    "hue-native": { status: "green", reason: "Hue-Geräte können direkt über den Zigbee-Hub ohne Hue Bridge verbunden werden." },
  },
  homekit: {
    "matter-wifi": { status: "green", reason: "Apple HomeKit unterstützt Matter nativ seit iOS 16." },
    "matter-thread": { status: "green", reason: "HomePod mini und Apple TV 4K fungieren als Thread-Borderrouter — perfekte Kombination!" },
    zigbee: { status: "red", reason: "Apple HomeKit unterstützt kein direktes Zigbee. Du benötigst eine Matter-fähige Zigbee-Bridge." },
    "tuya-wlan": { status: "red", reason: "Standard-Tuya-Geräte sind nicht HomeKit-kompatibel. Nur spezielle 'Works with Apple HomeKit'-Versionen funktionieren." },
    zwave: { status: "red", reason: "Z-Wave wird von HomeKit nicht direkt unterstützt." },
    "dect-ule": { status: "red", reason: "DECT ULE ist FritzBox-proprietär und nicht mit HomeKit kompatibel." },
    bluetooth: { status: "yellow", reason: "HomeKit unterstützt Bluetooth, aber die Geräte-Kompatibilität ist sehr eingeschränkt." },
    "hue-native": { status: "green", reason: "Philips Hue unterstützt HomeKit nativ über die Hue Bridge." },
  },
  google: {
    "matter-wifi": { status: "green", reason: "Google Home unterstützt Matter nativ." },
    "matter-thread": { status: "green", reason: "Nest Hub 2. Gen. und Nest WiFi Pro sind Thread-Borderrouter." },
    zigbee: { status: "red", reason: "Google Home unterstützt Zigbee nicht direkt. Eine Matter-Bridge ist erforderlich." },
    "tuya-wlan": { status: "yellow", reason: "Viele Tuya-Geräte sind mit Google Home über die Cloud kompatibel." },
    zwave: { status: "red", reason: "Z-Wave wird von Google Home nicht unterstützt." },
    "dect-ule": { status: "red", reason: "DECT ULE ist FritzBox-proprietär." },
    bluetooth: { status: "yellow", reason: "Begrenzte Bluetooth-Unterstützung." },
    "hue-native": { status: "green", reason: "Philips Hue funktioniert mit Google Home nativ." },
  },
  hue: {
    "matter-wifi": { status: "green", reason: "Die neue Hue Bridge v2 unterstützt Matter." },
    "matter-thread": { status: "yellow", reason: "Thread-Geräte benötigen einen kompatiblen Thread-Router — die Hue Bridge ist keiner." },
    zigbee: { status: "green", reason: "Philips Hue Bridge ist eine Zigbee-Bridge. Viele Zigbee-3.0-Geräte sind kompatibel." },
    "tuya-wlan": { status: "red", reason: "Tuya WLAN-Geräte sind nicht mit der Hue Bridge kompatibel." },
    zwave: { status: "red", reason: "Z-Wave wird von der Hue Bridge nicht unterstützt." },
    "dect-ule": { status: "red", reason: "DECT ULE ist FritzBox-proprietär." },
    bluetooth: { status: "red", reason: "Bluetooth-Geräte können nicht direkt mit der Hue Bridge verbunden werden." },
    "hue-native": { status: "green", reason: "Hue-Geräte sind natürlich vollständig mit der Hue Bridge kompatibel." },
  },
  fritzbox: {
    "matter-wifi": { status: "yellow", reason: "FritzBox selbst ist keine Matter-Zentrale. Du benötigst einen zusätzlichen Matter-Controller." },
    "matter-thread": { status: "red", reason: "FritzBox unterstützt Thread/Matter nicht." },
    zigbee: { status: "red", reason: "FritzBox hat keinen Zigbee-Empfänger." },
    "tuya-wlan": { status: "yellow", reason: "Tuya-Geräte laufen über WLAN und brauchen die FritzBox nur als Router, benötigen aber eine eigene App/Cloud." },
    zwave: { status: "red", reason: "Z-Wave wird von der FritzBox nicht unterstützt." },
    "dect-ule": { status: "green", reason: "Fritz!DECT-Geräte (Steckdosen, Thermostate) sind vollständig kompatibel — perfekte Kombination!" },
    bluetooth: { status: "red", reason: "Bluetooth-Heimautomatisierungsgeräte werden von der FritzBox nicht unterstützt." },
    "hue-native": { status: "yellow", reason: "Hue-Geräte laufen über ihre eigene Bridge und WLAN — FritzBox fungiert nur als Router." },
  },
  homematic: {
    "matter-wifi": { status: "red", reason: "Homematic IP verwendet ein proprietäres Funkprotokoll (868 MHz). Matter wird nicht unterstützt." },
    "matter-thread": { status: "red", reason: "Thread wird von Homematic IP nicht unterstützt." },
    zigbee: { status: "red", reason: "Zigbee wird von Homematic IP nicht unterstützt." },
    "tuya-wlan": { status: "red", reason: "Tuya-Geräte sind nicht mit Homematic IP kompatibel." },
    zwave: { status: "red", reason: "Z-Wave wird von Homematic IP nicht unterstützt." },
    "dect-ule": { status: "red", reason: "DECT ULE wird von Homematic IP nicht unterstützt." },
    bluetooth: { status: "red", reason: "Bluetooth-Automatisierungsgeräte sind mit Homematic IP nicht kompatibel." },
    "hue-native": { status: "yellow", reason: "Über Homematic IP-Skripte und IFTTT lassen sich Hue-Lichter steuern, aber das ist keine native Unterstützung." },
  },
};

const STATUS_LABELS: Record<Compat, string> = {
  green: "Passt direkt zusammen!",
  yellow: "Achtung: Mit Einschränkungen",
  red: "Inkompatibel",
};

const STATUS_COLORS: Record<Compat, { bg: string; border: string; text: string; emoji: string }> = {
  green: { bg: "bg-green-950/30", border: "border-green-700/50", text: "text-green-300", emoji: "✅" },
  yellow: { bg: "bg-amber-950/30", border: "border-amber-700/50", text: "text-amber-300", emoji: "⚠️" },
  red: { bg: "bg-red-950/30", border: "border-red-700/50", text: "text-red-300", emoji: "❌" },
};

export default function SmartHomeCheckerPage() {
  const [hub, setHub] = useState<string | null>(null);
  const [device, setDevice] = useState<string | null>(null);

  const result = hub && device ? MATRIX[hub]?.[device] : null;

  return (
    <main className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800/60 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <a href="/tools" className="text-blue-400 text-sm hover:text-blue-300 transition">← Tools</a>
          <span className="text-slate-700">/</span>
          <span className="text-slate-500 text-sm font-mono">smart-home-checker</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-900/30 border border-blue-700/40 text-blue-300 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Statische Datenbank · Kein Login · Für Laien
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            Smart Home <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Checker</span>
          </h1>
          <p className="text-slate-400">Passt dein neues Gerät zu deiner Zentrale? Finde es in 10 Sekunden heraus.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Hub */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-800">
              <span className="font-bold text-slate-200">Schritt 1: Was ist deine Zentrale?</span>
            </div>
            <div className="flex flex-col p-3 gap-1.5">
              {HUBS.map((h) => (
                <button key={h.id} onClick={() => setHub(h.id)}
                  className={`text-left px-4 py-3 rounded-xl transition flex items-center gap-3 ${hub === h.id ? "bg-blue-700 text-white" : "hover:bg-slate-800 text-slate-300"}`}>
                  <span className="text-xl">{h.icon}</span>
                  <span className="font-semibold text-sm">{h.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Device */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-800">
              <span className="font-bold text-slate-200">Schritt 2: Was möchtest du kaufen?</span>
            </div>
            <div className="flex flex-col p-3 gap-1.5">
              {DEVICES.map((d) => (
                <button key={d.id} onClick={() => setDevice(d.id)}
                  className={`text-left px-4 py-3 rounded-xl transition flex items-center gap-3 ${device === d.id ? "bg-cyan-700 text-white" : "hover:bg-slate-800 text-slate-300"}`}>
                  <span className="text-xl">{d.icon}</span>
                  <span className="font-semibold text-sm">{d.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Result */}
        {result ? (
          <div className={`border rounded-2xl p-6 ${STATUS_COLORS[result.status].bg} ${STATUS_COLORS[result.status].border}`}>
            <div className="flex items-start gap-4">
              <span className="text-5xl">{STATUS_COLORS[result.status].emoji}</span>
              <div>
                <h2 className={`text-xl font-black mb-1 ${STATUS_COLORS[result.status].text}`}>
                  {STATUS_LABELS[result.status]}
                </h2>
                <p className="text-slate-300 text-sm">{result.reason}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-slate-800 rounded-2xl py-10 text-center text-slate-600">
            Wähle oben Zentrale und Gerät aus.
          </div>
        )}

        {/* CTA */}
        <div className="mt-8 bg-slate-900/60 border border-slate-700 rounded-2xl p-6 text-center">
          <p className="text-slate-400 text-sm mb-3">Keine Lust auf App-Chaos, ständige Verbindungsabbrüche und Bridge-Wirrwarr?</p>
          <p className="text-slate-300 text-sm mb-4 font-semibold">Ich plane und installiere dein intelligentes Zuhause in Köln und Umgebung professionell und herstellerübergreifend.</p>
          <a href="/kontakt" className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition">
            Beratungstermin mit Leon Cordts vereinbaren →
          </a>
        </div>
      </div>
    </main>
  );
}
