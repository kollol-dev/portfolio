import { getContent } from "@/content/store";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default async function BlogLayout({ children }: LayoutProps<"/blog">) {
  const content = await getContent();
  return (
    <>
      <a
        href="#main"
        className="sr-only z-[60] rounded-sm bg-text px-4 py-2 text-bg focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <BlogHeader content={content} />
      <div className="mx-auto max-w-6xl px-(--gutter) pt-(--nav-h)">
        {children}
        <SiteFooter content={content} />
      </div>
    </>
  );
}
