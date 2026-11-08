import Link from "next/link";

import { ArrowRight, ToothMark } from "@/components/icons";

const NAV = [
  { label: "Treatments", href: "#treatments" },
  { label: "Approach", href: "#approach" },
  { label: "Visit", href: "#visit" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-forest/10 bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-6 px-6 lg:h-20">
        <Link href="/" className="flex items-center gap-2.5 text-forest">
          <ToothMark className="size-6" />
          <span className="font-display text-2xl tracking-[-0.03em]">Dentai</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[13px] font-medium text-forest/70 transition-colors hover:text-forest"
            >
              {item.label}
            </a>
          ))}
          <Link
            href="/clinic"
            className="text-[13px] font-medium text-forest/70 transition-colors hover:text-forest"
          >
            Clinic platform
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-full px-4 py-2.5 text-[13px] font-medium text-forest/70 transition-colors hover:bg-forest/5 hover:text-forest sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/book"
            className="group inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-[13px] font-medium text-cream transition-colors hover:bg-forest-700"
          >
            Book a visit
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
