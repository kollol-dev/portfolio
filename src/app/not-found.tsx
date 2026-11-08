import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { LinkButton } from "@/components/ui/LinkButton";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-(--content-max) flex-col justify-center px-(--gutter)">
      <p className="eyebrow flex items-center gap-3">
        <span className="text-accent">404</span>
        <span aria-hidden className="h-px w-8 bg-line-strong" />
        Not found
      </p>
      <h1 className="mt-6 font-display text-h2 text-text">
        Nothing on <em className="text-accent">this</em> shelf.
      </h1>
      <p className="mt-4 text-lead text-text-muted">The page you’re looking for doesn’t exist or has moved.</p>
      <div className="mt-10">
        <LinkButton href="/" icon={<ArrowLeft className="size-4" strokeWidth={1.75} />}>
          Back to the portfolio
        </LinkButton>
      </div>
    </main>
  );
}
