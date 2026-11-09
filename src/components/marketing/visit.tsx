import Link from "next/link";

import { ArrowRight, ClockIcon, PhoneIcon, PinIcon } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { CLINIC_PROFILE } from "@/lib/clinic-profile";

export function Visit() {
  return (
    <section
      id="visit"
      className="border-t border-forest/10 bg-cream px-6 py-24 lg:px-10 lg:py-36"
    >
      <div className="mx-auto w-full max-w-[90rem]">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-20">
          <Reveal>
            <p className="eyebrow">Visit</p>
            <h2 className="mt-5 max-w-[12ch] font-display text-[clamp(2.6rem,5vw,4.7rem)] leading-[0.92] tracking-[-0.065em] text-forest">
              We’d love to meet you.
            </h2>
          </Reveal>

          <Reveal delay={100}>
            <p className="font-editorial max-w-lg text-[1.12rem] leading-[1.55] text-muted sm:text-[1.28rem]">
              Come as you are. We will take the time to understand your history, talk
              through what matters to you, and make a plan you feel good about.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Link href="/book" className="btn btn-primary btn-lg">
                Book online
                <ArrowRight className="btn-arrow size-4" />
              </Link>
              <a href={CLINIC_PROFILE.phoneHref} className="btn btn-outline btn-lg">
                <PhoneIcon className="size-4" />
                {CLINIC_PROFILE.phone}
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal className="mt-24 grid gap-9 border-t border-forest/15 pt-10 sm:mt-22 sm:grid-cols-2 lg:mt-28 lg:grid-cols-[1.1fr_1fr_1.2fr] lg:gap-12">
          <div>
            <div className="flex items-center gap-2.5 text-clay">
              <PinIcon className="size-4" />
              <p className="text-[9px] font-extrabold uppercase tracking-[0.2em]">
                The clinic
              </p>
            </div>
            <p className="mt-3 text-[13px] leading-[1.7] text-forest">
              {CLINIC_PROFILE.address[0]}
              <br />
              {CLINIC_PROFILE.address[1]}
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-muted">
              Two blocks from Spring Street station.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2.5 text-clay">
              <PhoneIcon className="size-4" />
              <p className="text-[9px] font-extrabold uppercase tracking-[0.2em]">
                Front desk
              </p>
            </div>
            <a
              href={CLINIC_PROFILE.phoneHref}
              className="mt-3 block text-[13px] text-forest transition-colors hover:text-clay"
            >
              {CLINIC_PROFILE.phone}
            </a>
            <a
              href={`mailto:${CLINIC_PROFILE.email}`}
              className="mt-1 block text-[13px] text-forest/70 transition-colors hover:text-clay"
            >
              {CLINIC_PROFILE.email}
            </a>
            <p className="mt-2 text-[11px] leading-relaxed text-muted">
              Registered patients can reach the on-call clinician after hours.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2.5 text-clay">
              <ClockIcon className="size-4" />
              <p className="text-[9px] font-extrabold uppercase tracking-[0.2em]">
                Opening hours
              </p>
            </div>
            <dl className="mt-3 space-y-1.5">
              {CLINIC_PROFILE.hours.map((entry) => (
                <div key={entry.days} className="flex items-baseline justify-between gap-4">
                  <dt className="text-[11px] text-muted">{entry.days}</dt>
                  <dd
                    className={
                      entry.time === "Closed"
                        ? "text-[10.5px] text-muted/60"
                        : "text-[10.5px] font-semibold tabular-nums text-forest"
                    }
                  >
                    {entry.time}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
