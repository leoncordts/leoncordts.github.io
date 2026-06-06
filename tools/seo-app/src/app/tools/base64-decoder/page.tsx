"use client";
import { useState, useRef } from "react";

export default function Base64DecoderPage() {
  const [base64, setBase64] = useState("");
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [encodedResult, setEncodedResult] = useState("");
  const [copiedEnc, setCopiedEnc] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function decode(val: string) {
    setBase64(val);
    setError("");
    setImgSrc(null);
    if (!val.trim()) return;
    try {
      const clean = val.trim().replace(/^data:image\/[^;]+;base64,/, "");
      atob(clean); // validate
      const src = val.startsWith("data:") ? val : `data:image/png;base64,${clean}`;
      setImgSrc(src);
    } catch {
      setError("Ungültiger Base64-String");
    }
  }

  function encodeFile(f: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setEncodedResult(result);
    };
    reader.readAsDataURL(f);
  }

  function copyEnc() {
    navigator.clipboard.writeText(encodedResult);
    setCopiedEnc(true);
    setTimeout(() => setCopiedEnc(false), 1500);
  }

  function downloadImg() {
    if (!imgSrc) return;
    const a = document.createElement("a");
    a.href = imgSrc; a.download = "decoded-image.png"; a.click();
  }

  return (
    <main className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800/60 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <a href="/tools" className="text-indigo-400 text-sm hover:text-indigo-300 transition">← Tools</a>
          <span className="text-slate-700">/</span>
          <span className="text-slate-500 text-sm font-mono">base64-decoder</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-900/50 border border-indigo-700/50 text-indigo-300 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Zwei-Wege · 100% lokal · Kein Upload
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            Base64 ↔ <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Bild Konverter</span>
          </h1>
          <p className="text-slate-400">Dekodiere Base64 zu Bildern oder enkodiere Bilder zu Base64 — lokal im Browser.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Decode */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Base64 → Bild</h2>
            <textarea
              rows={8}
              value={base64}
              onChange={(e) => decode(e.target.value)}
              placeholder="Base64-String hier einfügen (mit oder ohne data:image/... Prefix)…"
              className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-slate-200 font-mono text-xs outline-none resize-none transition placeholder-slate-600"
            />
            {error && <p className="text-red-400 text-sm font-mono">{error}</p>}
            {imgSrc && (
              <div className="flex flex-col gap-3">
                <img src={imgSrc} alt="Dekodiert" className="rounded-xl max-h-60 object-contain border border-slate-700" />
                <button onClick={downloadImg} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition">
                  ↓ Bild herunterladen
                </button>
              </div>
            )}
          </div>

          {/* Encode */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Bild → Base64</h2>
            <div
              className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-8 text-center cursor-pointer transition"
              onClick={() => fileRef.current?.click()}
            >
              <p className="text-slate-400 text-sm">Bild hier ablegen oder klicken</p>
              <p className="text-slate-600 text-xs mt-1 font-mono">PNG, JPG, GIF, WebP, SVG</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) encodeFile(e.target.files[0]); }} />
            </div>
            {encodedResult && (
              <div className="flex flex-col gap-3">
                <textarea
                  rows={6}
                  readOnly
                  value={encodedResult}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-400 font-mono text-xs resize-none"
                />
                <button onClick={copyEnc} className={`w-full py-2 text-sm font-semibold rounded-xl transition ${copiedEnc ? "bg-green-700 text-green-100" : "bg-slate-700 hover:bg-slate-600 text-slate-200"}`}>
                  {copiedEnc ? "✓ Kopiert!" : "Base64 kopieren"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
