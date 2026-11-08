import Link from "next/link";

import { ArrowRight } from "@/components/icons";
import { AvailabilityCard } from "@/components/marketing/availability-card";

export function Hero() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pt-14 pb-16 lg:pt-24 lg:pb-24">
      <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        <div>
          <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-muted">
            <span>SoHo, New York</span>
            <span className="h-px w-8 bg-forest/25" />
            <span>Est. 2014</span>
          </div>

          <h1 className="mt-7 font-display text-[clamp(3rem,6.2vw,5.25rem)] leading-[0.92] text-forest">
            Dentistry that
            <br />
            feels <em className="italic text-clay">unhurried</em>.
          </h1>

          <p className="mt-7 max-w-[30rem] text-[15px] leading-[1.7] text-muted">
            General, cosmetic and restorative care in a quiet corner of SoHo. Longer
            appointments, plain-language plans, and a room that does not smell like a
            waiting room.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
            <Link
              href="/book"
              className="group inline-flex items-center gap-2.5 rounded-full bg-forest px-6 py-3.5 text-sm font-medium text-cream transition-colors hover:bg-forest-700"
            >
              Book a visit
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/clinic"
              className="group inline-flex items-center gap-2 border-b border-forest/30 pb-1 text-sm font-medium text-forest transition-colors hover:border-clay hover:text-clay"
            >
              Open the clinic platform
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-5 text-[13px]">
            {[
              ["4.9 / 5", "from 340 patient reviews"],
              ["Same day", "crowns milled on site"],
              ["1,200+", "patients in regular care"],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="font-display text-xl text-forest">{value}</dt>
                <dd className="mt-1 max-w-[10rem] text-xs leading-relaxed text-muted">
                  {label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Abstract composition in place of stock photography. */}
        <div className="relative">
          <div className="relative h-[26rem] overflow-hidden rounded-[2rem] border border-line bg-gradient-to-b from-cream-100 to-sand lg:h-[32rem]">
            <div className="absolute -right-20 -bottom-24 size-[22rem] rounded-full bg-forest" />
            <div className="absolute -top-16 -left-12 size-56 rounded-full border border-clay/40" />
            <div className="absolute top-10 right-10 size-24 rounded-full bg-sage/40 blur-[2px]" />

            <div className="absolute top-6 left-6 flex items-center gap-2 rounded-full border border-forest/10 bg-cream/80 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-forest/70 backdrop-blur">
              <span className="size-1.5 rounded-full bg-forest" />
              Open today
            </div>
          </div>

          <AvailabilityCard />
        </div>
      </div>
    </section>
  );
}
