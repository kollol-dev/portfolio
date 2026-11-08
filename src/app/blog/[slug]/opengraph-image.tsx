import { ImageResponse } from "next/og";
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

/** Per-article share card: title in the site's display font. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [posts, content, serif, sans, mono] = await Promise.all([
    getLivePosts(),
    getContent(),
    font("instrument-serif-latin-400-normal.woff"),
    font("geist-sans-latin-400-normal.woff"),
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
          background: "radial-gradient(ellipse 70% 80% at 85% 40%, #17171b 0%, #0a0a0c 70%)",
          color: "#ededef",
          fontFamily: "Geist",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 16,
            fontFamily: "Geist Mono",
            fontSize: 22,
            letterSpacing: 3,
            color: "#c8a97e",
          }}
        >
          {(post?.category ?? "Blog").toUpperCase()}
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: "Instrument Serif",
            fontSize: title.length > 60 ? 64 : 80,
            lineHeight: 1.05,
            letterSpacing: -2,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: 28,
            fontFamily: "Geist Mono",
            fontSize: 20,
            color: "#8a8a93",
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
        { name: "Instrument Serif", data: serif, style: "normal", weight: 400 },
        { name: "Geist", data: sans, style: "normal", weight: 400 },
        { name: "Geist Mono", data: mono, style: "normal", weight: 400 },
      ],
    },
  );
}
