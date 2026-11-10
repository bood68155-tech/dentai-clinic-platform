import Image from "next/image";

import { CheckIcon } from "@/components/icons";
import { Reveal } from "@/components/reveal";

const STEPS = [
  {
    number: "01",
    title: "We listen first",
    body: "A 45-minute first visit. History, habits, worries — then the examination. No production targets in the room.",
  },
  {
    number: "02",
    title: "You see what we see",
    body: "Intraoral photographs and radiographs on a screen beside you, explained in plain language before anything is booked.",
  },
  {
    number: "03",
    title: "Care that fits",
    body: "A written plan with costs, sequencing and alternatives. Stage it over months if that suits your life and your budget.",
  },
];

const PROMISES = [
  "Transparent pricing before consent",
  "Mercury-free, minimally invasive",
  "Evening and Saturday appointments",
];

export function Approach() {
  return (
    <section
      id="approach"
      className="border-t border-forest/10 bg-cream-50 px-6 py-24 lg:px-10 lg:py-36"
    >
      <div className="mx-auto grid w-full max-w-[90rem] gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-20">
        <Reveal className="order-2 lg:order-1 lg:sticky lg:top-28">
          <div className="img-zoom relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-sand">
            <Image
              src="/images/dental-clean.jpg"
              alt="A hygienist carrying out a professional clean during a calm appointment"
              fill
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest/30 via-transparent to-transparent" />
            <div className="absolute right-5 bottom-5 left-5 flex items-center justify-between gap-4 rounded-[1.2rem] border border-cream/35 bg-cream/90 px-4 py-3 text-forest backdrop-blur-md sm:right-6 sm:bottom-6 sm:left-6">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.18em]">
                The first visit
              </p>
              <p className="text-[10px] font-semibold text-forest/60">45 minutes</p>
            </div>
          </div>
        </Reveal>

        <div className="order-1 lg:order-2">
          <Reveal>
            <p className="eyebrow">Our approach</p>
            <h2 className="mt-5 max-w-[11ch] font-display text-[clamp(2.6rem,4.9vw,4.5rem)] leading-[0.93] tracking-[-0.065em] text-forest">
              A slower kind of dentistry.
            </h2>
            <p className="font-editorial mt-6 max-w-lg text-[1.08rem] leading-[1.55] text-muted sm:text-[1.2rem]">
              Fewer chairs, longer appointments, and one clinician who knows your mouth.
              It is a simple idea that most clinics cannot afford to run.
            </p>

            <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-[11px] font-semibold text-forest/75">
              {PROMISES.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-clay" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <ol className="mt-12 lg:mt-16">
            {STEPS.map((step, index) => (
              <li
                key={step.number}
                className="group border-t border-forest/15 py-7 last:border-b lg:py-8"
              >
                <Reveal delay={index * 80}>
                  <div className="grid grid-cols-[3.6rem_1fr] gap-4 sm:grid-cols-[5.5rem_1fr] sm:gap-6">
                    <span className="font-display text-[2.6rem] font-extrabold leading-[0.78] tracking-[-0.08em] text-forest/20 transition-colors duration-300 group-hover:text-clay sm:text-[3.8rem]">
                      {step.number}
                    </span>
                    <div>
                      <h3 className="font-display text-[1.5rem] font-extrabold leading-[1.05] tracking-[-0.05em] text-forest sm:text-[1.7rem]">
                        {step.title}
                      </h3>
                      <p className="mt-2.5 max-w-[32rem] text-[12.5px] leading-[1.7] text-muted sm:text-[13px]">
                        {step.body}
                      </p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
