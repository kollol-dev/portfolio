import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main id="main" className="grid min-h-dvh place-items-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xs border border-line-strong font-mono text-micro text-accent">
            KC
          </span>
          <p className="font-mono text-micro tracking-wider text-text-subtle uppercase">Portfolio dashboard</p>
        </div>
        <h1 className="font-display text-h2 text-text">
          Sign <em className="text-accent">in</em>
        </h1>
        <div className="mt-8 rounded-md border border-line bg-surface p-6">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
        <Link href="/" className="mt-6 inline-block text-caption text-text-subtle hover:text-text">
          ← Back to the site
        </Link>
      </div>
    </main>
  );
}
