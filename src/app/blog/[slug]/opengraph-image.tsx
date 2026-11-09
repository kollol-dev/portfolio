import { ImageResponse } from "next/og";
import { color, palette } from "@/styles/tokens3d";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getContent, getLivePosts } from "@/content/store";
import { formatDate } from "@/data/blog";

export const alt = "Article share image";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  const posts = await getLivePosts();
  return posts.length ? posts.map((p) => ({ slug: p.slug })) : [{ slug: "__no-posts__" }];
}

const font = (file: string) => readFile(join(process.cwd(), "public/fonts", file));

/** Per-article share card: title in the site's display font (Space Grotesk). */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [posts, content, sans, mono] = await Promise.all([
    getLivePosts(),
    getContent(),
    font("space-grotesk-latin-500-normal.woff"),
    font("geist-mono-latin-400-normal.woff"),
  ]);
  const post = posts.find((p) => p.slug === slug);
  const title = post?.title ?? content.profile.name;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: `radial-gradient(ellipse 70% 80% at 85% 40%, ${palette.slateBlue} 0%, ${color.bg} 70%)`,
          color: color.text,
          fontFamily: "Space Grotesk",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 16,
            fontFamily: "Geist Mono",
            fontSize: 22,
            letterSpacing: 3,
            color: color.accent,
          }}
        >
          {(post?.category ?? "Blog").toUpperCase()}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: title.length > 60 ? 64 : 80,
            lineHeight: 1.02,
            letterSpacing: -3,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: `1px solid ${color.line}`,
            paddingTop: 28,
            fontFamily: "Geist Mono",
            fontSize: 20,
            color: color.textMuted,
            letterSpacing: 2,
          }}
        >
          <span>{content.profile.name.toUpperCase()}</span>
          <span>{post ? formatDate(post.publishedAt).toUpperCase() : ""}</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Space Grotesk", data: sans, style: "normal", weight: 500 },
        { name: "Geist Mono", data: mono, style: "normal", weight: 400 },
      ],
    },
  );
}
