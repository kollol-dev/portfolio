"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Menu, X } from "lucide-react";
import { SECTIONS } from "@/config/sections";
import { portfolio } from "@/data/portfolio";
import { useScrollStore } from "@/lib/scrollStore";

const links = SECTIONS.filter((s) => s.id !== "intro");

/**
 * Fixed top navigation: section links with the active one highlighted
 * (from the shared scroll store), resume download, and a mobile menu.
 */
export function SiteNav() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const { profile } = portfolio;
  const active = useScrollStore((st) => st.active);

  // Close on Escape and return focus to the toggle.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-bg/80 backdrop-blur-md supports-[backdrop-filter]:bg-bg/70">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-(--nav-h) items-center justify-between gap-6 px-(--gutter)"
      >
        <a
          href="#intro"
          className="flex min-h-11 items-center gap-3 text-caption font-medium tracking-tight text-text"
        >
          <span
            aria-hidden
            className="grid size-7 place-items-center rounded-xs border border-line-strong font-mono text-micro text-accent"
          >
            KC
          </span>
          <span className="hidden sm:inline">{profile.name}</span>
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((s) => {
            const current = s.id === active;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  aria-current={current ? "location" : undefined}
                  className={`relative flex min-h-11 items-center gap-1.5 rounded-sm px-3 text-caption transition-colors duration-(--dur-base) hover:text-text ${
                    current ? "text-text" : "text-text-muted"
                  }`}
                >
                  <span
                    className={`font-mono text-micro transition-colors duration-(--dur-base) ${
                      current ? "text-accent" : "text-text-faint"
                    }`}
                  >
                    {s.index}
                  </span>
                  {s.navLabel}
                  <span
                    aria-hidden
                    className={`absolute inset-x-3 bottom-2 h-px origin-left bg-accent transition-transform duration-(--dur-slow) ease-out-expo ${
                      current ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </a>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href={profile.resumePath}
            download="Kollol-Chakraborty-Resume.pdf"
            className="inline-flex min-h-9 items-center gap-2 rounded-sm border border-line-strong px-3 text-caption text-text transition-colors duration-(--dur-base) hover:border-accent hover:text-accent-strong"
          >
            <Download className="size-3.5" aria-hidden strokeWidth={1.75} />
            Resume
            <span className="sr-only"> (PDF)</span>
          </a>
          <button
            ref={toggleRef}
            type="button"
            className="grid size-11 place-items-center rounded-sm text-text-muted hover:text-text lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </nav>

      <div
        id="mobile-menu"
        hidden={!open}
        className="border-t border-line bg-bg px-(--gutter) pb-6 lg:hidden"
      >
        <ul className="divide-y divide-line">
          {links.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                onClick={() => setOpen(false)}
                aria-current={s.id === active ? "location" : undefined}
                className={`flex min-h-12 items-baseline gap-4 py-3 text-lead ${
                  s.id === active ? "text-text" : "text-text-muted"
                }`}
              >
                <span className="font-mono text-micro text-accent">{s.index}</span>
                {s.navLabel}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
