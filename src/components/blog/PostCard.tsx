import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatDate, postPath, readingMinutes, type Post } from "@/data/blog";

/** Article teaser used on the blog index, related posts and the home page. */
export function PostCard({ post, headingLevel = "h2" }: { post: Post; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <article className="group relative flex flex-col rounded-md border border-line bg-surface p-6 transition-colors duration-(--dur-base) hover:border-line-strong">
      <p className="font-mono text-micro tracking-wider text-text-subtle uppercase">
        <span className="text-accent">{post.category}</span> ·{" "}
        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time> · {readingMinutes(post.body)} min read
      </p>
      <Heading className="mt-3 text-h3 text-balance text-text">
        <Link href={postPath(post)} className="after:absolute after:inset-0 group-hover:text-accent-strong">
          {post.title}
        </Link>
      </Heading>
      {post.excerpt ? (
        <p className="mt-2 line-clamp-3 text-caption text-pretty text-text-muted">{post.excerpt}</p>
      ) : null}
      <span
        aria-hidden
        className="mt-auto flex items-center gap-1 pt-5 text-caption text-text-subtle group-hover:text-accent"
      >
        Read article <ArrowUpRight className="size-3.5" />
      </span>
    </article>
  );
}
