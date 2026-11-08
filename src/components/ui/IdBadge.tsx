"use client";

import { useState, type PointerEvent, type ReactNode } from "react";
import Image from "next/image";
import { m } from "motion/react";
import { MapPin, RefreshCw } from "lucide-react";
import { careerStartYear, portfolio } from "@/data/portfolio";
import { SocialIcon } from "./BrandIcons";
import { Value } from "./Value";

/** Shared frame for both faces: card stock, hairline border, lanyard slot. */
function Face({ children, back = false }: { children: ReactNode; back?: boolean }) {
  return (
    <div
      className={`absolute inset-0 flex flex-col overflow-hidden rounded-[14px] border border-line-strong bg-[linear-gradient(160deg,#1a1a1f_0%,#121216_55%,#0e0e11_100%)] px-3.5 pb-3.5 shadow-[0_24px_60px_-24px_rgb(0_0_0/0.9)] backface-hidden ${
        back ? "rotate-y-180" : ""
      }`}
    >
      {/* Punched slot the lanyard clip passes through */}
      <div
        aria-hidden
        className="mx-auto mt-2.5 h-[7px] w-10 rounded-full border border-line bg-bg shadow-[inset_0_1px_2px_rgb(0_0_0/0.8)]"
      />
      {children}
    </div>
  );
}

/**
 * Portrait ID card hanging from a lanyard. Flips on mouse hover, and toggles
 * on click or tap. A real button underneath does the same for keyboard and
 * screen-reader users. DOM-only animation (motion); honours reduced motion
 * through the site-wide MotionConfig.
 */
export function IdBadge() {
  const [flipped, setFlipped] = useState(false);
  const { profile } = portfolio;
  const since = careerStartYear();
  const profiles = profile.socials.filter((s) => s.kind !== "email");

  const onHover = (value: boolean) => (e: PointerEvent) => {
    if (e.pointerType === "mouse") setFlipped(value);
  };

  return (
    <figure className="badge-sway relative w-56 shrink-0" aria-label={`${profile.name} — identity card`}>
      {/* Lanyard */}
      <div aria-hidden className="flex flex-col items-center">
        <div className="lanyard-strap h-16 w-[22px]">
          <span>{`${profile.name} · `.repeat(3)}</span>
        </div>
        <div className="h-3 w-3.5 rounded-b-[3px] bg-[linear-gradient(90deg,#6f6a62,#d8d2c6_45%,#8a8478)]" />
        <div className="-mt-px h-5 w-2 rounded-full border-2 border-[#a49d90] bg-transparent" />
      </div>

      <div className="-mt-3 perspective-[1100px]">
        <m.div
          className="relative aspect-[54/86] w-full cursor-pointer transform-3d"
          initial={false}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 15, mass: 0.9 }}
          onPointerEnter={onHover(true)}
          onPointerLeave={onHover(false)}
          onClick={() => setFlipped((f) => !f)}
        >
          {/* Front */}
          <Face>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="grid size-6 place-items-center rounded-xs bg-[linear-gradient(135deg,#e0c39a,#a8875c)] font-mono text-[0.625rem] font-medium text-[#1a1408]">
                KC
              </span>
              <span className="eyebrow text-[0.625rem]">Identity</span>
            </div>

            <div className="relative mt-2.5 h-40 overflow-hidden rounded-md border border-line">
              <Image
                src={profile.photo}
                alt={`Portrait of ${profile.name}`}
                fill
                sizes="196px"
                unoptimized
                priority
                className="object-cover object-top"
              />
            </div>

            <p className="mt-3 font-display text-[1.375rem] leading-none text-text">{profile.name}</p>
            <p className="mt-1.5 text-caption leading-tight text-text-muted">{profile.title}</p>

            <div className="mt-auto border-t border-line pt-2.5">
              <div className="flex items-center justify-between font-mono text-[0.625rem] tracking-wider text-text-subtle uppercase">
                <span className="flex items-center gap-1">
                  <MapPin className="size-3" aria-hidden strokeWidth={1.5} />
                  {profile.location.split(",")[0]}
                </span>
                {since ? <span>Since {since}</span> : null}
              </div>
              <div
                aria-hidden
                className="mt-2 h-4 bg-[repeating-linear-gradient(90deg,#3a3a42_0_1px,transparent_1px_3px,#3a3a42_3px_5px,transparent_5px_6px,#3a3a42_6px_7px,transparent_7px_10px)] opacity-80"
              />
            </div>
          </Face>

          {/* Back */}
          <Face back>
            <div
              className="flex flex-1 flex-col"
              // Keyboard users tabbing into a back-side link see the back.
              onFocusCapture={() => setFlipped(true)}
            >
              <p className="eyebrow mt-3 text-[0.625rem]">
                <span className="text-accent">Contact</span>
              </p>
              <p className="mt-2 font-display text-[1.375rem] leading-tight text-text">
                Let&rsquo;s <em className="text-accent">talk</em>.
              </p>

              <dl className="mt-4 space-y-3 text-caption">
                <div>
                  <dt className="eyebrow text-[0.625rem]">Email</dt>
                  <dd>
                    <a
                      href={`mailto:${profile.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="break-all text-text underline decoration-line-strong underline-offset-4 hover:text-accent-strong hover:decoration-accent"
                    >
                      {profile.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow text-[0.625rem]">Availability</dt>
                  <dd className="text-text-muted">
                    <Value text={profile.availability} />
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow text-[0.625rem]">Based in</dt>
                  <dd className="text-text-muted">{profile.location}</dd>
                </div>
              </dl>

              <ul className="mt-auto -ml-2 flex gap-1 border-t border-line pt-2">
                {profiles.map((s) => (
                  <li key={s.kind}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="grid size-9 place-items-center rounded-sm text-text-muted hover:text-accent-strong"
                    >
                      <SocialIcon kind={s.kind} />
                      <span className="sr-only">{s.label} (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </Face>
        </m.div>
      </div>

      <figcaption className="mt-4 flex justify-center">
        <button
          type="button"
          aria-pressed={flipped}
          onClick={() => setFlipped((f) => !f)}
          className="inline-flex min-h-9 items-center gap-2 rounded-sm px-2 font-mono text-micro tracking-wider text-text-subtle uppercase transition-colors duration-(--dur-base) hover:text-text"
        >
          <RefreshCw className="size-3" aria-hidden strokeWidth={1.75} />
          <span className="[@media(hover:hover)]:hidden">Tap to flip</span>
          <span className="hidden [@media(hover:hover)]:inline">Hover or click to flip</span>
        </button>
      </figcaption>
    </figure>
  );
}
