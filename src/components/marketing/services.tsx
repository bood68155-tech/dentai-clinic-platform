import Image from "next/image";

import { ArrowRight } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { CLINIC_PROFILE } from "@/lib/clinic-profile";

export function Services() {
  return (
    <section
      id="treatments"
      className="overflow-hidden border-t border-forest/10 bg-cream px-6 py-24 lg:px-10 lg:py-36"
    >
      <div className="mx-auto w-full max-w-[90rem]">
        <Reveal className="grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-end">
          <div>
            <p className="eyebrow">What we do</p>
            <h2 className="mt-5 max-w-[13ch] font-display text-[clamp(2.5rem,4.8vw,4.4rem)] leading-[0.94] tracking-[-0.065em] text-forest">
              Care for every stage of your smile.
            </h2>
          </div>
          <p className="font-editorial max-w-md text-[1.08rem] leading-[1.5] text-muted lg:justify-self-end lg:text-[1.2rem]">
            Every treatment starts with a conversation and a written plan. Nothing is
            booked before you have seen the number.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <div className="img-zoom relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-sand">
              <Image
                src="/images/clinic-interior.webp"
                alt="A bright, modern treatment room at the Dentai clinic"
                fill
                sizes="(min-width: 1024px) 38vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/55 via-transparent to-transparent" />
              <div className="absolute right-5 bottom-5 left-5 rounded-[1.3rem] border border-cream/25 bg-forest/75 p-5 text-cream backdrop-blur-md sm:right-6 sm:bottom-6 sm:left-6">
                <p className="text-[8.5px] font-extrabold uppercase tracking-[0.22em] text-clay-soft">
                  The clinic
                </p>
                <p className="mt-2 max-w-[15rem] font-display text-[1.3rem] font-extrabold leading-[1.05] tracking-[-0.045em]">
                  Three quiet suites. One steady team.
                </p>
              </div>
            </div>
          </Reveal>

          <div>
            {CLINIC_PROFILE.services.map((service, index) => (
              <Reveal key={service.code} delay={index * 55}>
                <article className="group border-t border-forest/15 py-6 transition-colors last:border-b hover:border-forest/40 lg:py-7">
                  <div className="grid grid-cols-[2.1rem_1fr_auto] items-start gap-3 sm:gap-5">
                    <span className="pt-1 text-[10px] font-extrabold tabular-nums text-clay">
                      {service.code}
                    </span>
                    <div>
                      <h3 className="font-display text-[clamp(1.4rem,2.2vw,1.9rem)] font-extrabold leading-tight tracking-[-0.055em] text-forest transition-colors group-hover:text-forest-500">
                        {service.title}
                      </h3>
                      <p className="mt-2 max-w-[35rem] text-[12.5px] leading-[1.7] text-muted sm:text-[13px]">
                        {service.body}
                      </p>
                    </div>
                    <ArrowRight className="mt-1 size-4 -translate-x-1 text-clay opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
