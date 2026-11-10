"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { BookOnline } from "@/components/marketing/book-online";
import { Roll } from "@/components/marketing/roll";

export const MARKETING_NAV = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "New Patients", href: "/new-patients" },
  { label: "Contact", href: "/contact" },
] as const;

/**
 * Reference navigation: no logo on desktop, six equal two-column cells with the
 * gold Book Online last, and a single hairline under the bar. On small screens
 * it collapses to Menu / Book Online.
 */
export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to Main Content
      </a>

      <header className="nav">
        <div className="container">
          <nav aria-label="Primary" className="nav-desktop row flush">
            {MARKETING_NAV.map((item) => (
              <div key={item.href} className="col col-2">
                <Link href={item.href} className="nav-link">
                  {item.label}
                </Link>
              </div>
            ))}
            <div className="col col-2">
              <button type="button" data-book-online className="nav-link gold">
                Book Online
              </button>
            </div>
          </nav>

          <div className="nav-mobile callout-bar">
            <button
              type="button"
              className="menu-toggle"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              Menu
            </button>
            <button type="button" data-book-online className="button">
              <Roll>Book Online</Roll>
            </button>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <div className="mobile-panel" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="mobile-panel__top">
            <button type="button" className="menu-toggle" onClick={() => setMenuOpen(false)}>
              Close
            </button>
            <button type="button" data-book-online className="button" onClick={() => setMenuOpen(false)}>
              <Roll>Book Online</Roll>
            </button>
          </div>
          <nav className="flex flex-col" aria-label="Mobile">
            {MARKETING_NAV.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-2">
            <Link href="/book" onClick={() => setMenuOpen(false)}>
              Appointment
            </Link>
            <Link href="/login" onClick={() => setMenuOpen(false)}>
              Patient sign in
            </Link>
            <Link href="/clinic" onClick={() => setMenuOpen(false)}>
              Clinic platform
            </Link>
          </div>
        </div>
      ) : null}

      <BookOnline />
    </>
  );
}
