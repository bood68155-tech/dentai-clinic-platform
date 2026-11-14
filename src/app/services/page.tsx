import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { AssistantWidget } from "@/components/marketing/assistant-widget";
import { HeroSplit } from "@/components/marketing/hero-split";
import { ArrowIcon, Roll } from "@/components/marketing/roll";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CLINIC_PROFILE } from "@/lib/clinic-profile";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Preventive, restorative, cosmetic, endodontic and implant dentistry at NUV in Khan Yunis, Gaza.",
};

const MAIN = CLINIC_PROFILE.services.slice(0, 3);
const MORE = CLINIC_PROFILE.services.slice(3);

const DETAILS = [
  {
    code: "01",
    title: "First visit",
    body: "A full assessment, photographs and a conversation about what you want from your mouth. No treatment is started on the day unless it is urgent.",
  },
  {
    code: "02",
    title: "The plan",
    body: "A written plan with options, timescales and costs, sent to you after the appointment so you can read it without anyone waiting.",
  },
  {
    code: "03",
    title: "The work",
    body: "Appointments long enough to finish what we start, with the same clinician throughout and a review once everything has settled.",
  },
];

export default function ServicesPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <main id="main" className="flex-1">
        <HeroSplit
          tone="gold"
          priority
          src="/images/portrait-smile.webp"
          alt="A patient smiling at the NUV practice"
          title={<>Everything your mouth needs, under one calm roof.</>}
          intro={<>General, cosmetic and specialist dentistry delivered by one team, on one plan, without the hand-offs.</>}
        />

        <section className="section">
          <div className="container xtra">
            <div className="row mb-16">
              <div className="col col-4">
                <p className="eyebrow">01 — What we do</p>
                <h2 className="h2 mt-4">A full-service practice.</h2>
              </div>
              <div className="col col-8">
                <p className="paragraph-lg max-w-[44ch]">
                  From a six-month clean to a full-arch rebuild, the same standards
                  apply: diagnose properly, explain clearly, and only then pick up an
                  instrument.
                </p>
              </div>
            </div>

            <div className="row">
              {MAIN.map((service) => (
                <div key={service.code} className="col col-4">
                  <article className="service-card">
                    <div className="service-card__num">{service.code}</div>
                    <div className="service-card__body">
                      <h3 className="h3">{service.title}</h3>
                      <p className="paragraph-md">{service.body}</p>
                      <button type="button" data-book-online className="link-arrow">
                        Book this
                        <span className="btn-icon">
                          <ArrowIcon />
                        </span>
                      </button>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section green">
          <div className="container xtra">
            <div className="row">
              <div className="col col-4">
                <p className="eyebrow">02 — More services</p>
                <h2 className="h2 mt-4">The rest of the list.</h2>
              </div>
              <div className="col col-8">
                <ul className="border-t border-[color:var(--ref-border)]">
                  {MORE.map((service) => (
                    <li key={service.code} className="border-b border-[color:var(--ref-border)]">
                      <Link
                        href="/contact"
                        className="flex items-center justify-between gap-6 py-5 no-underline"
                      >
                        <span className="flex items-baseline gap-6">
                          <span className="paragraph-sm opacity-60">{service.code}</span>
                          <span className="h3">{service.title}</span>
                        </span>
                        <span className="btn-icon !size-5 shrink-0">
                          <ArrowIcon />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className="paragraph-md mt-8 max-w-[42ch]">
                  Not sure which of these you need? That is what the first visit is
                  for — we will tell you honestly if the answer is &ldquo;none of them
                  yet&rdquo;.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="media ratio-16x9 zoom-media">
          <Image
            src="/images/blanket.webp"
            alt="A folded blanket on a chair in the NUV lounge"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </section>

        <section className="section">
          <div className="container xtra">
            <div className="row">
              <div className="col col-4">
                <p className="eyebrow">03 — Why choose us</p>
                <h2 className="h2 mt-4">How a visit actually runs.</h2>
                <p className="paragraph-md mt-6 max-w-[28ch]">
                  Three appointments, three clear jobs. Nothing is added to the plan
                  without you knowing why.
                </p>
              </div>
              <div className="col col-8">
                <div className="flex flex-col">
                  {DETAILS.map((item) => (
                    <div
                      key={item.code}
                      className="flex gap-6 border-t border-[color:var(--ref-border)] py-6 last:border-b"
                    >
                      <span className="paragraph-sm w-10 shrink-0 opacity-60">{item.code}</span>
                      <div>
                        <h3 className="h3">{item.title}</h3>
                        <p className="paragraph-md mt-2 max-w-[42ch]">{item.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section green">
          <div className="container xtra">
            <div className="row">
              <div className="col col-4">
                <h2 className="h2">Come See Us</h2>
              </div>
              <div className="col col-8">
                <p className="paragraph-lg max-w-[42ch]">
                  Book a first visit and we will take it from there — assessment,
                  photographs, and a plan you can read at home before deciding
                  anything.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-4">
                  <button type="button" data-book-online className="button light">
                    <Roll>Book Online</Roll>
                  </button>
                  <a href={CLINIC_PROFILE.phoneHref} className="link-arrow text-[color:var(--ref-cream)]">
                    {CLINIC_PROFILE.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <AssistantWidget />
    </div>
  );
}
