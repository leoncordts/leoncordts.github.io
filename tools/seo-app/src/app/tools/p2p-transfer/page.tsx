"use client";
import { useState, useRef, useEffect, useCallback } from "react";

const CHUNK_SIZE = 64 * 1024;

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  .glow-text { text-shadow: 0 0 40px rgba(0,212,255,0.45), 0 0 80px rgba(0,212,255,0.15); }
  .card { background: linear-gradient(135deg,#071422 0%,#050d1a 100%); border: 1px solid rgba(14,165,233,0.2); border-radius: 1rem; }
  .tab-btn { flex: 1; padding: 0.7rem; border-radius: 0.65rem; font-family: 'Syne',sans-serif; font-weight: 700; font-size: 0.95rem; cursor: pointer; border: 1px solid rgba(14,165,233,0.2); background: transparent; color: #475569; transition: all 0.2s; }
  .tab-btn.active { background: rgba(14,165,233,0.15); border-color: rgba(0,212,255,0.5); color: #38bdf8; }
  .code-input { text-align: center; font-family: 'JetBrains Mono',monospace; font-size: 2.2rem; font-weight: 900; letter-spacing: 0.4em; background: rgba(7,20,34,0.9); border: 2px solid rgba(14,165,233,0.25); border-radius: 0.75rem; color: #38bdf8; padding: 0.8rem 1rem; width: 100%; outline: none; transition: border-color 0.2s; text-transform: uppercase; box-sizing: border-box; }
  .code-input:focus { border-color: rgba(0,212,255,0.6); }
  .primary-btn { background: linear-gradient(135deg,rgba(14,165,233,0.25),rgba(6,182,212,0.15)); border: 1px solid rgba(14,165,233,0.5); border-radius: 0.65rem; color: #38bdf8; cursor: pointer; font-family: 'Syne',sans-serif; font-weight: 700; font-size: 0.95rem; padding: 0.75rem; width: 100%; transition: all 0.2s; }
  .primary-btn:hover:not(:disabled) { background: linear-gradient(135deg,rgba(14,165,233,0.35),rgba(6,182,212,0.25)); }
  .primary-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .share-btn { display: flex; align-items: center; gap: 0.45rem; padding: 0.45rem 0.85rem; border-radius: 0.5rem; font-family: 'JetBrains Mono',monospace; font-size: 0.72rem; cursor: pointer; border: 1px solid rgba(14,165,233,0.2); background: transparent; color: #64748b; transition: all 0.15s; white-space: nowrap; }
  .share-btn:hover { color: #38bdf8; border-color: rgba(0,212,255,0.4); background: rgba(14,165,233,0.06); }
  .share-btn.whatsapp:hover { color: #25d366; border-color: rgba(37,211,102,0.4); }
  .share-btn.telegram:hover { color: #0088cc; border-color: rgba(0,136,204,0.4); }
  .prog-track { height: 10px; background: rgba(14,165,233,0.1); border-radius: 99px; overflow: hidden; }
  .prog-fill { height: 100%; background: linear-gradient(90deg,#0ea5e9,#22d3ee); border-radius: 99px; transition: width 0.2s; }
  .drop-zone { border: 2px dashed rgba(14,165,233,0.25); border-radius: 0.75rem; padding: 2rem; text-align: center; cursor: pointer; transition: all 0.2s; }
  .drop-zone:hover { border-color: rgba(0,212,255,0.5); background: rgba(14,165,233,0.04); }
  .pulse { animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
`;

function randomId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

type Mode = "sender" | "receiver";
type Status = "init" | "waiting" | "connecting" | "connected" | "transferring" | "done" | "error";

export default function P2PTransferPage() {
  const [mode, setMode]         = useState<Mode>("sender");
  const [myId, setMyId]         = useState("");
  const [peerId, setPeerId]     = useState("");
  const [status, setStatus]     = useState<Status>("init");
  const [file, setFile]         = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("");
  const [copied, setCopied]     = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const peerRef   = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const connRef   = useRef<any>(null);
  const chunksRef = useRef<ArrayBuffer[]>([]);
  const totalRef  = useRef(0);
  const recvRef   = useRef(0);
  const fileRef   = useRef<HTMLInputElement>(null);

  // Read ?connect=XXXXX from URL on mount → switch to receiver and pre-fill code
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("connect");
    if (code) {
      setMode("receiver");
      setPeerId(code.toUpperCase());
    }
  }, []);

  // Returns a Promise that resolves when the peer is open
  const initPeer = useCallback((id: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Destroy old peer if any
      if (peerRef.current) {
        try { peerRef.current.destroy(); } catch {}
        peerRef.current = null;
      }

      import("peerjs").then(({ Peer }) => {
        const peer = new Peer(id);
        peerRef.current = peer;

        peer.on("open", (actualId: string) => {
          setMyId(actualId);
          resolve(actualId);
        });

        peer.on("connection", (conn) => {
          if (mode === "sender") {
            connRef.current = conn;
            setStatus("connected");
            wireConn(conn);
          }
        });

        peer.on("error", (err: Error) => {
          setErrorMsg(err.message);
          setStatus("error");
          reject(err);
        });
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  function wireConn(conn: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c = conn as any;
    c.on("data", (data: unknown) => {
      if (typeof data === "object" && data !== null && "type" in data) {
        const msg = data as { type: string; name?: string; size?: number; chunk?: ArrayBuffer };
        if (msg.type === "meta") {
          setDownloadName(msg.name ?? "file");
          totalRef.current = msg.size ?? 0;
          recvRef.current  = 0;
          chunksRef.current = [];
          setStatus("transferring");
        } else if (msg.type === "chunk" && msg.chunk) {
          chunksRef.current.push(msg.chunk);
          recvRef.current += msg.chunk.byteLength;
          setProgress(Math.round((recvRef.current / totalRef.current) * 100));
        } else if (msg.type === "done") {
          const blob = new Blob(chunksRef.current);
          setDownloadUrl(URL.createObjectURL(blob));
          setStatus("done");
        }
      }
    });
    c.on("error", (err: Error) => { setErrorMsg(err.message); setStatus("error"); });
  }

  // Init sender peer on mount / mode change
  useEffect(() => {
    if (mode === "sender") {
      setStatus("init");
      initPeer(randomId()).then(() => setStatus("waiting"));
    }
    return () => {
      peerRef.current?.destroy();
      peerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  async function connectAsReceiver() {
    if (!peerId || peerId.length < 5) return;
    setStatus("connecting");
    setErrorMsg("");
    try {
      // Init own peer and wait until it's open
      await initPeer(randomId());
      // Now connect to sender
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const conn = (peerRef.current as any).connect(peerId.toUpperCase());
      connRef.current = conn;
      conn.on("open", () => {
        setStatus("connected");
        wireConn(conn);
      });
      conn.on("error", (err: Error) => { setErrorMsg(err.message); setStatus("error"); });
    } catch {
      setStatus("error");
    }
  }

  async function sendFile() {
    if (!file || !connRef.current) return;
    setStatus("transferring");
    setProgress(0);
    connRef.current.send({ type: "meta", name: file.name, size: file.size });

    const reader = new FileReader();
    let offset = 0;

    function readNext() {
      reader.readAsArrayBuffer(file!.slice(offset, offset + CHUNK_SIZE));
    }
    reader.onload = (e) => {
      const chunk = e.target!.result as ArrayBuffer;
      connRef.current.send({ type: "chunk", chunk });
      offset += chunk.byteLength;
      setProgress(Math.round((offset / file!.size) * 100));
      if (offset < file!.size) setTimeout(readNext, 0);
      else { connRef.current.send({ type: "done" }); setStatus("done"); }
    };
    readNext();
  }

  function resetAll() {
    peerRef.current?.destroy();
    peerRef.current = null;
    connRef.current = null;
    setStatus("init");
    setProgress(0);
    setDownloadUrl(null);
    setFile(null);
    setErrorMsg("");
    if (mode === "sender") {
      initPeer(randomId()).then(() => setStatus("waiting"));
    }
  }

  // Share link helpers
  const shareUrl = myId ? `${typeof window !== "undefined" ? window.location.origin : "https://leon-seo-checker.vercel.app"}/tools/p2p-transfer?connect=${myId}` : "";

  function copyLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopied("link");
    setTimeout(() => setCopied(null), 1500);
  }
  function copyCode() {
    navigator.clipboard.writeText(myId);
    setCopied("code");
    setTimeout(() => setCopied(null), 1500);
  }
  function shareWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(`Verbinde dich mit mir für einen P2P-Transfer: ${shareUrl}`)}`,"_blank");
  }
  function shareTelegram() {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent("P2P Datei-Transfer – kein Upload, direkt Browser-zu-Browser")}`,"_blank");
  }
  function shareNative() {
    if (navigator.share) {
      navigator.share({ title: "P2P Transfer", text: "Verbinde dich mit mir für einen P2P-Transfer", url: shareUrl });
    }
  }
  const hasNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  const isReceiver = mode === "receiver";

  return (
    <div style={{ backgroundColor: "#020b18", color: "#cbd5e1", fontFamily: "'DM Sans',sans-serif", minHeight: "100vh" }}>
      <style>{S}</style>

      <nav style={{ borderBottom: "1px solid rgba(14,165,233,0.1)", backgroundColor: "rgba(5,13,26,0.95)", backdropFilter: "blur(12px)" }} className="px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" style={{ color: "#38bdf8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>← Tools</a>
          <span style={{ color: "#1e3a5f" }}>/</span>
          <span style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem" }}>p2p-transfer</span>
        </div>
      </nav>

      <main className="max-w-lg mx-auto px-6 py-10">
        <div className="mb-8 text-center">
          <div style={{ display:"inline-flex", alignItems:"center", gap:"0.5rem", padding:"0.3rem 0.9rem", borderRadius:"99px", background:"rgba(14,165,233,0.08)", border:"1px solid rgba(14,165,233,0.2)", fontFamily:"'JetBrains Mono',monospace", fontSize:"0.68rem", color:"#38bdf8", marginBottom:"1rem" }}>
            <span className="pulse" style={{ width:6, height:6, borderRadius:"50%", background:"#38bdf8", display:"inline-block" }} />
            WebRTC · Kein Upload · Direkt Browser-zu-Browser
          </div>
          <h1 className="glow-text" style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"clamp(1.8rem,5vw,2.8rem)", color:"#fff", marginBottom:"0.3rem" }}>
            P2P Datei-Transfer
          </h1>
          <p style={{ color:"#64748b", fontSize:"0.9rem" }}>Dateien ohne Server direkt übertragen — Ende-zu-Ende verschlüsselt.</p>
        </div>

        {/* Mode tabs */}
        <div style={{ display:"flex", gap:"0.5rem", marginBottom:"1rem" }}>
          {(["sender","receiver"] as const).map(m => (
            <button key={m} className={`tab-btn ${mode === m ? "active" : ""}`}
              onClick={() => { setMode(m); resetAll(); }}>
              {m === "sender" ? "📤 Senden" : "📥 Empfangen"}
            </button>
          ))}
        </div>

        <div className="card p-6" style={{ display:"flex", flexDirection:"column", gap:"1.2rem" }}>

          {/* ── SENDER ── */}
          {!isReceiver && (
            <>
              {/* My ID + share */}
              <div style={{ textAlign:"center" }}>
                <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.65rem", color:"#38bdf8", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"0.6rem" }}>Dein Code — teile ihn mit dem Empfänger</p>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"3rem", fontWeight:900, color: status === "init" ? "#1e3a5f" : "#38bdf8", letterSpacing:"0.4em", marginBottom:"0.75rem", minHeight:"3.5rem" }}>
                  {status === "init" ? "·····" : myId}
                </div>

                {myId && (
                  <>
                    {/* Share buttons */}
                    <div style={{ display:"flex", flexWrap:"wrap", gap:"0.4rem", justifyContent:"center", marginBottom:"0.5rem" }}>
                      <button className="share-btn whatsapp" onClick={shareWhatsApp}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        WhatsApp
                      </button>
                      <button className="share-btn telegram" onClick={shareTelegram}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                        Telegram
                      </button>
                      {hasNativeShare && (
                        <button className="share-btn" onClick={shareNative}>
                          📤 Teilen
                        </button>
                      )}
                      <button className="share-btn" onClick={copyLink} style={copied === "link" ? { color:"#4ade80", borderColor:"rgba(74,222,128,0.4)" } : {}}>
                        🔗 {copied === "link" ? "✓ Kopiert!" : "Link kopieren"}
                      </button>
                      <button className="share-btn" onClick={copyCode} style={copied === "code" ? { color:"#4ade80", borderColor:"rgba(74,222,128,0.4)" } : {}}>
                        {copied === "code" ? "✓ Code kopiert" : "Code kopieren"}
                      </button>
                    </div>
                    <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.62rem", color:"#334155", wordBreak:"break-all" }}>{shareUrl}</p>
                  </>
                )}
              </div>

              {status === "waiting" && (
                <p style={{ textAlign:"center", fontFamily:"'JetBrains Mono',monospace", fontSize:"0.8rem", color:"#334155" }}>
                  ⏳ Warte auf Verbindung…
                </p>
              )}

              {status === "connected" && !file && (
                <div>
                  <p style={{ color:"#38bdf8", textAlign:"center", fontWeight:600, marginBottom:"0.75rem" }}>✓ Verbunden — Datei auswählen:</p>
                  <div className="drop-zone" onClick={() => fileRef.current?.click()}>
                    <input ref={fileRef} type="file" style={{ display:"none" }} onChange={e => setFile(e.target.files?.[0] ?? null)} />
                    <p style={{ color:"#475569", fontSize:"0.9rem" }}>Klicken oder Datei ablegen</p>
                  </div>
                </div>
              )}

              {status === "connected" && file && (
                <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
                  <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.82rem", color:"#94a3b8" }}>
                    📄 {file.name} <span style={{ color:"#475569" }}>({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </p>
                  <button className="primary-btn" onClick={sendFile}>Datei senden →</button>
                </div>
              )}
            </>
          )}

          {/* ── RECEIVER ── */}
          {isReceiver && (status === "init" || status === "connecting") && (
            <div style={{ display:"flex", flexDirection:"column", gap:"0.85rem" }}>
              <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.65rem", color:"#38bdf8", letterSpacing:"0.1em", textTransform:"uppercase", textAlign:"center" }}>
                Code vom Sender eingeben
              </p>
              <input
                className="code-input"
                type="text"
                value={peerId}
                onChange={e => setPeerId(e.target.value.replace(/[^a-zA-Z0-9]/g,"").toUpperCase().slice(0,5))}
                placeholder="·····"
                maxLength={5}
                spellCheck={false}
              />
              <button className="primary-btn" onClick={connectAsReceiver}
                disabled={peerId.length < 5 || status === "connecting"}>
                {status === "connecting" ? "⏳ Verbinde…" : "Verbinden"}
              </button>
            </div>
          )}

          {isReceiver && status === "connected" && (
            <p style={{ textAlign:"center", fontFamily:"'JetBrains Mono',monospace", fontSize:"0.85rem", color:"#38bdf8" }}>
              ✓ Verbunden — warte auf Datei…
            </p>
          )}

          {/* Progress */}
          {status === "transferring" && (
            <div style={{ display:"flex", flexDirection:"column", gap:"0.6rem" }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontFamily:"'JetBrains Mono',monospace", fontSize:"0.8rem" }}>
                <span style={{ color:"#64748b" }}>{isReceiver ? "Empfange…" : "Sende…"}</span>
                <span style={{ color:"#38bdf8" }}>{progress}%</span>
              </div>
              <div className="prog-track">
                <div className="prog-fill" style={{ width:`${progress}%` }} />
              </div>
            </div>
          )}

          {/* Done */}
          {status === "done" && (
            <div style={{ textAlign:"center", display:"flex", flexDirection:"column", gap:"0.75rem" }}>
              <p style={{ color:"#4ade80", fontWeight:700, fontSize:"1rem" }}>
                ✓ {isReceiver ? "Datei empfangen!" : "Datei gesendet!"}
              </p>
              {downloadUrl && (
                <a href={downloadUrl} download={downloadName} className="primary-btn" style={{ textDecoration:"none", display:"block", textAlign:"center" }}>
                  ↓ {downloadName} herunterladen
                </a>
              )}
              <button onClick={resetAll} style={{ background:"transparent", border:"1px solid rgba(14,165,233,0.2)", borderRadius:"0.5rem", color:"#475569", cursor:"pointer", padding:"0.5rem", fontFamily:"'JetBrains Mono',monospace", fontSize:"0.72rem" }}>
                Neu starten
              </button>
            </div>
          )}

          {/* Error */}
          {status === "error" && (
            <div style={{ textAlign:"center", display:"flex", flexDirection:"column", gap:"0.5rem" }}>
              <p style={{ color:"#f87171", fontFamily:"'JetBrains Mono',monospace", fontSize:"0.82rem" }}>
                ⚠ {errorMsg || "Verbindungsfehler."}
              </p>
              <button onClick={resetAll} style={{ background:"transparent", border:"1px solid rgba(239,68,68,0.3)", borderRadius:"0.5rem", color:"#f87171", cursor:"pointer", padding:"0.5rem", fontFamily:"'JetBrains Mono',monospace", fontSize:"0.72rem" }}>
                Erneut versuchen
              </button>
            </div>
          )}
        </div>

        <p style={{ textAlign:"center", fontFamily:"'JetBrains Mono',monospace", fontSize:"0.62rem", color:"#1e3a5f", marginTop:"1.5rem" }}>
          Übertragung verschlüsselt direkt zwischen den Browsern — keine Daten berühren einen Server.
        </p>
      </main>
    </div>
  );
}
