import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Post } from "@/data/blog";
import { PostCard } from "@/components/blog/PostCard";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Editorial";

/** "From the blog" on the home page: internal links to the newest articles. */
export function LatestPosts({ posts }: { posts: Post[] }) {
  if (!posts.length) return null;
  return (
    <section aria-labelledby="latest-posts-heading" className="border-t border-line py-(--section-py)">
      <Reveal>
        <Eyebrow index="→">Writing</Eyebrow>
        <h2 id="latest-posts-heading" className="mt-8 text-h2 text-balance text-text">
          From the <em className="editorial text-accent">blog</em>.
        </h2>
      </Reveal>
      <div className="mt-14 grid gap-10 md:pl-(--hang)">
        {posts.map((p) => (
          <Reveal key={p.id}>
            <PostCard post={p} headingLevel="h3" />
          </Reveal>
        ))}
      </div>
      <Link
        href="/blog"
        className="mt-10 inline-flex min-h-11 items-center gap-2 text-caption text-accent hover:text-accent-strong md:ml-(--hang)"
      >
        All articles <ArrowRight className="size-4" aria-hidden />
      </Link>
    </section>
  );
}
