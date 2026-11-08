import Link from "next/link";

import { ArrowRight, ClockIcon, PhoneIcon, PinIcon } from "@/components/icons";
import { CLINIC_PROFILE } from "@/lib/clinic-profile";

export function Visit() {
  return (
    <section id="visit" className="border-t border-line">
      <div className="mx-auto grid w-full max-w-6xl gap-14 px-6 py-20 lg:grid-cols-2 lg:gap-20 lg:py-28">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-clay">
            Visiting
          </p>
          <h2 className="mt-4 max-w-md font-display text-[clamp(2rem,3.6vw,3rem)] leading-[1.05] text-forest">
            Find us two blocks from the Spring Street station.
          </h2>

          <div className="mt-10 space-y-7">
            <div className="flex gap-4">
              <PinIcon className="mt-0.5 size-5 shrink-0 text-clay" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                  The clinic
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-forest">
                  {CLINIC_PROFILE.address[0]}
                  <br />
                  {CLINIC_PROFILE.address[1]}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <PhoneIcon className="mt-0.5 size-5 shrink-0 text-clay" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                  Front desk
                </p>
                <a
                  href={CLINIC_PROFILE.phoneHref}
                  className="mt-1.5 block text-sm text-forest underline-offset-4 hover:underline"
                >
                  {CLINIC_PROFILE.phone}
                </a>
                <a
                  href={`mailto:${CLINIC_PROFILE.email}`}
                  className="text-sm text-forest/70 underline-offset-4 hover:underline"
                >
                  {CLINIC_PROFILE.email}
                </a>
              </div>
            </div>

            <div className="flex gap-4">
              <ClockIcon className="mt-0.5 size-5 shrink-0 text-clay" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                  Emergencies
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-forest">
                  Registered patients can call the same number after hours and reach the
                  on-call clinician.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-line bg-cream-50 p-7 lg:p-9">
          <div className="flex items-baseline justify-between">
            <h3 className="font-display text-2xl text-forest">Opening hours</h3>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
              GMT-5
            </span>
          </div>

          <dl className="mt-6 divide-y divide-line/70">
            {CLINIC_PROFILE.hours.map((entry) => (
              <div
                key={entry.days}
                className="flex items-center justify-between py-3.5 text-sm"
              >
                <dt className="text-forest/75">{entry.days}</dt>
                <dd
                  className={
                    entry.time === "Closed"
                      ? "text-muted/70"
                      : "font-medium text-forest tabular-nums"
                  }
                >
                  {entry.time}
                </dd>
              </div>
            ))}
          </dl>

          <Link
            href="/book"
            className="group mt-7 flex w-full items-center justify-between gap-3 rounded-full bg-forest px-6 py-3.5 text-sm font-medium text-cream transition-colors hover:bg-forest-700"
          >
            Book online
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href={CLINIC_PROFILE.phoneHref}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-forest/20 px-6 py-3 text-sm font-medium text-forest transition-colors hover:border-forest/40"
          >
            Or call {CLINIC_PROFILE.phone}
          </a>
          <p className="mt-4 text-center text-[11px] text-muted">
            Walk-ins accepted before 11:00 · Insurance verified in advance
          </p>
        </div>
      </div>
    </section>
  );
}
