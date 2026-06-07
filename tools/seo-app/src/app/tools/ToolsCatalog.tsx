"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type Tool = {
  slug: string;
  name: string;
  desc: string;
  category: string;
  icon: string;
};

const TOOLS: Tool[] = [
  // SEO & Web
  { slug: "seo-checker", name: "SEO Checker", desc: "Analysiere deine Website mit 25+ Prüfpunkten", category: "SEO & Web", icon: "🔍" },
  { slug: "security-auditor", name: "Security Auditor", desc: "Sicherheitslücken in deiner Website finden", category: "SEO & Web", icon: "🛡️" },
  { slug: "slug-generator", name: "Slug Generator", desc: "URL-freundliche Slugs aus Text erstellen", category: "SEO & Web", icon: "🔗" },
  { slug: "url-encoder", name: "URL Encoder", desc: "URLs korrekt encodieren & decodieren", category: "SEO & Web", icon: "📎" },
  // Developer
  { slug: "json-validator", name: "JSON Validator", desc: "JSON validieren, formatieren & minifizieren", category: "Developer", icon: "{ }" },
  { slug: "yaml-json-converter", name: "YAML ↔ JSON", desc: "YAML und JSON ineinander umwandeln", category: "Developer", icon: "⇄" },
  { slug: "xml-json-converter", name: "XML ↔ JSON", desc: "XML und JSON konvertieren", category: "Developer", icon: "⇄" },
  { slug: "csv-json-converter", name: "CSV ↔ JSON", desc: "CSV und JSON umwandeln", category: "Developer", icon: "⇄" },
  { slug: "base64-decoder", name: "Base64", desc: "Base64 encodieren & decodieren", category: "Developer", icon: "64" },
  { slug: "html-entities", name: "HTML Entities", desc: "HTML-Sonderzeichen en-/decodieren", category: "Developer", icon: "&amp;" },
  { slug: "jwt-decoder", name: "JWT Decoder", desc: "JWT-Tokens dekodieren & analysieren", category: "Developer", icon: "🔑" },
  { slug: "hash-generator", name: "Hash Generator", desc: "MD5, SHA-1, SHA-256 und mehr", category: "Developer", icon: "#" },
  { slug: "uuid-generator", name: "UUID Generator", desc: "Eindeutige IDs generieren (v1–v5)", category: "Developer", icon: "🆔" },
  { slug: "number-base-converter", name: "Zahlensysteme", desc: "Binär, Oktal, Dezimal, Hex konvertieren", category: "Developer", icon: "01" },
  { slug: "binary-text", name: "Binary ↔ Text", desc: "Text in Binärcode umwandeln", category: "Developer", icon: "🔢" },
  { slug: "code-formatter", name: "Code Formatter", desc: "Code formatieren (JS, CSS, HTML, …)", category: "Developer", icon: "✨" },
  { slug: "regex-tester", name: "Regex Tester", desc: "Reguläre Ausdrücke testen & debuggen", category: "Developer", icon: ".*" },
  { slug: "cron-builder", name: "Cron Builder", desc: "Cron-Ausdrücke visuell erstellen", category: "Developer", icon: "⏱️" },
  { slug: "cron-helper", name: "Cron Helper", desc: "Cron-Syntax schnell nachschlagen", category: "Developer", icon: "📅" },
  { slug: "http-status-codes", name: "HTTP Status Codes", desc: "Alle HTTP-Statuscodes auf einen Blick", category: "Developer", icon: "200" },
  { slug: "mock-data-generator", name: "Mock Data Generator", desc: "Testdaten in JSON, CSV und SQL", category: "Developer", icon: "🗄️" },
  // Text & Schreiben
  { slug: "lorem-ipsum", name: "Lorem Ipsum", desc: "Blindtext in verschiedenen Varianten", category: "Text & Schreiben", icon: "📝" },
  { slug: "word-counter", name: "Word Counter", desc: "Wörter, Zeichen & Lesedauer zählen", category: "Text & Schreiben", icon: "📊" },
  { slug: "char-counter", name: "Char Counter", desc: "Zeichen mit Social-Media-Limits", category: "Text & Schreiben", icon: "Aa" },
  { slug: "case-converter", name: "Case Converter", desc: "Text in UPPER, lower, Title Case …", category: "Text & Schreiben", icon: "Aa" },
  { slug: "text-repeater", name: "Text Repeater", desc: "Text beliebig oft wiederholen", category: "Text & Schreiben", icon: "🔁" },
  { slug: "diff-checker", name: "Diff Checker", desc: "Zwei Texte vergleichen", category: "Text & Schreiben", icon: "±" },
  { slug: "text-diff", name: "Text Diff", desc: "Unterschiede im Text hervorheben", category: "Text & Schreiben", icon: "↔️" },
  { slug: "markdown-editor", name: "Markdown Editor", desc: "Markdown live schreiben & previewen", category: "Text & Schreiben", icon: "M↓" },
  { slug: "markdown-to-html", name: "Markdown → HTML", desc: "Markdown in sauberes HTML umwandeln", category: "Text & Schreiben", icon: "🌐" },
  { slug: "morse-code-converter", name: "Morse Code", desc: "Text in Morsecode übersetzen", category: "Text & Schreiben", icon: "···" },
  { slug: "list-shuffler", name: "List Shuffler", desc: "Listen mischen & sortieren", category: "Text & Schreiben", icon: "🃏" },
  // Farbe & Design
  { slug: "color-palette-generator", name: "Color Palette", desc: "Harmonische Farbpaletten generieren", category: "Farbe & Design", icon: "🎨" },
  { slug: "color-converter", name: "Color Converter", desc: "HEX, RGB, HSL ineinander umrechnen", category: "Farbe & Design", icon: "🖌️" },
  { slug: "color-contrast-checker", name: "Contrast Checker", desc: "WCAG-Kontrastverhältnisse prüfen", category: "Farbe & Design", icon: "◐" },
  { slug: "color-blindness-simulator", name: "Farbsehschwäche", desc: "Farbenblindheit simulieren", category: "Farbe & Design", icon: "👁️" },
  { slug: "css-gradient-generator", name: "CSS Gradient", desc: "Gradienten visuell erstellen", category: "Farbe & Design", icon: "🌈" },
  { slug: "css-formatter", name: "CSS Formatter", desc: "CSS formatieren & minifizieren", category: "Farbe & Design", icon: "🎯" },
  { slug: "svg-optimizer", name: "SVG Optimizer", desc: "SVG-Dateigröße reduzieren", category: "Farbe & Design", icon: "⚡" },
  { slug: "favicon-generator", name: "Favicon Generator", desc: "Favicons aus Bild oder Text erstellen", category: "Farbe & Design", icon: "🏠" },
  // Bild & Medien
  { slug: "image-compressor", name: "Image Compressor", desc: "Bilder verlustlos komprimieren", category: "Bild & Medien", icon: "📦" },
  { slug: "image-converter", name: "Image Converter", desc: "Bildformate konvertieren", category: "Bild & Medien", icon: "🔄" },
  { slug: "image-resizer", name: "Image Resizer", desc: "Bilder auf Maß skalieren", category: "Bild & Medien", icon: "📐" },
  { slug: "photo-filter", name: "Photo Filter", desc: "Instagram-Filter im Browser anwenden", category: "Bild & Medien", icon: "📸" },
  { slug: "webp-converter", name: "WebP Converter", desc: "Bilder in WebP konvertieren & zurück", category: "Bild & Medien", icon: "🌐" },
  { slug: "heic-to-jpg", name: "HEIC → JPG", desc: "iPhone-Fotos in JPG umwandeln", category: "Bild & Medien", icon: "📱" },
  { slug: "svg-to-png", name: "SVG → PNG", desc: "SVG als PNG exportieren", category: "Bild & Medien", icon: "🖼️" },
  { slug: "bg-remover", name: "Hintergrund entfernen", desc: "Hintergrund aus Fotos entfernen", category: "Bild & Medien", icon: "✂️" },
  { slug: "pfp-maker", name: "PFP Maker", desc: "Profilbilder mit Rahmen gestalten", category: "Bild & Medien", icon: "👤" },
  { slug: "exif-stripper", name: "EXIF Stripper", desc: "Metadaten aus Fotos entfernen", category: "Bild & Medien", icon: "🕵️" },
  { slug: "meme-generator", name: "Meme Generator", desc: "Memes mit eigenem Text erstellen", category: "Bild & Medien", icon: "😂" },
  { slug: "ascii-art-generator", name: "ASCII Art", desc: "Text und Bilder in ASCII umwandeln", category: "Bild & Medien", icon: "█▓▒" },
  { slug: "instant-ocr", name: "Instant OCR", desc: "Text aus Bildern extrahieren", category: "Bild & Medien", icon: "👁️" },
  // PDF
  { slug: "pdf-merger", name: "PDF Merger", desc: "Mehrere PDFs zusammenführen", category: "PDF", icon: "📄" },
  { slug: "pdf-splitter", name: "PDF Splitter", desc: "PDF in einzelne Seiten aufteilen", category: "PDF", icon: "✂️" },
  { slug: "pdf-to-image", name: "PDF → Bild", desc: "PDF-Seiten als Bilder exportieren", category: "PDF", icon: "🖼️" },
  { slug: "pdf-encryptor", name: "PDF Encryptor", desc: "PDF mit Passwort schützen", category: "PDF", icon: "🔒" },
  { slug: "pdf-watermarker", name: "PDF Watermarker", desc: "Wasserzeichen in PDF einfügen", category: "PDF", icon: "💧" },
  { slug: "pdf-rotator", name: "PDF Rotator", desc: "PDF-Seiten drehen", category: "PDF", icon: "🔃" },
  // Audio & Video
  { slug: "audio-trimmer", name: "Audio Trimmer", desc: "Audiodateien zuschneiden", category: "Audio & Video", icon: "🎵" },
  { slug: "audio-modifier", name: "Audio Modifier", desc: "Tonhöhe, Tempo & Effekte anpassen", category: "Audio & Video", icon: "🎚️" },
  { slug: "video-to-gif", name: "Video → GIF", desc: "Video-Clips in GIFs umwandeln", category: "Audio & Video", icon: "🎬" },
  { slug: "video-to-audio", name: "Video → Audio", desc: "Audio aus Video extrahieren", category: "Audio & Video", icon: "🔊" },
  { slug: "voice-recorder", name: "Voice Recorder", desc: "Aufnehmen und direkt herunterladen", category: "Audio & Video", icon: "🎤" },
  { slug: "tts-converter", name: "Text to Speech", desc: "Text vorlesen lassen", category: "Audio & Video", icon: "🔈" },
  // Netzwerk & System
  { slug: "subnet-calculator", name: "Subnet Calculator", desc: "IP-Subnetze berechnen und aufteilen", category: "Netzwerk & System", icon: "🌐" },
  { slug: "ip-scanner", name: "IP Scanner", desc: "Netzwerkgeräte scannen", category: "Netzwerk & System", icon: "📡" },
  { slug: "mac-vendor-lookup", name: "MAC Vendor Lookup", desc: "Hersteller einer MAC-Adresse ermitteln", category: "Netzwerk & System", icon: "🔎" },
  { slug: "pc-bottleneck-checker", name: "PC Bottleneck", desc: "CPU/GPU-Flaschenhals analysieren", category: "Netzwerk & System", icon: "💻" },
  { slug: "smart-home-checker", name: "Smart Home Checker", desc: "Smart-Home-Kompatibilität prüfen", category: "Netzwerk & System", icon: "🏡" },
  { slug: "input-tester", name: "Input Tester", desc: "Tastatur, Maus & Gamepad testen", category: "Netzwerk & System", icon: "🎮" },
  { slug: "windows-optimizer", name: "Windows Optimizer", desc: "Windows-Einstellungen optimieren", category: "Netzwerk & System", icon: "⚙️" },
  // Rechner & Konverter
  { slug: "unit-converter", name: "Unit Converter", desc: "Einheiten umrechnen: Länge, Gewicht …", category: "Rechner & Konverter", icon: "📏" },
  { slug: "storage-converter", name: "Storage Converter", desc: "Speichereinheiten umrechnen", category: "Rechner & Konverter", icon: "💾" },
  { slug: "percentage-calculator", name: "Prozentrechner", desc: "Prozente schnell berechnen", category: "Rechner & Konverter", icon: "%" },
  { slug: "timestamp-converter", name: "Timestamp Converter", desc: "Unix-Timestamps umrechnen", category: "Rechner & Konverter", icon: "⏰" },
  { slug: "aspect-ratio", name: "Aspect Ratio", desc: "Seitenverhältnisse berechnen", category: "Rechner & Konverter", icon: "📺" },
  { slug: "abo-rechner", name: "Abo Rechner", desc: "Monatliche & jährliche Kosten vergleichen", category: "Rechner & Konverter", icon: "💰" },
  // Sonstiges
  { slug: "password-generator", name: "Password Generator", desc: "Sichere Passwörter generieren", category: "Sonstiges", icon: "🔐" },
  { slug: "password-checker", name: "Password Checker", desc: "Passwortstärke analysieren", category: "Sonstiges", icon: "🔒" },
  { slug: "qr-creator-pro", name: "QR Creator Pro", desc: "QR-Codes mit Logo und Farben erstellen", category: "Sonstiges", icon: "▦" },
  { slug: "qr-scanner-offline", name: "QR Scanner", desc: "QR-Codes offline scannen", category: "Sonstiges", icon: "📷" },
  { slug: "pomodoro-timer", name: "Pomodoro Timer", desc: "Fokussiert arbeiten mit Pausen", category: "Sonstiges", icon: "🍅" },
  { slug: "p2p-transfer", name: "P2P Transfer", desc: "Dateien direkt übertragen ohne Server", category: "Sonstiges", icon: "📡" },
  { slug: "agb-filter", name: "AGB Filter", desc: "Wichtige Klauseln in AGBs finden", category: "Sonstiges", icon: "📋" },
];

const CATEGORIES = ["Alle", ...Array.from(new Set(TOOLS.map((t) => t.category)))];

const CATEGORY_COLORS: Record<string, string> = {
  "SEO & Web": "text-cyan-400 border-cyan-400/30 bg-cyan-400/10",
  Developer: "text-violet-400 border-violet-400/30 bg-violet-400/10",
  "Text & Schreiben": "text-amber-400 border-amber-400/30 bg-amber-400/10",
  "Farbe & Design": "text-pink-400 border-pink-400/30 bg-pink-400/10",
  "Bild & Medien": "text-green-400 border-green-400/30 bg-green-400/10",
  PDF: "text-red-400 border-red-400/30 bg-red-400/10",
  "Audio & Video": "text-orange-400 border-orange-400/30 bg-orange-400/10",
  "Netzwerk & System": "text-blue-400 border-blue-400/30 bg-blue-400/10",
  "Rechner & Konverter": "text-teal-400 border-teal-400/30 bg-teal-400/10",
  Sonstiges: "text-gray-400 border-gray-400/30 bg-gray-400/10",
};

const ACTIVE_COLORS: Record<string, string> = {
  "SEO & Web": "bg-cyan-400 text-[#020b18] border-cyan-400",
  Developer: "bg-violet-400 text-[#020b18] border-violet-400",
  "Text & Schreiben": "bg-amber-400 text-[#020b18] border-amber-400",
  "Farbe & Design": "bg-pink-400 text-[#020b18] border-pink-400",
  "Bild & Medien": "bg-green-400 text-[#020b18] border-green-400",
  PDF: "bg-red-400 text-[#020b18] border-red-400",
  "Audio & Video": "bg-orange-400 text-[#020b18] border-orange-400",
  "Netzwerk & System": "bg-blue-400 text-[#020b18] border-blue-400",
  "Rechner & Konverter": "bg-teal-400 text-[#020b18] border-teal-400",
  Sonstiges: "bg-gray-400 text-[#020b18] border-gray-400",
};

export default function ToolsCatalog() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Alle");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return TOOLS.filter((t) => {
      const matchCat = activeCategory === "Alle" || t.category === activeCategory;
      const matchSearch = !q || t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [search, activeCategory]);

  return (
    <div className="min-h-screen bg-[#020b18] text-white">
      {/* Header */}
      <div className="border-b border-white/5 bg-[#020b18]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Tool suchen…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#38bdf8]/50 focus:bg-white/8 transition-all"
            />
          </div>
          <span className="text-white/30 text-sm tabular-nums shrink-0">
            {filtered.length} Tools
          </span>
        </div>

        {/* Category tabs */}
        <div className="max-w-7xl mx-auto px-4 pb-3 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 w-max">
            {CATEGORIES.map((cat) => {
              const isActive = cat === activeCategory;
              const colorClass = isActive
                ? cat === "Alle"
                  ? "bg-[#38bdf8] text-[#020b18] border-[#38bdf8]"
                  : ACTIVE_COLORS[cat] ?? "bg-white text-[#020b18] border-white"
                : cat === "Alle"
                ? "text-white/60 border-white/10 bg-white/5 hover:bg-white/10"
                : (CATEGORY_COLORS[cat] ?? "text-white/60 border-white/10 bg-white/5") + " hover:opacity-80";
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${colorClass}`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {filtered.length === 0 ? (
          <div className="text-center text-white/30 py-24 text-sm">
            Kein Tool gefunden für &ldquo;{search}&rdquo;
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filtered.map((tool) => {
              const badgeColor = CATEGORY_COLORS[tool.category] ?? "text-gray-400 border-gray-400/20 bg-gray-400/10";
              return (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="group flex flex-col gap-2 p-3 rounded-xl border border-white/8 bg-white/3 hover:bg-white/6 hover:border-white/15 transition-all duration-200"
                >
                  <div className="text-2xl leading-none">{tool.icon}</div>
                  <div>
                    <div className="text-sm font-medium text-white/90 group-hover:text-white transition-colors leading-tight">
                      {tool.name}
                    </div>
                    <div className="text-xs text-white/40 mt-1 leading-tight line-clamp-2">
                      {tool.desc}
                    </div>
                  </div>
                  {activeCategory === "Alle" && (
                    <span className={`mt-auto text-[10px] px-1.5 py-0.5 rounded border self-start ${badgeColor}`}>
                      {tool.category}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
