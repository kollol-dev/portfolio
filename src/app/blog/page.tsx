import type { Metadata } from "next";
import { getContent, getLivePosts } from "@/content/store";
import { SITE_URL } from "@/config/site";
import { postPath } from "@/data/blog";
import { PostCard } from "@/components/blog/PostCard";
import { JsonLd } from "@/components/blog/JsonLd";

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getContent();
  const title = `Blog — ${profile.name}`;
  const description = `Articles by ${profile.name}, ${profile.title}, on backend engineering, system design and lessons from production.`;
  return {
    title,
    description,
    alternates: { canonical: "/blog", types: { "application/rss+xml": "/blog/rss.xml" } },
    openGraph: { type: "website", url: "/blog", title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function BlogIndex() {
  const [content, posts] = await Promise.all([getContent(), getLivePosts()]);
  const { profile } = content;

  return (
    <main id="main" className="pt-16 pb-24">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Blog",
            name: `${profile.name} — Blog`,
            url: `${SITE_URL}/blog`,
            author: { "@type": "Person", name: profile.name, url: SITE_URL },
            blogPost: posts.map((p) => ({
              "@type": "BlogPosting",
              headline: p.title,
              url: `${SITE_URL}${postPath(p)}`,
              datePublished: p.publishedAt,
              dateModified: p.updatedAt,
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
            ],
          },
        ]}
      />
      <p className="eyebrow flex items-center gap-3">
        <span className="text-accent">Blog</span>
        <span aria-hidden className="h-px w-8 bg-line-strong" />
        Writing
      </p>
      <h1 className="mt-6 max-w-3xl font-display text-h2 text-balance text-text">
        Notes on backend <em className="text-accent">engineering</em>.
      </h1>
      <p className="mt-4 max-w-2xl text-lead text-text-muted">
        Practical write-ups from {profile.name} on APIs, data pipelines and event-driven systems.
      </p>

      {posts.length ? (
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      ) : (
        <p className="mt-12 rounded-md border border-dashed border-line p-8 text-center text-text-subtle">
          The first article is on its way.
        </p>
      )}
    </main>
  );
}
