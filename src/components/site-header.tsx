import Link from "next/link";

import { BookOnline } from "@/components/marketing/book-online";
import { RollingLabel } from "@/components/rolling-label";

const NAV = [
  { label: "Treatments", href: "/#treatments" },
  { label: "Approach", href: "/#approach" },
  { label: "Visit", href: "/#visit" },
  { label: "Contact", href: "/contact" },
  { label: "Clinic", href: "/clinic" },
];

/**
 * Sticky bar lifted from the reference site: cream ground, one hairline rule
 * along the bottom, Manrope links spread evenly across the row and a gold
 * text-only Book Online action at the end. No logo mark, no pill, no shadow.
 */
export function SiteHeader() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-ink bg-paper">
        <div className="shell flex items-center justify-between gap-8 py-3 lg:py-4">
          <Link
            href="/"
            className="font-display text-[1.375rem] font-extrabold leading-none tracking-[-0.05em] text-ink transition-colors duration-300 hover:text-forest"
          >
            Dentai
          </Link>

          <nav
            aria-label="Primary"
            className="hidden flex-1 grid-cols-5 items-center lg:grid"
          >
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-sans text-base font-bold leading-none tracking-[-0.05em] text-ink transition-colors duration-300 ease-[cubic-bezier(0.165,0.84,0.44,1)] hover:text-forest"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-6">
            <button type="button" data-book-online className="btn btn-book">
              <RollingLabel>Book Online</RollingLabel>
            </button>

            <details className="relative lg:hidden">
              <summary className="cursor-pointer font-sans text-base font-bold leading-none tracking-[-0.05em] text-ink">
                Menu
              </summary>
              <div className="absolute right-0 top-full z-50 mt-3 w-60 border border-ink bg-paper px-5 py-4">
                <ul className="flex flex-col">
                  {NAV.map((item) => (
                    <li key={item.href} className="border-b border-ink/15 last:border-0">
                      <Link
                        href={item.href}
                        className="block py-2.5 font-sans text-base font-bold tracking-[-0.05em]"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                  <li className="border-t border-ink/15">
                    <Link
                      href="/login"
                      className="block py-2.5 font-sans text-base font-bold tracking-[-0.05em]"
                    >
                      Sign in
                    </Link>
                  </li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </header>

      <BookOnline />
    </>
  );
}
