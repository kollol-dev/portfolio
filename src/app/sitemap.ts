import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/site";
import { getLivePosts } from "@/content/store";
import { postPath } from "@/data/blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = (await getLivePosts()).filter((p) => !p.seo.noindex && !p.seo.canonical);
  return [
    { url: `${SITE_URL}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.8, lastModified: posts[0]?.updatedAt },
    ...posts.map((p) => ({
      url: `${SITE_URL}${postPath(p)}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      ...(p.coverImage ? { images: [new URL(p.coverImage, SITE_URL).toString()] } : {}),
    })),
  ];
}
