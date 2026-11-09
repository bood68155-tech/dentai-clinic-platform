import Image from "next/image";
import Link from "next/link";

import { ArrowRight } from "@/components/icons";
import { Reveal } from "@/components/reveal";

export function CareBand() {
  return (
    <section className="relative isolate overflow-hidden bg-forest">
      <Image
        src="/images/smiling-patient.webp"
        alt="A patient laughing with his dental hygienist during a check-up"
        fill
        sizes="100vw"
        className="object-cover object-[58%_center]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-forest/95 via-forest/65 to-forest/15 lg:via-forest/45 lg:to-transparent" />

      <div className="relative mx-auto w-full max-w-[90rem] px-6 py-24 sm:px-10 lg:px-20 lg:py-36">
        <Reveal className="max-w-[38rem] text-cream">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.24em] text-clay-soft">
            A different first visit
          </p>
          <blockquote className="font-editorial mt-6 text-[clamp(2.05rem,4.2vw,3.65rem)] leading-[1.04] tracking-[-0.045em]">
            “The first appointment felt more like a conversation than a checklist.”
          </blockquote>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-cream/20 pt-5">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-cream">
              Amelia Fontaine
            </p>
            <p className="text-[10.5px] text-cream/55">Patient since 2021</p>
          </div>
          <Link
            href="/book"
            className="link-underline mt-8 text-[11px] text-clay-soft hover:text-cream"
          >
            Book your first visit
            <ArrowRight className="size-3.5" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
