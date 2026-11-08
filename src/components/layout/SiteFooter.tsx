import { portfolio } from "@/data/portfolio";
import { SocialLinks } from "@/components/ui/BrandIcons";

export function SiteFooter() {
  return (
    <footer className="border-t border-line py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="font-mono text-micro tracking-wider text-text-subtle uppercase">
          {portfolio.profile.name} · {portfolio.profile.location}
        </p>
        <SocialLinks links={portfolio.profile.socials} className="-mr-3" />
      </div>
    </footer>
  );
}
