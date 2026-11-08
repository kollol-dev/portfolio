import type { Metadata } from "next";
import { getContent, getRawContent } from "@/content/store";
import { SITE_URL } from "@/config/site";
import { SeoEditor } from "@/components/admin/SeoEditor";

export const metadata: Metadata = { title: "SEO" };

export default async function SeoPage() {
  const [content, raw] = await Promise.all([getContent(), getRawContent()]);
  return <SeoEditor initial={(raw.seo as object) ?? {}} content={content} siteUrl={SITE_URL} />;
}
