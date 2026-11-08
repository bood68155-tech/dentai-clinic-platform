"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ToothMark } from "@/components/icons";
import { cn } from "@/lib/utils";

const NAV = [
  {
    label: "Overview",
    href: "/clinic",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
        <rect x="3" y="3" width="6" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.3" />
        <rect x="11" y="3" width="6" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.3" />
        <rect x="3" y="11" width="6" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.3" />
        <rect x="11" y="11" width="6" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    ),
  },
  {
    label: "Patients",
    href: "/clinic/patients",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
        <circle cx="8" cy="7" r="2.6" stroke="currentColor" strokeWidth="1.3" />
        <path d="M3.2 16c.5-2.6 2.5-4 4.8-4s4.3 1.4 4.8 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M13.4 5.1a2.4 2.4 0 0 1 0 4.4M15.2 12.6c1 .6 1.6 1.7 1.8 3.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Appointments",
    href: "/clinic/appointments",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
        <rect x="3" y="4.5" width="14" height="12.5" rx="2" stroke="currentColor" strokeWidth="1.3" />
        <path d="M3 8.2h14M7 3v3M13 3v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-line bg-cream-50 lg:flex lg:flex-col">
      <div className="flex h-20 items-center gap-2.5 border-b border-line px-6">
        <Link href="/" className="flex items-center gap-2.5 text-forest">
          <ToothMark className="size-5" />
          <span className="font-display text-xl tracking-[-0.03em]">Dentai</span>
        </Link>
        <span className="ml-auto rounded-full border border-line px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">
          Clinic
        </span>
      </div>

      <nav className="flex-1 px-3 py-6" aria-label="Clinic sections">
        <p className="px-3 pb-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-muted/80">
          Practice
        </p>
        <ul className="space-y-1">
          {NAV.map((item) => {
            const active =
              item.href === "/clinic"
                ? pathname === "/clinic"
                : pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-colors",
                    active
                      ? "bg-forest text-cream"
                      : "text-forest/70 hover:bg-forest/5 hover:text-forest",
                  )}
                >
                  <span className={active ? "text-cream" : "text-forest/50"}>{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="mt-8 px-3 pb-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-muted/80">
          Reference
        </p>
        <ul className="space-y-1 text-[13px]">
          <li>
            <Link
              href="/clinic/patients"
              className="flex items-center justify-between rounded-xl px-3 py-2.5 text-forest/60 transition-colors hover:bg-forest/5 hover:text-forest"
            >
              Odontograms
              <span className="text-[10px] text-muted/70">FDI</span>
            </Link>
          </li>
          <li>
            <Link
              href="/"
              className="flex items-center justify-between rounded-xl px-3 py-2.5 text-forest/60 transition-colors hover:bg-forest/5 hover:text-forest"
            >
              Public site
              <span aria-hidden="true">↗</span>
            </Link>
          </li>
        </ul>
      </nav>

      <div className="border-t border-line p-4">
        <div className="rounded-xl bg-cream px-4 py-3">
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted">
            Practice
          </p>
          <p className="mt-1 font-display text-[15px] leading-tight text-forest">
            Dentai Clinic
          </p>
          <p className="mt-0.5 text-[11px] text-muted">SoHo · New York</p>
        </div>
      </div>
    </aside>
  );
}

/** Compact navigation shown on small screens. */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex items-center gap-1 overflow-x-auto border-b border-line bg-cream-50 px-4 py-2.5 lg:hidden"
      aria-label="Clinic sections"
    >
      <Link href="/" className="mr-2 flex items-center gap-1.5 px-1 text-forest">
        <ToothMark className="size-4" />
        <span className="font-display text-base">Dentai</span>
      </Link>
      {NAV.map((item) => {
        const active =
          item.href === "/clinic" ? pathname === "/clinic" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "whitespace-nowrap rounded-full px-3 py-1.5 text-xs transition-colors",
              active ? "bg-forest text-cream" : "text-forest/60",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
