"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ComponentType } from "react";
import {
  Award,
  Briefcase,
  ExternalLink,
  FolderGit2,
  GraduationCap,
  Heading,
  LayoutDashboard,
  Newspaper,
  Menu,
  Search,
  Settings,
  Trophy,
  User,
  Wrench,
  X,
} from "lucide-react";
import { ScorePill } from "./ui";

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  profile: User,
  headings: Heading,
  experience: Briefcase,
  skills: Wrench,
  projects: FolderGit2,
  certifications: Award,
  education: GraduationCap,
  activities: Trophy,
};

interface Props {
  editors: { slug: string; label: string }[];
  seoScore: number;
  todo: number;
  posts: number;
}

/** WordPress-style admin menu. Collapses behind a button on small screens. */
export function AdminSidebar({ editors, seoScore, todo, posts }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const item = (href: string, label: string, Icon: ComponentType<{ className?: string }>, badge?: React.ReactNode) => {
    const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
    return (
      <li key={href}>
        <Link
          href={href}
          onClick={() => setOpen(false)}
          aria-current={active ? "page" : undefined}
          className={`flex min-h-10 items-center gap-3 rounded-sm px-3 text-caption transition-colors ${
            active
              ? "bg-elevated text-text shadow-[inset_2px_0_0_var(--c-accent)]"
              : "text-text-muted hover:bg-elevated/60 hover:text-text"
          }`}
        >
          <Icon className={`size-4 shrink-0 ${active ? "text-accent" : ""}`} aria-hidden />
          <span className="flex-1">{label}</span>
          {badge}
        </Link>
      </li>
    );
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="admin-menu"
        className="fixed top-3 left-3 z-50 grid size-10 place-items-center rounded-sm border border-line bg-surface text-text lg:hidden"
      >
        {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
      </button>

      <nav
        id="admin-menu"
        aria-label="Dashboard"
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-surface transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-line px-5">
          <span className="grid size-8 place-items-center rounded-xs border border-line-strong font-mono text-micro text-accent">
            KC
          </span>
          <div className="leading-tight">
            <p className="text-caption font-medium text-text">Portfolio</p>
            <p className="font-mono text-[0.625rem] tracking-wider text-text-subtle uppercase">Dashboard</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="grid gap-0.5">
            {item(
              "/admin",
              "Dashboard",
              LayoutDashboard,
              todo ? <span className="font-mono text-[0.625rem] text-[#e0c38a]">{todo} TBD</span> : null,
            )}
          </ul>
          <p className="mt-5 mb-1.5 px-3 font-mono text-[0.625rem] tracking-wider text-text-faint uppercase">Blog</p>
          <ul className="grid gap-0.5">
            {item(
              "/admin/blog",
              "Posts",
              Newspaper,
              posts ? <span className="font-mono text-[0.625rem] text-text-subtle">{posts}</span> : null,
            )}
          </ul>
          <p className="mt-5 mb-1.5 px-3 font-mono text-[0.625rem] tracking-wider text-text-faint uppercase">
            Home page
          </p>
          <ul className="grid gap-0.5">
            {editors.map((e) => item(`/admin/edit/${e.slug}`, e.label, ICONS[e.slug] ?? User))}
          </ul>
          <p className="mt-5 mb-1.5 px-3 font-mono text-[0.625rem] tracking-wider text-text-faint uppercase">Site</p>
          <ul className="grid gap-0.5">
            {item("/admin/seo", "Home page SEO", Search, <ScorePill score={seoScore} />)}
            {item("/admin/settings", "Settings", Settings)}
          </ul>
        </div>

        <div className="border-t border-line p-3">
          <a
            href="/"
            target="_blank"
            rel="noopener"
            className="flex min-h-10 items-center gap-3 rounded-sm px-3 text-caption text-text-muted hover:bg-elevated/60 hover:text-text"
          >
            <ExternalLink className="size-4" aria-hidden /> View site
          </a>
        </div>
      </nav>
      {open ? (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setOpen(false)} aria-hidden />
      ) : null}
    </>
  );
}
