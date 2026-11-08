import { readFile } from "node:fs/promises";
import { NextResponse, type NextRequest } from "next/server";
import { blogFile, blogSeedFile } from "@/content/paths";
import { SESSION_COOKIE, readAuthConfig, verifyToken } from "@/lib/auth/token";

/**
 * Guards the admin dashboard. Anything under /admin needs a valid session,
 * except the login page. Pages and Server Actions re-verify too, so this is
 * the first layer, not the only one.
 */
/** Is there a live (published, not scheduled) post with this slug? */
async function isLivePost(slug: string): Promise<boolean> {
  for (const file of [blogFile(), blogSeedFile()]) {
    try {
      const { posts } = JSON.parse(await readFile(file, "utf8")) as {
        posts?: { slug?: string; status?: string; publishedAt?: string }[];
      };
      return Boolean(
        posts?.some(
          (p) => p.slug === slug && p.status === "published" && Date.parse(p.publishedAt ?? "") <= Date.now(),
        ),
      );
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "ENOENT") return true; // unreadable: let the page decide
    }
  }
  return false;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Blog articles: answer unknown, draft and scheduled slugs with a real 404
  // before the page starts streaming (a streamed not-found would be a 200).
  if (pathname.startsWith("/blog/")) {
    const slug = pathname.slice("/blog/".length);
    if (slug && !slug.includes("/") && slug !== "rss.xml" && !(await isLivePost(slug))) {
      return NextResponse.rewrite(new URL("/blog/__no-posts__", request.url), { status: 404 });
    }
    return NextResponse.next();
  }
  const session = verifyToken(request.cookies.get(SESSION_COOKIE)?.value, readAuthConfig());
  const isLogin = pathname === "/admin/login";

  let response: NextResponse;
  if (isLogin && session) {
    response = NextResponse.redirect(new URL("/admin", request.url));
  } else if (!isLogin && !session) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("next", pathname + search);
    response = NextResponse.redirect(login);
  } else {
    response = NextResponse.next();
  }

  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "same-origin");
  response.headers.set("X-Content-Type-Options", "nosniff");
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/blog/:slug"],
};
