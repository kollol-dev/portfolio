"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { LogIn } from "lucide-react";
import { login, type LoginState } from "@/app/admin/actions";
import { Button, TextInput } from "./ui";

export function LoginForm() {
  const next = useSearchParams().get("next") ?? "/admin";
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  if (state.notConfigured) {
    return (
      <div
        role="alert"
        className="rounded-md border border-[#e0b45c]/40 bg-[#e0b45c]/10 p-4 text-caption text-[#e0c38a]"
      >
        <p className="font-medium">Admin login isn&rsquo;t set up yet.</p>
        <p className="mt-2 text-text-muted">
          Run <code className="font-mono text-text">npm run admin:setup</code> and add{" "}
          <code className="font-mono text-text">ADMIN_USERNAME</code>,{" "}
          <code className="font-mono text-text">ADMIN_PASSWORD_HASH</code> and{" "}
          <code className="font-mono text-text">SESSION_SECRET</code> to your environment variables, then restart the
          app.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="next" value={next} />
      <label className="block">
        <span className="mb-1.5 block text-caption text-text-muted">Username</span>
        <TextInput name="username" autoComplete="username" required autoFocus />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-caption text-text-muted">Password</span>
        <TextInput name="password" type="password" autoComplete="current-password" required />
      </label>
      <label className="flex items-center gap-2 text-caption text-text-muted">
        <input type="checkbox" name="remember" className="size-4 accent-[var(--c-accent)]" />
        Keep me signed in for 14 days
      </label>
      {state.error ? (
        <p
          role="alert"
          className="rounded-sm border border-[#c45b5b]/50 bg-[#c45b5b]/10 px-3 py-2 text-caption text-[#f0a3a3]"
        >
          {state.error}
        </p>
      ) : null}
      <Button type="submit" variant="primary" disabled={pending} className="mt-2 min-h-11">
        <LogIn className="size-4" aria-hidden /> {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
