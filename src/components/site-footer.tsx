import Link from "next/link";

import { ArrowRight, ToothMark } from "@/components/icons";
import { CLINIC_PROFILE } from "@/lib/clinic-profile";

// Resolved at build time so the marketing page can stay fully static.
const COPYRIGHT_YEAR = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="mt-auto overflow-hidden bg-forest text-cream">
      <div className="mx-auto w-full max-w-[90rem] px-6 pt-14 sm:px-10 lg:px-16 lg:pt-20">
        <div className="grid gap-12 border-b border-cream/15 pb-12 lg:grid-cols-[1.1fr_2fr] lg:gap-20">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-full border border-cream/25">
                <ToothMark className="size-[1.15rem]" />
              </span>
              <span className="font-display text-[1.35rem] font-extrabold tracking-[-0.055em]">
                Dentai
              </span>
            </div>
            <p className="font-editorial mt-5 max-w-[18rem] text-[1.1rem] leading-[1.45] text-cream/65">
              General, cosmetic and restorative dentistry in SoHo, New York. Calm rooms,
              clear plans, no rush.
            </p>
            <Link
              href="/book"
              className="link-underline mt-6 text-[11px] text-clay-soft hover:text-cream"
            >
              Book a visit
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-cream/40">
                Explore
              </p>
              <ul className="mt-4 space-y-2.5 text-[12px] text-cream/75">
                <li>
                  <Link href="/book" className="transition-colors hover:text-clay-soft">
                    Book a visit
                  </Link>
                </li>
                <li>
                  <a href="#treatments" className="transition-colors hover:text-clay-soft">
                    Treatments
                  </a>
                </li>
                <li>
                  <a href="#approach" className="transition-colors hover:text-clay-soft">
                    Our approach
                  </a>
                </li>
                <li>
                  <a href="#visit" className="transition-colors hover:text-clay-soft">
                    Visiting the clinic
                  </a>
                </li>
                <li>
                  <Link href="/clinic" className="transition-colors hover:text-clay-soft">
                    Clinic platform
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-cream/40">
                Clinic
              </p>
              <ul className="mt-4 space-y-2.5 text-[12px] text-cream/75">
                <li>{CLINIC_PROFILE.address[0]}</li>
                <li>{CLINIC_PROFILE.address[1]}</li>
                <li>
                  <a
                    href={CLINIC_PROFILE.phoneHref}
                    className="transition-colors hover:text-clay-soft"
                  >
                    {CLINIC_PROFILE.phone}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${CLINIC_PROFILE.email}`}
                    className="transition-colors hover:text-clay-soft"
                  >
                    {CLINIC_PROFILE.email}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-cream/40">
                Hours
              </p>
              <ul className="mt-4 space-y-2 text-[11.5px] text-cream/75">
                {CLINIC_PROFILE.hours.map((entry) => (
                  <li key={entry.days} className="flex justify-between gap-3">
                    <span>{entry.days.split(" – ")[0].slice(0, 3)}</span>
                    <span className="tabular-nums text-cream/50">{entry.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-10">
          <p className="animate-line-grow select-none font-display text-[clamp(5.2rem,17vw,15rem)] font-extrabold leading-[0.68] tracking-[-0.09em] text-cream">
            Dentai
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-cream/15 py-6 text-[10px] text-cream/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {COPYRIGHT_YEAR} Dentai Clinic. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span>Care, considered.</span>
            <Link href="/login" className="transition-colors hover:text-cream">
              Patient sign in
            </Link>
            <Link href="/book" className="transition-colors hover:text-cream">
              Book online
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
