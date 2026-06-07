"use client";
import { useState, useRef } from "react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
  .card { background: linear-gradient(135deg,#071422 0%,#050d1a 100%); border: 1px solid rgba(14,165,233,0.2); border-radius: 1rem; }
  .drop-zone { border: 2px dashed rgba(14,165,233,0.25); border-radius: 0.75rem; padding: 2rem 1.5rem; text-align: center; cursor: pointer; transition: all 0.2s; }
  .drop-zone:hover, .drop-zone.over { border-color: rgba(0,212,255,0.55); background: rgba(14,165,233,0.04); }
  .pw-input { background: rgba(7,20,34,0.8); border: 1px solid rgba(14,165,233,0.2); border-radius: 0.5rem; color: #e2e8f0; padding: 0.65rem 0.9rem; font-family: 'JetBrains Mono',monospace; font-size: 0.9rem; width: 100%; outline: none; transition: border-color 0.2s; }
  .pw-input:focus { border-color: rgba(0,212,255,0.4); }
  .btn-dl { background: linear-gradient(135deg,rgba(14,165,233,0.3),rgba(0,212,255,0.15)); border: 1px solid rgba(14,165,233,0.5); color: #38bdf8; border-radius: 0.6rem; padding: 0.7rem 0; font-family: 'Syne',sans-serif; font-weight: 700; font-size: 0.95rem; cursor: pointer; transition: all 0.2s; width: 100%; }
  .btn-dl:hover:not(:disabled) { background: linear-gradient(135deg,rgba(14,165,233,0.45),rgba(0,212,255,0.25)); }
  .btn-dl:disabled { opacity: 0.35; cursor: default; }
  .status { font-family: 'JetBrains Mono',monospace; font-size: 0.8rem; text-align: center; min-height: 1.2rem; }
  .info-box { background: rgba(14,165,233,0.06); border: 1px solid rgba(14,165,233,0.15); border-radius: 0.5rem; padding: 0.75rem 1rem; font-family: 'JetBrains Mono',monospace; font-size: 0.72rem; color: #475569; line-height: 1.6; }
`;

async function encryptFile(data: ArrayBuffer, password: string): Promise<Uint8Array> {
  const enc  = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv   = crypto.getRandomValues(new Uint8Array(12));
  const key  = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false, ["encrypt"]
  );
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);
  // Format: magic(8) + salt(16) + iv(12) + ciphertext
  const magic  = enc.encode("LCTOOL01");
  const result = new Uint8Array(8 + 16 + 12 + encrypted.byteLength);
  result.set(magic, 0);
  result.set(salt, 8);
  result.set(iv, 24);
  result.set(new Uint8Array(encrypted), 36);
  return result;
}

async function decryptFile(data: ArrayBuffer, password: string): Promise<Uint8Array> {
  const bytes = new Uint8Array(data);
  const enc   = new TextEncoder();
  const dec   = new TextDecoder();
  const magic = dec.decode(bytes.slice(0, 8));
  if (magic !== "LCTOOL01") throw new Error("Keine gültige verschlüsselte Datei.");
  const salt = bytes.slice(8, 24);
  const iv   = bytes.slice(24, 36);
  const ciphertext = bytes.slice(36).buffer;
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false, ["decrypt"]
  );
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  return new Uint8Array(decrypted);
}

export default function PdfEncryptorPage() {
  const [file, setFile]      = useState<File | null>(null);
  const [over, setOver]      = useState(false);
  const [password, setPassword] = useState("");
  const [mode, setMode]      = useState<"encrypt" | "decrypt">("encrypt");
  const [status, setStatus]  = useState<{ msg: string; ok: boolean } | null>(null);
  const [busy, setBusy]      = useState(false);
  const fileRef = useRef<File | null>(null);

  function loadFile(f: File) {
    fileRef.current = f;
    setFile(f);
    setStatus(null);
    const isEnc = f.name.endsWith(".enc");
    setMode(isEnc ? "decrypt" : "encrypt");
  }

  async function process() {
    const f = fileRef.current;
    if (!f || !password) return;
    setBusy(true);
    setStatus(null);
    try {
      const buf = await f.arrayBuffer();
      if (mode === "encrypt") {
        const result = await encryptFile(buf, password);
        const blob = new Blob([result.buffer as ArrayBuffer], { type: "application/octet-stream" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = f.name + ".enc";
        a.click();
        setStatus({ msg: "✓ Datei verschlüsselt (AES-256-GCM).", ok: true });
      } else {
        const result = await decryptFile(buf, password);
        const stem = f.name.replace(/\.enc$/, "");
        const blob = new Blob([result.buffer as ArrayBuffer], { type: "application/octet-stream" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = stem;
        a.click();
        setStatus({ msg: "✓ Datei entschlüsselt.", ok: true });
      }
    } catch {
      setStatus({ msg: mode === "decrypt" ? "Falsches Passwort oder ungültige Datei." : "Fehler beim Verarbeiten.", ok: false });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans',sans-serif", minHeight: "100vh" }}>
      <style>{S}</style>

      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>pdf-encryptor</span>
        </div>
      </nav>

      <main className="max-w-md mx-auto px-6 py-10">
        <div className="mb-7">
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Sicherheit</div>
          <h1 className="glow-text" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,5vw,2.6rem)", color: "#fff", marginBottom: "0.3rem" }}>Datei Verschlüsseln</h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Beliebige Dateien mit AES-256-GCM verschlüsseln — kein Upload, alles lokal.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="card p-5">
            <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.75rem" }}>Datei</label>
            <div
              className={`drop-zone ${over ? "over" : ""}`}
              onDragOver={e => { e.preventDefault(); setOver(true); }}
              onDragLeave={() => setOver(false)}
              onDrop={e => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files[0]; if (f) loadFile(f); }}
              onClick={() => { const i = document.createElement("input"); i.type = "file"; i.onchange = () => { if (i.files?.[0]) loadFile(i.files[0]); }; i.click(); }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "0.4rem" }}>{mode === "decrypt" ? "🔓" : "🔒"}</div>
              <p style={{ color: file ? "#38bdf8" : "#475569", fontSize: "0.8rem", fontFamily: "'JetBrains Mono',monospace" }}>
                {file ? file.name : "Datei ablegen oder klicken"}
              </p>
            </div>
            {file && (
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#475569", marginTop: "0.5rem" }}>
                Modus: <span style={{ color: mode === "encrypt" ? "#38bdf8" : "#fbbf24" }}>{mode === "encrypt" ? "Verschlüsseln" : "Entschlüsseln"}</span>
                <span style={{ color: "#1e3a5f" }}> (automatisch erkannt)</span>
              </p>
            )}
          </div>

          <div className="card p-5">
            <label style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#38bdf8", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.6rem" }}>Passwort</label>
            <input className="pw-input" type="password" placeholder="Sicheres Passwort eingeben" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => { if (e.key === "Enter") process(); }} />
          </div>

          <button className="btn-dl" disabled={!file || !password || busy} onClick={process}>
            {busy ? "Verarbeite…" : mode === "encrypt" ? "🔒 Verschlüsseln & Herunterladen" : "🔓 Entschlüsseln & Herunterladen"}
          </button>

          {status && <p className="status" style={{ color: status.ok ? "#4ade80" : "#f87171" }}>{status.msg}</p>}

          <div className="info-box">
            AES-256-GCM · PBKDF2 (100k Iterationen) · Web Crypto API<br />
            .enc-Dateien automatisch zum Entschlüsseln erkannt.
          </div>
        </div>
      </main>
    </div>
  );
}
