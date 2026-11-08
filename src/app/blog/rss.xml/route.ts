import { getContent, getLivePosts } from "@/content/store";
import { SITE_URL } from "@/config/site";
import { postDescription, postPath } from "@/data/blog";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** RSS 2.0 feed of published articles. */
export async function GET() {
  const [posts, { profile }] = await Promise.all([getLivePosts(), getContent()]);
  const items = posts
    .map(
      (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${SITE_URL}${postPath(p)}</link>
      <guid isPermaLink="true">${SITE_URL}${postPath(p)}</guid>
      <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>
      <category>${esc(p.category)}</category>
      <description>${esc(postDescription(p))}</description>
    </item>`,
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(`${profile.name} — Blog`)}</title>
    <link>${SITE_URL}/blog</link>
    <atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml" />
    <description>${esc(`Articles by ${profile.name}, ${profile.title}.`)}</description>
    <language>en</language>
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
