import Link from "next/link";

import { ArrowRight, ToothMark } from "@/components/icons";

const NAV = [
  { label: "Treatments", href: "#treatments" },
  { label: "Approach", href: "#approach" },
  { label: "Visit", href: "#visit" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-forest/10 bg-cream/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.75rem] w-full max-w-[90rem] items-center justify-between gap-6 px-6 lg:h-20 lg:px-10">
        <Link href="/" className="group flex items-center gap-2.5 text-forest">
          <span className="grid size-8 place-items-center rounded-full border border-forest/15 transition-colors group-hover:border-forest/40">
            <ToothMark className="size-[1.15rem]" />
          </span>
          <span className="font-display text-[1.35rem] font-extrabold tracking-[-0.055em]">
            Dentai
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[11px] font-bold uppercase tracking-[0.15em] text-forest/65 transition-colors hover:text-forest"
            >
              {item.label}
            </a>
          ))}
          <Link
            href="/clinic"
            className="text-[11px] font-bold uppercase tracking-[0.15em] text-forest/65 transition-colors hover:text-forest"
          >
            Clinic platform
          </Link>
        </nav>

        <div className="flex items-center gap-5">
          <Link
            href="/login"
            className="hidden text-[11px] font-bold uppercase tracking-[0.15em] text-forest/65 transition-colors hover:text-forest sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/book"
            className="group inline-flex items-center gap-2 border-b border-clay/50 pb-1 text-[11px] font-extrabold uppercase tracking-[0.15em] text-clay transition-colors hover:border-forest hover:text-forest"
          >
            <span className="hidden sm:inline">Book a visit</span>
            <span className="sm:hidden">Book</span>
            <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </header>
  );
}
