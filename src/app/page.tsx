import { SiteNav } from "@/components/layout/SiteNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { StageFrame } from "@/components/layout/StageFrame";
import { SceneMount } from "@/three/SceneMount";
import { ScrollSync } from "@/components/layout/ScrollSync";
import { IntroSection } from "@/components/sections/IntroSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { CertificationsSection } from "@/components/sections/CertificationsSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { EducationSection } from "@/components/sections/EducationSection";
import { ActivitiesSection } from "@/components/sections/ActivitiesSection";
import { ContactSection } from "@/components/sections/ContactSection";

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-[60] rounded-sm bg-text px-4 py-2 text-bg focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <ScrollSync />
      <SiteNav />
      <StageFrame>
        <SceneMount />
      </StageFrame>
      <main id="main" className="px-(--gutter) lg:w-1/2 lg:pr-[clamp(2rem,4vw,5rem)]">
        <IntroSection />
        <ExperienceSection />
        <CertificationsSection />
        <ProjectsSection />
        <EducationSection />
        <ActivitiesSection />
        <ContactSection />
        <SiteFooter />
      </main>
    </>
  );
}
