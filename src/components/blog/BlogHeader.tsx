import Link from "next/link";
import { Download } from "lucide-react";
import type { Portfolio } from "@/data/portfolio";

/** Site header for blog pages (the home page has its own scroll-linked nav). */
export function BlogHeader({ content }: { content: Portfolio }) {
  const { profile } = content;
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-bg/85 backdrop-blur-md">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-(--nav-h) max-w-6xl items-center justify-between gap-6 px-(--gutter)"
      >
        <Link href="/" className="flex min-h-11 items-center gap-3 text-caption font-medium tracking-tight text-text">
          <span
            aria-hidden
            className="grid size-7 place-items-center rounded-xs border border-line-strong font-mono text-micro text-accent"
          >
            KC
          </span>
          <span className="max-sm:sr-only">{profile.name}</span>
        </Link>
        <ul className="flex items-center gap-1 text-caption">
          <li>
            <Link href="/" className="flex min-h-11 items-center rounded-sm px-3 text-text-muted hover:text-text">
              Home
            </Link>
          </li>
          <li>
            <Link href="/blog" className="flex min-h-11 items-center rounded-sm px-3 text-text-muted hover:text-text">
              Blog
            </Link>
          </li>
          <li className="max-sm:hidden">
            <Link
              href="/#contact"
              className="flex min-h-11 items-center rounded-sm px-3 text-text-muted hover:text-text"
            >
              Contact
            </Link>
          </li>
          <li>
            <a
              href={profile.resumePath}
              download="Kollol-Chakraborty-Resume.pdf"
              className="ml-1 inline-flex min-h-9 items-center gap-2 rounded-sm border border-line-strong px-3 text-text hover:border-accent hover:text-accent-strong"
            >
              <Download className="size-3.5" aria-hidden strokeWidth={1.75} />
              Resume<span className="sr-only"> (PDF)</span>
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
