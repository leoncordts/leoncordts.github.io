"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const KEY_LAYOUT = [
  ["Escape","","F1","F2","F3","F4","","F5","F6","F7","F8","","F9","F10","F11","F12"],
  ["Backquote","Digit1","Digit2","Digit3","Digit4","Digit5","Digit6","Digit7","Digit8","Digit9","Digit0","Minus","Equal","Backspace"],
  ["Tab","KeyQ","KeyW","KeyE","KeyR","KeyT","KeyY","KeyU","KeyI","KeyO","KeyP","BracketLeft","BracketRight","Backslash"],
  ["CapsLock","KeyA","KeyS","KeyD","KeyF","KeyG","KeyH","KeyJ","KeyK","KeyL","Semicolon","Quote","Enter"],
  ["ShiftLeft","KeyZ","KeyX","KeyC","KeyV","KeyB","KeyN","KeyM","Comma","Period","Slash","ShiftRight"],
  ["ControlLeft","MetaLeft","AltLeft","Space","AltRight","MetaRight","ContextMenu","ControlRight"],
];

const KEY_LABELS: Record<string, string> = {
  Backquote:"~",Digit1:"1",Digit2:"2",Digit3:"3",Digit4:"4",Digit5:"5",Digit6:"6",Digit7:"7",Digit8:"8",Digit9:"9",Digit0:"0",
  Minus:"-",Equal:"=",Backspace:"⌫",Tab:"Tab",BracketLeft:"[",BracketRight:"]",Backslash:"\\",
  CapsLock:"Caps",Semicolon:";",Quote:"'",Enter:"Enter",ShiftLeft:"Shift",ShiftRight:"Shift",
  ControlLeft:"Ctrl",ControlRight:"Ctrl",MetaLeft:"⌘",MetaRight:"⌘",AltLeft:"Alt",AltRight:"AltGr",
  Space:"Space",ContextMenu:"☰",Slash:"/",Period:".",Comma:",",
  KeyA:"A",KeyB:"B",KeyC:"C",KeyD:"D",KeyE:"E",KeyF:"F",KeyG:"G",KeyH:"H",KeyI:"I",KeyJ:"J",KeyK:"K",KeyL:"L",KeyM:"M",
  KeyN:"N",KeyO:"O",KeyP:"P",KeyQ:"Q",KeyR:"R",KeyS:"S",KeyT:"T",KeyU:"U",KeyV:"V",KeyW:"W",KeyX:"X",KeyY:"Y",KeyZ:"Z",
};

export default function InputTesterPage() {
  const [mode, setMode] = useState<"keyboard" | "gamepad">("keyboard");
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [testedKeys, setTestedKeys] = useState<Set<string>>(new Set());
  const [lastKey, setLastKey] = useState("");
  const [gamepad, setGamepad] = useState<Gamepad | null>(null);
  const [gpButtons, setGpButtons] = useState<boolean[]>([]);
  const [gpAxes, setGpAxes] = useState<number[]>([]);
  const rafRef = useRef<number>(0);

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    setPressedKeys((p) => new Set(p).add(e.code));
    setTestedKeys((p) => new Set(p).add(e.code));
    setLastKey(e.code);
  }, []);

  const onKeyUp = useCallback((e: KeyboardEvent) => {
    setPressedKeys((p) => { const s = new Set(p); s.delete(e.code); return s; });
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => { window.removeEventListener("keydown", onKeyDown); window.removeEventListener("keyup", onKeyUp); };
  }, [onKeyDown, onKeyUp]);

  // Gamepad polling
  useEffect(() => {
    if (mode !== "gamepad") return;
    function poll() {
      const gps = navigator.getGamepads();
      const gp = gps[0] || gps[1] || gps[2] || gps[3];
      if (gp) {
        setGamepad(gp);
        setGpButtons(gp.buttons.map((b) => b.pressed));
        setGpAxes([...gp.axes]);
      }
      rafRef.current = requestAnimationFrame(poll);
    }
    const onConnect = () => rafRef.current = requestAnimationFrame(poll);
    window.addEventListener("gamepadconnected", onConnect);
    rafRef.current = requestAnimationFrame(poll);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("gamepadconnected", onConnect); };
  }, [mode]);

  function keyColor(code: string) {
    if (!code) return "transparent";
    if (pressedKeys.has(code)) return "#6366f1";
    if (testedKeys.has(code)) return "rgba(99,102,241,0.2)";
    return "rgba(30,41,59,0.8)";
  }

  const WIDE_KEYS = new Set(["Backspace","Tab","CapsLock","Enter","ShiftLeft","ShiftRight","Space","ControlLeft","ControlRight"]);

  return (
    <main className="min-h-screen bg-slate-950 pb-12">
      <nav className="border-b border-slate-800/60 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <a href="/tools" className="text-indigo-400 text-sm hover:text-indigo-300 transition">← Tools</a>
          <span className="text-slate-700">/</span>
          <span className="text-slate-500 text-sm font-mono">input-tester</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            Tastatur & <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Gamepad</span> Diagnostiker
          </h1>
          <p className="text-slate-400">Drücke Tasten — sie leuchten sofort auf.</p>
        </div>

        {/* Mode toggle */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-slate-900 border border-slate-700 rounded-xl p-1 gap-1">
            {(["keyboard","gamepad"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={`px-5 py-2 text-sm font-semibold rounded-lg transition ${mode === m ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"}`}>
                {m === "keyboard" ? "⌨️ Tastatur" : "🎮 Gamepad"}
              </button>
            ))}
          </div>
        </div>

        {mode === "keyboard" && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            {lastKey && (
              <div className="text-center mb-4 font-mono text-sm text-indigo-400">
                Zuletzt gedrückt: <span className="font-bold text-white">{lastKey}</span>
                <span className="ml-3 text-slate-500">({testedKeys.size} Tasten getestet)</span>
              </div>
            )}
            <div className="flex flex-col gap-1.5 overflow-x-auto">
              {KEY_LAYOUT.map((row, ri) => (
                <div key={ri} className="flex gap-1.5 justify-center">
                  {row.map((code, ci) => {
                    if (!code) return <div key={ci} className="w-6" />;
                    const label = KEY_LABELS[code] || code.replace("Key","").replace("Digit","").replace("Arrow","↑").slice(0,4);
                    const isWide = WIDE_KEYS.has(code);
                    return (
                      <div
                        key={code}
                        style={{ backgroundColor: keyColor(code), transition: "background-color 0.1s" }}
                        className={`${isWide ? "min-w-[60px]" : "w-10"} h-10 rounded-lg flex items-center justify-center text-xs font-mono font-bold border border-slate-700/50 text-slate-300 select-none flex-shrink-0`}
                      >
                        {label}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="flex gap-4 justify-center mt-5 text-xs font-mono">
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-indigo-600 inline-block"/> Gedrückt</span>
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-indigo-900/50 inline-block border border-indigo-700/40"/> Getestet</span>
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-slate-800 inline-block border border-slate-700"/> Nicht getestet</span>
            </div>
            <div className="text-center mt-3">
              <button onClick={() => setTestedKeys(new Set())} className="text-xs text-slate-500 hover:text-slate-300 underline transition">Zurücksetzen</button>
            </div>
          </div>
        )}

        {mode === "gamepad" && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center">
            {!gamepad ? (
              <div>
                <div className="text-6xl mb-4">🎮</div>
                <p className="text-slate-300 font-semibold text-lg mb-2">Drücke einen Button auf deinem Controller…</p>
                <p className="text-slate-500 text-sm font-mono">Gamepad wird automatisch erkannt.</p>
              </div>
            ) : (
              <div>
                <p className="text-indigo-400 font-mono text-sm mb-6">Verbunden: <span className="text-white">{gamepad.id.slice(0,40)}</span></p>
                <div className="grid grid-cols-8 gap-2 justify-center mb-6 max-w-sm mx-auto">
                  {gpButtons.map((pressed, i) => (
                    <div key={i} style={{ background: pressed ? "#6366f1" : "rgba(30,41,59,0.8)", transition: "background 0.1s" }}
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-mono text-slate-300 border border-slate-700/50">
                      {i}
                    </div>
                  ))}
                </div>
                <div className="flex justify-center gap-8">
                  {[0,2].map((i) => (
                    <div key={i} className="w-24 h-24 rounded-full border-2 border-slate-700 bg-slate-900 relative" title={`Achse ${i}/${i+1}`}>
                      <div
                        className="w-4 h-4 rounded-full bg-indigo-500 absolute transition-all duration-75"
                        style={{ left: `calc(50% + ${(gpAxes[i] || 0) * 36}px - 8px)`, top: `calc(50% + ${(gpAxes[i+1] || 0) * 36}px - 8px)` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
