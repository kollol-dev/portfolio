import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { getAllPosts } from "@/content/store";
import { renderMarkdown } from "@/content/markdown";
import { analyzeArticle } from "@/content/seoAnalysis";
import { SITE_URL } from "@/config/site";
import { formatDate, postPath } from "@/data/blog";
import { ScorePill } from "@/components/admin/ui";
import { createPost } from "../../actions";

export const metadata: Metadata = { title: "Blog posts" };

export default async function BlogAdmin() {
  const posts = await getAllPosts();
  const rows = posts.map((p) => ({
    post: p,
    score: analyzeArticle(p, renderMarkdown(p.body, SITE_URL), SITE_URL).score,
  }));

  return (
    <div className="py-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-h2 text-text">Blog</h1>
          <p className="mt-1 text-caption text-text-subtle">
            {posts.filter((p) => p.status === "published").length} published ·{" "}
            {posts.filter((p) => p.status === "draft").length} drafts
          </p>
        </div>
        <form action={createPost}>
          <button
            type="submit"
            className="inline-flex min-h-10 items-center gap-2 rounded-sm bg-accent px-4 text-caption font-medium text-[#1a1408] hover:bg-accent-strong"
          >
            <Plus className="size-4" aria-hidden /> New post
          </button>
        </form>
      </div>

      <div className="mt-8 overflow-x-auto rounded-md border border-line">
        <table className="w-full min-w-[40rem] text-left text-caption">
          <thead className="border-b border-line bg-surface font-mono text-micro tracking-wider text-text-subtle uppercase">
            <tr>
              <th className="px-4 py-3 font-normal">Title</th>
              <th className="px-4 py-3 font-normal">Status</th>
              <th className="px-4 py-3 font-normal">Date</th>
              <th className="px-4 py-3 font-normal">SEO</th>
              <th className="px-4 py-3 font-normal">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map(({ post, score }) => (
              <tr key={post.id} className="hover:bg-surface/60">
                <td className="px-4 py-3">
                  <Link href={`/admin/blog/${post.id}`} className="font-medium text-text hover:text-accent-strong">
                    {post.title}
                  </Link>
                  <p className="font-mono text-[0.6875rem] text-text-faint">{postPath(post)}</p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[0.625rem] uppercase ${
                      post.status === "published" ? "bg-[#7fb59a]/15 text-[#b8dcc7]" : "bg-[#e0b45c]/15 text-[#e0c38a]"
                    }`}
                  >
                    {post.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-muted">{formatDate(post.publishedAt)}</td>
                <td className="px-4 py-3">
                  <ScorePill score={score} />
                </td>
                <td className="px-4 py-3 text-right">
                  {post.status === "published" ? (
                    <a
                      href={postPath(post)}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center gap-1 text-text-subtle hover:text-text"
                    >
                      View <ArrowUpRight className="size-3.5" aria-hidden />
                    </a>
                  ) : null}
                </td>
              </tr>
            ))}
            {!rows.length ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-text-subtle">
                  No posts yet. Click “New post” to write your first article.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
