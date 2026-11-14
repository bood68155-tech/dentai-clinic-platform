"use client";

import Link from "next/link";
import { useState } from "react";

import { MARKETING_NAV } from "@/components/site-header";
import { Wordmark } from "@/components/marketing/wordmark";
import { CLINIC_PROFILE } from "@/lib/clinic-profile";

const COPYRIGHT_YEAR = 2026;

/**
 * The reference's closing green plate: full-viewport, an edge-to-edge wordmark
 * with a script line riding its top edge, the same six nav cells, a four-column
 * meta row and a full-bleed legal bar.
 */
export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer className="section footer">
      <div className="container">
        <div className="footer-head">
          <Link href="/" className="footer-wordmark" aria-label="NUV home">
            <span className="footer-script">Dentistry — Not Routine</span>
            <Wordmark />
          </Link>

          <div className="footer-nav row flush">
            {MARKETING_NAV.map((item) => (
              <div key={item.href} className="col col-2">
                <Link href={item.href} className="nav-link">
                  {item.label}
                </Link>
              </div>
            ))}
            <div className="col col-2">
              <Link href="/our-team" className="nav-link">
                Our Team
              </Link>
            </div>
          </div>
        </div>

        <div className="footer-grid">
          <div>
            <h3 className="h3">Contact</h3>
            <div className="rule" />
            <ul className="paragraph-sm paragraph-short space-y-1">
              <li>
                <a href={CLINIC_PROFILE.phoneHref}>{CLINIC_PROFILE.phone}</a>
              </li>
              <li>
                <a href={`mailto:${CLINIC_PROFILE.email}`}>{CLINIC_PROFILE.email}</a>
              </li>
              <li>
                <a href={CLINIC_PROFILE.instagram} target="_blank" rel="noreferrer">
                  {CLINIC_PROFILE.instagramHandle}
                </a>
              </li>
            </ul>
            <ul className="mt-4 flex gap-1">
              <li>
                <a
                  href={CLINIC_PROFILE.instagram}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="NUV on Instagram"
                  className="block w-6"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="h3">Address</h3>
            <div className="rule" />
            <p className="paragraph-sm paragraph-short">
              {CLINIC_PROFILE.address[0]}
              <br />
              {CLINIC_PROFILE.address[1]}
            </p>
            <p className="paragraph-sm paragraph-short mt-3">
              Led by {CLINIC_PROFILE.owner}
            </p>
          </div>

          <div>
            <h3 className="h3">Hours</h3>
            <div className="rule" />
            <p className="paragraph-sm paragraph-short">
              Mon to Wed: 9 am – 6 pm
              <br />
              Thu: 9 am – 7 pm
              <br />
              Fri: 9 am – 4 pm · Sat: 9 am – 1 pm
            </p>
          </div>

          <div>
            <h3 className="h3">Newsletter</h3>
            <div className="rule" />
            <p className="paragraph-sm paragraph-short mb-3">
              Want to know about the goings on around the clinic? Get the NUV news.
            </p>
            {subscribed ? (
              <p className="paragraph-md form-success">Thank you! Your submission has been received!</p>
            ) : (
              <form
                className="flex flex-col items-start gap-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!email.includes("@")) return;
                  setSubscribed(true);
                }}
              >
                <label className="sr-only" htmlFor="footer-email">
                  Email Address
                </label>
                <input
                  id="footer-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email Address"
                  className="newsletter-input"
                />
                <button type="submit" className="button">
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="container full footer-bottom">
        <div className="container">
          <div className="row flush">
            <div className="col col-2">
              <p className="paragraph-sm paragraph-short mb-0">© NUV {COPYRIGHT_YEAR}</p>
            </div>
            <div className="col col-6">
              <Link href="/privacy" className="paragraph-sm paragraph-short mb-0 no-underline">
                Privacy Policy
              </Link>
            </div>
            <div className="col col-4 text-right">
              <span className="paragraph-sm paragraph-short mb-0">
                Designed with care in Khan Yunis, Gaza
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
