import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ContactForm } from "@/components/marketing/contact-form";
import { RollingChip, RollingLabel } from "@/components/rolling-label";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ClockIcon, PinIcon } from "@/components/icons";
import { CLINIC_PROFILE } from "@/lib/clinic-profile";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Find Dentai in SoHo, New York, check opening hours, or send the front desk a message. New patients are welcome.",
};

const MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=118+Greene+Street+New+York+NY+10012";

export default function ContactPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-t border-forest/10 px-6 py-16 lg:px-10 lg:py-24">
          <div className="mx-auto w-full max-w-[90rem]">
            <div className="flex flex-col gap-1 border-b border-forest/20 pb-5 sm:flex-row sm:items-baseline sm:justify-between">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-muted">
                (Visit us)
              </p>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-muted">
                Mon — Sat · {CLINIC_PROFILE.address[0]}
              </p>
            </div>

            <div className="grid gap-12 pt-10 lg:grid-cols-[1.35fr_0.65fr] lg:gap-16 lg:pt-14">
              <div>
                <h1 className="max-w-[11ch] font-display text-[clamp(2.9rem,5.6vw,4.9rem)] font-extrabold leading-[0.9] tracking-[-0.065em] text-forest">
                  Come see us.
                </h1>
                <p className="font-editorial mt-5 max-w-[46ch] text-[1.08rem] leading-[1.55] text-muted sm:text-[1.2rem]">
                  We are two blocks from Spring Street station, with a step-free
                  entrance and a quiet room to wait in. Send a note and the front desk
                  will reply the same working day — or book online if you already know
                  what you need.
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border border-forest/15 bg-gradient-to-b from-cream-50/70 to-cream/40 px-5 py-4 sm:px-6">
                  <div>
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-muted">
                      (The fastest way in)
                    </p>
                    <p className="mt-1.5 max-w-[42ch] text-[13px] leading-relaxed text-forest/85">
                      Pick a time that suits you. New patients are usually seen within
                      three days.
                    </p>
                  </div>
                  <button
                    type="button"
                    data-book-online
                    className="btn btn-primary btn-lg btn-book"
                  >
                    <RollingLabel>Book online</RollingLabel>
                    <RollingChip />
                  </button>
                </div>

                <div className="mt-10">
                  <ContactForm />
                </div>
              </div>

              <aside className="lg:pt-2">
                <div className="animate-fade-up border border-forest/12 bg-cream-50/70 p-6 sm:p-7">
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-muted">
                    (Clinic details)
                  </p>
                  <h2 className="mt-2 font-display text-[1.6rem] font-extrabold tracking-[-0.05em] text-forest">
                    {CLINIC_PROFILE.name}
                  </h2>

                  <dl className="mt-6 grid gap-4">
                    <div>
                      <dt className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-muted">
                        Address
                      </dt>
                      <dd className="mt-1 text-[13px] leading-[1.6] text-forest">
                        {CLINIC_PROFILE.address.map((line) => (
                          <span key={line} className="block">
                            {line}
                          </span>
                        ))}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-muted">
                        Phone
                      </dt>
                      <dd className="mt-1 text-[13px] text-forest">
                        <a href={CLINIC_PROFILE.phoneHref} className="contact-link">
                          {CLINIC_PROFILE.phone}
                        </a>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-muted">
                        Email
                      </dt>
                      <dd className="mt-1 text-[13px] text-forest">
                        <a href={`mailto:${CLINIC_PROFILE.email}`} className="contact-link">
                          {CLINIC_PROFILE.email}
                        </a>
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-6 border-t border-forest/10 pt-5">
                    <p className="flex items-center gap-2 text-[9px] font-extrabold uppercase tracking-[0.18em] text-muted">
                      <ClockIcon className="size-3.5 text-clay" />
                      Opening hours
                    </p>
                    <ul className="mt-3">
                      {CLINIC_PROFILE.hours.map((entry) => (
                        <li
                          key={entry.days}
                          className="flex items-baseline justify-between gap-4 border-b border-forest/10 py-1.5 last:border-0"
                        >
                          <span className="text-[11.5px] text-muted">{entry.days}</span>
                          <span
                            className={
                              entry.time === "Closed"
                                ? "text-[10.5px] text-muted/55"
                                : "text-[10.5px] font-semibold tabular-nums text-forest"
                            }
                          >
                            {entry.time}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="mt-5 border-t border-forest/10 pt-4 text-[11px] leading-relaxed text-muted">
                    <PinIcon className="mr-1.5 inline size-3.5 text-clay" />
                    Metered street parking on Greene Street, and a garage on Broome.
                    The entrance is step-free.
                  </p>
                </div>

                <Link
                  href={MAP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-4 block border border-forest/12 bg-cream-50/70 p-2 transition-colors hover:border-forest/35"
                >
                  <div className="img-zoom relative aspect-[4/3] overflow-hidden bg-sand">
                    <Image
                      src="/images/dental-interior.jpg"
                      alt="The waiting room and front door of the Dentai clinic"
                      fill
                      sizes="(min-width: 1024px) 30vw, 100vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-forest/75 via-forest/10 to-transparent" />
                    <p className="absolute bottom-3 left-4 text-[10px] font-extrabold uppercase tracking-[0.18em] text-cream">
                      Open in maps ↗
                    </p>
                  </div>
                  <p className="px-2 pt-2 pb-1 text-[11px] text-muted">
                    {CLINIC_PROFILE.address.join(", ")}
                  </p>
                </Link>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
