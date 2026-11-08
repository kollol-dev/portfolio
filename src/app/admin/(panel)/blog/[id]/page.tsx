import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAllPosts, getContent, getLivePosts } from "@/content/store";
import { buildLinkTargets } from "@/content/linkTargets";
import { SITE_URL } from "@/config/site";
import { PostEditor } from "@/components/admin/blog/PostEditor";

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.length ? posts.map((p) => ({ id: p.id })) : [{ id: "__none__" }];
}

export async function generateMetadata({ params }: PageProps<"/admin/blog/[id]">): Promise<Metadata> {
  const { id } = await params;
  const post = (await getAllPosts()).find((p) => p.id === id);
  return { title: post ? `Edit: ${post.title}` : "Edit post" };
}

async function Editor({ params }: { params: PageProps<"/admin/blog/[id]">["params"] }) {
  const { id } = await params;
  const [posts, live, content] = await Promise.all([getAllPosts(), getLivePosts(), getContent()]);
  const post = posts.find((p) => p.id === id);
  if (!post) notFound();
  return <PostEditor key={post.id} initial={post} linkTargets={buildLinkTargets(content, live)} siteUrl={SITE_URL} />;
}

export default function EditPostPage({ params }: PageProps<"/admin/blog/[id]">) {
  return (
    <Suspense fallback={<p className="py-10 text-caption text-text-faint">Loading post…</p>}>
      <Editor params={params} />
    </Suspense>
  );
}
