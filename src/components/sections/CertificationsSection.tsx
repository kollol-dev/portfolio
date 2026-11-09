import { type Portfolio } from "@/data/portfolio";
import { Section } from "@/components/ui/Section";
import { sectionMeta } from "@/config/sections";
import { Reveal } from "@/components/ui/Reveal";
import { LinkButton, MissingLink } from "@/components/ui/LinkButton";
import { Value } from "@/components/ui/Value";
import { HangRow, Period } from "@/components/ui/Editorial";

/** 03 — Certifications. */
export function CertificationsSection({ content }: { content: Portfolio }) {
  return (
    <Section meta={sectionMeta(content, "certifications")}>
      <ul>
        {content.certifications.map((cert, i) => (
          <Reveal
            as="li"
            key={cert.name}
            delay={i * 0.08}
            className="border-t border-line py-10 first:border-t-0 first:pt-0"
          >
            <HangRow meta={<Period text={cert.period} />}>
              <h3 className="max-w-(--body-max) text-h3 text-balance text-text">{cert.name}</h3>
              <p className="mt-1.5 text-caption text-text-muted">{cert.issuer}</p>
              <p className="mt-4 font-mono text-micro tracking-wider text-text-subtle uppercase">
                Credential <Value text={cert.credentialId} className="text-text-muted" />
              </p>
              <div className="mt-3">
                {cert.verifyUrl ? (
                  <LinkButton href={cert.verifyUrl} external variant="text">
                    Verify credential
                  </LinkButton>
                ) : (
                  <MissingLink label="Verification link" />
                )}
              </div>
            </HangRow>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
