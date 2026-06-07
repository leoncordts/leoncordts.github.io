"use client";
import { useState, useRef, useEffect, useCallback } from "react";

const CHUNK_SIZE = 64 * 1024; // 64 KB chunks

function randomId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

type Mode = "sender" | "receiver";
type Status = "init" | "waiting" | "connected" | "transferring" | "done" | "error";

export default function P2PTransferPage() {
  const [mode, setMode] = useState<Mode>("sender");
  const [myId, setMyId] = useState<string>("");
  const [peerId, setPeerId] = useState("");
  const [status, setStatus] = useState<Status>("init");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("");
  const [copied, setCopied] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const peerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const connRef = useRef<any>(null);
  const chunksRef = useRef<ArrayBuffer[]>([]);
  const totalRef = useRef(0);
  const receivedRef = useRef(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const initPeer = useCallback(async (id: string) => {
    const { Peer } = await import("peerjs");
    const peer = new Peer(id);
    peerRef.current = peer;

    peer.on("open", (actualId: string) => {
      setMyId(actualId);
      setStatus("waiting");
    });

    peer.on("connection", (conn) => {
      connRef.current = conn;
      setStatus("connected");

      conn.on("data", (data: unknown) => {
        if (typeof data === "object" && data !== null && "type" in data) {
          const msg = data as { type: string; name?: string; size?: number; chunk?: ArrayBuffer };
          if (msg.type === "meta") {
            setDownloadName(msg.name ?? "file");
            totalRef.current = msg.size ?? 0;
            receivedRef.current = 0;
            chunksRef.current = [];
            setStatus("transferring");
          } else if (msg.type === "chunk" && msg.chunk) {
            chunksRef.current.push(msg.chunk);
            receivedRef.current += msg.chunk.byteLength;
            setProgress(Math.round((receivedRef.current / totalRef.current) * 100));
          } else if (msg.type === "done") {
            const blob = new Blob(chunksRef.current);
            setDownloadUrl(URL.createObjectURL(blob));
            setStatus("done");
          }
        }
      });
    });

    peer.on("error", (err: Error) => {
      setError(err.message);
      setStatus("error");
    });
  }, []);

  useEffect(() => {
    const id = randomId();
    if (mode === "sender") initPeer(id);
    return () => {
      peerRef.current?.destroy();
    };
  }, [mode, initPeer]);

  async function connectAsSender() {
    if (!peerRef.current || !peerId) return;
    const conn = peerRef.current.connect(peerId.toUpperCase());
    connRef.current = conn;
    conn.on("open", () => setStatus("connected"));
    conn.on("error", (err: Error) => { setError(err.message); setStatus("error"); });
  }

  async function sendFile() {
    if (!file || !connRef.current) return;
    setStatus("transferring");
    setProgress(0);

    connRef.current.send({ type: "meta", name: file.name, size: file.size });

    const reader = new FileReader();
    let offset = 0;

    function readNext() {
      const slice = file!.slice(offset, offset + CHUNK_SIZE);
      reader.readAsArrayBuffer(slice);
    }

    reader.onload = (e) => {
      const chunk = e.target!.result as ArrayBuffer;
      connRef.current!.send({ type: "chunk", chunk });
      offset += chunk.byteLength;
      setProgress(Math.round((offset / file!.size) * 100));
      if (offset < file!.size) {
        setTimeout(readNext, 0);
      } else {
        connRef.current!.send({ type: "done" });
        setStatus("done");
      }
    };

    readNext();
  }

  function copyId() {
    navigator.clipboard.writeText(myId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const isReceiver = mode === "receiver";

  return (
    <main className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800/60 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/tools" className="text-teal-400 text-sm hover:text-teal-300 transition">← Tools</a>
          <span className="text-slate-700">/</span>
          <span className="text-slate-500 text-sm font-mono">p2p-transfer</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-900/30 border border-teal-700/40 text-teal-300 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            WebRTC P2P · Kein Upload · Ende-zu-Ende
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            P2P <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Datei-Transfer</span>
          </h1>
          <p className="text-slate-400">Dateien direkt Browser-zu-Browser senden — ohne Server, ohne Upload.</p>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-2 mb-6">
          {(["sender", "receiver"] as const).map((m) => (
            <button key={m} onClick={() => { setMode(m); setStatus("init"); setProgress(0); setDownloadUrl(null); }}
              className={`flex-1 py-3 rounded-xl font-bold transition ${mode === m ? "bg-teal-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}>
              {m === "sender" ? "📤 Senden" : "📥 Empfangen"}
            </button>
          ))}
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col gap-5">
          {!isReceiver && (
            <>
              {/* My ID */}
              <div className="text-center">
                <p className="text-slate-500 text-sm mb-2">Dein Code — gib ihn dem Empfänger:</p>
                <div className="text-5xl font-black text-teal-400 tracking-[0.3em] font-mono mb-3">
                  {status === "init" ? "…" : myId}
                </div>
                <button onClick={copyId} className={`text-xs px-4 py-1.5 rounded-lg font-mono transition ${copied ? "bg-teal-800 text-teal-200" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}>
                  {copied ? "✓ Kopiert" : "Code kopieren"}
                </button>
              </div>

              {status === "waiting" && (
                <p className="text-center text-slate-500 text-sm">⏳ Warte auf Verbindung…</p>
              )}

              {status === "connected" && !file && (
                <div>
                  <p className="text-teal-400 text-center mb-3 font-semibold">✓ Verbunden! Datei auswählen:</p>
                  <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:border-slate-600 transition"
                    onClick={() => fileRef.current?.click()}>
                    <input ref={fileRef} type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                    <p className="text-slate-400">Klicken oder Datei ablegen</p>
                  </div>
                </div>
              )}

              {status === "connected" && file && (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-slate-300 font-semibold">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
                  <button onClick={sendFile} className="py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition">
                    Datei senden
                  </button>
                </div>
              )}
            </>
          )}

          {isReceiver && (
            <>
              {status === "init" || status === "waiting" ? (
                <div className="flex flex-col gap-3">
                  <p className="text-slate-400 text-sm">Code vom Sender eingeben:</p>
                  <input
                    type="text"
                    value={peerId}
                    onChange={(e) => setPeerId(e.target.value.toUpperCase())}
                    placeholder="z.B. X7K9P"
                    maxLength={5}
                    className="text-center text-3xl font-black tracking-[0.3em] font-mono bg-slate-950 border border-slate-700 rounded-xl py-4 text-teal-400 focus:outline-none focus:border-teal-500 uppercase"
                  />
                  <button onClick={async () => { await initPeer(randomId()); connectAsSender(); }} disabled={peerId.length < 5}
                    className="py-3 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold transition">
                    Verbinden
                  </button>
                </div>
              ) : status === "connected" ? (
                <p className="text-teal-400 text-center font-semibold">✓ Verbunden — warte auf Datei…</p>
              ) : null}
            </>
          )}

          {status === "transferring" && (
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">{isReceiver ? "Empfange…" : "Sende…"}</span>
                <span className="text-teal-400 font-mono">{progress}%</span>
              </div>
              <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {status === "done" && (
            <div className="text-center flex flex-col gap-3">
              <p className="text-green-400 font-bold">✓ {isReceiver ? "Datei empfangen!" : "Datei gesendet!"}</p>
              {downloadUrl && (
                <a href={downloadUrl} download={downloadName}
                  className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold transition inline-block">
                  {downloadName} herunterladen
                </a>
              )}
            </div>
          )}

          {status === "error" && (
            <p className="text-red-400 text-center text-sm">{error || "Verbindungsfehler."}</p>
          )}
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Die Übertragung erfolgt verschlüsselt direkt zwischen den Browsern. Keine Daten berühren einen Server.
        </p>
      </div>
    </main>
  );
}
