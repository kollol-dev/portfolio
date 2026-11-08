import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Post } from "@/data/blog";
import { PostCard } from "@/components/blog/PostCard";
import { Reveal } from "@/components/ui/Reveal";

/** "From the blog" on the home page: internal links to the newest articles. */
export function LatestPosts({ posts }: { posts: Post[] }) {
  if (!posts.length) return null;
  return (
    <section aria-labelledby="latest-posts-heading" className="border-t border-line py-(--section-py)">
      <Reveal>
        <p className="eyebrow flex items-center gap-3">
          <span className="text-accent">Blog</span>
          <span aria-hidden className="h-px w-8 bg-line-strong" />
          Writing
        </p>
        <h2 id="latest-posts-heading" className="mt-6 font-display text-h2 text-balance text-text">
          From the <em className="text-accent">blog</em>.
        </h2>
      </Reveal>
      <div className="mt-10 grid gap-4">
        {posts.map((p) => (
          <Reveal key={p.id}>
            <PostCard post={p} headingLevel="h3" />
          </Reveal>
        ))}
      </div>
      <Link
        href="/blog"
        className="mt-8 inline-flex min-h-11 items-center gap-2 text-caption text-accent hover:text-accent-strong"
      >
        All articles <ArrowRight className="size-4" aria-hidden />
      </Link>
    </section>
  );
}
