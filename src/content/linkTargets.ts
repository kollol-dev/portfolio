import type { Portfolio } from "@/data/portfolio";
import { postPath, type Post } from "@/data/blog";
import { buildSections } from "@/config/sections";
import type { LinkTarget } from "@/components/admin/blog/LinkDialog";

const words = (s: string) =>
  s
    .replace(/\*/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3);

/** Everything an article can link to internally: live posts + home page sections. */
export function buildLinkTargets(content: Portfolio, posts: Post[]): LinkTarget[] {
  const pages: LinkTarget[] = [
    {
      label: `Home — ${content.profile.name}`,
      url: "/",
      kind: "page",
      keywords: [content.profile.name, content.profile.title],
    },
    { label: "Blog", url: "/blog", kind: "page", keywords: ["my blog", "other articles"] },
    ...buildSections(content)
      .filter((s) => s.id !== "intro")
      .map((s) => ({
        label: `Home › ${s.navLabel}`,
        url: `/#${s.id}`,
        kind: "page" as const,
        keywords: [
          s.navLabel.toLowerCase(),
          ...(s.id === "projects" ? content.projects.map((p) => p.name) : []),
          ...(s.id === "contact" ? ["get in touch", "contact me", "hire me"] : []),
        ],
      })),
  ];
  const postTargets: LinkTarget[] = posts.map((p) => ({
    label: p.title,
    url: postPath(p),
    kind: "post",
    keywords: [
      p.seo.focusKeyword,
      ...p.seo.secondaryKeywords,
      p.title,
      ...(words(p.title).length > 3 ? [] : words(p.title)),
    ].filter(Boolean) as string[],
  }));
  return [...postTargets, ...pages];
}
