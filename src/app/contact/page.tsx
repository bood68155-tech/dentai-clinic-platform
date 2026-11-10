import type { Metadata } from "next";
import Link from "next/link";

import { ContactForm } from "@/components/marketing/contact-form";
import { RollingLabel } from "@/components/rolling-label";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CLINIC_PROFILE } from "@/lib/clinic-profile";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Dentai in SoHo, New York. Find the clinic, check hours, or send the front desk a message.",
};

const MAP_SRC =
  "https://www.google.com/maps?q=118+Greene+Street+New+York+NY+10012&z=16&output=embed";
const MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=118+Greene+Street+New+York+NY+10012";

export default function ContactPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Title band: the reference gives the page name a whole screen's
            worth of air above it before the rule. */}
        <section className="pb-10 pt-28 sm:pt-40 lg:pt-[20rem]">
          <div className="shell">
            <h1 className="display-1">Contact Us</h1>
          </div>
        </section>

        <section className="band py-12 lg:py-16">
          <div className="shell">
            <div className="grid grid-cols-1 gap-x-10 gap-y-10 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="lede">
                  Generally speaking, we&rsquo;re always just a phone call away. Or an
                  email, whatever you prefer.
                </p>
              </div>
              <div className="lg:col-span-8">
                <ContactForm />
              </div>
            </div>
          </div>
        </section>

        {/* Green band: ruled off with a single hairline, cream type. */}
        <section className="band bg-forest py-20 text-paper lg:py-[7.5rem]">
          <div className="shell">
            <div className="grid grid-cols-1 gap-x-10 gap-y-8 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <h2>We&rsquo;ve Got Your Smile and Your Back.</h2>
              </div>
              <div className="lg:col-span-8">
                <p className="lede max-w-[46ch]">
                  Questions about a treatment, a quote, or a nervous first visit are
                  always welcome. Ring the front desk, write us a note, or pop by when
                  you&rsquo;re in the neighbourhood &mdash; we would rather answer twice
                  than have you guess.
                </p>
                <button type="button" data-book-online className="btn btn-on-green mt-6">
                  <RollingLabel>Book Online</RollingLabel>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Find us: ruled contact blocks on the left, live map on the right. */}
        <section className="band py-14 lg:py-20">
          <div className="shell">
            <div className="grid grid-cols-1 gap-x-10 gap-y-12 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <h2 className="mb-14">Find Us</h2>

                <div className="mb-10">
                  <h3>Contact</h3>
                  <hr className="my-3 border-t border-ink" />
                  <ul className="space-y-1">
                    <li>
                      <a href={`mailto:${CLINIC_PROFILE.email}`} className="contact-link">
                        {CLINIC_PROFILE.email}
                      </a>
                    </li>
                    <li>
                      <a href={CLINIC_PROFILE.phoneHref} className="contact-link">
                        {CLINIC_PROFILE.phone}
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.instagram.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="contact-link"
                      >
                        @dentaiclinic
                      </a>
                    </li>
                  </ul>
                </div>

                <div className="mb-10">
                  <h3>Address</h3>
                  <hr className="my-3 border-t border-ink" />
                  <address className="not-italic leading-[1.3]">
                    {CLINIC_PROFILE.address.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </address>
                </div>

                <div className="mb-10">
                  <h3>Hours</h3>
                  <hr className="my-3 border-t border-ink" />
                  <ul className="leading-[1.4]">
                    {CLINIC_PROFILE.hours.map((entry) => (
                      <li key={entry.days}>
                        {entry.days}: {entry.time === "Closed" ? "Closed" : entry.time}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3>Parking</h3>
                  <hr className="my-3 border-t border-ink" />
                  <p className="mb-0">
                    Metered street parking on Greene Street, and a garage on Broome.
                    The entrance is step-free.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-8">
                <div className="relative aspect-[4/3] w-full border border-ink">
                  <iframe
                    src={MAP_SRC}
                    title="Map showing Dentai at 118 Greene Street, New York"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0 h-full w-full border-0"
                  />
                </div>
                <Link href={MAP_URL} target="_blank" rel="noopener noreferrer" className="link-underline mt-4">
                  Open in maps
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Closing call to action, same shape as the reference's Come See Us. */}
        <section className="band py-20 lg:py-[7.5rem]">
          <div className="shell">
            <div className="grid grid-cols-1 gap-x-10 gap-y-8 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <h2>Come See Us</h2>
              </div>
              <div className="lg:col-span-8">
                <p className="lede max-w-[46ch]">
                  From preventive and restorative care to cosmetic and endodontic
                  treatment, Dentai does it all with the same unhurried, plain-spoken
                  approach.
                </p>
                <button type="button" data-book-online className="btn mt-6">
                  <RollingLabel>Book Online</RollingLabel>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
