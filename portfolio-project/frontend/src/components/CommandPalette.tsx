"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { FiCommand, FiExternalLink, FiSearch, FiX } from "react-icons/fi";

import { siteConfig } from "@/content/site";

interface CommandPaletteAction {
  label: string;
  detail: string;
  href: string;
  external: boolean;
}

const commands: CommandPaletteAction[] = [
  { label: "Home", detail: "Open system profile", href: "/", external: false },
  { label: "About", detail: "Read current signal", href: "/about", external: false },
  { label: "Projects", detail: "Inspect architecture", href: "/projects", external: false },
  { label: "Contact", detail: "Open direct channels", href: "/contact", external: false },
  { label: "GitHub", detail: "@TurkishKEBAB", href: siteConfig.github, external: true },
];

export default function CommandPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredCommands = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return commands;

    return commands.filter((command) =>
      `${command.label} ${command.detail}`.toLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }

      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    setOpen(false);
    setQuery("");
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true });
    }, 0);

    return () => window.clearTimeout(focusTimer);
  }, [open]);

  const executeCommand = (command: CommandPaletteAction) => {
    if (command.external) {
      window.open(command.href, "_blank", "noopener,noreferrer");
    } else {
      router.push(command.href);
    }

    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden md:inline-flex h-9 items-center gap-2 rounded border border-gray-200 bg-white/80 px-2.5 font-mono text-[10px] uppercase tracking-wide text-gray-500 transition-colors hover:border-primary-400/50 hover:text-primary-600 dark:border-dark-600 dark:bg-dark-800/50 dark:text-dark-300 dark:hover:text-primary-400"
        aria-label="Open command palette"
        title="Command palette"
      >
        <FiCommand size={13} aria-hidden="true" />
        <span className="hidden xl:inline">Cmd</span>
        <span className="text-primary-600 dark:text-primary-400">K</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-start justify-center bg-dark-950/60 px-4 pt-24 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-lg rounded border border-dark-600 bg-dark-900 text-dark-50 shadow-2xl shadow-dark-950/40"
              role="dialog"
              aria-modal="true"
              aria-label="Command palette"
            >
              <div className="flex items-center gap-3 border-b border-dark-600 px-4 py-3">
                <FiSearch size={16} className="text-primary-400" aria-hidden="true" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search commands"
                  className="min-w-0 flex-1 bg-transparent font-mono text-sm text-dark-50 outline-none placeholder:text-dark-400"
                />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded p-1 text-dark-400 transition-colors hover:text-primary-400"
                  aria-label="Close command palette"
                >
                  <FiX size={16} />
                </button>
              </div>

              <div className="p-2">
                {filteredCommands.map((command) => (
                  <button
                    type="button"
                    key={command.label}
                    onClick={() => executeCommand(command)}
                    className="flex w-full items-center justify-between rounded px-3 py-3 text-left transition-colors hover:bg-primary-400/10"
                  >
                    <span>
                      <span className="block font-mono text-xs uppercase tracking-[0.18em] text-dark-50">
                        {command.label}
                      </span>
                      <span className="mt-1 block text-sm text-dark-300">{command.detail}</span>
                    </span>
                    {command.external ? (
                      <FiExternalLink size={15} className="text-primary-400" aria-hidden="true" />
                    ) : (
                      <span className="font-mono text-xs text-primary-400">Enter</span>
                    )}
                  </button>
                ))}

                {filteredCommands.length === 0 && (
                  <div className="px-3 py-6 text-center font-mono text-xs uppercase tracking-[0.18em] text-dark-400">
                    No command found
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
