"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Menu, X } from "lucide-react";
import Link from "next/link";
import { useContent, useHasBlog, useSections } from "@/content/ContentProvider";
import { useScrollStore } from "@/lib/scrollStore";
import { StageToggle } from "./StageToggle";
import { ScrollProgress } from "./ScrollProgress";

/**
 * Fixed top navigation: section links with the active one highlighted
 * (from the shared scroll store), resume download, and a mobile menu.
 */
export function SiteNav() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { profile } = useContent();
  const links = useSections().filter((s) => s.id !== "intro");
  const hasBlog = useHasBlog();
  const active = useScrollStore((st) => st.active);

  // Move focus into the menu on open; close on Escape and return focus to the toggle.
  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector("a")?.focus();
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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-bg">
      <nav aria-label="Primary" className="mx-auto flex h-(--nav-h) items-center justify-between gap-6 px-(--gutter)">
        <a href="#intro" className="flex min-h-11 items-center gap-3 text-caption font-medium tracking-tight text-text">
          <span
            aria-hidden
            className="grid size-7 place-items-center rounded-xs border border-line-strong font-mono text-micro text-accent"
          >
            KC
          </span>
          {/* Visually hidden on phones and on narrow desktops (where the section links need the room),
              but always the link's accessible name */}
          <span className="whitespace-nowrap max-sm:sr-only lg:max-xl:sr-only">{profile.name}</span>
        </a>

        <ul className="hidden items-center lg:flex xl:gap-1">
          {links.map((s) => {
            const current = s.id === active;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  aria-current={current ? "location" : undefined}
                  className={`relative flex min-h-11 items-center gap-1.5 rounded-sm px-2 text-caption xl:px-3 transition-colors duration-(--dur-base) hover:text-text ${
                    current ? "text-text" : "text-text-muted"
                  }`}
                >
                  <span
                    className={`font-mono text-micro transition-colors duration-(--dur-base) ${
                      current ? "text-accent" : "text-text-subtle"
                    }`}
                  >
                    {s.index}
                  </span>
                  {s.navLabel}
                  <span
                    aria-hidden
                    className={`absolute inset-x-2 bottom-2 h-px xl:inset-x-3 origin-left bg-accent transition-transform duration-(--dur-slow) ease-editorial ${
                      current ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </a>
              </li>
            );
          })}
          {hasBlog ? (
            <li>
              <Link
                href="/blog"
                className="flex min-h-11 items-center rounded-sm px-2 text-caption text-text-muted transition-colors duration-(--dur-base) hover:text-text xl:px-3"
              >
                Blog
              </Link>
            </li>
          ) : null}
        </ul>

        <div className="flex items-center gap-2">
          <StageToggle />
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
      <ScrollProgress />

      <div
        id="mobile-menu"
        ref={menuRef}
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
          {hasBlog ? (
            <li>
              <Link
                href="/blog"
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-baseline gap-4 py-3 text-lead text-text-muted"
              >
                <span className="font-mono text-micro text-accent">→</span>
                Blog
              </Link>
            </li>
          ) : null}
        </ul>
      </div>
    </header>
  );
}
