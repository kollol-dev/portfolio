import { BadgeCheck } from "lucide-react";
import { portfolio } from "@/data/portfolio";
import { Section } from "@/components/ui/Section";
import { LinkButton, MissingLink } from "@/components/ui/LinkButton";
import { Value } from "@/components/ui/Value";

/** 03 — Certifications. */
export function CertificationsSection() {
  return (
    <Section
      id="certifications"
      eyebrow="Certifications"
      title={
        <>
          Training that <em className="text-accent">started</em> it.
        </>
      }
    >
      <ul className="divide-y divide-line border-y border-line">
        {portfolio.certifications.map((cert) => (
          <li key={cert.name} className="py-8">
            <div className="flex items-start gap-4">
              <BadgeCheck className="mt-1 size-5 shrink-0 text-accent" aria-hidden strokeWidth={1.5} />
              <div className="min-w-0 flex-1">
                <h3 className="text-h3 text-balance text-text">{cert.name}</h3>
                <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-caption">
                  <dt className="text-text-subtle">Issuer</dt>
                  <dd className="text-text-muted">{cert.issuer}</dd>
                  <dt className="text-text-subtle">Date</dt>
                  <dd className="font-mono text-text-muted">{cert.period}</dd>
                  <dt className="text-text-subtle">Credential</dt>
                  <dd className="text-text-muted">
                    <Value text={cert.credentialId} />
                  </dd>
                </dl>
                <div className="mt-5">
                  {cert.verifyUrl ? (
                    <LinkButton href={cert.verifyUrl} external variant="text">
                      Verify credential
                    </LinkButton>
                  ) : (
                    <MissingLink label="Verification link" />
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
