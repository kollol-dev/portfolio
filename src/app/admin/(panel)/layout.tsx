import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { getAllPosts, getContent } from "@/content/store";
import { EDITORS, findPlaceholders } from "@/content/editors";
import { analyzeSeo } from "@/content/seoAnalysis";
import { SITE_URL } from "@/config/site";
import { getSession } from "@/lib/auth/session";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { logout } from "../actions";

/** Re-checks the session (the proxy is the first check) and shows who's signed in. */
async function SessionBadge() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return (
    <span className="text-caption text-text-subtle">
      Signed in as <span className="text-text">{session.u}</span>
    </span>
  );
}

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  const content = await getContent();
  const score = analyzeSeo(content, SITE_URL).score;
  const todo = findPlaceholders(content).length;
  const posts = (await getAllPosts()).length;

  return (
    <>
      {/* The sidebar reads the current URL (active link), so it streams inside Suspense. */}
      <Suspense
        fallback={<div className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-surface lg:block" />}
      >
        <AdminSidebar
          editors={EDITORS.map(({ slug, label }) => ({ slug, label }))}
          seoScore={score}
          todo={todo}
          posts={posts}
        />
      </Suspense>
      <div className="lg:pl-64">
        <header className="flex h-16 items-center justify-end gap-4 border-b border-line px-4 sm:px-8">
          <Suspense fallback={<span className="text-caption text-text-faint">Checking session…</span>}>
            <SessionBadge />
          </Suspense>
          <form action={logout}>
            <button
              type="submit"
              className="inline-flex min-h-9 items-center gap-2 rounded-sm px-3 text-caption text-text-muted hover:bg-elevated hover:text-text"
            >
              <LogOut className="size-4" aria-hidden /> Log out
            </button>
          </form>
        </header>
        <main id="main" className="px-4 pt-2 pb-16 sm:px-8">
          {children}
        </main>
      </div>
    </>
  );
}
