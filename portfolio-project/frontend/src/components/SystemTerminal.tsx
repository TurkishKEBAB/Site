"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";

type TerminalTab = "sh" | "java" | "ps";

const terminalTabs: Array<{ id: TerminalTab; label: string }> = [
  { id: "sh", label: "profile.sh" },
  { id: "java", label: "Profile.java" },
  { id: "ps", label: "PowerShell" },
];

// Syntax-highlighted Java source (faithful to the design's Profile.java).
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

const escapeHtml = (value: string) =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

const ps1 = () =>
  `<span class="ps-prompt">PS</span> <span class="ps-path">${String.raw`C:\dev\yigit-okur`}</span><span class="ps-prompt">&gt;</span>`;

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

interface PsLine {
  id: number;
  html: string;
}

const introLines: PsLine[] = [
  { id: -2, html: '<span class="ps-dim">Windows PowerShell · javac / java ready</span>' },
  { id: -1, html: '<span class="ps-dim">Type a command or press ▶ Run.</span>' },
];

export default function SystemTerminal() {
  const [activeTab, setActiveTab] = useState<TerminalTab>("sh");
  const [psLines, setPsLines] = useState<PsLine[]>(introLines);
  const [psInput, setPsInput] = useState("");
  const [busy, setBusy] = useState(false);

  const compiledRef = useRef(false);
  const busyRef = useRef(false);
  const idRef = useRef(0);
  const reducedRef = useRef(false);
  const outRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (outRef.current) outRef.current.scrollTop = outRef.current.scrollHeight;
  }, [psLines]);

  const sleep = (ms: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, reducedRef.current ? 0 : ms));

  const push = (html: string) => {
    idRef.current += 1;
    const id = idRef.current;
    setPsLines((prev) => [...prev, { id, html }]);
  };

  const setBusyState = (value: boolean) => {
    busyRef.current = value;
    setBusy(value);
    if (!value) setTimeout(() => inputRef.current?.focus(), 0);
  };

  const typeOut = async (lines: string[]) => {
    for (const line of lines) {
      push(line);
      await sleep(120);
    }
  };

  const exec = async (raw: string) => {
    const cmd = raw.trim();
    const low = cmd.toLowerCase();
    push(`${ps1()} <span class="ps-cmd">${escapeHtml(raw)}</span>`);

    if (cmd === "") return;
    if (low === "cls" || low === "clear") {
      setPsLines([]);
      return;
    }
    if (low === "help") {
      push('<span class="ps-dim">Commands:</span>');
      push('  <span class="ps-ok">javac Profile.java</span>  <span class="ps-dim">compile the source</span>');
      push('  <span class="ps-ok">java Profile</span>        <span class="ps-dim">run → prints the profile</span>');
      push('  <span class="ps-ok">dir</span> · <span class="ps-ok">cls</span> · <span class="ps-ok">help</span>');
      return;
    }
    if (low === "dir" || low === "ls" || low === "gci") {
      push('<span class="ps-dim">Mode   Name</span>');
      push("-a---  Profile.java");
      if (compiledRef.current) push("-a---  Profile.class");
      return;
    }
    if (low === "javac profile.java" || low === "javac profile") {
      setBusyState(true);
      await sleep(520);
      compiledRef.current = true;
      push('<span class="ps-dim"># compiled → Profile.class</span>');
      setBusyState(false);
      return;
    }
    if (low === "java profile" || low === "java profile.class") {
      if (!compiledRef.current) {
        push('<span class="ps-err">Error: Could not find or load main class Profile</span>');
        push('<span class="ps-dim">Run </span><span class="ps-ok">javac Profile.java</span><span class="ps-dim"> first.</span>');
        return;
      }
      setBusyState(true);
      await typeOut(profileOutput);
      setBusyState(false);
      return;
    }
    const first = cmd.split(/\s+/)[0];
    push(
      `<span class="ps-err">${escapeHtml(first)} : The term '${escapeHtml(
        first,
      )}' is not recognized as a name of a cmdlet, function, or operable program.</span>`,
    );
  };

  const typeInto = async (value: string) => {
    if (reducedRef.current) {
      setPsInput(value);
      return;
    }
    setPsInput("");
    for (let i = 0; i <= value.length; i += 1) {
      setPsInput(value.slice(0, i));
      await sleep(38);
    }
  };

  const runAll = async () => {
    if (busyRef.current) return;
    compiledRef.current = false;
    setBusyState(true);
    await typeInto("javac Profile.java");
    setPsInput("");
    await exec("javac Profile.java");
    await sleep(340);
    await typeInto("java Profile");
    setPsInput("");
    await exec("java Profile");
    setBusyState(false);
  };

  const onPsKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (busyRef.current) {
      event.preventDefault();
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const value = psInput;
      setPsInput("");
      void exec(value);
    }
  };

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const next =
      event.key === "ArrowRight"
        ? (index + 1) % terminalTabs.length
        : (index - 1 + terminalTabs.length) % terminalTabs.length;
    setActiveTab(terminalTabs[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="nx-term-surface overflow-hidden rounded-lg border border-dark-600/70 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur">
      <div className="flex items-center gap-2 border-b border-dark-600/70 bg-black/30 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#ff5f57" }} />
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#febc2e" }} />
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#28c840" }} />
        <div className="ml-2 flex flex-1 gap-0.5" role="tablist" aria-label="Profile terminal tabs">
          {terminalTabs.map((tab, index) => {
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                type="button"
                role="tab"
                aria-selected={selected}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(event) => onTabKeyDown(event, index)}
                className={`min-w-0 flex-1 truncate rounded-t px-2.5 py-1.5 text-center font-mono text-[11px] tracking-tight transition-colors ${
                  selected ? "bg-dark-900/80 text-primary-400" : "text-dark-400 hover:text-dark-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative">
        {activeTab === "sh" && (
          <div className="min-h-[16rem] px-5 py-5 font-mono text-[12.5px] leading-[1.9] md:min-h-[17rem]">
            <div>
              <span className="text-primary-400">&gt;</span> <span className="text-dark-400">init</span>{" "}
              <span className="text-dark-50">system.profile</span>
            </div>
            {[
              ["name", "Yiğit Okur"],
              ["role", "Software Engineer"],
              ["focus", "Cloud & DevOps"],
              ["edu", "Isik University · SE ’27"],
            ].map(([key, value]) => (
              <div key={key}>
                <span className="inline-block w-20 text-dark-400">{key}</span>
                <span className="text-dark-50">{value}</span>
              </div>
            ))}
            <div>
              <span className="inline-block w-20 text-dark-400">status</span>
              <span className="text-emerald-400">[ available ]</span>
            </div>
            <div className="mt-1.5 flex items-center gap-3">
              <img src="/profile.jpg" alt="" className="h-11 w-11 rounded border border-primary-400/40 object-cover" />
              <span className="text-dark-400">// part-time SWE &amp; cloud roles</span>
            </div>
            <div className="mt-1">
              <span className="text-primary-400">&gt;</span> <span className="text-emerald-400">profile loaded</span>{" "}
              <span className="inline-block w-2 animate-blink bg-primary-400 text-transparent">_</span>
            </div>
          </div>
        )}

        {activeTab === "java" && (
          <pre
            className="nx-java m-0 min-h-[16rem] overflow-auto whitespace-pre px-5 py-5 font-mono text-[12.5px] leading-[1.85] text-dark-300 md:min-h-[17rem]"
            dangerouslySetInnerHTML={{ __html: JAVA_HTML }}
          />
        )}

        {activeTab === "ps" && (
          <div className="nx-ps flex min-h-[16rem] flex-col font-mono text-[12.5px] md:min-h-[17rem]" style={{ background: "#012456", color: "#eaf0ff" }}>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-black/20 px-3.5 py-2.5">
              <span className="text-[10.5px] leading-relaxed" style={{ color: "#9fb6e6" }}>
                Run{" "}
                <code className="rounded px-1.5 py-0.5" style={{ background: "rgba(255,255,255,0.07)", color: "#ffd866" }}>
                  javac Profile.java
                </code>{" "}
                then{" "}
                <code className="rounded px-1.5 py-0.5" style={{ background: "rgba(255,255,255,0.07)", color: "#ffd866" }}>
                  java Profile
                </code>
              </span>
              <button
                type="button"
                onClick={() => void runAll()}
                disabled={busy}
                className="rounded px-3 py-1.5 font-mono text-[11px] font-bold tracking-tight transition-colors disabled:opacity-60"
                style={{ background: "#ffd866", color: "#012456" }}
              >
                ▶ Run
              </button>
            </div>

            <div ref={outRef} className="flex-1 overflow-y-auto px-3.5 pb-1 pt-3 leading-[1.8]" style={{ maxHeight: "20rem" }}>
              {psLines.map((line) => (
                <div
                  key={line.id}
                  className="whitespace-pre-wrap break-words"
                  dangerouslySetInnerHTML={{ __html: line.html }}
                />
              ))}
            </div>

            <div className="flex items-baseline gap-2 px-3.5 pb-3 pt-0.5">
              <span dangerouslySetInnerHTML={{ __html: ps1() }} />
              <input
                ref={inputRef}
                value={psInput}
                onChange={(event) => setPsInput(event.target.value)}
                onKeyDown={onPsKeyDown}
                disabled={busy}
                autoComplete="off"
                spellCheck={false}
                placeholder="type a command…"
                aria-label="PowerShell input"
                className="min-w-0 flex-1 bg-transparent font-mono text-[12.5px] outline-none placeholder:text-[#5f78ad]"
                style={{ color: "#eaf0ff", caretColor: "#ffd866" }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
