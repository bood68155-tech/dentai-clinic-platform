import Link from "next/link";

import { ToothMark } from "@/components/icons";
import { CLINIC_PROFILE } from "@/lib/clinic-profile";

// Resolved at build time so the marketing page can stay fully static.
const COPYRIGHT_YEAR = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-cream-100/60">
      <div className="mx-auto w-full max-w-6xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:pr-6">
            <div className="flex items-center gap-2.5 text-forest">
              <ToothMark className="size-5" />
              <span className="font-display text-xl tracking-[-0.03em]">Dentai</span>
            </div>
            <p className="mt-4 max-w-[15rem] text-[12px] leading-relaxed text-muted">
              General, cosmetic and restorative dentistry in SoHo, New York. Calm rooms,
              clear plans, no rush.
            </p>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
              Explore
            </p>
            <ul className="mt-4 space-y-2.5 text-[13px] text-forest/75">
              <li>
                <Link href="/book" className="hover:text-clay">
                  Book a visit
                </Link>
              </li>
              <li>
                <a href="#treatments" className="hover:text-clay">
                  Treatments
                </a>
              </li>
              <li>
                <a href="#approach" className="hover:text-clay">
                  Our approach
                </a>
              </li>
              <li>
                <a href="#visit" className="hover:text-clay">
                  Visiting the clinic
                </a>
              </li>
              <li>
                <Link href="/clinic" className="hover:text-clay">
                  Clinic platform
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
              Clinic
            </p>
            <ul className="mt-4 space-y-2.5 text-[13px] text-forest/75">
              <li>{CLINIC_PROFILE.address[0]}</li>
              <li>{CLINIC_PROFILE.address[1]}</li>
              <li>
                <a href={CLINIC_PROFILE.phoneHref} className="hover:text-clay">
                  {CLINIC_PROFILE.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${CLINIC_PROFILE.email}`} className="hover:text-clay">
                  {CLINIC_PROFILE.email}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
              Hours
            </p>
            <ul className="mt-4 space-y-2 text-[13px] text-forest/75">
              {CLINIC_PROFILE.hours.slice(0, 4).map((entry) => (
                <li key={entry.days} className="flex justify-between gap-3">
                  <span>{entry.days.split(" – ")[0].slice(0, 3)}</span>
                  <span className="tabular-nums text-forest/60">{entry.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-[11px] text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {COPYRIGHT_YEAR} Dentai Clinic. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span className="size-1 rounded-full bg-sage" />
            Built with Next.js · Deployed on Vercel
          </p>
        </div>
      </div>
    </footer>
  );
}
