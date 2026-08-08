"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";

/* uptime epoch — first semester of the SE program */
const UPTIME_EPOCH = Date.parse("2023-09-18T09:00:00+03:00");

/* Every tab reserves the same box so switching never reflows the hero. */
const PANEL_MIN_HEIGHT = 300;

const fetchRows: Array<[string, string]> = [
  ["os", "YO.sys v2026 LTS"],
  ["host", "Işık University · SE '27"],
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
            {<span class="j-str">"edu"</span>,    <span class="j-str">"Işık University · SE '27"</span>},
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

const JAVA_LINES = JAVA_HTML.split("\n");
/* What the copy button hands over. Reaching this string by stripping tags out
   of JAVA_HTML with a regex is an unsafe way to sanitise markup, so the source
   is spelled out instead and a test asserts it still matches what is rendered. */
const JAVA_PLAIN = `public class Profile {
    public static void main(String[] args) {
        String[][] info = {
            {"name",   "Yiğit Okur"},
            {"role",   "Software Engineer"},
            {"focus",  "Cloud & DevOps"},
            {"edu",    "Işık University · SE '27"},
            {"status", "[ available ]"},
        };
        System.out.println("> init system.profile");
        for (String[] row : info) {
            System.out.printf("%-9s %s%n", row[0], row[1]);
        }
        System.out.println("// part-time SWE & cloud roles");
        System.out.println("> profile loaded");
    }
}`;

const profileOutput = [
  '<span class="c-prompt">&gt;</span> <span class="c-dim">init</span> system.profile',
  '<span class="c-key">name</span>      <span class="c-val">Yiğit Okur</span>',
  '<span class="c-key">role</span>      <span class="c-val">Software Engineer</span>',
  '<span class="c-key">focus</span>     <span class="c-val">Cloud &amp; DevOps</span>',
  '<span class="c-key">edu</span>       <span class="c-val">Işık University · SE ’27</span>',
  '<span class="c-key">status</span>    <span class="c-ok">[ available ]</span>',
  '<span class="c-dim">// part-time SWE &amp; cloud roles</span>',
  '<span class="c-prompt">&gt;</span> <span class="c-ok">profile loaded</span>',
];

/* name → one-line summary, shared by `help` and tab completion */
const COMMANDS: Array<[string, string]> = [
  ["javac Profile.java", "compile the source"],
  ["java Profile", "run it — prints the profile"],
  ["yofetch", "system summary"],
  ["ls", "list the working directory"],
  ["whoami", "current user"],
  ["pwd", "working directory"],
  ["date", "local time in Istanbul"],
  ["uptime", "time since the first semester"],
  ["open <page>", "jump to a page on the site"],
  ["cls", "clear the screen"],
  ["help", "this list"],
];

const PAGES: Array<[string, string]> = [
  ["projects", "/projects"],
  ["blog", "/blog"],
  ["contact", "/contact"],
  ["resume", "/resume"],
  ["about", "/about"],
];

const COMPLETIONS = [
  "javac Profile.java", "java Profile", "yofetch", "ls", "dir", "whoami", "pwd",
  "date", "uptime", "cls", "clear", "help",
  ...PAGES.map(([name]) => `open ${name}`),
];

const escapeHtml = (v: string) => v.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const ps1 = '<span class="ps-path">yigit@yo-sys</span><span class="ps-dim">:~</span> <span class="ps-prompt">❯</span>';

const pad2 = (n: number) => String(n).padStart(2, "0");
const fmtUptime = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 86400)}d ${pad2(Math.floor(s / 3600) % 24)}:${pad2(Math.floor(s / 60) % 60)}:${pad2(s % 60)}`;
};

/** Longest string every candidate starts with — used for tab completion. */
const commonPrefix = (values: string[]) => {
  if (values.length === 0) return "";
  let prefix = values[0];
  for (const value of values.slice(1)) {
    while (!value.toLowerCase().startsWith(prefix.toLowerCase())) prefix = prefix.slice(0, -1);
  }
  return prefix;
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

const TABS: Array<[Tab, string]> = [["fetch", "yofetch"], ["java", "Profile.java"], ["shell", "shell"]];

/**
 * Hero terminal: traffic lights + 3 tabs (yofetch, Profile.java, shell).
 * yofetch = neofetch-style ID panel — duotone photo with scanline sweep, live
 * uptime, status, palette blocks. Profile.java = the source with a gutter, a
 * copy button and a Run that hands off to the shell. shell = a working toy
 * shell with history, tab completion and the house command set.
 */
export default function SystemTerminal({ profileSrc = "/profile-zurich.webp", className = "" }: { profileSrc?: string; className?: string }) {
  const [tab, setTab] = useState<Tab>("fetch");
  const [rawPhoto, setRawPhoto] = useState(false);
  // Keep the server and first client render identical; the live value starts
  // immediately after hydration in the effect below.
  const [now, setNow] = useState(UPTIME_EPOCH);
  const [lines, setLines] = useState<Line[]>([
    { id: -2, html: '<span class="ps-dim">yo-shell 2.0 · javac / java ready</span>' },
    { id: -1, html: '<span class="ps-dim">Type a command, press ↹ to complete, ↑ for history.</span>' },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cursor, setCursor] = useState<number | null>(null);
  const compiled = useRef(false);
  const idRef = useRef(0);
  const outRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const history = useRef<string[]>([]);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (outRef.current) outRef.current.scrollTop = outRef.current.scrollHeight;
  }, [lines]);
  // Land in the shell ready to type instead of hunting for the caret.
  useEffect(() => {
    if (tab === "shell") inputRef.current?.focus();
  }, [tab]);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

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
      for (const [name, description] of COMMANDS) {
        push(`  <span class="ps-ok">${escapeHtml(name.padEnd(20))}</span><span class="ps-dim">${escapeHtml(description)}</span>`);
      }
      return;
    }
    if (low === "dir" || low === "ls") {
      push(`<span class="ps-ok">Profile.java</span>${compiled.current ? '  <span class="ps-dim">Profile.class</span>' : ""}`);
      return;
    }
    if (low === "whoami") {
      push('<span class="ps-ok">yigit</span> <span class="ps-dim">· software engineering student, cloud &amp; devops</span>');
      return;
    }
    if (low === "pwd") {
      push('<span class="ps-ok">/home/yigit/yo-sys</span>');
      return;
    }
    if (low === "date") {
      const stamp = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Istanbul", dateStyle: "medium", timeStyle: "medium",
      }).format(new Date());
      push(`<span class="ps-ok">${escapeHtml(stamp)}</span> <span class="ps-dim">Europe/Istanbul</span>`);
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
    if (low.startsWith("open")) {
      const target = low.slice(4).trim();
      const match = PAGES.find(([name]) => name === target);
      if (!match) {
        push(`<span class="ps-err">open: unknown page</span> <span class="ps-dim">— try</span> <span class="ps-ok">${PAGES.map(([name]) => name).join(" · ")}</span>`);
        return;
      }
      push(`<span class="ps-dim">→</span> <a href="${match[1]}" class="ps-link">${escapeHtml(match[1])}</a>`);
      return;
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
    setTab("shell");
    compiled.current = false;
    setBusy(true);
    await exec("javac Profile.java");
    await sleep(340);
    await exec("java Profile");
    setBusy(false);
  };

  const complete = () => {
    const value = input.trim();
    if (!value) return;
    const matches = COMPLETIONS.filter((c) => c.toLowerCase().startsWith(value.toLowerCase()));
    if (matches.length === 0) return;
    if (matches.length === 1) { setInput(matches[0]); return; }
    setInput(commonPrefix(matches));
    push(`<span class="ps-dim">${matches.map((m) => escapeHtml(m)).join("   ")}</span>`);
  };

  const recall = (step: -1 | 1) => {
    const items = history.current;
    if (items.length === 0) return;
    if (step === -1) {
      const next = cursor === null ? items.length - 1 : Math.max(0, cursor - 1);
      setCursor(next);
      setInput(items[next]);
      return;
    }
    if (cursor === null) return;
    const next = cursor + 1;
    if (next >= items.length) { setCursor(null); setInput(""); return; }
    setCursor(next);
    setInput(items[next]);
  };

  const onShellKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") { e.preventDefault(); if (!busy) complete(); return; }
    if (busy) { e.preventDefault(); return; }
    if (e.key === "ArrowUp") { e.preventDefault(); recall(-1); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); recall(1); return; }
    if (e.key === "Enter") {
      e.preventDefault();
      const v = input;
      if (v.trim() && history.current[history.current.length - 1] !== v.trim()) {
        history.current = [...history.current, v.trim()];
      }
      setCursor(null);
      setInput("");
      void exec(v);
    }
  };

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const order = TABS.map(([id]) => id);
    const at = order.indexOf(tab);
    if (e.key === "ArrowRight") { e.preventDefault(); setTab(order[(at + 1) % order.length]); }
    if (e.key === "ArrowLeft") { e.preventDefault(); setTab(order[(at - 1 + order.length) % order.length]); }
    if (e.key === "Home") { e.preventDefault(); setTab(order[0]); }
    if (e.key === "End") { e.preventDefault(); setTab(order[order.length - 1]); }
  };

  const copyJava = async () => {
    try {
      await navigator.clipboard.writeText(JAVA_PLAIN);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const mono: CSSProperties = { fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.8 };
  const keyStyle: CSSProperties = { color: "var(--primary-400)", display: "inline-block", minWidth: 64, flexShrink: 0 };
  const chip: CSSProperties = { borderRadius: 3, padding: "2px 6px", background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.28)", color: "var(--primary-400)" };
  const barBtn: CSSProperties = { borderRadius: 4, border: "1px solid rgba(0,212,255,0.28)", background: "rgba(0,212,255,0.08)", padding: "4px 10px", fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.04em", color: "var(--primary-300)", cursor: "pointer" };
  const panel = (extra: CSSProperties = {}): CSSProperties => ({ minHeight: PANEL_MIN_HEIGHT, ...extra });

  return (
    <div className={`nx-term-surface ${className}`} style={{ overflow: "hidden", borderRadius: 8, border: "1px solid rgba(30,30,62,0.7)", boxShadow: "var(--shadow-terminal)", backdropFilter: "blur(8px)", background: "rgba(10,10,20,0.72)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid rgba(30,30,62,0.7)", background: "rgba(0,0,0,0.3)", padding: "10px 16px" }}>
        <span style={{ width: 10, height: 10, borderRadius: 9999, background: "var(--traffic-red)" }} />
        <span style={{ width: 10, height: 10, borderRadius: 9999, background: "var(--traffic-yellow)" }} />
        <span style={{ width: 10, height: 10, borderRadius: 9999, background: "var(--traffic-green)" }} />
        <div style={{ marginLeft: 8, display: "flex", flex: 1, gap: 2 }} role="tablist" aria-label="Terminal panels">
          {TABS.map(([id, label]) => (
            <button key={id} type="button" role="tab" id={`nx-tab-${id}`} aria-controls={`nx-panel-${id}`}
              aria-selected={tab === id} tabIndex={tab === id ? 0 : -1}
              onClick={() => setTab(id)} onKeyDown={onTabKey}
              style={{ minWidth: 0, flex: 1, borderRadius: "4px 4px 0 0", padding: "6px 10px", textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "-0.01em", border: "none", cursor: "pointer", transition: "color 200ms", background: tab === id ? "rgba(10,10,20,0.8)" : "transparent", color: tab === id ? "var(--primary-400)" : "var(--dark-400)" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === "fetch" ? (
        <div role="tabpanel" id="nx-panel-fetch" aria-labelledby="nx-tab-fetch"
          style={panel({ display: "flex", gap: 16, padding: 18, ...mono })}>
          {/* — photo: cyan duotone + scanline sweep + HUD brackets — */}
          {profileSrc ? (
            <button type="button" onClick={() => setRawPhoto((r) => !r)} aria-pressed={rawPhoto} title={rawPhoto ? "Apply cyan duotone" : "Show original photo"} style={{ position: "relative", display: "block", width: "clamp(120px, 40%, 158px)", flexShrink: 0, alignSelf: "stretch", minHeight: 208, overflow: "hidden", borderRadius: 4, border: "1px solid rgba(0,212,255,0.35)", boxShadow: "0 0 28px rgba(0,212,255,0.12)", padding: 0, background: "transparent", cursor: "pointer" }}>
              <img src={profileSrc} alt="Yiğit Okur" fetchPriority="high" decoding="async" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 30%", filter: rawPhoto ? "none" : "grayscale(0.7) contrast(1.06) brightness(0.95)", transition: "filter 300ms var(--ease-nx)" }} />
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
        <div role="tabpanel" id="nx-panel-java" aria-labelledby="nx-tab-java"
          style={panel({ display: "flex", flexDirection: "column" })}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8, borderBottom: "1px solid rgba(0,212,255,0.14)", background: "rgba(0,0,0,0.2)", padding: "8px 14px", fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--dark-400)" }}>
            <span>
              <span style={{ color: "var(--primary-400)" }}>Profile.java</span>
              <span> · java 21 · {JAVA_LINES.length} lines · UTF-8</span>
            </span>
            <span style={{ display: "flex", gap: 6 }}>
              <button type="button" onClick={copyJava} style={barBtn}>{copied ? "copied ✓" : "copy"}</button>
              <button type="button" onClick={runAll} disabled={busy} style={{ ...barBtn, opacity: busy ? 0.6 : 1 }}>▶ run</button>
            </span>
          </div>
          <pre className="nx-java" style={{ margin: 0, flex: 1, overflow: "auto", padding: "14px 16px", lineHeight: 1.85, color: "var(--dark-300)", fontFamily: "var(--font-mono)", fontSize: 12.5 }}>
            {JAVA_LINES.map((line, index) => (
              <div key={`line-${index}`} style={{ display: "flex", gap: 14 }}>
                <span aria-hidden="true" style={{ flexShrink: 0, width: 18, textAlign: "right", color: "var(--dark-600)", userSelect: "none" }}>{index + 1}</span>
                <span style={{ flex: 1, minWidth: 0, whiteSpace: "pre" }} dangerouslySetInnerHTML={{ __html: line || "&nbsp;" }} />
              </div>
            ))}
          </pre>
        </div>
      ) : null}

      {tab === "shell" ? (
        <div role="tabpanel" id="nx-panel-shell" aria-labelledby="nx-tab-shell" className="nx-ps"
          style={panel({ display: "flex", flexDirection: "column", background: "var(--term-ps-bg)", color: "var(--dark-50)", fontFamily: "var(--font-mono)", fontSize: 12.5 })}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8, borderBottom: "1px solid rgba(0,212,255,0.14)", background: "rgba(0,0,0,0.2)", padding: "10px 14px" }}>
            <span style={{ fontSize: 10.5, lineHeight: 1.6, color: "var(--dark-300)" }}>
              Run <code style={chip}>javac Profile.java</code> then <code style={chip}>java Profile</code>
            </span>
            <button type="button" onClick={runAll} disabled={busy} style={{ borderRadius: 4, border: "none", padding: "6px 12px", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, cursor: "pointer", background: "var(--primary-400)", color: "var(--dark-950)", boxShadow: "var(--glow-btn)", opacity: busy ? 0.6 : 1 }}>▶ Run</button>
          </div>
          <div ref={outRef} style={{ flex: 1, overflowY: "auto", padding: "12px 14px 4px", lineHeight: 1.8, maxHeight: 320 }}>
            {lines.map((l) => <div key={l.id} style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }} dangerouslySetInnerHTML={{ __html: l.html }} />)}
          </div>
          {/* The label makes the whole prompt row a focus target for the input. */}
          <label htmlFor="nx-shell-input" style={{ display: "flex", alignItems: "baseline", gap: 8, padding: "2px 14px 12px", cursor: "text" }}>
            <span dangerouslySetInnerHTML={{ __html: ps1 }} />
            <input id="nx-shell-input" ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onShellKey}
              disabled={busy} autoComplete="off" spellCheck={false} placeholder="type a command…" aria-label="Shell input"
              style={{ minWidth: 0, flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--dark-50)", caretColor: "var(--primary-400)" }} />
          </label>
        </div>
      ) : null}
    </div>
  );
}
