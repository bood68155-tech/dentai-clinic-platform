import Image from "next/image";
import Link from "next/link";

import { ArrowRight } from "@/components/icons";
import { AvailabilityCard } from "@/components/marketing/availability-card";

const HERO_STATS = [
  ["4.9 / 5", "from 340 patient reviews"],
  ["45 min", "for a first visit"],
  ["Same day", "crowns milled on site"],
];

export function Hero() {
  return (
    <section className="relative grid overflow-hidden bg-forest lg:min-h-[calc(100svh-5rem)] lg:grid-cols-2">
      <div className="relative z-10 flex flex-col justify-between bg-forest px-6 py-14 text-cream sm:px-10 lg:px-14 lg:py-14 xl:px-20">
        <div className="pointer-events-none absolute -top-24 -right-24 size-[30rem] rounded-full border border-cream/10" />
        <div className="pointer-events-none absolute -bottom-56 -left-24 size-[34rem] rounded-full bg-forest-700/60 blur-3xl" />

        <p className="relative animate-fade-up text-[10px] font-extrabold uppercase tracking-[0.26em] text-clay-soft">
          SoHo, New York <span className="mx-2 text-cream/30">/</span> Est. 2014
        </p>

        <div className="relative mt-16 lg:mt-10">
          <h1 className="animate-fade-up animate-delay-100 max-w-[11ch] font-display text-[clamp(3.15rem,5.7vw,5.35rem)] leading-[0.9] tracking-[-0.07em] text-cream">
            Dentistry that feels{" "}
            <span className="text-clay-soft">unhurried.</span>
          </h1>

          <p className="animate-fade-up animate-delay-200 font-editorial mt-7 max-w-[31rem] text-[1.2rem] leading-[1.45] text-cream/80 sm:text-[1.32rem]">
            General, cosmetic and restorative care in a quiet corner of SoHo. Longer
            appointments, plain-language plans, and a room that does not feel like a
            waiting room.
          </p>

          <div className="animate-fade-up animate-delay-300 mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
            <Link href="/book" className="btn btn-light btn-lg">
              Book a visit
              <ArrowRight className="btn-arrow size-4" />
            </Link>
            <a
              href="#treatments"
              className="group inline-flex items-center gap-2 border-b border-cream/30 pb-1 text-[12px] font-bold uppercase tracking-[0.15em] text-cream/75 transition-colors hover:border-clay-soft hover:text-cream"
            >
              Explore treatments
              <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>

          {/* Desktop statistics bar lives below the image; on mobile it sits after the photo */}
          <div className="hidden lg:block animate-fade-up animate-delay-400 mt-12 grid max-w-xl grid-cols-3 gap-5 border-t border-cream/15 pt-6">
            {HERO_STATS.map(([value, label]) => (
              <div key={label}>
                <dt className="font-display text-lg font-extrabold leading-none text-cream sm:text-xl">
                  {value}
                </dt>
                <dd className="mt-2 max-w-[9rem] text-[10px] leading-[1.5] text-cream/50">
                  {label}
                </dd>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative w-full min-h-[34rem] overflow-hidden bg-sand lg:min-h-0 lg:col-span-1 lg:min-h-0">
        <Image
          src="/images/hero-dental.webp"
          alt="A smiling dental patient during a calm appointment with her dentist"
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="animate-image-settle object-cover object-[60%_center]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest/45 via-transparent to-forest/10" />

        {/* Live availability sticker overlays the photo on every size */}
        <div className="animate-fade-up animate-delay-500 absolute bottom-5 left-5 sm:left-7 lg:left-8 max-w-sm">
          <AvailabilityCard />
        </div>

        {/* Mobile statistics bar sits inside the photo column so the hero image is above the fold */}
        <div className="w-full lg:hidden animate-fade-up animate-delay-400 absolute top-5 right-5 grid grid-cols-3 gap-4 border-none pt-0">
          {HERO_STATS.map(([value, label]) => (
            <div key={label}>
              <dt className="font-display text-lg font-extrabold leading-none text-cream sm:text-xl">
                {value}
              </dt>
              <dd className="mt-2 max-w-[9rem] text-[10px] leading-[1.5] text-cream/50">
                {label}
              </dd>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
