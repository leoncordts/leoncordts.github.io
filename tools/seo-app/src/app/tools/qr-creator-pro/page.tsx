"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export default function QrCreatorProPage() {
  const [text, setText] = useState("https://leoncordts.de");
  const [dotColor, setDotColor] = useState("#00d4ff");
  const [bgColor, setBgColor] = useState("#020b18");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [size] = useState(280);
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const qrRef = useRef<any>(null);

  const buildQr = useCallback(async () => {
    if (!containerRef.current) return;
    const QRCodeStyling = (await import("qr-code-styling")).default;

    const options = {
      width: size,
      height: size,
      type: "svg" as const,
      data: text || " ",
      dotsOptions: { color: dotColor, type: "rounded" as const },
      backgroundOptions: { color: bgColor },
      cornersSquareOptions: { type: "extra-rounded" as const, color: dotColor },
      cornersDotOptions: { type: "dot" as const, color: dotColor },
      imageOptions: { crossOrigin: "anonymous", margin: 4 },
      ...(logoUrl ? { image: logoUrl } : {}),
    };

    if (qrRef.current) {
      qrRef.current.update(options);
    } else {
      qrRef.current = new QRCodeStyling(options);
      containerRef.current.innerHTML = "";
      qrRef.current.append(containerRef.current);
    }
  }, [text, dotColor, bgColor, logoUrl, size]);

  useEffect(() => { buildQr(); }, [buildQr]);

  const download = async () => {
    if (!qrRef.current) return;
    await qrRef.current.download({ name: "qr-code", extension: "png" });
  };

  const onLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setLogoUrl(url);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
        .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
        .card { background: linear-gradient(135deg,#071422 0%,#050d1a 100%); border: 1px solid rgba(14,165,233,0.2); border-radius: 1rem; }
        .input-field { background: rgba(7,20,34,0.8); border: 1px solid rgba(14,165,233,0.25); border-radius: 0.5rem; color: #e2e8f0; padding: 0.75rem 1rem; font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; width: 100%; outline: none; transition: border-color 0.2s; }
        .input-field:focus { border-color: rgba(0,212,255,0.5); box-shadow: 0 0 0 2px rgba(0,212,255,0.1); }
        .field-label { font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; color: #38bdf8; letter-spacing: 0.08em; text-transform: uppercase; display: block; margin-bottom: 0.4rem; }
        .color-row { display: flex; align-items: center; gap: 0.75rem; }
        .color-swatch { width: 40px; height: 40px; border-radius: 0.4rem; border: 1px solid rgba(14,165,233,0.3); cursor: pointer; overflow: hidden; padding: 2px; background: transparent; }
        .color-swatch input[type="color"] { width: 100%; height: 100%; border: none; cursor: pointer; border-radius: 4px; }
        .dl-btn { width: 100%; padding: 0.7rem; background: linear-gradient(135deg,rgba(14,165,233,0.3),rgba(0,212,255,0.15)); border: 1px solid rgba(14,165,233,0.5); color: #38bdf8; border-radius: 0.6rem; font-family: 'JetBrains Mono', monospace; font-size: 0.88rem; font-weight: 700; cursor: pointer; transition: all 0.2s; margin-top: 1.25rem; letter-spacing: 0.04em; }
        .dl-btn:hover { background: linear-gradient(135deg,rgba(14,165,233,0.45),rgba(0,212,255,0.25)); }
        .logo-btn { border: 1px dashed rgba(14,165,233,0.3); border-radius: 0.4rem; padding: 0.5rem 1rem; color: #64748b; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; cursor: pointer; background: transparent; width: 100%; transition: all 0.2s; text-align: center; }
        .logo-btn:hover { border-color: rgba(0,212,255,0.5); color: #38bdf8; }
      `}</style>

      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>qr-creator-pro</span>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
            Text &amp; Produktivität
          </div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.5rem)", color: "#fff", marginBottom: "0.4rem" }}>
            QR-Code Creator Pro
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
            QR-Code mit eigenen Farben und Logo — direkt als PNG herunterladen.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1.5rem", alignItems: "start" }}>
          {/* Settings */}
          <div className="card p-6" style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            <div>
              <span className="field-label">URL / Text</span>
              <input
                className="input-field"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="https://..."
                spellCheck={false}
              />
            </div>

            <div>
              <span className="field-label">Punktfarbe</span>
              <div className="color-row">
                <div className="color-swatch">
                  <input type="color" value={dotColor} onChange={(e) => setDotColor(e.target.value)} />
                </div>
                <input
                  className="input-field"
                  style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.85rem" }}
                  value={dotColor}
                  onChange={(e) => setDotColor(e.target.value)}
                />
              </div>
            </div>

            <div>
              <span className="field-label">Hintergrundfarbe</span>
              <div className="color-row">
                <div className="color-swatch">
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
                </div>
                <input
                  className="input-field"
                  style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.85rem" }}
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                />
              </div>
            </div>

            <div>
              <span className="field-label">Logo (optional)</span>
              <label className="logo-btn">
                {logoUrl ? "✓ Logo geladen — klicken zum Ändern" : "+ Logo hochladen (PNG/SVG)"}
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={onLogo} />
              </label>
              {logoUrl && (
                <button onClick={() => setLogoUrl(null)} style={{ marginTop: "0.4rem", background: "none", border: "none", color: "#f87171", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", cursor: "pointer" }}>
                  × Logo entfernen
                </button>
              )}
            </div>

            <button className="dl-btn" onClick={download}>
              ↓ Als PNG herunterladen
            </button>
          </div>

          {/* QR Preview */}
          <div className="card p-6" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div ref={containerRef} style={{ width: size, height: size, borderRadius: "0.75rem", overflow: "hidden" }} />
          </div>
        </div>
      </main>
    </div>
  );
}
