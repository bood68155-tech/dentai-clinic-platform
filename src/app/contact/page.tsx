import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { AssistantWidget } from "@/components/marketing/assistant-widget";
import { ContactForm } from "@/components/marketing/contact-form";
import { Roll } from "@/components/marketing/roll";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CLINIC_PROFILE } from "@/lib/clinic-profile";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact NUV in Khan Yunis, Gaza. Find the clinic, check hours, or send the front desk a message.",
};

const MAP_SRC =
  "https://www.google.com/maps?q=Khan+Yunis+Gaza+Palestine&z=14&output=embed";

export default function ContactPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <main id="main" className="flex-1">
        <section className="section">
          <div className="container top-spacer">
            <h1 className="h1">Contact Us</h1>
          </div>
        </section>

        <section className="section border-t">
          <div className="container xtra">
            <div className="row">
              <div className="col col-4">
                <p className="paragraph-lg max-w-[24ch]">
                  Generally speaking, we&rsquo;re always just a phone call away. Or an
                  email, whatever you prefer.
                </p>
              </div>
              <div className="col col-8">
                <ContactForm />
              </div>
            </div>
          </div>
        </section>

        <section className="section green">
          <div className="container xtra">
            <div className="row">
              <div className="col col-4">
                <h2 className="h2 max-w-[16ch]">
                  We&rsquo;ve Got Your Smile and Your Back.
                </h2>
              </div>
              <div className="col col-8">
                <p className="paragraph-lg max-w-[44ch]">
                  We&rsquo;ve got some answers to some frequently asked questions
                  below, but we&rsquo;re always more than happy to answer any other
                  questions you may have about our services or your dental health.
                  Don&rsquo;t be shy about reaching out via phone, email, or even just
                  popping by when you&rsquo;re in the neighbourhood.
                </p>
                <Link href="/new-patients#faq" className="button light mt-8">
                  <Roll>Read FAQs</Roll>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container xtra">
            <div className="row">
              <div className="col col-4">
                <h2 className="h2 mb-12">Find Us</h2>

                <div>
                  <h3 className="h3">Contact</h3>
                  <div className="rule" />
                  <ul className="paragraph-md space-y-1">
                    <li>
                      <a href={`mailto:${CLINIC_PROFILE.email}`} className="link-underline">
                        {CLINIC_PROFILE.email}
                      </a>
                    </li>
                    <li>
                      <a href={CLINIC_PROFILE.phoneHref} className="link-underline">
                        {CLINIC_PROFILE.phone}
                      </a>
                    </li>
                    <li>
                      <a
                        href={CLINIC_PROFILE.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-underline"
                      >
                        {CLINIC_PROFILE.instagramHandle}
                      </a>
                    </li>
                  </ul>
                  <div className="mt-3 flex items-center gap-3">
                    <a
                      href={CLINIC_PROFILE.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="NUV on Instagram"
                      className="link-arrow"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                        <rect x="3" y="3" width="18" height="18" rx="5" />
                        <circle cx="12" cy="12" r="4" />
                        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                      </svg>
                    </a>
                  </div>
                </div>

                <div className="mt-10">
                  <h3 className="h3">Address</h3>
                  <div className="rule" />
                  <address className="paragraph-md not-italic leading-[1.35]">
                    {CLINIC_PROFILE.address.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </address>
                </div>
              </div>

              <div className="col col-8">
                <div className="media ratio-4x3">
                  <iframe
                    src={MAP_SRC}
                    title="Map showing NUV in Khan Yunis, Gaza"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0 h-full w-full border-0"
                  />
                </div>

                <div className="row mt-8">
                  <div className="col col-6">
                    <h3 className="h3">Hours</h3>
                    <div className="rule" />
                    <ul className="paragraph-md leading-[1.5]">
                      {CLINIC_PROFILE.hours.map((entry) => (
                        <li key={entry.days}>
                          {entry.days}: {entry.time}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="col col-6">
                    <h3 className="h3">Parking</h3>
                    <div className="rule" />
                    <p className="paragraph-md mb-0">
                      On-site parking available, with street parking nearby. The
                      entrance is step-free.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="media anamorphic zoom-media">
          <Image
            src="/images/shelf-detail.webp"
            alt="A detail of the shelving at the NUV practice"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </section>

        <section className="section">
          <div className="container xtra">
            <div className="row">
              <div className="col col-4">
                <h2 className="h2">Come See Us</h2>
              </div>
              <div className="col col-8">
                <p className="paragraph-lg max-w-[42ch]">
                  From preventive and restorative care to cosmetic and endodontic
                  treatment, NUV does it all with the same unhurried, plain-spoken
                  approach.
                </p>
                <button type="button" data-book-online className="button mt-8">
                  <Roll>Book Online</Roll>
                </button>
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
