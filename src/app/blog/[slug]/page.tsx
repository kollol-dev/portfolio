import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getContent, getLivePosts } from "@/content/store";
import { renderMarkdown } from "@/content/markdown";
import { SITE_URL } from "@/config/site";
import { formatDate, postDescription, postPath, postTitle, readingMinutes, relatedPosts } from "@/data/blog";
import { PostCard } from "@/components/blog/PostCard";
import { JsonLd } from "@/components/blog/JsonLd";
import { SocialLinks } from "@/components/ui/BrandIcons";

// Cache Components needs at least one param; the placeholder renders a 404.
const PLACEHOLDER = "__no-posts__";

export async function generateStaticParams() {
  const posts = await getLivePosts();
  return posts.length ? posts.map((p) => ({ slug: p.slug })) : [{ slug: PLACEHOLDER }];
}

async function findPost(slug: string) {
  return (await getLivePosts()).find((p) => p.slug === slug);
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await findPost(slug);
  if (!post) return { title: "Article not found", robots: { index: false } };
  const { profile } = await getContent();
  const title = postTitle(post);
  const description = postDescription(post);
  const keywords = [post.seo.focusKeyword, ...post.seo.secondaryKeywords, ...post.tags].filter(Boolean) as string[];
  return {
    title,
    description,
    keywords,
    authors: [{ name: profile.name, url: SITE_URL }],
    alternates: { canonical: post.seo.canonical ?? postPath(post) },
    robots: post.seo.noindex
      ? { index: false, follow: true }
      : { index: true, follow: true, "max-image-preview": "large" },
    openGraph: {
      type: "article",
      url: postPath(post),
      title,
      description,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [profile.name],
      section: post.category,
      tags: post.tags,
      ...(post.coverImage ? { images: [{ url: post.coverImage, alt: post.coverAlt ?? post.title }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

/**
 * The slug is read inside <Suspense> (see the default export), so a post
 * published after the build is rendered on its first visit and then cached,
 * instead of being served the build-time placeholder shell.
 */
async function Article({ params }: { params: PageProps<"/blog/[slug]">["params"] }) {
  const { slug } = await params;
  const [post, all, content] = await Promise.all([findPost(slug), getLivePosts(), getContent()]);
  if (!post) notFound();

  const { profile } = content;
  const article = renderMarkdown(post.body, SITE_URL);
  const minutes = readingMinutes(post.body);
  const related = relatedPosts(post, all);
  const url = `${SITE_URL}${postPath(post)}`;
  const updated = post.updatedAt.slice(0, 10) !== post.publishedAt.slice(0, 10);
  const toc = article.headings.filter((h) => h.depth === 2 || h.depth === 3);

  const schema: object[] = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: postDescription(post),
      url,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      articleSection: post.category,
      keywords: [post.seo.focusKeyword, ...post.seo.secondaryKeywords, ...post.tags].filter(Boolean).join(", "),
      wordCount: article.text.split(/\s+/).filter(Boolean).length,
      timeRequired: `PT${minutes}M`,
      inLanguage: "en",
      ...(post.coverImage ? { image: new URL(post.coverImage, SITE_URL).toString() } : {}),
      author: {
        "@type": "Person",
        name: profile.name,
        jobTitle: profile.title,
        url: SITE_URL,
        sameAs: profile.socials.filter((s) => s.kind !== "email").map((s) => s.href),
      },
      publisher: { "@type": "Person", name: profile.name, url: SITE_URL },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    },
  ];
  if (post.faqs.length) {
    schema.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: post.faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    });
  }

  return (
    <main id="main" className="pt-10 pb-24">
      <JsonLd data={schema} />

      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-caption text-text-subtle">
          <li>
            <Link href="/" className="hover:text-text">
              Home
            </Link>
          </li>
          <ChevronRight className="size-3.5" aria-hidden />
          <li>
            <Link href="/blog" className="hover:text-text">
              Blog
            </Link>
          </li>
          <ChevronRight className="size-3.5" aria-hidden />
          <li aria-current="page" className="max-w-[40ch] truncate text-text-muted">
            {post.title}
          </li>
        </ol>
      </nav>

      <header className="mt-10 max-w-3xl">
        <p className="font-mono text-micro tracking-wider text-accent uppercase">{post.category}</p>
        <h1 className="mt-4 font-display text-[clamp(2.25rem,1.5rem+3vw,3.75rem)] leading-[1.05] tracking-[-0.02em] text-balance text-text">
          {post.title}
        </h1>
        {post.excerpt ? <p className="mt-5 text-lead text-pretty text-text-muted">{post.excerpt}</p> : null}
        <p className="mt-6 flex flex-wrap gap-x-3 gap-y-1 font-mono text-micro tracking-wider text-text-subtle uppercase">
          <span>
            By{" "}
            <Link href="/" className="text-text hover:text-accent-strong">
              {profile.name}
            </Link>
          </span>
          <span aria-hidden>·</span>
          <span>
            Published <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          </span>
          {updated ? (
            <>
              <span aria-hidden>·</span>
              <span>
                Updated <time dateTime={post.updatedAt}>{formatDate(post.updatedAt)}</time>
              </span>
            </>
          ) : null}
          <span aria-hidden>·</span>
          <span>{minutes} min read</span>
        </p>
      </header>

      {post.coverImage ? (
        <figure className="relative mt-10 aspect-[1200/630] overflow-hidden rounded-md border border-line">
          <Image
            src={post.coverImage}
            alt={post.coverAlt ?? ""}
            fill
            priority
            unoptimized
            sizes="(min-width: 1152px) 1152px, 100vw"
            className="object-cover"
          />
        </figure>
      ) : null}

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="min-w-0 max-w-[70ch]">
          <div className="prose-article" dangerouslySetInnerHTML={{ __html: article.html }} />

          {post.faqs.length ? (
            <section aria-labelledby="faq-heading" className="mt-16 border-t border-line pt-10">
              <h2 id="faq-heading" className="font-display text-h3 text-text">
                Frequently asked questions
              </h2>
              <div className="mt-6 divide-y divide-line border-y border-line">
                {post.faqs.map((f) => (
                  <details key={f.question} className="group py-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-text">
                      <h3 className="text-base font-medium">{f.question}</h3>
                      <ChevronRight
                        className="size-4 shrink-0 text-text-subtle transition-transform group-open:rotate-90"
                        aria-hidden
                      />
                    </summary>
                    <p className="mt-3 text-text-muted">{f.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          ) : null}

          {post.tags.length ? (
            <ul aria-label="Tags" className="mt-10 flex flex-wrap gap-1.5">
              {post.tags.map((t) => (
                <li key={t} className="rounded-xs border border-line px-2 py-0.5 font-mono text-micro text-text-muted">
                  {t}
                </li>
              ))}
            </ul>
          ) : null}

          <aside
            aria-label="About the author"
            className="mt-12 flex gap-5 rounded-md border border-line bg-surface p-6"
          >
            <div className="relative size-16 shrink-0 overflow-hidden rounded-full border border-line">
              <Image
                src={profile.photo}
                alt={`Portrait of ${profile.name}`}
                fill
                sizes="64px"
                unoptimized
                className="object-cover object-top"
              />
            </div>
            <div>
              <p className="font-display text-h3 text-text">{profile.name}</p>
              <p className="text-caption text-text-subtle">
                {profile.title} · {profile.location}
              </p>
              <p className="mt-2 text-caption text-pretty text-text-muted">{profile.summary}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Link href="/#contact" className="text-caption text-accent hover:text-accent-strong">
                  Work with me →
                </Link>
                <SocialLinks links={profile.socials} />
              </div>
            </div>
          </aside>
        </div>

        {toc.length >= 2 ? (
          <aside className="hidden lg:block">
            <nav aria-label="On this page" className="sticky top-[calc(var(--nav-h)+2rem)]">
              <p className="eyebrow">On this page</p>
              <ol className="mt-4 grid gap-2 border-l border-line">
                {toc.map((h) => (
                  <li key={h.id} className={h.depth === 3 ? "pl-7" : "pl-4"}>
                    <a href={`#${h.id}`} className="text-caption text-text-subtle hover:text-text">
                      {h.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>
        ) : null}
      </div>

      {related.length ? (
        <section aria-labelledby="related-heading" className="mt-20 border-t border-line pt-12">
          <h2 id="related-heading" className="font-display text-h3 text-text">
            Continue reading
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {related.map((p) => (
              <PostCard key={p.id} post={p} headingLevel="h3" />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

export default function ArticlePage({ params }: PageProps<"/blog/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-[60vh] pt-10" aria-busy="true" />}>
      <Article params={params} />
    </Suspense>
  );
}
