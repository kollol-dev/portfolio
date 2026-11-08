import { SiteNav } from "@/components/layout/SiteNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { StageFrame } from "@/components/layout/StageFrame";
import { SceneMount } from "@/three/SceneMount";
import { ScrollSync } from "@/components/layout/ScrollSync";
import { SITE_URL } from "@/config/site";
import type { Metadata } from "next";
import { seoDescription, seoTitle, type Portfolio } from "@/data/portfolio";
import { getContent, getLivePosts } from "@/content/store";
import { LatestPosts } from "@/components/sections/LatestPosts";
import { ContentProvider } from "@/content/ContentProvider";

/** schema.org Person, built only from real portfolio data. */
function personJsonLd(content: Portfolio) {
  const { profile, experience, education } = content;
  const current = experience.find((r) => r.end === "Present");
  const [city, country] = profile.location.split(",").map((part) => part.trim());
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.title,
    url: SITE_URL,
    email: `mailto:${profile.email}`,
    address: { "@type": "PostalAddress", addressLocality: city, addressCountry: country },
    sameAs: profile.socials.filter((s) => s.kind !== "email").map((s) => s.href),
    ...(current ? { worksFor: { "@type": "Organization", name: current.company } } : {}),
    alumniOf: education.map((e) => ({ "@type": "CollegeOrUniversity", name: e.institution })),
    knowsAbout: content.skills.flatMap((g) => g.items),
  };
}
import { IntroSection } from "@/components/sections/IntroSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { CertificationsSection } from "@/components/sections/CertificationsSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { EducationSection } from "@/components/sections/EducationSection";
import { ActivitiesSection } from "@/components/sections/ActivitiesSection";
import { ContactSection } from "@/components/sections/ContactSection";

/** SEO tags from the live content (edited in /admin → SEO). */
export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  const { profile, seo } = content;
  const title = seoTitle(content);
  const description = seoDescription(content);
  const keywords = [
    ...new Set([seo.focusKeyword, ...seo.secondaryKeywords, ...seo.keywords].filter(Boolean)),
  ] as string[];
  return {
    title,
    description,
    applicationName: `${profile.name} Portfolio`,
    authors: [{ name: profile.name, url: SITE_URL }],
    creator: profile.name,
    keywords,
    alternates: { canonical: "/" },
    openGraph: {
      type: "profile",
      url: "/",
      siteName: profile.name,
      title,
      description,
      locale: "en_US",
      firstName: profile.firstName,
      lastName: profile.lastName,
    },
    twitter: { card: "summary_large_image", title, description },
    robots: seo.noindex ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export default async function Home() {
  const [content, posts] = await Promise.all([getContent(), getLivePosts()]);
  return (
    <ContentProvider content={content} hasBlog={posts.length > 0}>
      <a
        href="#main"
        className="sr-only z-[60] rounded-sm bg-text px-4 py-2 text-bg focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <script
        type="application/ld+json"
        // Static, trusted data; "<" escaped so the JSON can't close the tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd(content)).replace(/</g, "\\u003c") }}
      />
      <ScrollSync />
      <SiteNav />
      <StageFrame>
        <SceneMount />
      </StageFrame>
      {/* Left editorial column; the right half belongs to the fixed stage on desktop. */}
      <div className="px-(--gutter) pt-(--stage-h) lg:w-1/2 lg:pr-[clamp(2rem,4vw,5rem)]">
        <main id="main" tabIndex={-1} className="outline-none">
          <IntroSection content={content} />
          <ExperienceSection content={content} />
          <CertificationsSection content={content} />
          <ProjectsSection content={content} />
          <EducationSection content={content} />
          <ActivitiesSection content={content} />
          <LatestPosts posts={posts.slice(0, 3)} />
          <ContactSection content={content} />
        </main>
        <SiteFooter content={content} />
      </div>
    </ContentProvider>
  );
}
