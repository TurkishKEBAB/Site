"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";

/* uptime epoch — first semester of the SE program */
const UPTIME_EPOCH = Date.parse("2023-09-18T09:00:00+03:00");

const fetchRows: Array<[string, string]> = [
  ["os", "YO.sys v2026 LTS"],
  ["host", "Isik University · SE '27"],
  ["kernel", "6.1-enterprise-lts"],
  ["shell", "java / spring / aws"],
  ["focus", "Cloud & DevOps"],
];

const palette = [
  "var(--dark-600)", "var(--syn-err)", "var(--status-green)", "var(--gold-400)",
  "var(--syn-fn)", "var(--syn-keyword)", "var(--primary-400)", "var(--dark-100)",
];

const JAVA_HTML = `<span class="j-kw">public class</span> <span class="j-type">Profile</span> {
    <span class="j-kw">public static</span> <span class="j-type">void</span> <span class="j-fn">main</span>(<span class="j-type">String</span>[] args) {
        <span class="j-type">String</span>[][] info = {
            {<span class="j-str">"name"</span>,   <span class="j-str">"Yiğit Okur"</span>},
            {<span class="j-str">"role"</span>,   <span class="j-str">"Software Engineer"</span>},
            {<span class="j-str">"focus"</span>,  <span class="j-str">"Cloud &amp; DevOps"</span>},
            {<span class="j-str">"edu"</span>,    <span class="j-str">"Isik University · SE '27"</span>},
            {<span class="j-str">"status"</span>, <span class="j-str">"[ available ]"</span>},
        };
        <span class="j-type">System</span>.out.<span class="j-fn">println</span>(<span class="j-str">"&gt; init system.profile"</span>);
        <span class="j-kw">for</span> (<span class="j-type">String</span>[] row : info) {
            <span class="j-type">System</span>.out.<span class="j-fn">printf</span>(<span class="j-str">"%-9s %s%n"</span>, row[<span class="j-num">0</span>], row[<span class="j-num">1</span>]);
        }
        <span class="j-type">System</span>.out.<span class="j-fn">println</span>(<span class="j-str">"// part-time SWE &amp; cloud roles"</span>);
        <span class="j-type">System</span>.out.<span class="j-fn">println</span>(<span class="j-str">"&gt; profile loaded"</span>);
    }
}`;

const profileOutput = [
  '<span class="c-prompt">&gt;</span> <span class="c-dim">init</span> system.profile',
  '<span class="c-key">name</span>      <span class="c-val">Yiğit Okur</span>',
  '<span class="c-key">role</span>      <span class="c-val">Software Engineer</span>',
  '<span class="c-key">focus</span>     <span class="c-val">Cloud &amp; DevOps</span>',
  '<span class="c-key">edu</span>       <span class="c-val">Isik University · SE ’27</span>',
  '<span class="c-key">status</span>    <span class="c-ok">[ available ]</span>',
  '<span class="c-dim">// part-time SWE &amp; cloud roles</span>',
  '<span class="c-prompt">&gt;</span> <span class="c-ok">profile loaded</span>',
];

const escapeHtml = (v: string) => v.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const ps1 = '<span class="ps-path">yigit@yo-sys</span><span class="ps-dim">:~</span> <span class="ps-prompt">❯</span>';

const pad2 = (n: number) => String(n).padStart(2, "0");
const fmtUptime = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 86400)}d ${pad2(Math.floor(s / 3600) % 24)}:${pad2(Math.floor(s / 60) % 60)}:${pad2(s % 60)}`;
};

/* corner bracket for the photo frame */
const bracket = (pos: string): CSSProperties => ({
  position: "absolute", width: 14, height: 14, pointerEvents: "none",
  ...(pos.includes("t") ? { top: 6, borderTop: "1px solid rgba(0,212,255,0.8)" } : { bottom: 6, borderBottom: "1px solid rgba(0,212,255,0.8)" }),
  ...(pos.includes("l") ? { left: 6, borderLeft: "1px solid rgba(0,212,255,0.8)" } : { right: 6, borderRight: "1px solid rgba(0,212,255,0.8)" }),
});

interface Line {
  id: number;
  html: string;
}

type Tab = "fetch" | "java" | "shell";

/**
 * Hero terminal: traffic lights + 3 tabs (yofetch, Profile.java, shell).
 * yofetch = neofetch-style ID panel — duotone photo with scanline sweep, live
 * uptime, status, palette blocks. shell = a working toy shell in the house
 * palette (help / dir / ls / uptime / yofetch / javac / java / cls).
 */
export default function SystemTerminal({ profileSrc = "/profile.jpg", className = "" }: { profileSrc?: string; className?: string }) {
  const [tab, setTab] = useState<Tab>("fetch");
  const [rawPhoto, setRawPhoto] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [lines, setLines] = useState<Line[]>([
    { id: -2, html: '<span class="ps-dim">yo-shell 2.0 · javac / java ready</span>' },
    { id: -1, html: '<span class="ps-dim">Type a command or press ▶ Run.</span>' },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const compiled = useRef(false);
  const idRef = useRef(0);
  const outRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (outRef.current) outRef.current.scrollTop = outRef.current.scrollHeight;
  }, [lines]);

  const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
  const push = (html: string) => {
    idRef.current += 1;
    const id = idRef.current;
    setLines((p) => [...p, { id, html }]);
  };

  const exec = async (raw: string) => {
    const cmd = raw.trim();
    const low = cmd.toLowerCase();
    push(`${ps1} <span class="ps-cmd">${escapeHtml(raw)}</span>`);
    if (cmd === "") return;
    if (low === "cls" || low === "clear") { setLines([]); return; }
    if (low === "help") {
      push('<span class="ps-dim">Commands:</span>');
      push('  <span class="ps-ok">javac Profile.java</span>  <span class="ps-dim">compile the source</span>');
      push('  <span class="ps-ok">java Profile</span>        <span class="ps-dim">run → prints the profile</span>');
      push('  <span class="ps-ok">yofetch</span>             <span class="ps-dim">system summary</span>');
      push('  <span class="ps-ok">ls</span> · <span class="ps-ok">uptime</span> · <span class="ps-ok">cls</span> · <span class="ps-ok">help</span>');
      return;
    }
    if (low === "dir" || low === "ls") {
      push(`<span class="ps-ok">Profile.java</span>${compiled.current ? '  <span class="ps-dim">Profile.class</span>' : ""}`);
      return;
    }
    if (low === "uptime") {
      push(`<span class="ps-dim">up</span> <span class="ps-ok">${fmtUptime(Date.now() - UPTIME_EPOCH)}</span> <span class="ps-dim">· load: coursework + NETAS backlog</span>`);
      return;
    }
    if (low === "yofetch" || low === "neofetch") {
      setBusy(true);
      for (const line of profileOutput) { push(line); await sleep(90); }
      setBusy(false); return;
    }
    if (low === "javac profile.java" || low === "javac profile") {
      setBusy(true); await sleep(520);
      compiled.current = true;
      push('<span class="ps-dim"># compiled → Profile.class</span>');
      setBusy(false); return;
    }
    if (low === "java profile" || low === "java profile.class") {
      if (!compiled.current) {
        push('<span class="ps-err">Error: Could not find or load main class Profile</span>');
        push('<span class="ps-dim">Run </span><span class="ps-ok">javac Profile.java</span><span class="ps-dim"> first.</span>');
        return;
      }
      setBusy(true);
      for (const line of profileOutput) { push(line); await sleep(120); }
      setBusy(false); return;
    }
    const first = cmd.split(/\s+/)[0];
    push(`<span class="ps-err">yo-shell: command not found: ${escapeHtml(first)}</span> <span class="ps-dim">— try</span> <span class="ps-ok">help</span>`);
  };

  const runAll = async () => {
    if (busy) return;
    compiled.current = false;
    setBusy(true);
    await exec("javac Profile.java");
    await sleep(340);
    await exec("java Profile");
    setBusy(false);
  };

  const onShellKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (busy) { e.preventDefault(); return; }
    if (e.key === "Enter") {
      e.preventDefault();
      const v = input;
      setInput("");
      void exec(v);
    }
  };

  const tabs: Array<[Tab, string]> = [["fetch", "yofetch"], ["java", "Profile.java"], ["shell", "shell"]];
  const mono: CSSProperties = { fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.8 };
  const keyStyle: CSSProperties = { color: "var(--primary-400)", display: "inline-block", minWidth: 64, flexShrink: 0 };
  const chip: CSSProperties = { borderRadius: 3, padding: "2px 6px", background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.28)", color: "var(--primary-400)" };

  return (
    <div className={`nx-term-surface ${className}`} style={{ overflow: "hidden", borderRadius: 8, border: "1px solid rgba(30,30,62,0.7)", boxShadow: "var(--shadow-terminal)", backdropFilter: "blur(8px)", background: "rgba(10,10,20,0.72)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid rgba(30,30,62,0.7)", background: "rgba(0,0,0,0.3)", padding: "10px 16px" }}>
        <span style={{ width: 10, height: 10, borderRadius: 9999, background: "var(--traffic-red)" }} />
        <span style={{ width: 10, height: 10, borderRadius: 9999, background: "var(--traffic-yellow)" }} />
        <span style={{ width: 10, height: 10, borderRadius: 9999, background: "var(--traffic-green)" }} />
        <div style={{ marginLeft: 8, display: "flex", flex: 1, gap: 2 }} role="tablist">
          {tabs.map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
              style={{ minWidth: 0, flex: 1, borderRadius: "4px 4px 0 0", padding: "6px 10px", textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "-0.01em", border: "none", cursor: "pointer", transition: "color 200ms", background: tab === id ? "rgba(10,10,20,0.8)" : "transparent", color: tab === id ? "var(--primary-400)" : "var(--dark-400)" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === "fetch" ? (
        <div style={{ display: "flex", gap: 16, minHeight: 272, padding: 18, ...mono }}>
          {/* — photo: cyan duotone + scanline sweep + HUD brackets — */}
          {profileSrc ? (
            <button type="button" onClick={() => setRawPhoto((r) => !r)} aria-pressed={rawPhoto} title={rawPhoto ? "Apply cyan duotone" : "Show original photo"} style={{ position: "relative", display: "block", width: "clamp(120px, 40%, 158px)", flexShrink: 0, alignSelf: "stretch", minHeight: 208, overflow: "hidden", borderRadius: 4, border: "1px solid rgba(0,212,255,0.35)", boxShadow: "0 0 28px rgba(0,212,255,0.12)", padding: 0, background: "transparent", cursor: "pointer" }}>
              <img src={profileSrc} alt="Yiğit Okur" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 30%", filter: rawPhoto ? "none" : "grayscale(0.7) contrast(1.06) brightness(0.95)", transition: "filter 300ms var(--ease-nx)" }} />
              <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "rgba(0,212,255,0.35)", mixBlendMode: "color", opacity: rawPhoto ? 0 : 1, transition: "opacity 300ms var(--ease-nx)" }} />
              <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, rgba(0,212,255,0.05) 0px, rgba(0,212,255,0.05) 1px, transparent 1px, transparent 3px)", opacity: rawPhoto ? 0 : 1, transition: "opacity 300ms var(--ease-nx)" }} />
              <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(6,6,14,0.6), transparent 40%)" }} />
              {!rawPhoto ? <div aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, top: 0, height: 44, background: "linear-gradient(to bottom, transparent, rgba(0,212,255,0.16), transparent)", borderBottom: "1px solid rgba(0,212,255,0.4)", animation: "nx-scan 4.5s linear infinite" }} /> : null}
              <span aria-hidden="true" style={bracket("tl")} />
              <span aria-hidden="true" style={bracket("tr")} />
              <span aria-hidden="true" style={bracket("bl")} />
              <span aria-hidden="true" style={bracket("br")} />
              <span aria-hidden="true"
                style={{ position: "absolute", right: 8, top: 8, borderRadius: 3, border: "1px solid rgba(0,212,255,0.35)", background: "rgba(6,6,14,0.6)", backdropFilter: "blur(2px)", padding: "2px 7px", fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--primary-300)" }}>
                {rawPhoto ? "◂ duotone" : "original"}
              </span>
              <span style={{ position: "absolute", left: 10, bottom: 8, fontSize: 9.5, letterSpacing: "0.12em", color: "rgba(232,232,240,0.85)" }}>ID·OKUR_Y</span>
            </button>
          ) : null}
          {/* — readout — */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div><span style={{ color: "var(--primary-400)", fontWeight: 700 }}>yigit</span><span style={{ color: "var(--dark-400)" }}>@</span><span style={{ color: "var(--primary-400)", fontWeight: 700 }}>yo-sys</span></div>
            <div aria-hidden="true" style={{ height: 1, background: "var(--dark-600)", margin: "6px 0 8px" }} />
            {fetchRows.map(([k, v]) => (
              <div key={k} style={{ display: "flex", gap: 8 }}><span style={keyStyle}>{k}</span><span style={{ color: "var(--dark-50)", minWidth: 0 }}>{v}</span></div>
            ))}
            <div style={{ display: "flex", gap: 8 }}><span style={keyStyle}>uptime</span><span style={{ color: "var(--dark-50)", fontVariantNumeric: "tabular-nums" }}>{fmtUptime(now - UPTIME_EPOCH)}</span></div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={keyStyle}>status</span>
              <span style={{ width: 7, height: 7, borderRadius: 9999, background: "var(--status-green)", boxShadow: "0 0 8px rgba(52,211,153,0.8)", animation: "nx-pulse-glow 2s ease-in-out infinite" }} />
              <span style={{ color: "var(--status-green)" }}>[ available ]</span>
            </div>
            <div aria-hidden="true" style={{ display: "flex", gap: 3, marginTop: 10 }}>
              {palette.map((c, i) => <span key={`a${i}`} style={{ width: 15, height: 9, borderRadius: 1.5, background: c, opacity: 0.55 }} />)}
            </div>
            <div aria-hidden="true" style={{ display: "flex", gap: 3, marginTop: 3 }}>
              {palette.map((c, i) => <span key={`b${i}`} style={{ width: 15, height: 9, borderRadius: 1.5, background: c }} />)}
            </div>
            <div style={{ marginTop: 8 }}>
              <span style={{ color: "var(--primary-400)" }}>❯</span>{" "}
              <span style={{ display: "inline-block", width: 8, background: "var(--primary-400)", color: "transparent", animation: "nx-blink 1.2s step-end infinite" }}>_</span>
            </div>
          </div>
        </div>
      ) : null}

      {tab === "java" ? (
        <pre className="nx-java" style={{ margin: 0, minHeight: 272, overflow: "auto", whiteSpace: "pre", padding: 20, lineHeight: 1.85, color: "var(--dark-300)", fontFamily: "var(--font-mono)", fontSize: 12.5 }} dangerouslySetInnerHTML={{ __html: JAVA_HTML }} />
      ) : null}

      {tab === "shell" ? (
        <div className="nx-ps" style={{ display: "flex", minHeight: 272, flexDirection: "column", background: "var(--term-ps-bg)", color: "var(--dark-50)", fontFamily: "var(--font-mono)", fontSize: 12.5 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8, borderBottom: "1px solid rgba(0,212,255,0.14)", background: "rgba(0,0,0,0.2)", padding: "10px 14px" }}>
            <span style={{ fontSize: 10.5, lineHeight: 1.6, color: "var(--dark-300)" }}>
              Run <code style={chip}>javac Profile.java</code> then <code style={chip}>java Profile</code>
            </span>
            <button type="button" onClick={runAll} disabled={busy} style={{ borderRadius: 4, border: "none", padding: "6px 12px", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, cursor: "pointer", background: "var(--primary-400)", color: "var(--dark-950)", boxShadow: "var(--glow-btn)", opacity: busy ? 0.6 : 1 }}>▶ Run</button>
          </div>
          <div ref={outRef} style={{ flex: 1, overflowY: "auto", padding: "12px 14px 4px", lineHeight: 1.8, maxHeight: 320 }}>
            {lines.map((l) => <div key={l.id} style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }} dangerouslySetInnerHTML={{ __html: l.html }} />)}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, padding: "2px 14px 12px" }}>
            <span dangerouslySetInnerHTML={{ __html: ps1 }} />
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onShellKey}
              disabled={busy} autoComplete="off" spellCheck={false} placeholder="type a command…" aria-label="Shell input"
              style={{ minWidth: 0, flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--dark-50)", caretColor: "var(--primary-400)" }} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
